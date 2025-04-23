import { FREEPIK_OPTIONS } from '../constant.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS_CODES } from '../utils/HttpStatusCode.js';
import { base64ToImage } from '../service/base64ToImage.js';

const POLL_INTERVAL = 3000; // 3 seconds
const MAX_RETRIES = 20;     // Max attempts before giving up (~60 sec)

/**
 * Poll Freepik until status is COMPLETED or FAILED
 */
const pollFreepikStatus = async (taskId) => {
    console.log(taskId);
    const url = `https://api.freepik.com/v1/ai/text-to-image/flux-dev/${taskId}`;
    const headers = { 'x-freepik-api-key': process.env.FREEPIC_API_KEY };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const res = await fetch(url, { method: 'GET', headers });
        // console.log("res", res);
        const data = await res.json();
        // console.log("data", data);

        if (!res.ok) {
            throw new ApiError(res.status, "Failed to fetch image status", data);
        }

        const { status, generated } = data.data;

        if (status === "COMPLETED") {
            return generated; // array of image URLs
        }

        if (status === "FAILED") {
            throw new ApiError(500, "Image generation failed", data);
        }

        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new ApiError(504, "Image generation timed out after multiple retries");
};

/**
 * Freepik Text-to-Image Generation with Polling
 */
export const FreePikGenrateImageFlux = asyncHandler(async (req, res) => {
    const {
        prompt,
        aspect_ratio = "square_1_1",
        color = "vibrant",
        framing = "portrait",
        lightning = "dramatic",
        colors = [],
        webhook_url = ""
    } = req.body;

    if (!prompt) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Prompt is required");
    }
    const payload = {
        prompt,
        aspect_ratio,
        // webhook_url,
        styling: {
            effects: { color, framing, lightning },
            ...(colors.length > 0 && { colors })
        }
    };


    // Step 1: Initiate image generation task
    const initiate = await fetch('https://api.freepik.com/v1/ai/text-to-image/flux-dev', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-freepik-api-key': process.env.FREEPIC_API_KEY
        },
        body: JSON.stringify(payload)
    });

    if (!initiate.ok) {
        throw new ApiError(initiate.status, "Freepik generation request failed");
    }

    const startData = await initiate.json();
    const taskId = startData.data.task_id;

    // Step 2: Poll until status is COMPLETED or FAILED
    const imageUrls = await pollFreepikStatus(taskId);

    // Step 3: Return image URLs
    return res.status(200).json(
        new ApiResponse(200, {
            taskId,
            imageUrls
        }, "Image successfully generated")
    );
});


export const FreePikGenerateImageClassicFast = asyncHandler(async (req, res) => {
    const {
        prompt,
        negative_prompt = '',
        guidance_scale = 1.0,
        seed,
        num_images = 1,
        image = { size: 'square_1_1' },
        styling, // is an object with effects like color, framing, lightning
        // styling: { style: "anime", effects: { color: "pastel", lightning: "warm", framing: "portrait" } }
        filter_nsfw = true
    } = req.body;

    // Validate required field
    if (!prompt) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, 'Prompt is required');
    }

    // Prepare payload for API
    const payload = {
        prompt,
        negative_prompt,
        guidance_scale,
        ...(seed && { seed }),
        num_images,
        image,
        ...(styling && { styling }),
        filter_nsfw
    };

    const response = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-freepik-api-key': process.env.FREEPIC_API_KEY
        },
        body: JSON.stringify(payload)
    });


    if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(response.status, 'Freepik (Classic Fast) generation failed', errorData);
    }

    const result = await response.json();

    // Convert base64 images to URLs using helper function
    const imageUrls = await Promise.all(
        result.data?.map(async (item) => {
            return await base64ToImage(item.base64); // Implement this function to store or upload the base64 and return URL
        }) || []
    );

    return res.status(200).json(
        new ApiResponse(200, { imageUrls }, 'Classic Fast image(s) generated successfully')
    );
});



