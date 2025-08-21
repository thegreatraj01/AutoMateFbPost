// controllers/history.controller.js
import Image from '../models/image.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

/**
 * GET /api/v1/history/user
 * Query params:
 *  - page: number (default 1)
 *  - limit: number (default 20, max 100)
 *  - order: 'asc' | 'desc' (default 'desc') - sorts by createdAt
 */
export const getUserHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  // Parse and sanitize query params
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limitRaw = Math.max(parseInt(req.query.limit || '20', 10), 1);
  const limit = Math.min(limitRaw, 100); // hard cap to prevent abuse
  const order = (req.query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

  const sort = { createdAt: order === 'asc' ? 1 : -1 };

  // Filters: only this user's non-deleted images
  const filter = { user: userId, isDeleted: { $ne: true } };

  // Count total
  const total = await Image.countDocuments(filter);

  // Fetch page
  const items = await Image.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .select('prompt imageUrl model has_nsfw createdAt') // only if you want to see it; otherwise remove
    .lean();

  const totalPages = Math.ceil(total / limit);
  if( page > totalPages && totalPages > 0) {
    throw new ApiError(404, 'Page not found max page is ' + totalPages);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        items,
        pagination: {
          page,
          limit,
          order,
          total,
          totalPages,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages
        }
      },
      'User image history fetched successfully'
    )
  );
});



/**
 * GET /api/v1/history/admin
 * Admin: list ALL images in the database with pagination (no filters)
 *
 * Query params:
 *  - page: number (default 1)
 *  - limit: number (default 20, max 100)
 *  - order: 'asc' | 'desc' (default 'desc') - sorts by createdAt
 *
 * NOTE: Ensure route-level middleware restricts this endpoint to admins.
 */
export const getAdminHistory = asyncHandler(async (req, res) => {
  // Parse pagination/sorting
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limitRaw = Math.max(parseInt(req.query.limit || '20', 10), 1);
  const limit = Math.min(limitRaw, 100);
  const order = (req.query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  const sort = { createdAt: order === 'asc' ? 1 : -1 };

  // NO FILTERS: return every image in the collection
  const total = await Image.countDocuments({});
  const items = await Image.find({})
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .select('prompt imageUrl model has_nsfw createdAt') // only if you want to see it; otherwise remove
    // .populate('user', 'email -_id') // optional: remove if not needed
    .lean();
    

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        items,
        pagination: {
          page,
          limit,
          order,
          total,
          totalPages,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages
        }
      },
      'Admin image history (all images) fetched successfully'
    )
  );
});