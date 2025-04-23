import express from "express";
import { authFacebook, facebookCallback, loginUser, logout, registerUser, resendVerificationEmail, verifyEmail } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get('/verify-email', verifyEmail);
router.post("/login", loginUser);
router.post("/resend-verification-email", resendVerificationEmail);

// Route: /auth/facebook
router.get('/facebook', authFacebook);
// Route: /auth/facebook/callback
router.get("/facebook/callback", facebookCallback);
// Route: /auth/logout
router.get("/logout", logout);

export default router;
