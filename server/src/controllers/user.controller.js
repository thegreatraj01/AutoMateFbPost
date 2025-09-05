import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { HTTP_STATUS_CODES } from "../utils/HttpStatusCode.js";
import { ApiResponse } from "../utils/ApiResponse.js";



export const genrateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforesave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code,
            "Something went wrong while generating access token and refresh token"
        );
    }
};




// DONE:  API Testing ✅ (Completed)
export const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "User not found");
    }

    const user = req.user;
    return res
        .status(HTTP_STATUS_CODES.OK.code)
        .json(
            new ApiResponse(
                HTTP_STATUS_CODES.OK.code,
                {
                    user
                },

                "Current user fatched successfully"
            )
        )
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(
            HTTP_STATUS_CODES.UNAUTHORIZED.code,
            "Unauthorized request No token provided"
        );
    }

    try {
        // Verify incoming token (will throw if invalid/expired)
        const decodedIncoming = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedIncoming?._id);
        if (!user) {
            throw new ApiError(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                "Invalid refresh token"
            );
        }

        // If string tokens don't match, try decoding the stored token and compare payloads
        if (incomingRefreshToken !== user?.refreshToken) {
            const decodedStored = jwt.decode(user.refreshToken);

            // If stored token cannot be decoded or payloads differ, reject
            if (
                !decodedStored ||
                String(decodedStored._id || decodedStored.id) !== String(decodedIncoming._id || decodedIncoming.id)
            ) {
                throw new ApiError(
                    HTTP_STATUS_CODES.UNAUTHORIZED.code,
                    "refresh token is expired or used"
                );
            }
            // If payloads match but tokens differ (e.g. rotated token with same payload), allow refresh
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Must be `true` in production
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 24 * 60 * 60 * 1000 * 7,
            path: "/",
        };

        const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
            user?._id
        );

        return res
            .status(HTTP_STATUS_CODES.OK.code)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    HTTP_STATUS_CODES.OK.code,
                    { accessToken, refreshToken },
                    "token refreshed successfully"
                )
            );
    } catch (error) {
        // Treat JWT errors as unauthorized so clients can react (e.g., force logout)
        if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError') {
            throw new ApiError(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                error?.message || 'Invalid refresh token'
            );
        }

        throw new ApiError(
            HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code,
            error?.message || "invalid refresh token"
        );
    }
});
