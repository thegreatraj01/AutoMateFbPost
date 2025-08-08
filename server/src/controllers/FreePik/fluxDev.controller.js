// freepik/flux-dev/flux-dev.controller.js
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
 * Dynamic task polling function for Freepik async APIs
 * @param {string} taskId - Task ID to poll
 * @param {string} endpoint - API endpoint to poll , flux-dev , imagen3
 * @returns {Promise<string|Array>} Generated image URL(s)
 */
const pollTaskStatus = async (taskId, endpoint = 'flux-dev') => {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Check if we've exceeded total timeout
            if (Date.now() - startTime > TIMEOUT) {
                throw new ApiError(504, `Polling timeout exceeded (${TIMEOUT}ms)`);
            }

            console.log(`🔄 Polling attempt ${attempt}/${MAX_RETRIES} for task: ${taskId}`);

            const { data } = await FREEPIK_API.get(`/text-to-image/${endpoint}/${taskId}`);

            // Handle response based on status
            if (data.data.status === "COMPLETED") {
                console.log(`✅ Task ${taskId} completed successfully`);
                return data.data.generated; // Array of image URLs or single URL
            }

            if (data.data.status === "FAILED") {
                throw new ApiError(500, `Image generation failed for task: ${taskId}`, {
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
            // If it's our last attempt, throw the error
            if (attempt === MAX_RETRIES) {
                if (error instanceof ApiError) {
                    throw error;
                }

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
 * Create Flux Dev request body
 */
const createFluxDevRequestBody = ({
    prompt,
    aspect_ratio = "square_1_1",
    color_effect = "vibrant",
    lightning_effect = "dramatic",
    framing_effect = "portrait",
    custom_colors = [],
    webhook_url = null,
    seed = null
}) => {
    return {
        prompt: prompt.trim(),
        aspect_ratio,
        ...(webhook_url && { webhook_url }),
        ...(seed && { seed }),
        styling: {
            effects: {
                color: color_effect,
                lightning: lightning_effect,
                framing: framing_effect
            },
            ...(custom_colors.length > 0 && { colors: custom_colors })
        }
    };
};

/**
 * Validate Flux Dev input parameters
 */
const validateFluxDevInputs = ({
    prompt,
    aspect_ratio,
    color_effect,
    lightning_effect,
    framing_effect,
    custom_colors,
    seed
}) => {
    // Required fields
    if (!prompt || prompt.trim().length === 0) {
        throw new ApiError(400, "Prompt is required and cannot be empty");
    }

    if (prompt.trim().length > 2000) {
        throw new ApiError(400, "Prompt must be less than 2000 characters");
    }

    // Seed validation
    if (seed && (seed < FREEPIK_FLUX_DEV_OPTIONS.seed_range.min ||
        seed > FREEPIK_FLUX_DEV_OPTIONS.seed_range.max)) {
        throw new ApiError(400, `Seed must be between ${FREEPIK_FLUX_DEV_OPTIONS.seed_range.min} and ${FREEPIK_FLUX_DEV_OPTIONS.seed_range.max}`);
    }

    // Option validations
    if (!FREEPIK_FLUX_DEV_OPTIONS.aspect_ratios.includes(aspect_ratio)) {
        throw new ApiError(400, `Invalid aspect ratio. Available options: ${FREEPIK_FLUX_DEV_OPTIONS.aspect_ratios.join(', ')}`);
    }

    if (!FREEPIK_FLUX_DEV_OPTIONS.color_effects.includes(color_effect)) {
        throw new ApiError(400, `Invalid color effect. Available options: ${FREEPIK_FLUX_DEV_OPTIONS.color_effects.join(', ')}`);
    }

    if (!FREEPIK_FLUX_DEV_OPTIONS.lightning_effects.includes(lightning_effect)) {
        throw new ApiError(400, `Invalid lightning effect. Available options: ${FREEPIK_FLUX_DEV_OPTIONS.lightning_effects.join(', ')}`);
    }

    if (!FREEPIK_FLUX_DEV_OPTIONS.framing_effects.includes(framing_effect)) {
        throw new ApiError(400, `Invalid framing effect. Available options: ${FREEPIK_FLUX_DEV_OPTIONS.framing_effects.join(', ')}`);
    }

    // Custom colors validation
    if (custom_colors && custom_colors.length > 0) {
        if (custom_colors.length > 5) {
            throw new ApiError(400, "Maximum 5 custom colors allowed");
        }

        custom_colors.forEach((colorObj, index) => {
            if (!colorObj.color || typeof colorObj.weight !== 'number') {
                throw new ApiError(400, `Custom color ${index + 1} must have both 'color' and 'weight' properties`);
            }

            if (!/^#[0-9A-F]{6}$/i.test(colorObj.color)) {
                throw new ApiError(400, `Custom color ${index + 1} must be a valid hex color (e.g., #FF5733)`);
            }

            if (colorObj.weight < FREEPIK_FLUX_DEV_OPTIONS.color_weight_range.min ||
                colorObj.weight > FREEPIK_FLUX_DEV_OPTIONS.color_weight_range.max) {
                throw new ApiError(400, `Custom color ${index + 1} weight must be between ${FREEPIK_FLUX_DEV_OPTIONS.color_weight_range.min} and ${FREEPIK_FLUX_DEV_OPTIONS.color_weight_range.max}`);
            }
        });
    }
};

/**
 * Generate images using Freepik's Flux Dev API (Async Processing)
 * 
 * @route POST /api/v1/freepik/generate/flux-dev
 * @access Private
 * 
 * Request Body:
 * @param {string} prompt - Required. Detailed text description of desired image
 * @param {string} [aspect_ratio="square_1_1"] - Image aspect ratio
 * @param {string} [color_effect="vibrant"] - Color effect
 * @param {string} [lightning_effect="dramatic"] - Lightning effect  
 * @param {string} [framing_effect="portrait"] - Framing effect
 * @param {Array} [custom_colors=[]] - Custom color palette with weights
 * @param {string} [webhook_url] - Optional webhook URL for completion notification
 * @param {number} [seed] - Random seed for reproducibility (1-4294967295)
 * 
 * @returns {Object} Generated image with metadata
 */
export const FreePikGenerateImageFluxDev = asyncHandler(async (req, res) => {
    let {
        prompt,
        aspect_ratio = "square_1_1",
        color_effect = "vibrant",
        lightning_effect = "dramatic",
        framing_effect = "portrait",
        custom_colors = [],
        webhook_url = null,
        seed = null
    } = req.body;

    // Generate random seed if not provided
    if (!seed) {
        seed = Math.floor(Math.random() * 4294967295) + 1;
        console.log(`🎲 Generated random seed: ${seed}`);
    }

    // Input Validation
    validateFluxDevInputs({
        prompt,
        aspect_ratio,
        color_effect,
        lightning_effect,
        framing_effect,
        custom_colors,
        seed
    });

    try {
        // Create optimized request payload
        const requestPayload = createFluxDevRequestBody({
            prompt,
            aspect_ratio,
            color_effect,
            lightning_effect,
            framing_effect,
            custom_colors,
            webhook_url,
            seed
        });

        // Step 1: Initiate image generation
        console.log(`🎨 Initiating Flux Dev image generation...`);
        const { data: initiationResponse } = await FREEPIK_API.post('/text-to-image/flux-dev', requestPayload);

        const taskId = initiationResponse.data.task_id;
        console.log(`📋 Task created with ID: ${taskId}`);

        // Step 2: Poll for results with dynamic polling
        console.log(`⏳ Starting polling for task completion...`);
        const imageUrls = await pollTaskStatus(taskId, 'flux-dev');

        // Handle single or multiple image URLs
        const imageUrl = Array.isArray(imageUrls) ? imageUrls[0] : imageUrls;
        console.log(`🖼️ Received image URL: ${imageUrl}`);

        // Step 3: Upload to Cloudinary
        console.log(`📤 Uploading image to cloud storage...`);
        const cloudinaryUrl = await uploadFromUrl(imageUrl, `freepik/flux`);

        // Step 4: Store image in database
        console.log(`💾 Saving image to database...`);
        const savedImage = await Image.create({
            user: req.user._id,
            prompt: prompt.trim(),
            imageUrl: cloudinaryUrl,
            provider: "freepik",
            model: "flux-dev",
            parameters: {
                aspect_ratio,
                color_effect,
                lightning_effect,
                framing_effect,
                seed,
                custom_colors,
                task_id: taskId
            },
            dimensions: aspect_ratio // Flux Dev doesn't return exact dimensions
        });

        // Step 5: Return successful response
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    cloudinary_url: cloudinaryUrl,
                    original_url: imageUrl,
                    generation_meta: {
                        provider: "freepik",
                        model: "flux-dev",
                        prompt: prompt.trim(),
                        seed: seed,
                        task_id: taskId,
                        aspect_ratio,
                        effects: {
                            color: color_effect,
                            lightning: lightning_effect,
                            framing: framing_effect
                        },
                        custom_colors: custom_colors.length > 0 ? custom_colors : null
                    }
                },
                "Image generated successfully using Freepik Flux Dev"
            )
        );

    } catch (error) {
        console.error("❌ Freepik Flux Dev generation error:", error);

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
                model: "flux-dev",
                api_error: error.response?.data,
                request_parameters: req.body
            }
        );
    }
});

/**
 * Get available options for Freepik Flux Dev API
 * @route GET /api/v1/freepik/get/flux-dev-option
 * @access Public
 */
export const getFreepikFluxDevOptions = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                "api_info": {
                    "endpoint": "POST /api/v1/freepik/generate/flux-dev",
                    "method": "POST",
                    "content_type": "application/json",
                    "authentication": "Bearer token required // Cookie",
                    "processing_type": "Asynchronous with polling",
                    "average_generation_time": "30-60 seconds"
                },
                "request_body_schema": {
                    "prompt": {
                        "type": "string",
                        "required": true,
                        "description": "Main image description",
                        "max_length": 2000,
                        "example": "A majestic dragon flying over a medieval castle at sunset"
                    },
                    "aspect_ratio": {
                        "type": "string",
                        "required": false,
                        "default": "square_1_1",
                        "description": "Image aspect ratio",
                        "available_values": FREEPIK_FLUX_DEV_OPTIONS.aspect_ratios
                    },
                    "color_effect": {
                        "type": "string",
                        "required": false,
                        "default": "vibrant",
                        "description": "Color effect to apply",
                        "available_values": FREEPIK_FLUX_DEV_OPTIONS.color_effects
                    },
                    "lightning_effect": {
                        "type": "string",
                        "required": false,
                        "default": "dramatic",
                        "description": "Lighting effect to apply",
                        "available_values": FREEPIK_FLUX_DEV_OPTIONS.lightning_effects
                    },
                    "framing_effect": {
                        "type": "string",
                        "required": false,
                        "default": "portrait",
                        "description": "Framing/perspective effect",
                        "available_values": FREEPIK_FLUX_DEV_OPTIONS.framing_effects
                    },
                    "custom_colors": {
                        "type": "array",
                        "required": false,
                        "default": [],
                        "max_items": 5,
                        "description": "Custom color palette with weights",
                        "example": [
                            { "color": "#FF5733", "weight": 0.8 },
                            { "color": "#33FF57", "weight": 0.6 }
                        ],
                        "item_schema": {
                            "color": {
                                "type": "string",
                                "pattern": "^#[0-9A-F]{6}$",
                                "description": "Hex color code",
                                "example": "#FF5733"
                            },
                            "weight": {
                                "type": "number",
                                "min": 0.05,
                                "max": 1.0,
                                "description": "Color influence (0.05 = subtle, 1.0 = dominant)",
                                "example": 0.8
                            }
                        }
                    },
                    "seed": {
                        "type": "number",
                        "required": false,
                        "default": null,
                        "min": 1,
                        "max": 4294967295,
                        "description": "For reproducible results"
                    },
                    "webhook_url": {
                        "type": "string",
                        "required": false,
                        "description": "Optional webhook URL for completion notification",
                        "example": "https://yourapp.com/webhook/freepik"
                    }
                },
                "example_requests": {
                    "basic": {
                        "prompt": "A beautiful sunset over mountains",
                        "aspect_ratio": "widescreen_16_9"
                    },
                    "advanced": {
                        "prompt": "Cyberpunk warrior standing in neon-lit alley",
                        "aspect_ratio": "widescreen_16_9",
                        "color_effect": "electric",
                        "lightning_effect": "iridescent",
                        "framing_effect": "cinematic",
                        "custom_colors": [
                            { "color": "#00FFFF", "weight": 0.8 },
                            { "color": "#FF0080", "weight": 0.6 }
                        ],
                        "seed": 12345
                    }
                },
                "available_options": FREEPIK_FLUX_DEV_OPTIONS,
                "polling_info": {
                    "description": "Flux Dev uses asynchronous processing",
                    "polling_interval": "3 seconds",
                    "max_polling_time": "60 seconds",
                    "webhook_support": true
                }
            },
            "Freepik Flux Dev API options and documentation retrieved successfully"
        )
    );
});



/**
 * Available options for Freepik Flux Dev API
 */
export const FREEPIK_FLUX_DEV_OPTIONS = {
    aspect_ratios: [
        "square_1_1",
        "classic_4_3",
        "traditional_3_4",
        "widescreen_16_9",
        "social_story_9_16",
        "smartphone_horizontal_20_9",
        "smartphone_vertical_9_20",
        "standard_3_2",
        "portrait_2_3",
        "horizontal_2_1",
        "vertical_1_2",
        "social_5_4",
        "social_post_4_5"
    ],
    color_effects: [
        "softhue", "b&w", "goldglow", "vibrant", "coldneon"
    ],
    lightning_effects: [
        "iridescent", "dramatic", "goldenhour", "longexposure", "indorlight", "flash", "neon"
    ],
    framing_effects: [
        'portrait', "lowangle", "midshot", "wideshot", "tiltshot", "aerial"
    ],
    seed_range: {
        min: 1,
        max: 4294967295,
        default: null
    },
    color_weight_range: {
        min: 0.05,
        max: 1.0,
        default: 0.5
    },
    polling_config: {
        interval: POLL_INTERVAL,
        max_retries: MAX_RETRIES,
        timeout: TIMEOUT
    }
};