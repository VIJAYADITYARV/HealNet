import express from 'express';
import multer from 'multer';
import {
    analyzeSymptomsWithAI,
    getAIRecommendations,
    processMedicalReportOCR,
    getComparisonAIInsight,
    generateExperienceDraft,
    analyzeChatContext,
    getAICommunityTrends
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer setup for OCR
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/query', protect as any, analyzeSymptomsWithAI as any);
router.get('/recommendations', protect as any, getAIRecommendations as any);

// OCR Route
router.post('/scan-report', protect as any, upload.single('report'), processMedicalReportOCR as any);

// AI Insight Routes
router.post('/hospital-compare', protect as any, getComparisonAIInsight as any);
router.post('/experience-draft', protect as any, generateExperienceDraft as any);
router.post('/chat-context', protect as any, analyzeChatContext as any);
router.get('/trends', protect as any, getAICommunityTrends as any);

export default router;
