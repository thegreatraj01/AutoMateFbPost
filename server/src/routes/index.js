import express from 'express';
const router = express.Router();
import authRouter from './auth.routes.js';
import userRouter from './user.router.js';
import freePikRouter from './FreePik.router.js';
import healthcheckRoute from './healthcheck.routes.js';
import { imageGenratorLimiter } from '../middleware/rateLimter.middleware.js';


router.use("/auth" , authRouter);
router.use('/user',userRouter);
router.use('/freepik', imageGenratorLimiter ,freePikRouter);
router.use('/healthcheck',healthcheckRoute);


export default router;