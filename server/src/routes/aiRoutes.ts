import express from 'express';
import { analyzeSymptomsWithAI, getAIRecommendations } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/query', protect as any, analyzeSymptomsWithAI as any);
router.get('/recommendations', protect as any, getAIRecommendations as any);

export default router;
