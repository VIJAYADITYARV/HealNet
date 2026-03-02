import express from 'express';
import { analyzeSymptomsWithAI } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/query', protect as any, analyzeSymptomsWithAI as any);

export default router;
