import express from 'express';
const router = express.Router();
import authRouter from './auth.routes.js';
import userRouter from './user.router.js';
import freePicRouter from './FreePik.router.js';
import healthcheckRoute from './healthcheck.routes.js';


router.use("/auth" , authRouter);
router.use('/user',userRouter);
router.use('/freepik',freePicRouter);
router.use('/healthcheck',healthcheckRoute);


export default router;