import express from 'express';
import { createComment, getCommentsForExperience, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect as any, createComment as any);
router.get('/:experienceId', getCommentsForExperience as any);
router.delete('/:id', protect as any, deleteComment as any);

export default router;
