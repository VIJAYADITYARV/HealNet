import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getHospitalMentions,
    getExperienceTrends,
    getSymptomFrequency,
    getSimilarCaseMatchCount,
    getModerationActivity,
    exportReportsData
} from '../controllers/reportAggregations.js';

const router = express.Router();

router.get('/export', protect as any, admin as any, exportReportsData as any);
router.get('/hospital-mentions', protect as any, admin as any, getHospitalMentions as any);
router.get('/experience-trends', protect as any, admin as any, getExperienceTrends as any);
router.get('/symptom-frequency', protect as any, admin as any, getSymptomFrequency as any);
router.get('/similar-case-matches', protect as any, admin as any, getSimilarCaseMatchCount as any);
router.get('/moderation-activity', protect as any, admin as any, getModerationActivity as any);

export default router;
