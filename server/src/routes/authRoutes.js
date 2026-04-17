// Auth route definitions for registration, sign-in, verification, password reset, and profile checks.
import express from 'express';
import { registerUser, verifyEmail, loginUser, forgotPassword, resetPassword, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

export default router;
