import express from 'express';
import { registerUser, loginUser, getMe, verifyMFALogin } from '../controllers/authController.js';
import { setupMFA, verifyMFA, disableMFA } from '../controllers/mfaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser as any);
router.post('/login', loginUser as any);
router.get('/me', protect as any, getMe as any);

// MFA Routes
router.post('/mfa/setup', protect as any, setupMFA as any);
router.post('/mfa/verify', protect as any, verifyMFA as any);
router.post('/mfa/disable', protect as any, disableMFA as any);
router.post('/mfa/login-verify', verifyMFALogin as any);

export default router;
