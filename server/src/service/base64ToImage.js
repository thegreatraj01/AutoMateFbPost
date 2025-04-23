import { promises as fs } from 'fs';
import { Buffer } from 'buffer';
import path from 'path';

/**
 * Converts a Base64 string to an image file with a unique filename
 * @param {string} base64String - The Base64 encoded image string
 * @param {string} directoryPath - Directory where to save the image file (default: 'public/images/')
 * @returns {Promise<{filePath: string, fileName: string}>} - Resolves with file info when complete
 */
export async function base64ToImage(base64String, directoryPath = 'public/images/') {
    try {
        // Create directory if it doesn't exist
        await fs.mkdir(directoryPath, { recursive: true });

        // Extract image type and clean the Base64 string
        const matches = base64String.match(/^data:image\/(\w+);base64,/);
        const imageType = matches?.[1] || 'png';

        // Remove the data URL prefix if present
        const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, '');

        // Create buffer from Base64
        const imageBuffer = Buffer.from(cleanBase64, 'base64');

        // Generate unique filename with timestamp and random string
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileName = `image_${timestamp}_${randomString}.${imageType}`;
        const filePath = path.join(directoryPath, fileName);

        // Write file asynchronously
        await fs.writeFile(filePath, imageBuffer);

        return {
            filePath,
            fileName,
            directory: directoryPath,
            fullPath: path.resolve(filePath)
        };
    } catch (error) {
        throw new Error(`Failed to save image: ${error.message}`);
    }
}

