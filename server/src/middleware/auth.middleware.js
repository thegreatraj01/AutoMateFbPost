import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";
import { HTTP_STATUS_CODES } from "../utils/HttpStatusCode.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(
        HTTP_STATUS_CODES.UNAUTHORIZED.code,
        "Unauthorized: No token provided"
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(
          HTTP_STATUS_CODES.UNAUTHORIZED.code,
          "Token expired. Please refresh your token."
        );
      } else if (err.name === "JsonWebTokenError") {
        throw new ApiError(
          HTTP_STATUS_CODES.UNAUTHORIZED.code,
          "Invalid token. Please log in again."
        );
      } else {
        throw new ApiError(
          HTTP_STATUS_CODES.UNAUTHORIZED.code,
          "Unauthorized: Token verification failed."
        );
      }
    }

    const logedInUser = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );
    if (!logedInUser) {
      throw new ApiError(
        HTTP_STATUS_CODES.UNAUTHORIZED.code,
        "Invalid Access Token: User not found."
      );
    }

    req.user = logedInUser;
    next();
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});


export const verifyAdmin = asyncHandler(async (req, res, next) => {
  console.log('req.user', req.user);
  if (req?.user && req.user?.email === process.env.GMAIL_USER) {
    return next();
  };
  throw new ApiError(
    403,
    "Forbidden: You do not have permission to access this resource."
  );
});