import express from 'express';
import { FreePikGenerateImageClassicFast, FreePikGenrateImageFlux as generateImageFromText } from '../controllers/FreePik.controller.js';

const router = express.Router();

// POST /api/freepik/generate
router.route('/generate/flux').post(generateImageFromText);
router.route('/generate/classic-fast').post(FreePikGenerateImageClassicFast);

export default router;
