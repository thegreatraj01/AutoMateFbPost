import express from 'express';
const router = express.Router();
import authRouter from './auth.routes.js';
import userRouter from './user.router.js';
import freePicRouter from './FreePik.router.js';


router.use("/auth" , authRouter);
router.use('/user',userRouter);
router.use('/freepic',freePicRouter);


export default router;