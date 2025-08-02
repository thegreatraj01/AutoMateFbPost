import express from "express";
import { loginUser, registerUser, resendVerificationEmail, verifyEmail } from "../controllers/auth.controller.js";
import { otpRequestLimiter } from "../middleware/rateLimter.middleware.js";
// import { verifyJWT } from "../middleware/auth.middleware.js";

const authRouter = express.Router();
// Register User First Time 
authRouter.post("/register", registerUser);
// Verify User Email
authRouter.post('/verify-email', verifyEmail);
// Resend Verification Email
authRouter.post("/resend-verification-email", otpRequestLimiter, resendVerificationEmail);

authRouter.post("/login", loginUser);



export default authRouter;





// // Route: /auth/facebook
// authRouter.get('/facebook', authFacebook);
// // Route: /auth/facebook/callback
// authRouter.get("/facebook/callback", facebookCallback);
// // Route: /auth/logout
// authRouter.post("/logout", verifyJWT, logout);
