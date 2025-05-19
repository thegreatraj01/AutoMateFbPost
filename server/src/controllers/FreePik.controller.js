import axios from 'axios';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadFromBase64, uploadFromUrl } from '../utils/cloudinaryUtils.js';
import { HTTP_STATUS_CODES } from '../utils/HttpStatusCode.js';
import User from '../models/user.model.js';
import Image from '../models/image.model.js';

// Configuration
const FREEPIK_API = axios.create({
    baseURL: 'https://api.freepik.com/v1/ai',
    headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': process.env.FREEPIK_API_KEY
    },
    timeout: 30000 // 30 seconds timeout
});

const POLL_INTERVAL = 3000;
const MAX_RETRIES = 20;

/**
 * Poll Freepik status with Axios
 */
const pollFreepikStatus = async (taskId) => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const { data } = await FREEPIK_API.get(`/text-to-image/flux-dev/${taskId}`);

            if (data.data.status === "COMPLETED") {
                return data.data.generated;
            }
            if (data.data.status === "FAILED") {
                throw new ApiError(500, "Image generation failed");
            }

            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        } catch (error) {
            if (attempt === MAX_RETRIES) {
                throw new ApiError(504, "Polling timeout", {
                    originalError: error.response?.data?.message || error.message
                });
            }
        }
    }
};

/**
 * Flux Dev API - Async Processing
 */
export const FreePikGenrateImageFlux = asyncHandler(async (req, res) => {
    const {
        prompt,
        aspect_ratio = "square_1_1",
        color = "vibrant",
        framing = "portrait",
        lightning = "dramatic",
        colors = [], // "colors":[{"color":"#FF0000","weight":0.5}]} 0.05 <= x <= 1
        webhook_url = "",
        seed = null //1 <= x <= 4294967295
    } = req.body;

    if (!prompt) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Prompt is required");
    };
    if (seed < 1 || seed > 4294967295) {
        throw new ApiError(400, "Seed must be between 1 and 4294967295");
    }

    const payload = {
        prompt,
        aspect_ratio,
        // ...(webhook_url && { webhook_url }),
        ...(seed && { seed }),
        styling: {
            effects: {
                color,
                framing,
                lightning
            },
            colors
        }
    };

    try {
        // Step 1: Initiate image generation
        const { data } = await FREEPIK_API.post('/text-to-image/flux-dev', payload);

        // Step 2: Poll for results
        const imageUrl = await pollFreepikStatus(data.data.task_id);

        // Step 3: Upload to Cloudinary 
        const cloudinaryUrl = await uploadFromUrl(imageUrl, 'freepik/flux')

        // Step 4: Store image in the database 
        const image = await Image.create({
            user: req.user._id,
            prompt: prompt.trim(),
            imageUrl: cloudinaryUrl,
        });
        // Step 5 : Return response 
        return res.status(HTTP_STATUS_CODES.OK.code).json(
            new ApiResponse(
                HTTP_STATUS_CODES.OK.code,
                {
                    image
                },
                "Images generated successfully"
            )
        );

    } catch (error) {
        // console.log("error 1", error);
        // console.log(error.response?.data)
        // Enhanced error handling
        const statusCode = error.response?.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code;
        const errorMessage = error.response?.data?.message || "Image generation failed";
        const errorData = error.response?.data || null;

        throw new ApiError(statusCode, errorMessage, errorData);
    }
});


/**
 * Generate images using Freepik's Classic Fast API
 * @param {string} prompt - Required. Text description of desired image
 * @param {string} [negative_prompt=""] - What to exclude from image
 * @param {number} [guidance_scale=1.0] - Prompt adherence (0.0-2.0)
 * @param {number} [seed] - Random seed for reproducibility
 * @param {number} [num_images=1] - Number of images (1-4)
 * @param {Object} image - Size specifications
 * @param {string} [image.size="square_1_1"] - Aspect ratio
 * @param {Object} styling - Style parameters
 * @param {string} [styling.style="realistic"] - Art style
 * @param {Object} styling.effects - Visual effects
 * @param {Array} [styling.colors] - Color palette weights
 * @param {boolean} [filter_nsfw=true] - Filter inappropriate content
 */
export const FreePikGenerateImageClassicFast = asyncHandler(async (req, res) => {
    const {
        prompt,
        aspect_ratio = "square_1_1",
        color = "vibrant",
        framing = "portrait",
        lightning = "dramatic",
        style = "photo",
        colors = [], // "colors":[{"color":"#FF0000","weight":0.5}]} 0.05 <= x <= 1
        seed = null,
        negative_prompt = '',
        guidance_scale = 1.0, //[0.0, 2.0]
        num_images = 1, //1 <= x <= 4
        filter_nsfw = true
    } = req.body;

    // Validation
    if (!prompt) throw new ApiError(400, "Prompt is required");
    if (guidance_scale < 0 || guidance_scale > 2) {
        throw new ApiError(400, "Guidance scale must be between 0.0 and 2.0");
    }
    if (seed && (seed < 0 || seed > 1000000)) {
        throw new ApiError(400, "Seed must be between 1 and 1000000");
    }
    if (num_images < 1 || num_images > 4) {
        throw new ApiError(400, "Number of images must be between 1 and 4");
    }

    try {
        const payload = {
            prompt,
            negative_prompt,
            guidance_scale,
            ...(seed && { seed }),
            num_images,
            image: {
                size: aspect_ratio
            },
            styling: {
                style,
                effects: {
                    color,
                    framing,
                    lightning
                },
                ...(colors.length > 0 && { colors })
            },
            filter_nsfw,
        };
        console.log(filter_nsfw);

        const { data } = await FREEPIK_API.post('/text-to-image', payload);

        let safeImages;
        // Process images with NSFW filtering
        if (!filter_nsfw) {
            safeImages = data.data.filter(img => !img.has_nsfw);
            if (safeImages.length === 0 && data.data.length > 0) {
                throw new ApiError(400, "All generated images were filtered as NSFW");
            }
        }
        safeImages = data.data.map(img => img);

        // Upload to Cloudinary
        const processedImages = await Promise.all(
            safeImages.map(async (img) => {
                const uploadResult = await uploadFromBase64(
                    img.base64,
                    `freepik/classic-fast`
                );
                return {
                    url: uploadResult,
                    dimensions: `${data.meta.image.width}x${data.meta.image.height}`,
                    aspect_ratio: data.meta.image.size
                };
            })
        );

        const Images = await Promise.all(
            processedImages.map(async (img) => {
                return await Image.create({
                    user: req.user._id,
                    prompt: prompt.trim(),
                    imageUrl: img.url,
                });
            })
        );

        return res.status(200).json(
            new ApiResponse(200, {
                Images,
                meta: {
                    seed: data.meta.seed,
                    guidance_scale: data.meta.guidance_scale,
                    prompt: data.meta.prompt,
                    inference_steps: data.meta.num_inference_steps
                }
            }, `Successfully generated ${processedImages.length} image(s)`)
        );

    } catch (error) {
        // console.log('erorr', error)
        throw new ApiError(
            error.response?.status || 500,
            error.response?.data?.message || error.message || "Image generation failed",
            {
                apiError: error.response?.data,
                requestParameters: req.body
            }
        );
    }
});