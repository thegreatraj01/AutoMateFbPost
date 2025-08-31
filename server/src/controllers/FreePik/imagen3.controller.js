// freepik/imagen3/imagen3.controller.js
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadFromUrl } from "../../utils/cloudinaryUtils.js";
import Image from "../../models/image.model.js";
import { FREEPIK_API } from "./freePik.config.js";

// Configuration
const POLL_INTERVAL = 3000; // 3 seconds
const MAX_RETRIES = 20;
const TIMEOUT = 60000; // 1 minute


/**
 * Available options for Freepik Imagen3 API - CORRECTED
 */
export const FREEPIK_IMAGEN3_OPTIONS = {
    aspect_ratios: [
        "square_1_1",
        "social_story_9_16",
        "widescreen_16_9",
        "traditional_3_4",
        "classic_4_3"
    ],
    styles: [
        "anime",
        "photo",
        "digital-art",
        "3d",
        "painting",
        "low-poly",
        "pixel-art",
        "cyberpunk",
        "comic",
        "vintage",
        "cartoon",
        "vector",
        "studio-shot",
        "dark",
        "sketch",
        "mockup",
        "watercolor",
        "art-nouveau",
        "origami",
        "surreal",
        "fantasy",
        "traditional-japan"
    ],
    color_effects: [
        "pastel",
        "vibrant",
        "dramatic",
        "sepia",
        "b&w",
        "orange&teal",
        "film-filter",
        "split",
        "electric",
        "pastel-pink",
        "gold-glow",
        "autumn",
        "muted-green",
        "deep-teal",
        "duotone",
        "terracotta&teal",
        "red&blue",
        "cold-neon",
        "burgundy&blue"
    ],
    lightning_effects: [
        "warm",
        "studio",
        "cinematic",
        "volumetric",
        "golden-hour",
        "long-exposure",
        "cold",
        "iridescent",
        "dramatic",
        "hardlight",
        "redscale",
        "indoor-light"
    ],
    framing_effects: [
        "portrait",
        "macro",
        "panoramic",
        "aerial-view",
        "close-up",
        "cinematic",
        "high-angle",
        "low-angle",
        "symmetry",
        "fish-eye",
        "first-person"
    ],
    person_generation: [
        "allow_adult",    // Allow generation of adults
        "allow_all",      // Allow generation of all people (including children)
        "dont_allow"      // Don't allow generation of any people
    ],
    safety_settings: [
        "block_low_and_above",      // Blocks low-risk and above content
        "block_medium_and_above",   // Blocks medium-risk and above content  
        "block_only_high",          // Blocks only high-risk content
        "block_none"                // No content blocking
    ],
    num_images_range: {
        min: 1,
        max: 4,
        default: 1
    },
    polling_config: {
        interval: POLL_INTERVAL,
        max_retries: MAX_RETRIES,
        timeout: TIMEOUT
    }
};


/**
 * Dynamic task polling function for Freepik async APIs
 * @param {string} taskId - Task ID to poll
 * @param {string} endpoint - API endpoint to poll
 * @returns {Promise<string|Array>} Generated image URL(s)
 */
const pollTaskStatus = async (taskId, endpoint = 'imagen3') => {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Check if we've exceeded total timeout
            if (Date.now() - startTime > TIMEOUT) {
                throw new ApiError(504, `Polling timeout exceeded (${TIMEOUT}ms)`);
            }

            console.log(`🔄 Polling attempt ${attempt}/${MAX_RETRIES} for task: ${taskId}`);

            const res = await FREEPIK_API.get(`/text-to-image/${endpoint}/${taskId}`);
            // console.log('res ' , res);
            const data = res.data;
            console.log('poll data ', data, data.data.status);
            // Handle response based on status
            if (data.data.status === "COMPLETED") {
                console.log(`✅ Task ${taskId} completed successfully`);
                return data.data.generated; // Array of image URLs or single URL
            }

            if (data.data.status === "FAILED") {
                console.log('status failed ')
                throw new ApiError(500, `Image generation failed Try Again`, {
                    task_id: taskId,
                    status: data.data.status,
                    endpoint
                });
            }

            if (data.data.status === "IN_PROGRESS") {
                console.log(`⏳ Task ${taskId} still in progress...`);

                // Wait before next attempt (except on last attempt)
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
                }
                continue;
            }

            // Handle unexpected status
            console.warn(`⚠️ Unexpected status: ${data.data.status} for task: ${taskId}`);

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            // If it's our last attempt, throw the error
            if (attempt === MAX_RETRIES) {
                throw new ApiError(504, "Polling timeout - maximum retries reached", {
                    task_id: taskId,
                    attempts: attempt,
                    original_error: error.response?.data?.message || error.message,
                    endpoint
                });
            }

            // Log error and continue for non-final attempts
            console.warn(`⚠️ Polling attempt ${attempt} failed:`, error.response?.data?.message || error.message);
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
    }

    throw new ApiError(504, "Polling failed - maximum retries exceeded", {
        task_id: taskId,
        max_retries: MAX_RETRIES,
        endpoint
    });
};

/**
 * Create Imagen3 request body
 */
const createImagen3RequestBody = ({
    prompt,
    num_images = 1,
    aspect_ratio = "square_1_1",
    style = "photo",
    color_effect = "vibrant",
    lightning_effect = "warm",
    framing_effect = "portrait",
    person_generation = "allow_all",
    safety_settings = "block_none"
}) => {
    return {
        prompt: prompt.trim(),
        num_images,
        aspect_ratio,
        styling: {
            style,
            effects: {
                color: color_effect,
                lightning: lightning_effect,
                framing: framing_effect
            }
        },
        person_generation,
        safety_settings
    };
};

/**
 * Validate Imagen3 input parameters
 */
const validateImagen3Inputs = ({
    prompt,
    num_images,
    aspect_ratio,
    style,
    color_effect,
    lightning_effect,
    framing_effect,
    person_generation,
    safety_settings
}) => {
    // Required fields
    if (!prompt || prompt.trim().length === 0) {
        throw new ApiError(400, "Prompt is required and cannot be empty");
    }

    if (prompt.trim().length > 2000) {
        throw new ApiError(400, "Prompt must be less than 2000 characters");
    }

    // Numeric validations
    if (num_images < FREEPIK_IMAGEN3_OPTIONS.num_images_range.min ||
        num_images > FREEPIK_IMAGEN3_OPTIONS.num_images_range.max) {
        throw new ApiError(400, `Number of images must be between ${FREEPIK_IMAGEN3_OPTIONS.num_images_range.min} and ${FREEPIK_IMAGEN3_OPTIONS.num_images_range.max}`);
    }

    // Option validations
    if (aspect_ratio && !FREEPIK_IMAGEN3_OPTIONS.aspect_ratios.includes(aspect_ratio)) {
        throw new ApiError(400, `Invalid aspect ratio. Available options: ${FREEPIK_IMAGEN3_OPTIONS.aspect_ratios.join(', ')}`);
    }

    if (style && !FREEPIK_IMAGEN3_OPTIONS.styles.includes(style)) {
        throw new ApiError(400, `Invalid style. Available options: ${FREEPIK_IMAGEN3_OPTIONS.styles.join(', ')}`);
    }

    if (color_effect && !FREEPIK_IMAGEN3_OPTIONS.color_effects.includes(color_effect)) {
        throw new ApiError(400, `Invalid color effect. Available options: ${FREEPIK_IMAGEN3_OPTIONS.color_effects.join(', ')}`);
    }

    if (lightning_effect && !FREEPIK_IMAGEN3_OPTIONS.lightning_effects.includes(lightning_effect)) {
        throw new ApiError(400, `Invalid lightning effect. Available options: ${FREEPIK_IMAGEN3_OPTIONS.lightning_effects.join(', ')}`);
    }

    if (framing_effect && !FREEPIK_IMAGEN3_OPTIONS.framing_effects.includes(framing_effect)) {
        throw new ApiError(400, `Invalid framing effect. Available options: ${FREEPIK_IMAGEN3_OPTIONS.framing_effects.join(', ')}`);
    }

    if (person_generation && !FREEPIK_IMAGEN3_OPTIONS.person_generation.includes(person_generation)) {
        throw new ApiError(400, `Invalid person generation setting. Available options: ${FREEPIK_IMAGEN3_OPTIONS.person_generation.join(', ')}`);
    }

    if (safety_settings && !FREEPIK_IMAGEN3_OPTIONS.safety_settings.includes(safety_settings)) {
        throw new ApiError(400, `Invalid safety settings. Available options: ${FREEPIK_IMAGEN3_OPTIONS.safety_settings.join(', ')}`);
    }
};

/**
 * Generate images using Freepik's Imagen3 API (Async Processing)
 * 
 * @route POST /api/v1/freepik/generate/imagen3
 * @access Private
 * 
 * Request Body:
 * @param {string} prompt - Required. Detailed text description of desired image
 * @param {number} [num_images=1] - Number of images to generate (1-4)
 * @param {string} [aspect_ratio="square_1_1"] - Image aspect ratio
 * @param {string} [style="anime"] - Artistic style
 * @param {string} [color_effect="pastel"] - Color effect
 * @param {string} [lightning_effect="warm"] - Lightning effect  
 * @param {string} [framing_effect="portrait"] - Framing effect
 * @param {string} [person_generation="allow_adult"] - Person generation policy
 * @param {string} [safety_settings="block_low_and_above"] - Content safety level
 * 
 * @returns {Object} Generated images with metadata
 */
export const FreePikGenerateImageImagen3 = asyncHandler(async (req, res) => {
    const {
        prompt,
        num_images = 1,
        aspect_ratio,
        style,
        color_effect,
        lightning_effect,
        framing_effect,
        person_generation,
        safety_settings,
    } = req.body;

    // Input Validation
    validateImagen3Inputs({
        prompt,
        num_images,
        aspect_ratio,
        style,
        color_effect,
        lightning_effect,
        framing_effect,
        person_generation,
        safety_settings
    });

    try {
        // Create optimized request payload
        const requestPayload = createImagen3RequestBody({
            prompt,
            num_images,
            aspect_ratio,
            style,
            color_effect,
            lightning_effect,
            framing_effect,
            person_generation,
            safety_settings
        });

        // Step 1: Initiate image generation
        console.log(`🎨 Initiating Imagen3 image generation for ${num_images} image(s)...`);
        const { data: initiationResponse } = await FREEPIK_API.post('/text-to-image/imagen3', requestPayload);
        const taskId = initiationResponse.data.task_id;
        console.log(`📋 Task created with ID: ${taskId}`);

        // Step 2: Poll for results with dynamic polling
        console.log(`⏳ Starting polling for task completion...`);
        const imageUrls = await pollTaskStatus(taskId, 'imagen3');

        // Handle multiple image URLs
        const imageUrlsArray = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
        console.log(`🖼️ Received ${imageUrlsArray.length} image URL(s)`);

        // Step 3: Upload images to Cloudinary
        console.log(`📤 Uploading ${imageUrlsArray.length} image(s) to cloud storage...`);
        const cloudinaryResults = await Promise.all(
            imageUrlsArray.map(async (imageUrl, index) => {
                const cloudinaryUrl = await uploadFromUrl(imageUrl, `freepik/imagen3/${Date.now()}-${index}`);
                return {
                    original_url: imageUrl,
                    cloudinary_url: cloudinaryUrl
                };
            })
        );

        // Step 4: Store images in database
        console.log(`💾 Saving ${cloudinaryResults.length} image(s) to database...`);
        const savedImages = await Promise.all(
            cloudinaryResults.map(async (imgData) => {
                return await Image.create({
                    user: req.user._id,
                    prompt: prompt.trim(),
                    imageUrl: imgData.cloudinary_url,
                    provider: "freepik",
                    model: "imagen3",
                    parameters: {
                        num_images,
                        aspect_ratio,
                        style,
                        color_effect,
                        lightning_effect,
                        framing_effect,
                        person_generation,
                        safety_settings,
                        task_id: taskId
                    }
                });
            })
        );

        // Step 5: Return successful response
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    cloudinary_urls: cloudinaryResults.map(img => img.cloudinary_url),
                    original_urls: cloudinaryResults.map(img => img.original_url),
                    generation_meta: {
                        provider: "freepik",
                        model: "imagen3",
                        prompt: prompt.trim(),
                        task_id: taskId,
                        num_images: imageUrlsArray.length,
                        aspect_ratio,
                        styling: {
                            style,
                            effects: {
                                color: color_effect,
                                lightning: lightning_effect,
                                framing: framing_effect
                            }
                        },
                        person_generation,
                        safety_settings
                    }
                },
                `Successfully generated ${savedImages.length} image(s) using Freepik Imagen3`
            )
        );

    } catch (error) {
        console.error("❌ Freepik Imagen3 generation error:", error);

        // Handle specific API errors
        if (error.response?.status === 429) {
            throw new ApiError(429, "Rate limit exceeded. Please wait before generating more images.");
        }

        if (error.response?.status === 403) {
            throw new ApiError(403, "API key invalid or insufficient credits.");
        }

        if (error.response?.status === 400) {
            throw new ApiError(400, error.response.data.message || "Invalid request parameters.");
        }

        // Handle polling timeouts
        if (error.message.includes('timeout') || error.message.includes('Polling')) {
            throw new ApiError(504, "Image generation timeout. Please try again.");
        }

        throw new ApiError(
            error.response?.status || 500,
            error.response?.data?.message || error.message || "Image generation failed",
            {
                provider: "freepik",
                model: "imagen3",
                api_error: error.response?.data,
                request_parameters: req.body
            }
        );
    }
});

/**
 * Get available options for Freepik Imagen3 API
 * @route GET /api/v1/freepik/get/imagen3-options
 * @access Public
 */
export const getFreepikImagen3Options = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                "api_info": {
                    "endpoint": "POST /api/v1/freepik/generate/imagen",
                    "method": "POST",
                    "content_type": "application/json",
                    "authentication": "Bearer token required // Cookie",
                    "processing_type": "Asynchronous with polling",
                    "average_generation_time": "30-60 seconds",
                    "model_provider": "Google Imagen3"
                },
                "request_body_schema": {
                    "prompt": {
                        "type": "string",
                        "required": true,
                        "description": "Main image description",
                        "max_length": 2000,
                        "example": "A majestic dragon flying over a medieval castle at sunset"
                    },
                    "num_images": {
                        "type": "number",
                        "required": false,
                        "default": 1,
                        "min": 1,
                        "max": 4,
                        "description": "Number of images to generate",
                        "example": 2
                    },
                    "aspect_ratio": {
                        "type": "string",
                        "required": false,
                        "default": "square_1_1",
                        "description": "Image aspect ratio",
                        "available_values": FREEPIK_IMAGEN3_OPTIONS.aspect_ratios
                    },
                    "style": {
                        "type": "string",
                        "required": false,
                        "default": "photo",
                        "description": "Artistic style",
                        "available_values": FREEPIK_IMAGEN3_OPTIONS.styles
                    },
                    "color_effect": {
                        "type": "string",
                        "required": false,
                        "default": "vibrant",
                        "description": "Color effect to apply",
                        "available_values": FREEPIK_IMAGEN3_OPTIONS.color_effects
                    },
                    "lightning_effect": {
                        "type": "string",
                        "required": false,
                        "default": "warm",
                        "description": "Lighting effect to apply",
                        "available_values": FREEPIK_IMAGEN3_OPTIONS.lightning_effects
                    },
                    "framing_effect": {
                        "type": "string",
                        "required": false,
                        "default": "portrait",
                        "description": "Framing/perspective effect",
                        "available_values": FREEPIK_IMAGEN3_OPTIONS.framing_effects
                    },
                    "person_generation": {
                        "type": "string",
                        "required": false,
                        "default": "allow_adult",
                        "description": "Person generation policy",
                        "available_values": FREEPIK_IMAGEN3_OPTIONS.person_generation
                    },
                    "safety_settings": {
                        "type": "string",
                        "required": false,
                        "default": "block_low_and_above",
                        "description": "Content safety filtering level",
                        "available_values": FREEPIK_IMAGEN3_OPTIONS.safety_settings
                    }
                },
                "example_requests": {
                    "basic": {
                        "prompt": "A beautiful sunset over mountains",
                        "aspect_ratio": "widescreen_16_9"
                    },
                    "advanced": {
                        "prompt": "Cyberpunk warrior standing in neon-lit alley",
                        "num_images": 1,
                        "aspect_ratio": "widescreen_16_9",
                        "style": "cyberpunk",
                        "color_effect": "electric",
                        "lightning_effect": "dramatic",
                        "framing_effect": "cinematic",
                        "person_generation": "allow_adult",
                        "safety_settings": "block_medium_and_above"
                    }
                },
                "available_options": FREEPIK_IMAGEN3_OPTIONS,
                "polling_info": {
                    "description": "Imagen3 uses asynchronous processing",
                    "polling_interval": "3 seconds",
                    "max_polling_time": "60 seconds",
                    "webhook_support": false
                },
                "safety_features": {
                    "person_generation_control": "Control whether adult persons can be generated",
                    "content_safety_filtering": "Multiple levels of content safety filtering",
                    "automatic_moderation": "Built-in content moderation system"
                }
            },
            "Freepik Imagen3 API options and documentation retrieved successfully"
        )
    );
});
