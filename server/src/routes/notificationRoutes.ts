import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect as any, getNotifications as any);
router.patch('/read-all', protect as any, markAllAsRead as any);
router.patch('/:id/read', protect as any, markAsRead as any);

export default router;
