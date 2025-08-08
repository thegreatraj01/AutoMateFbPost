import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
// import { FREEPIK_CLASSIC_FAST_OPTIONS, createFreepikRequestBody } from "../constants/freepik.js";
import { uploadFromBase64 } from "../../utils/cloudinaryUtils.js";
import Image from "../../models/image.model.js";
import { FREEPIK_API } from "./freePik.config.js";


/**
 * Freepik Classic Fast API Request Body Schema
 * @typedef {Object} FreepikRequestBody
 * @property {string} prompt - Required. Detailed text description of desired image
 * @property {string} [negative_prompt=""] - What to exclude from the image
 * @property {number} [guidance_scale=1.0] - Prompt adherence level (0.0-2.0)
 * @property {number} [seed] - Random seed for reproducible results (1-2147483647)
 * @property {number} [num_images=1] - Number of images to generate (1-4)
 * @property {Object} image - Image size configuration
 * @property {string} image.size - Aspect ratio from available options
 * @property {Object} [styling] - Style and effects configuration
 * @property {string} [styling.style="photo"] - Artistic style
 * @property {Object} [styling.effects] - Visual effects
 * @property {string} [styling.effects.color] - Color effect
 * @property {string} [styling.effects.lightning] - Lighting effect
 * @property {string} [styling.effects.framing] - Framing/perspective effect
 * @property {Array<Object>} [styling.colors] - Custom color palette
 * @property {string} styling.colors[].color - Hex color code
 * @property {number} styling.colors[].weight - Color influence (0.05-1.0)
 * @property {boolean} [filter_nsfw=true] - Filter inappropriate content
 */

export const createFreepikRequestBody = ({
    prompt,
    negative_prompt = "",
    guidance_scale = 1.0,
    seed = 1,
    num_images = 1,
    aspect_ratio = "square_1_1",
    style = "photo",
    color_effect = "vibrant",
    lightning_effect = "dramatic",
    framing_effect = "portrait",
    custom_colors = [],
    filter_nsfw = true
}) => {
    return {
        prompt: prompt.trim(),
        negative_prompt: negative_prompt.trim(),
        guidance_scale,
        seed,
        num_images,
        image: {
            size: aspect_ratio
        },
        styling: {
            style,
            effects: {
                color: color_effect,
                lightning: lightning_effect,
                framing: framing_effect
            },
            ...(custom_colors.length > 0 && { colors: custom_colors })
        },
        filter_nsfw
    };
};

/**
 * Generate images using Freepik's Classic Fast API
 * 
 * @route POST /api/v1/freepik/generate/classic-fast
 * @access Private
 * 
 * Request Body:
 * @param {string} prompt - Required. Detailed text description of desired image
 * @param {string} [negative_prompt=""] - What to exclude from image
 * @param {number} [guidance_scale=1.0] - Prompt adherence (0.0-2.0)
 * @param {number} [seed] - Random seed for reproducibility (1-2147483647)
 * @param {number} [num_images=1] - Number of images to generate (1-4)
 * @param {string} [aspect_ratio="square_1_1"] - Image aspect ratio
 * @param {string} [style="photo"] - Artistic style
 * @param {string} [color_effect="vibrant"] - Color effect
 * @param {string} [lightning_effect="dramatic"] - Lighting effect
 * @param {string} [framing_effect="portrait"] - Framing effect
 * @param {Array} [custom_colors=[]] - Custom color palette with weights
 * @param {boolean} [filter_nsfw=true] - Filter inappropriate content
 * 
 * @returns {Object} Generated images with metadata
 */
export const FreePikGenerateImageClassicFast = asyncHandler(async (req, res) => {
    let {
        prompt,
        negative_prompt = "",
        guidance_scale = 1.0,
        seed = null,
        num_images = 1,
        aspect_ratio = "square_1_1",
        style = "photo",
        color_effect = "vibrant",
        lightning_effect = "dramatic",
        framing_effect = "portrait",
        custom_colors = [],
        filter_nsfw = true
    } = req.body;

    // Generate random seed if seed is false, null, undefined, or 0
    if (!seed) {
        seed = Math.floor(Math.random() * 1000000) + 1;
    }

    // Input Validation
    validateInputs({
        prompt,
        guidance_scale,
        seed,
        num_images,
        aspect_ratio,
        style,
        color_effect,
        lightning_effect,
        framing_effect,
        custom_colors
    });

    try {
        // Create optimized request payload
        const requestPayload = createFreepikRequestBody({
            prompt,
            negative_prompt,
            guidance_scale,
            seed,
            num_images,
            aspect_ratio,
            style,
            color_effect,
            lightning_effect,
            framing_effect,
            custom_colors,
            filter_nsfw
        });

        // Call Freepik API
        console.log(`🎨 Generating ${num_images} image(s) with Freepik Classic Fast...`);
        const { data } = await FREEPIK_API.post('/text-to-image', requestPayload);

        // Extract images array
        let processedImages = data.data || [];
        console.log(data);

        // Validate we received images
        if (!Array.isArray(processedImages) || processedImages.length === 0) {
            throw new ApiError(500, "No images received from Freepik API");
        }

        console.log(`📥 Received ${processedImages.length} image(s) from API`);

        // Apply NSFW filtering - check individual image has_nsfw property
        if (filter_nsfw) {
            const originalCount = processedImages.length;
            processedImages = processedImages.filter(img => !img.has_nsfw);

            const filteredCount = originalCount - processedImages.length;
            if (filteredCount > 0) {
                console.log(`🔍 Filtered ${filteredCount} NSFW image(s)`);
            }

            if (processedImages.length === 0) {
                throw new ApiError(400, "All generated images were filtered due to NSFW content");
            }
        }

        console.log(`✅ Processing ${processedImages.length} safe image(s)`);

        // Upload images to Cloudinary
        console.log(`📤 Uploading ${processedImages.length} image(s) to cloud storage...`);
        const cloudinaryResults = await Promise.all(
            processedImages.map(async (img, index) => {
                const uploadResult = await uploadFromBase64(
                    img.base64,
                    `freepik/classic-fast`
                );
                return {
                    url: uploadResult,
                    seed: img.seed || data.meta.seed,
                    dimensions: `${data.meta.image.width}x${data.meta.image.height}`,
                    aspect_ratio: data.meta.image?.size || aspect_ratio,
                    has_nsfw: img.has_nsfw
                };
            })
        );

        // Save images to database
        console.log(`💾 Saving ${cloudinaryResults.length} image(s) to database...`);
        const savedImages = await Promise.all(
            cloudinaryResults.map(async (imgData) => {
                return await Image.create({
                    user: req.user._id,
                    prompt: prompt.trim(),
                    negative_prompt: negative_prompt.trim(),
                    imageUrl: imgData.url,
                    provider: "freepik",
                    model: "classic-fast",
                    parameters: {
                        style,
                        aspect_ratio,
                        color_effect,
                        lightning_effect,
                        framing_effect,
                        guidance_scale,
                        seed: imgData.seed,
                        custom_colors
                    },
                    has_nsfw: imgData.has_nsfw,
                });
            })
        );

        // Calculate NSFW statistics for response
        const totalGenerated = data.data.length;
        const nsfwDetected = data.data.filter(img => img.has_nsfw).length;

        // Return successful response
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    cloudinary_urls: cloudinaryResults.map(img => img.url),
                    generation_meta: {
                        provider: "freepik",
                        model: "classic-fast",
                        prompt: data.meta.prompt || prompt,
                        seed: data.meta.seed,
                        guidance_scale: data.meta.guidance_scale,
                        inference_steps: data.meta.num_inference_steps,
                        dimensions: `${data.meta.image.width}x${data.meta.image.height}`,
                        aspect_ratio: data.meta.image.size,
                        total_generated: totalGenerated,
                        nsfw_detected: nsfwDetected,
                        safe_images: processedImages.length,
                        filtered_count: totalGenerated - processedImages.length
                    }
                },
                `Successfully generated ${savedImages.length} image(s) using Freepik Classic Fast`
            )
        );

    } catch (error) {
        console.error("❌ Freepik Classic Fast generation error:", error);

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

        throw new ApiError(
            error.response?.status || 500,
            error.response?.data?.message || error.message || "Image generation failed",
            {
                provider: "freepik",
                model: "classic-fast",
                api_error: error.response?.data,
                request_parameters: req.body
            }
        );
    }
});


/**
 * Validate input parameters against available options
 * @param {Object} inputs - Input parameters to validate
 * @throws {ApiError} When validation fails
 */
const validateInputs = ({
    prompt,
    guidance_scale,
    seed,
    num_images,
    aspect_ratio,
    style,
    color_effect,
    lightning_effect,
    framing_effect,
    custom_colors
}) => {
    // Required fields
    if (!prompt || prompt.trim().length === 0) {
        throw new ApiError(400, "Prompt is required and cannot be empty");
    }

    if (prompt.trim().length > 1000) {
        throw new ApiError(400, "Prompt must be less than 1000 characters");
    }

    // Numeric validations
    if (guidance_scale < FREEPIK_CLASSIC_FAST_OPTIONS.guidance_scale_range.min ||
        guidance_scale > FREEPIK_CLASSIC_FAST_OPTIONS.guidance_scale_range.max) {
        throw new ApiError(400, `Guidance scale must be between ${FREEPIK_CLASSIC_FAST_OPTIONS.guidance_scale_range.min} and ${FREEPIK_CLASSIC_FAST_OPTIONS.guidance_scale_range.max}`);
    }

    if (seed && (seed < FREEPIK_CLASSIC_FAST_OPTIONS.seed_range.min ||
        seed > FREEPIK_CLASSIC_FAST_OPTIONS.seed_range.max)) {
        throw new ApiError(400, `Seed must be between ${FREEPIK_CLASSIC_FAST_OPTIONS.seed_range.min} and ${FREEPIK_CLASSIC_FAST_OPTIONS.seed_range.max}`);
    }

    if (num_images < FREEPIK_CLASSIC_FAST_OPTIONS.num_images_range.min ||
        num_images > FREEPIK_CLASSIC_FAST_OPTIONS.num_images_range.max) {
        throw new ApiError(400, `Number of images must be between ${FREEPIK_CLASSIC_FAST_OPTIONS.num_images_range.min} and ${FREEPIK_CLASSIC_FAST_OPTIONS.num_images_range.max}`);
    }

    // Option validations
    if (!FREEPIK_CLASSIC_FAST_OPTIONS.aspect_ratios.includes(aspect_ratio)) {
        throw new ApiError(400, `Invalid aspect ratio. Available options: ${FREEPIK_CLASSIC_FAST_OPTIONS.aspect_ratios.join(', ')}`);
    }

    if (!FREEPIK_CLASSIC_FAST_OPTIONS.styles.includes(style)) {
        throw new ApiError(400, `Invalid style. Available options: ${FREEPIK_CLASSIC_FAST_OPTIONS.styles.join(', ')}`);
    }

    if (!FREEPIK_CLASSIC_FAST_OPTIONS.color_effects.includes(color_effect)) {
        throw new ApiError(400, `Invalid color effect. Available options: ${FREEPIK_CLASSIC_FAST_OPTIONS.color_effects.join(', ')}`);
    }

    if (!FREEPIK_CLASSIC_FAST_OPTIONS.lightning_effects.includes(lightning_effect)) {
        throw new ApiError(400, `Invalid lightning effect. Available options: ${FREEPIK_CLASSIC_FAST_OPTIONS.lightning_effects.join(', ')}`);
    }

    if (!FREEPIK_CLASSIC_FAST_OPTIONS.framing_effects.includes(framing_effect)) {
        throw new ApiError(400, `Invalid framing effect. Available options: ${FREEPIK_CLASSIC_FAST_OPTIONS.framing_effects.join(', ')}`);
    }

    // Custom colors validation
    if (custom_colors && custom_colors.length > 0) {
        if (custom_colors.length > 5) {
            throw new ApiError(400, "Maximum 5 custom colors allowed");
        }

        custom_colors.forEach((colorObj, index) => {
            if (!colorObj.color || !colorObj.weight) {
                throw new ApiError(400, `Custom color ${index + 1} must have both 'color' and 'weight' properties`);
            }

            if (!/^#[0-9A-F]{6}$/i.test(colorObj.color)) {
                throw new ApiError(400, `Custom color ${index + 1} must be a valid hex color (e.g., #FF5733)`);
            }

            if (colorObj.weight < FREEPIK_CLASSIC_FAST_OPTIONS.color_weight_range.min ||
                colorObj.weight > FREEPIK_CLASSIC_FAST_OPTIONS.color_weight_range.max) {
                throw new ApiError(400, `Custom color ${index + 1} weight must be between ${FREEPIK_CLASSIC_FAST_OPTIONS.color_weight_range.min} and ${FREEPIK_CLASSIC_FAST_OPTIONS.color_weight_range.max}`);
            }
        });
    }
};

/**
 * Get available options for Freepik Classic Fast API
 * @route GET /api/v1/freepik/get/classic-fast-option
 * @access Public
 */
export const getFreepikClassicFastOptions = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                "api_info": {
                    "endpoint": "POST /api/v1/freepik/generate/classic-fast",
                    "method": "POST",
                    "content_type": "application/json",
                    "authentication": "Bearer token required // Cookie",
                    "rate_limit": "10 requests per hour for normal user / 100 for primium user"
                },
                "request_body_schema": {
                    "prompt": {
                        "type": "string",
                        "required": true,
                        "description": "Main image description",
                        "max_length": 1000,
                        "example": "A majestic dragon flying over a medieval castle at sunset"
                    },
                    "negative_prompt": {
                        "type": "string",
                        "required": false,
                        "default": "",
                        "description": "What to exclude from image",
                        "example": "blurry, low quality, distorted, ugly"
                    },
                    "guidance_scale": {
                        "type": "number",
                        "required": false,
                        "default": 1.0,
                        "min": 0.0,
                        "max": 2.0,
                        "description": "How closely AI follows prompt (higher = more adherent)",
                        "example": 1.5
                    },
                    "seed": {
                        "type": "number",
                        "required": false,
                        "default": null,
                        "min": 1,
                        "max": 2147483647,
                        "description": "For reproducible results",
                        "example": 12345
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
                        "required": true,
                        "description": "Image aspect ratio",
                        "example": "square_1_1",
                        "available_values": FREEPIK_CLASSIC_FAST_OPTIONS.aspect_ratios
                    },
                    "style": {
                        "type": "string",
                        "required": false,
                        "default": "photo",
                        "description": "Artistic style",
                        "example": "anime",
                        "available_values": FREEPIK_CLASSIC_FAST_OPTIONS.styles
                    },
                    "color_effect": {
                        "type": "string",
                        "required": false,
                        "default": "vibrant",
                        "description": "Color effect to apply",
                        "example": "dramatic",
                        "available_values": FREEPIK_CLASSIC_FAST_OPTIONS.color_effects
                    },
                    "lightning_effect": {
                        "type": "string",
                        "required": false,
                        "default": "dramatic",
                        "description": "Lighting effect to apply",
                        "example": "cinematic",
                        "available_values": FREEPIK_CLASSIC_FAST_OPTIONS.lightning_effects
                    },
                    "framing_effect": {
                        "type": "string",
                        "required": false,
                        "default": "portrait",
                        "description": "Framing/perspective effect",
                        "example": "aerial-view",
                        "available_values": FREEPIK_CLASSIC_FAST_OPTIONS.framing_effects
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
                    "filter_nsfw": {
                        "type": "boolean",
                        "required": false,
                        "default": true,
                        "description": "Filter adult/inappropriate content",
                        "example": true
                    }
                },
                "example_requests": {
                    "basic": {
                        "prompt": "A beautiful sunset over mountains",
                        "aspect_ratio": "widescreen_16_9"
                    },
                    "advanced": {
                        "prompt": "Cyberpunk warrior standing in neon-lit alley",
                        "negative_prompt": "blurry, low quality, distorted",
                        "guidance_scale": 1.5,
                        "num_images": 2,
                        "aspect_ratio": "widescreen_16_9",
                        "style": "cyberpunk",
                        "color_effect": "electric",
                        "lightning_effect": "iridescent",
                        "framing_effect": "cinematic",
                        "custom_colors": [
                            { "color": "#00FFFF", "weight": 0.8 },
                            { "color": "#FF0080", "weight": 0.6 }
                        ],
                        "filter_nsfw": true
                    }
                },
                "available_options": FREEPIK_CLASSIC_FAST_OPTIONS,
                "response_format": {
                    "success": {
                        "status": 200,
                        "data": {
                            // "images": "Array of saved image objects",
                            "cloudinary_urls": "Array of image URLs",
                            "generation_meta": {
                                "provider": "freepik",
                                "model": "classic-fast",
                                "prompt": "Processed prompt",
                                "seed": "Used seed",
                                "guidance_scale": "Applied guidance scale",
                                "inference_steps": "Number of inference steps",
                                "has_nsfw": "NSFW content detected",
                                "filtered_count": "Number of filtered images",
                                "dimensions": "Image dimensions"
                            }
                        }
                    },
                    "error": {
                        "status": "4xx or 5xx",
                        "error": {
                            "code": "Error code",
                            "message": "Error description",
                            "details": "Additional error information"
                        }
                    }
                },
                "common_errors": {
                    "400": "Invalid request parameters or validation failed",
                    "401": "Authentication required",
                    "403": "API key invalid or insufficient credits",
                    "429": "Rate limit exceeded",
                    "500": "Internal server error or API unavailable"
                }
            },
            "Freepik Classic Fast API options and documentation retrieved successfully"
        )
    );
});



export const FREEPIK_CLASSIC_FAST_OPTIONS = {
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
    styles: [
        "photo",
        "digital-art",
        "3d",
        "painting",
        "low-poly",
        "pixel-art",
        "anime",
        "cyberpunk",
        "comic",
        "vintage",
        "cartoon",
        "vector",
        "studio-shot",
        "dark",
        "sketch",
        "mockup",
        "2000s-pone",
        "70s-vibe",
        "watercolor",
        "art-nouveau",
        "origami",
        "surreal",
        "fantasy",
        "traditional-japan"
    ],
    color_effects: [
        "b&w",
        "pastel",
        "sepia",
        "dramatic",
        "vibrant",
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
        "studio",
        "warm",
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
    guidance_scale_range: {
        min: 0.0,
        max: 2.0,
        default: 1.0,
        recommended: 1.5
    },
    seed_range: {
        min: 1,
        max: 1000000,
        default: null
    },
    num_images_range: {
        min: 1,
        max: 4,
        default: 1
    },
    color_weight_range: {
        min: 0.05,
        max: 1.0,
        default: 0.5
    },
    example_colors: [
        { color: "#FF5733", weight: 0.8 },  // Vibrant Orange
        { color: "#33FF57", weight: 0.6 },  // Bright Green
        { color: "#3357FF", weight: 0.7 },  // Electric Blue
        { color: "#FF33A1", weight: 0.5 },  // Hot Pink
        { color: "#FFD700", weight: 0.9 },  // Gold
        { color: "#8B0000", weight: 0.4 }   // Dark Red
    ]
};
