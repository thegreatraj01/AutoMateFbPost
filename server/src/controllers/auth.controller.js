import User from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendVerificationEmail } from "../utils/VefiryEmail.js";
import { HTTP_STATUS_CODES } from "../utils/HttpStatusCode.js";
import jwt from "jsonwebtoken";
import { generateRandomPassword, generateUsernameFromName } from "../service/user.service.js";
import FacebookAuth from "../models/facebookAuth.model.js";
import axios from "axios";

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI } = process.env;

// REGISTER CONTROLLER
export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  if (!userName || !email || !fullName || !password) {
    throw new ApiError(400, "All required fields must be filled.");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existingUser) {
    throw new ApiError(409, "User with given email or username already exists.");
  }

  const newUser = await User.create({
    userName,
    email,
    fullName,
    password,
  });

  const token = jwt.sign(
    { userId: newUser._id },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: '15m' }
  );

  const verificationUrl = `${process.env.FRONTEND_URL}?token=${token}`;

  await sendVerificationEmail(newUser.email, newUser.fullName, verificationUrl);


  res.status(201).json(
    new ApiResponse(
      201,
      true,
      'Registered successfully. Please verify your email within 10m.',
    )
  );

});


export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) throw new ApiError(400, 'Token is required');

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) throw new ApiError(404, 'User not found');

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email already verified.' });
    }

    user.isEmailVerified = true;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, {}, 'Email verified successfully. You can now log in.')
    )
  } catch (err) {
    throw new ApiError(400, 'Invalid or expired token');
  }
});


// LOGIN CONTROLLER
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email. No user found with this email.");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password.");
  }

  // 🔒 Check if the user's email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Email not verified. Please verify your email before logging in.");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
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
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: '15m' }
  );

  const verificationUrl = `${process.env.FRONTEND_URL}?token=${token}`;

  await sendVerificationEmail(user.email, user.fullName, verificationUrl);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification email has been resent"));
});


// 1 Initiates Facebook authentication
// 2 Redirects user to Facebook login page
export const authFacebook = asyncHandler(async (req, res) => {
  const fbLoginUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&response_type=code&scope=email,pages_show_list,pages_manage_posts,public_profile,publish_video,business_management`;
  res.status(HTTP_STATUS_CODES.TEMPORARY_REDIRECT.code).redirect(fbLoginUrl);
});




// 1 Handles Facebook callback
export const facebookCallback = asyncHandler(async (req, res) => {
  const { error, code } = req.query;

  if (error === "access_denied") {
    return res.status(400).json(new ApiResponse(400, null, "User denied access to Facebook account"));
  }

  if (!code) throw new ApiError(400, "Missing authorization code");

  try {
    // Step 1: Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
      code,
    });

    const tokenRes = await axios.get(`https://graph.facebook.com/v22.0/oauth/access_token?${tokenParams.toString()}`);
    const { access_token: accessToken } = tokenRes.data;

    // Step 2: Validate the token
    const appAccessToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
    const tokenVerifyRes = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`
    );
    const tokenVerifyData = tokenVerifyRes.data;

    if (!tokenVerifyData.data?.is_valid) {
      throw new ApiError(401, "Invalid Facebook access token");
    }

    const facebookId = tokenVerifyData.data.user_id;

    // Step 3: Get user profile data
    const profileFields = "id,name,email,picture.type(large),first_name,last_name";
    const profileRes = await axios.get(`https://graph.facebook.com/me?fields=${profileFields}&access_token=${accessToken}`);
    const fbUser = profileRes.data;

    // Step 4: Get user pages
    const pagesRes = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`);
    const pages = pagesRes.data.data; // List of pages the user manages

    // Step 5: Find or create user
    let user = fbUser.email
      ? await User.findOne({ email: fbUser.email })
      : await User.findOne({ facebookId });

    const fullName = fbUser.name || `${fbUser.first_name} ${fbUser.last_name}`;
    const avatar = fbUser.picture?.data?.url || null;
    const email = fbUser.email || null;

    if (user) {
      // Update user data
      user.facebookId = facebookId;
      user.fullName = fullName;
      user.avatar = avatar;
      user.authProvider = "facebook";
      user.facebookAccessToken = accessToken;
      user.facebookTokenExpiry = new Date(Date.now() + tokenVerifyData.data.expires_at * 1000);

      if (email && !user.email) {
        user.email = email;
        user.isEmailVerified = true;
        user.isTemporaryEmail = false;
      }

      // Save page info in FacebookAuth model
      const facebookAuth = await FacebookAuth.findOne({ user: user._id });
      if (facebookAuth) {
        facebookAuth.pages = pages.map(page => ({
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          tasks: page.tasks,
        }));
        await facebookAuth.save();
      }

      await user.save();
    } else {
      // Create new user
      user = await User.create({
        facebookId,
        fullName,
        userName: generateUsernameFromName(fullName),
        email,
        isEmailVerified: !!email,
        isTemporaryEmail: !email,
        avatar,
        authProvider: "facebook",
        password: generateRandomPassword(12),
        facebookAccessToken: accessToken,
        facebookTokenExpiry: new Date(Date.now() + tokenVerifyData.data.expires_at * 1000),
      });

      // Save page info in FacebookAuth model
      const facebookAuth = new FacebookAuth({
        user: user._id,
        facebookId,
        facebookAccessToken: accessToken,
        facebookTokenExpiry: new Date(Date.now() + tokenVerifyData.data.expires_at * 1000),
        pages: pages.map(page => ({
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          category: page.category,
          tasks: page.tasks,
        })),
      });

      await facebookAuth.save();
    }

    // Step 6: Generate tokens
    const jwtAccess = user.generateAccessToken();
    const jwtRefresh = user.generateRefreshToken();
    user.refreshToken = jwtRefresh;
    await user.save();

    // Step 7: Final response
    const baseUser = {
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      avatar: user.avatar,
      authProvider: "facebook",
    };

    if (!email) {
      return res.status(200).json(
        new ApiResponse(200, {
          user: { ...baseUser, facebookId, isTemporaryEmail: true },
          requiresEmail: true,
          accessToken: jwtAccess,
          refreshToken: jwtRefresh,
        }, "Login successful - please provide your email")
      );
    }

    res.status(200).json(
      new ApiResponse(200, {
        user: {
          ...baseUser,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken: jwtAccess,
        refreshToken: jwtRefresh,
      }, "Login successful")
    );
  } catch (error) {
    console.log("Error during Facebook authentication:", error.message);
    throw new ApiError(error.response?.status || 500, error.response?.data?.error?.message || "An error occurred");
  }
});





// Optional logout
export const logout = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, "Logged out"));
});