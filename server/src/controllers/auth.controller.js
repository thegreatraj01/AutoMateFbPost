import User from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { sendVerificationEmail } from "../utils/VefiryEmail.js";
import { HTTP_STATUS_CODES } from "../utils/HttpStatusCode.js";
import jwt from "jsonwebtoken";
import { generateUsernameFromName } from "../service/user.service.js";

import { genrateAccessAndRefreshTokens } from "./user.controller.js";
import Otp from "../models/otp.model.js";




const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Must be `true` in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Critical!
  // maxAge: 7 * 24 * 60 * 60 * 1000, 
  path: "/", // Ensure cookies are sent for all routes
};

// USER REGISTRATION CONTROLLER
export const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  if (!email?.trim() || !fullName?.trim() || !password?.trim()) {
    throw new ApiError(400, "All fields are required and must be filled.");
  }

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User with given email already exists.");
  }

  const newUser = await User.create({
    userName: generateUsernameFromName(fullName),
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    password,
  });

  // Generate and send verification email
  const otp = await Otp.create({
    email: newUser.email,
    otp: Math.floor(100000 + Math.random() * 900000).toString(), // Generate a 6-digit 
  });

  try {
    await newUser.sendVerificationEmail(otp.otp);
  } catch (error) {
    throw new ApiError(500, 'Failed to send verification email. Please try again later.');
  }


  res.status(201)
    .json(
      new ApiResponse(
        201, {
        user: {
          _id: newUser._id,
          userName: newUser.userName,
          email: newUser.email,
          fullName: newUser.fullName,
          avatar: newUser.avatar,
        }
      },
        'Registered successfully. Please verify your email within 10m.'
      )
    );
});


// controller for verifyuser email using otp 
export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;

  if (!otp || !email) throw new ApiError(400, 'OTP and email are required');

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  const otpRecord = await Otp.findOne({ email, otp });
  if (!otpRecord) {
    throw new ApiError(400, 'Invalid OTP');
  }
  if (otpRecord.createdAt < Date.now() - 10 * 60 * 1000) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  user.isEmailVerified = true;
  await user.save();

  // Delete the OTP record after successful verification

  await Otp.deleteOne({ email, otp });

  res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
});

// LOGIN CONTROLLER
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    throw new ApiError(401, "User not found create a new account.");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Email not verified. Please verify your email before logging in.");
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(user._id);

  return res.status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      }, "Login successful")
    );
});

// TODO: Add a rate limit to this endpoint
// Resend Verification Email Controller
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  };

  // Generate a new OTP
  const otp = await Otp.create({
    email: user.email,
    otp: Math.floor(100000 + Math.random() * 900000).toString(), // Generate a 6-digit
  });
 
  try {
    await user.sendVerificationEmail(otp.otp);
  } catch (error) {
    throw new ApiError(500, "Failed to send verification email");
  };
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification email has been resent"));
});






