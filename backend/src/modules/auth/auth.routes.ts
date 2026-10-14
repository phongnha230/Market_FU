import { Router } from 'express';
import { authController } from './auth.controller';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// ============================================================================
// 1. ĐĂNG KÝ & ĐĂNG NHẬP (Áp dụng Rate Limiter chống Brute-force)
// ============================================================================
router.post('/register', authRateLimiter, authController.register);
router.post('/send-register-otp', authRateLimiter, authController.sendRegisterOtp);
router.post('/verify-register-otp', authRateLimiter, authController.verifyRegisterOtp);
router.post('/resend-register-otp', authRateLimiter, authController.resendRegisterOtp);
router.post('/login', authRateLimiter, authController.login);
router.post('/google', authRateLimiter, authController.googleAuth);
router.post('/phone', authRateLimiter, authController.phoneAuth);

// ============================================================================
// 2. QUẢN LÝ PHIÊN ĐĂNG NHẬP & TOKEN (Áp dụng Rate Limiter chống lạm dụng)
// ============================================================================
router.post('/refresh-token', authRateLimiter, authController.refreshToken);
router.post('/logout', authRateLimiter, authController.logout);

// ============================================================================
// 3. THAY ĐỔI MẬT KHẨU (Bắt buộc đăng nhập - RESTful PATCH)
// ============================================================================
router.patch('/change-password', authenticate, authController.changePassword);

// ============================================================================
// 4. QUÊN MẬT KHẨU (Gửi OTP Email & Đặt lại mật khẩu)
// ============================================================================
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);

export default router;
