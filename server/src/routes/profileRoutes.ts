import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:username', getProfile as any);
router.put('/', protect as any, updateProfile as any);

export default router;
