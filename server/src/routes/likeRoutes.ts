import express from 'express';
import { addLike, removeLike, getUserLikes } from '../controllers/likeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect as any, addLike as any);
router.delete('/:experienceId', protect as any, removeLike as any);
router.get('/', protect as any, getUserLikes as any);

export default router;
