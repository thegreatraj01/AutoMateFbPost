import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import { ApiError } from "./ApiError.js"; // Custom error class (optional)

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image from a URL (e.g., Freepik temp URL) to Cloudinary.
 * @param {string} url - Publicly accessible image URL
 * @param {string} folder - Cloudinary folder (default: "ai_images")
 * @returns {Promise<string>} Cloudinary secure URL
 */
const uploadFromUrl = async (url, folder = "ai_images") => {
  try {
    const response = await axios.get(url, { responseType: "stream" });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(new ApiError(500, "Cloudinary upload failed"));
          else resolve(result);
        }
      );
      response.data.pipe(uploadStream);
    });

    return result.secure_url;
  } catch (error) {
    throw new ApiError(
      error.code || 500,
      error.message || "Failed to upload from URL"
    );
  }
};

/**
 * Uploads a Base64-encoded image to Cloudinary.
 * @param {string} base64Str - Base64 string (with or without header)
 * @param {string} folder - Cloudinary folder (default: "ai_images")
 * @returns {Promise<string>} Cloudinary secure URL
 */
const uploadFromBase64 = async (base64Str, folder = "ai_images") => {
  try {
    // Strip Base64 header if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Str.replace(/^data:\w+\/\w+;base64,/, "");

    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${cleanBase64}`, // Cloudinary requires Data URI
      {
        folder: folder,
        resource_type: "image",
      }
    );

    return result.secure_url;
  } catch (error) {
    throw new ApiError(
      error.code || 500,
      error.message || "Failed to upload Base64 image"
    );
  }
};

export { uploadFromUrl, uploadFromBase64 };