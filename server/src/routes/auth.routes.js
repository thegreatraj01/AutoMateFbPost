import express from "express";
import { loginUser, registerUser, resendEmailVerificationOtp, verifyEmail, resetPassword ,sendPasswordResetOtp } from "../controllers/auth.controller.js";
import { otpRequestLimiter } from "../middleware/rateLimter.middleware.js";
// import { verifyJWT } from "../middleware/auth.middleware.js";

const authRouter = express.Router();


// Register User First Time 
authRouter.post("/register", registerUser);

// Verify User Email
authRouter.post('/verify-email', verifyEmail);

// Resend OTP to Email for email verification
authRouter.post('/otp-request', otpRequestLimiter, resendEmailVerificationOtp);

// login User
authRouter.post("/login", loginUser);

// Send otp to reset password 
authRouter.post("/send-p-reset-otp", otpRequestLimiter, sendPasswordResetOtp);

// Reset Password 
authRouter.post("/reset-password", resetPassword);



export default authRouter;





// // Route: /auth/facebook
// authRouter.get('/facebook', authFacebook);
// // Route: /auth/facebook/callback
// authRouter.get("/facebook/callback", facebookCallback);
// // Route: /auth/logout
// authRouter.post("/logout", verifyJWT, logout);
