import express from 'express';
import { getReports, handleAdminAction } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/reports', protect as any, admin as any, getReports as any);
router.patch('/action', protect as any, admin as any, handleAdminAction as any);

export default router;
