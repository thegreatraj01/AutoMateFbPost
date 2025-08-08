import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { FreePikGenerateImageClassicFast, getFreepikClassicFastOptions } from '../controllers/FreePik/classicFast.controller.js';
import { FreePikGenerateImageFluxDev, getFreepikFluxDevOptions } from '../controllers/FreePik/fluxDev.controller.js';

const freePikRouter = express.Router();

// POST /api/freepik/generate/classic-fast
freePikRouter.route('/generate/classic-fast').post(verifyJWT, FreePikGenerateImageClassicFast);
// GET /api/freepik/generate/classic-fast
freePikRouter.route('/get/classic-fast-option').get(verifyJWT, getFreepikClassicFastOptions);

// POST /api/freepik/generate/flux-dev
freePikRouter.route('/generate/flux-dev').post(verifyJWT, FreePikGenerateImageFluxDev);
// GET /api/freepik/get/flux-dev-option
freePikRouter.route('/get/flux-dev-option').get(verifyJWT,getFreepikFluxDevOptions);

export default freePikRouter;
