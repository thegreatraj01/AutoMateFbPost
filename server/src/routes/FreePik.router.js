import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { FreePikGenerateImageClassicFast, getFreepikClassicFastOptions } from '../controllers/FreePik/classicFast.controller.js';
import { FreePikGenerateImageFluxDev, getFreepikFluxDevOptions } from '../controllers/FreePik/fluxDev.controller.js';
import { FreePikGenerateImageImagen3, getFreepikImagen3Options } from '../controllers/FreePik/imagen3.controller.js';
import { FreePikGenerateImageMystic } from '../controllers/FreePik/mystic.controller.js';

const freePikRouter = express.Router();

// POST /api/freepik/generate/classic-fast
freePikRouter.route('/generate/classic-fast').post(verifyJWT, FreePikGenerateImageClassicFast);
// GET /api/freepik/generate/classic-fast
freePikRouter.route('/get/classic-fast-option').get(verifyJWT, getFreepikClassicFastOptions);

// POST /api/freepik/generate/flux-dev
freePikRouter.route('/generate/flux-dev').post(verifyJWT, FreePikGenerateImageFluxDev);
// GET /api/freepik/get/flux-dev-option
freePikRouter.route('/get/flux-dev-option').get(verifyJWT,getFreepikFluxDevOptions);

// POST /api/freepik/generate/imagen
freePikRouter.route('/generate/imagen').post(verifyJWT,FreePikGenerateImageImagen3);
// GET /api/freepik/get/imagen-option
freePikRouter.route('/get/imagen-option').get(verifyJWT,getFreepikImagen3Options);

// POST /api/freepik/generate/mystic
freePikRouter.route('/generate/mystic').post(verifyJWT,FreePikGenerateImageMystic);
export default freePikRouter;
