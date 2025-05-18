import express from 'express';
import { FreePikGenerateImageClassicFast, FreePikGenrateImageFlux } from '../controllers/FreePik.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const freePicRouter = express.Router();

// POST /api/freepik/generate
freePicRouter.route('/generate/flux').post(verifyJWT, FreePikGenrateImageFlux);
freePicRouter.route('/generate/classic-fast').post(verifyJWT, FreePikGenerateImageClassicFast);

export default freePicRouter;
