import express from "express";
import { authFacebook, facebookCallback, loginUser, logout, registerUser, resendVerificationEmail, verifyEmail } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.get('/verify-email', verifyEmail);
authRouter.post("/login", loginUser);
authRouter.post("/resend-verification-email", resendVerificationEmail);

// Route: /auth/facebook
authRouter.get('/facebook', authFacebook);
// Route: /auth/facebook/callback
authRouter.get("/facebook/callback", facebookCallback);
// Route: /auth/logout
authRouter.post("/logout", verifyJWT, logout);




export default authRouter;
