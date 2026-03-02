import express from 'express';
import {
    getAnalytics,
    getTrendingConditions,
    getTreatmentSuccess,
    getHospitalTrustScores
} from '../controllers/analyticsController.js';

import { compareEntities } from '../controllers/compareController.js';

const router = express.Router();

router.get('/', getAnalytics as any);
router.get('/trending-conditions', getTrendingConditions as any);
router.get('/treatment-success', getTreatmentSuccess as any);
router.get('/hospital-trust', getHospitalTrustScores as any);

router.post('/compare', compareEntities as any);

export default router;
