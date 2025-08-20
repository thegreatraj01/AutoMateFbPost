// freepik/mystic/mystic.api.js

// Single-file Mystic API integration with:
// - Axios client
// - Request payload builder
// - Validation
// - Dynamic polling
// - Controller handler
// - Console logs for each step
// - Save generated image to database

// Usage:
//   import express from 'express';
//   import { FreePikGenerateImageMystic } from './freepik/mystic/mystic.api.js';
//   const router = express.Router();
//   router.post('/api/v1/freepik/generate/mystic', FreePikGenerateImageMystic);

import Image from "../../models/image.model.js"; // Make sure the path matches your project
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadFromUrl } from "../../utils/cloudinaryUtils.js"; // If you want to upload to Cloudinary
import { FREEPIK_API } from "./freePik.config.js"; // Your existing axios instance with baseURL+headers



// Poll Mystic task using setInterval (runs every 3 seconds by default)
const pollMysticTask = (taskId, { intervalMs = 3000, maxAttempts = 30 } = {}) => {
  console.log(`⏳ [Mystic] Polling started. taskId=${taskId}, intervalMs=${intervalMs}, maxAttempts=${maxAttempts}`);

  return new Promise((resolve, reject) => {
    let attempt = 0;
    const startedAt = Date.now();

    const timer = setInterval(async () => {
      attempt += 1;
      try {
        console.log(`🔄 [Mystic] Poll attempt ${attempt}/${maxAttempts} for taskId=${taskId}`);
        const response = await FREEPIK_API.get(`/mystic/${taskId}`);

        const { status } = response?.data?.data;
        console.log(`🔍 [Mystic] Poll attempt ${attempt}: status=${status}`);

        if (status === "COMPLETED") {
          console.log(`✅ [Mystic] Polling completed. taskId=${taskId}`);
          clearInterval(timer);
          return resolve(response?.data?.data?.generated); // Return full data; caller can pick fields
        }

        if (status === "FAILED") {
          console.error(`❌ [Mystic] Polling failed. taskId=${taskId}`);
          clearInterval(timer);
          return reject(new Error("Mystic task failed"));
        }

        // Optional absolute timeout safeguard (in case maxAttempts is large)
        const elapsed = Date.now() - startedAt;
        const hardTimeoutMs = intervalMs * maxAttempts + 5000; // small grace
        if (elapsed > hardTimeoutMs) {
          console.error(`⏱️ [Mystic] Polling hard-timeout. taskId=${taskId}`);
          clearInterval(timer);
          return reject(new Error("Mystic polling timeout"));
        }

        // Otherwise, continue polling on next tick...

      } catch (err) {
        console.warn(`⚠️ [Mystic] Poll attempt ${attempt} error:`, err?.response?.data || err.message);

        if (attempt >= maxAttempts) {
          console.error(`⏱️ [Mystic] Polling timeout. taskId=${taskId}`);
          clearInterval(timer);
          return reject(new Error("Mystic polling timeout"));
        }
        // Will try again on next interval tick...
      }
    }, intervalMs);
  });
};


// 2) Request payload creator (keeps controller clean)
const buildMysticPayload = (body) => {
    const {
        prompt,
        webhook_url,
        structure_reference,
        structure_strength = 50,
        style_reference,
        adherence = 50,
        hdr = 50,
        resolution = "2k",            // "1k" | "2k" | "4k"
        aspect_ratio = "square_1_1",  // e.g., "square_1_1","widescreen_16_9","traditional_3_4","classic_4_3","social_story_9_16"
        model = "realism",
        creative_detailing = 33,
        engine = "automatic",         // "automatic" | "magnific_illusio" | "magnific_sharpy" | "magnific_sparkle"
        fixed_generation = false,
        filter_nsfw = true,
        styling = {}
    } = body;

    const payload = {
        prompt: String(prompt || "").trim(),
        ...(webhook_url && { webhook_url }),
        ...(structure_reference && { structure_reference, structure_strength }),
        ...(style_reference && { style_reference, adherence }),
        hdr,
        resolution,
        aspect_ratio,
        model,
        creative_detailing,
        engine,
        fixed_generation,
        filter_nsfw
    };

    if (styling && typeof styling === "object" && Object.keys(styling).length > 0) {
        payload.styling = styling;
    }

    console.log(`🧱 [Mystic] Built payload:`, {
        ...payload,
        // Avoid logging entire base64 in console:
        structure_reference: structure_reference ? "[base64: hidden]" : undefined,
        style_reference: style_reference ? "[base64: hidden]" : undefined
    });

    return payload;
};

// 3) Minimal validation (extend as needed)
const validateMysticBody = (body) => {
    const {
        prompt,
        structure_strength = 50,
        adherence = 50,
        hdr = 50,
        creative_detailing = 33
    } = body;

    if (!prompt || !String(prompt).trim()) {
        throw new Error("prompt is required");
    }
    if (structure_strength < 0 || structure_strength > 100) {
        throw new Error("structure_strength must be between 0 and 100");
    }
    if (adherence < 0 || adherence > 100) {
        throw new Error("adherence must be between 0 and 100");
    }
    if (hdr < 0 || hdr > 100) {
        throw new Error("hdr must be between 0 and 100");
    }
    if (creative_detailing < 0 || creative_detailing >  100) {
        throw new Error("creative_detailing must be between 0 and 100");
    }
    console.log(`✅ [Mystic] Validation passed for prompt="${String(prompt).slice(0, 64)}..."`);
};

// 4) Controller: submit, poll, upload, save, respond


export const FreePikGenerateImageMystic = async (req, res) => {
  // console.log(`🚀 [Mystic] Request received from user=${req.user?._id || "anonymous"}`);
  try {
    // Validate
    validateMysticBody(req.body);

    // Build payload for Freepik Mystic API
    const payload = buildMysticPayload(req.body);

    // Submit task
    // console.log(`📤 [Mystic] Submitting task to Freepik...`);
    const { data: submitted } = await FREEPIK_API.post("/mystic", payload);
    // console.log(`📬 [Mystic] Submission response:`, submitted);

    // Expected: { task_id: "..." } OR { data: { task_id: "..." } }
    const taskId = submitted?.task_id || submitted?.data?.task_id;
    if (!taskId) {
      console.error(`❌ [Mystic] No task_id returned by API`);
      return res.status(502).json({ error: "Mystic did not return a task_id", raw: submitted });
    }
    console.log(`🆔 [Mystic] Task created: taskId= ${taskId}`);

    // Poll task until completion
    const resultUrlOrArray = await pollMysticTask(taskId);

    // Normalize to array for unified handling
    const resultUrls = Array.isArray(resultUrlOrArray) ? resultUrlOrArray : [resultUrlOrArray];
    // console.log(`🖼️ [Mystic] Received ${resultUrls.length} result URL(s)`);

    // We’ll return the first image in the exact structure you requested
    const imageUrl = resultUrls[0];

    // Optional: Upload to Cloudinary and save to DB
    let cloudinaryUrl = null;
    try {
      console.log(`☁️ [Mystic] Uploading 1st result to Cloudinary...`);
      cloudinaryUrl = await uploadFromUrl(imageUrl, `freepik/mystic`);
      console.log(`✅ [Mystic] Uploaded to Cloudinary: ${cloudinaryUrl}`);
    } catch (uploadErr) {
      console.warn(`⚠️ [Mystic] Cloudinary upload failed:`, uploadErr?.message || uploadErr);
      // Fallback to original URL if upload fails
      cloudinaryUrl = imageUrl;
    }

    // Save image to database (Image model must exist in your project)
    console.log(`💾 [Mystic] Saving image to DB...`);
    await Image.create({
      user: req.user?._id,
      prompt: String(payload.prompt || "").trim(),
      imageUrl: cloudinaryUrl,
      provider: "freepik",
      model: "mystic",
      parameters: {
        resolution: payload.resolution,
        aspect_ratio: payload.aspect_ratio,
        model: payload.model,
        engine: payload.engine,
        structure_strength: payload.structure_strength,
        adherence: payload.adherence,
        hdr: payload.hdr,
        creative_detailing: payload.creative_detailing,
        fixed_generation: payload.fixed_generation,
        filter_nsfw: payload.filter_nsfw,
        has_structure_reference: Boolean(req.body?.structure_reference),
        has_style_reference: Boolean(req.body?.style_reference),
        task_id: taskId
      },
      dimensions: `${payload.resolution}_${payload.aspect_ratio}`,
      has_nsfw: false
    });

    // Build generation_meta to mirror the Flux Dev structure you provided.
    // Note: Mystic does not have seed/effects/custom_colors in the same way as Flux Dev.
    // We'll include nulls for non-applicable fields to satisfy the schema shape.
    const generation_meta = {
      provider: "freepik",
      model: "mystic",                           // model name differs from flux-dev
      prompt: String(payload.prompt || "").trim(),
      seed: null,                                 // Mystic doesn’t expose seed; set to null
      task_id: taskId,
      aspect_ratio: payload.aspect_ratio,
      effects: {                                  // Mystic doesn’t have these; set to nulls
        color: null,
        lightning: null,
        framing: null
      },
      custom_colors: null                         // Mystic color guidance is under styling.colors; not returned here
    };

    console.log(`🎉 [Mystic] Completed successfully. Returning single image with ApiResponse shape`);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          cloudinary_url: cloudinaryUrl,
          original_url: imageUrl,
          generation_meta
        },
        "Image generated successfully using Freepik Mystic"
      )
    );

  } catch (err) {
    console.error(`🔥 [Mystic] Error:`, err?.response?.data || err.message || err);
    return res.status(500).json(
      new ApiResponse(
        500,
        { error: err?.response?.data || null },
        err?.response?.data?.message || err.message || "Mystic generation failed"
      )
    );
  }
};


/**
 * ===========================
 * Body Parameters Quick Guide
 * ===========================
 *
 * prompt (string, required)
 * - What to generate. Be explicit about subject, composition, details, lighting, lens, mood.
 * - Example: "Ultra-realistic portrait of an astronaut, studio lighting, 85mm, shallow DOF"
 *
 * webhook_url (string, optional)
 * - If provided, Freepik will POST completion data to this URL when task finishes.
 * - Use for background jobs; skip polling on your server if relying on webhooks.
 *
 * structure_reference (base64 string, optional)
 * - Base64-encoded "structure" guide image. Anchors layout/pose/composition.
 * - Pair with structure_strength to control how strictly layout is followed.
 *
 * structure_strength (number 0–100, default 50)
 * - 0: ignore structure; 100: follow structure reference strongly.
 *
 * style_reference (base64 string, optional)
 * - Base64-encoded "style" guide image (palette, brushwork, vibe).
 * - Pair with adherence to control how closely style is applied.
 *
 * adherence (number 0–100, default 50)
 * - 0: minimal style borrow; 100: heavy style transfer.
 *
 * hdr (number 0–100, default 50)
 * - Tone-mapping/contrast intensity. Higher = punchier highlights/shadows.
 *
 * resolution ("1k" | "2k" | "4k", default "2k")
 * - Output resolution target. Higher looks better and is slower.
 * - Suggestion: 2k for iteration, 4k for final hero assets.
 *
 * aspect_ratio (string, default "square_1_1")
 * - Output ratio. Common: "square_1_1", "widescreen_16_9", "classic_4_3", "traditional_3_4", "social_story_9_16".
 * - Choose based on platform (e.g., 9:16 for Stories, 16:9 for banners).
 *
 * model (string, default "realism")
 * - AI sub-model. "realism" for photoreal results. Others may exist (artistic, fantasy, anime) per account/docs.
 *
 * creative_detailing (number 0–100, default 33)
 * - Decorative detail/microtextures level. Higher = more intricate embellishment.
 *
 * engine (string, default "automatic")
 * - Backend refiner/upscaler:
 *   - "automatic": let API choose
 *   - "magnific_illusio" | "magnific_sharpy" | "magnific_sparkle": specialized finishing characteristics
 *
 * fixed_generation (boolean, default false)
 * - Try to keep output deterministic/stable across identical runs (if supported).
 *
 * filter_nsfw (boolean, default true)
 * - Enable Freepik's safety filter. Keep true for public apps.
 *
 * styling (object, optional)
 * - Advanced guiding knobs:
 *   - styling.styles: [{ name: string, strength: 0–100 }]
 *     e.g., { name: "cyberpunk", strength: 80 } to nudge toward a cataloged style.
 *   - styling.characters: [{ id: string, strength: 0–100 }]
 *     Use trained character IDs (LoRA-like); strength controls identity adherence.
 *   - styling.colors: [{ color: "#RRGGBB", weight: 0.0–1.0 }]
 *     Palette guidance. Use 2–5 brand colors with moderate weights (0.3–0.7) for natural results.
 *
 * ===========================
 * Practical Recipes
 * ===========================
 * 1) Keep layout, restyle
 *    - structure_reference + structure_strength: 60–80
 *    - style_reference + adherence: 40–70
 *    - creative_detailing: 20–40 for clean commercial looks
 *
 * 2) Premium hero image
 *    - resolution: "4k", aspect_ratio: "widescreen_16_9"
 *    - model: "realism", engine: "magnific_sparkle"
 *    - hdr: 60–75, creative_detailing: 50–70
 *
 * 3) Brand palette
 *    - styling.colors: up to 3–5 hex colors, weights 0.3–0.7
 *
 * 4) Deterministic runs
 *    - fixed_generation: true
 *    - Keep other params constant across runs
 */


// samples/mystic.postman.samples.js
// Four ready-to-use Postman JSON bodies for Freepik Mystic API
// Usage: Copy any object into Postman Body (raw, application/json)

// 1) Minimal fast draft (square, 2k)
export const MYSTIC_SAMPLE_MINIMAL = {
    prompt: "Ultra-realistic portrait of an astronaut in studio lighting, 85mm lens, shallow depth of field",
    resolution: "2k",
    aspect_ratio: "square_1_1"
};

// 2) Widescreen hero image with HDR and detailing (4k)
export const MYSTIC_SAMPLE_HERO_4K = {
    prompt: "Epic cinematic landscape of futuristic city skyline at sunset, volumetric light, haze, detailed architecture",
    resolution: "4k",
    aspect_ratio: "widescreen_16_9",
    model: "realism",
    hdr: 70,
    creative_detailing: 60,
    engine: "magnific_sparkle",
    filter_nsfw: true
};

// 3) Structure reference with brand color guidance (classic 4:3)
export const MYSTIC_SAMPLE_STRUCTURE_COLORS = {
    prompt: "Modern living room with Scandinavian minimalism, soft natural light, cozy textures",
    structure_reference: "iVBORw0KGgoAAAANSUhEUgAA...", // <-- replace with real base64
    structure_strength: 70,
    resolution: "2k",
    aspect_ratio: "classic_4_3",
    styling: {
        colors: [
            { color: "#E8E6E1", weight: 0.6 },
            { color: "#2F3E46", weight: 0.5 },
            { color: "#84A98C", weight: 0.4 }
        ]
    }
};

// 4) Style reference with moderate adherence (portrait 3:4)
export const MYSTIC_SAMPLE_STYLE_REFERENCE = {
    prompt: "Bust-length portrait of a young chef in a professional kitchen, shallow depth, natural rim light",
    style_reference: "iVBORw0KGgoAAAANSUhEUgAA...", // <-- replace with real base64
    adherence: 55,
    resolution: "2k",
    aspect_ratio: "traditional_3_4",
    model: "realism",
    creative_detailing: 40
};
