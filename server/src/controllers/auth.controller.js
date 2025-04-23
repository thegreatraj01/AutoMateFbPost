import User from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendVerificationEmail } from "../utils/VefiryEmail.js";
import { HTTP_STATUS_CODES } from "../utils/HttpStatusCode.js";
import jwt from "jsonwebtoken";
import { generateRandomPassword, generateUsernameFromName } from "../service/user.service.js";

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

// Initiates Facebook authentication
// Redirects user to Facebook login page
export const authFacebook = asyncHandler(async (req, res) => {
    const fbLoginUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&response_type=code&scope=email,pages_show_list,pages_manage_posts,public_profile,publish_video&auth_type=rerequest`;
    res.status(HTTP_STATUS_CODES.TEMPORARY_REDIRECT.code).redirect(fbLoginUrl);
});




// Handles Facebook callback
export const facebookCallback = asyncHandler(async (req, res) => {
    const { error } = req.query;
    if (error == "access_denied") {
        return res.status(400).json(new ApiResponse(400, null, "User denied access to Facebook account"));
    }

    const { code } = req.query;
    if (!code) throw new ApiError(400, "Missing authorization code");

    // Step 1: Exchange code for access token
    const tokenParams = new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: FACEBOOK_REDIRECT_URI,
        code,
    });

    const tokenRes = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?${tokenParams.toString()}`);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
        throw new ApiError(tokenRes.status, tokenData.error?.message || "Failed to fetch access token");
    }
    const access_token = tokenData.access_token;

    // Step 2: Validate the token
    const appAccessToken = `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`;
    const tokenverify = await fetch(`https://graph.facebook.com/debug_token?input_token=${access_token}&access_token=${appAccessToken}`);
    const tokenverifyData = await tokenverify.json();

    if (!tokenverifyData.data?.is_valid) {
        throw new ApiError(401, "Invalid Facebook access token");
    }

    // Step 3: Get user profile data
    const fields = 'id,name,email,picture.type(large),first_name,last_name';
    const profileRes = await fetch(`https://graph.facebook.com/me?fields=${fields}&access_token=${access_token}`);
    const userData = await profileRes.json();
    console.log(userData);

    if (!profileRes.ok) {
        throw new ApiError(profileRes.status, userData.error?.message || "Failed to fetch user profile");
    }

    // Step 4: Find or create user
    const existingUser = await User.findOne({
        $or: [
            { facebookId: userData.id },
            { email: userData.email }
        ]
    });

    let user;
    if (existingUser) {
        // Update existing user with latest Facebook data
        existingUser.facebookId = userData.id;
        existingUser.fullName = userData.name || `${userData.first_name} ${userData.last_name}`;
        existingUser.avatar = userData.picture?.data?.url || existingUser.avatar;
        existingUser.authProvider = 'facebook';

        // Only update email if we got one from Facebook and user doesn't have one
        if (userData.email && !existingUser.email) {
            existingUser.email = userData.email;
            existingUser.isEmailVerified = true;
            existingUser.isTemporaryEmail = false;
        }

        await existingUser.save();
        user = existingUser;
    } else {
        // Create new user
        const username = generateUsernameFromName(userData.name);
        const tempPassword = generateRandomPassword(8);

        user = new User({
            facebookId: userData.id,
            fullName: userData.name || `${userData.first_name} ${userData.last_name}`,
            userName: username,
            email: userData.email || null,
            isTemporaryEmail: !userData.email,
            isEmailVerified: !!userData.email,
            avatar: userData.picture?.data?.url || null,
            authProvider: 'facebook',
            password: tempPassword // Required field but not used for social login
        });

        await user.save();
    }

    // Step 5: Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update user's refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Step 6: Prepare response based on email availability
    if (!userData.email) {
        return res.status(200).json(new ApiResponse(200, {
            user: {
                _id: user._id,
                facebookId: user.facebookId,
                fullName: user.fullName,
                userName: user.userName,
                isTemporaryEmail: true,
                authProvider: 'facebook',
                avatar: user.avatar
            },
            requiresEmail: true,
            accessToken,
            refreshToken
        }, "Login successful - please provide your email"));
    }

    // Successful login with email
    return res.status(200).json(new ApiResponse(200, {
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            userName: user.userName,
            isEmailVerified: user.isEmailVerified,
            authProvider: 'facebook',
            avatar: user.avatar
        },
        accessToken,
        refreshToken
    }, "Login successful"));
});



// Optional logout
export const logout = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, null, "Logged out"));
});