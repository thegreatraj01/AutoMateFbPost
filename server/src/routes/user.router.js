import express from 'express';
import { getCurrentUser, refreshAccessToken } from '../controllers/user.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
const userRouter = express.Router();

userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/me").get(verifyJWT, getCurrentUser);

export default userRouter;