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
        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded?._id);
        if (!user) {
            throw new ApiError(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                "Invalid refresh token"
            );
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                "refresh token is expired or used"
            );
        }
        const option = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
            user?._id
        );
        return res
            .status(HTTP_STATUS_CODES.OK.code)
            .cookie("refreshToken", refreshToken, option)
            .cookie("accessToken", accessToken, option)
            .json(
                new ApiResponse(
                    HTTP_STATUS_CODES.OK.code,
                    { accessToken, refreshToken },
                    "token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code,
            error?.message || "invalid refresh token"
        );
    }
});


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
        );
});