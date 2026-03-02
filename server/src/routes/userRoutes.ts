import express from 'express';
import { getUserProfile, toggleAnonymousMode, getHealthProfile, updateHealthProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect as any, getUserProfile as any);
router.patch('/anonymous-mode', protect as any, toggleAnonymousMode as any);
router.get('/health-profile', protect as any, getHealthProfile as any);
router.patch('/health-profile', protect as any, updateHealthProfile as any);

export default router;
