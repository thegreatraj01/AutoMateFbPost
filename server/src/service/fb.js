import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';


/**
 * Uploads a single image to a Facebook Page via Graph API.
 *
 * @param {Object} options
 * @param {string} options.pageId - Facebook Page ID
 * @param {string} options.accessToken - Facebook Page Access Token
 * @param {string} options.imagePathOrUrl - Local file path or remote image URL
 * @param {boolean} [options.published=true] - Whether the image should be published
 * @param {string} [options.caption] - Optional image caption
 * @returns {Promise<Object>} - API response
 */
export const uploadSinglePhotoToFacebook = async ({
  pageId,
  accessToken,
  imagePathOrUrl,
  published = true,
  caption = ''
}) => {
  const form = new FormData();
  form.append('published', published.toString());
  if (caption) form.append('caption', caption);
  form.append('access_token', accessToken);

  const isRemote = imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://');

  if (isRemote) {
    // Remote image: Facebook handles the fetch
    form.append('url', imagePathOrUrl);
  } else {
    // Local image: Upload from file system
    const absolutePath = path.isAbsolute(imagePathOrUrl)
      ? imagePathOrUrl
      : path.resolve(process.cwd(), imagePathOrUrl);

    const fileStream = fs.createReadStream(absolutePath);
    form.append('source', fileStream);
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${pageId}/photos`,
      form,
      {
        headers: form.getHeaders()
      }
    );
    return response.data;
  } catch (error) {
    const fbError = error.response?.data || error.message;
    throw new Error(`Facebook photo upload failed: ${JSON.stringify(fbError)}`);
  }
};
