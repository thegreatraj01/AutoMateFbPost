import express from 'express';
import { FreePikGenerateImageClassicFast, FreePikGenrateImageFlux as generateImageFromText } from '../controllers/FreePik.controller.js';

const  freePicRouter= express.Router();

// POST /api/freepik/generate
freePicRouter.route('/generate/flux').post(generateImageFromText);
freePicRouter.route('/generate/classic-fast').post(FreePikGenerateImageClassicFast);

export default freePicRouter;
