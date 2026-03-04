import express from 'express';
import { sendMessage, getConversation, getConversationsList } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect as any, sendMessage as any);
router.get('/conversations/list', protect as any, getConversationsList as any);
router.get('/:userId', protect as any, getConversation as any);

export default router;
