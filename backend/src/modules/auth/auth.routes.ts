import { Router } from 'express';
import { authController } from './auth.controller';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware';
import { authenticate } from '../../middlewares/auth.middleware';

import { verifyAccessToken } from '../../utils/token';

const router = Router();

// ============================================================================
// 1. ĐĂNG KÝ & ĐĂNG NHẬP (Áp dụng Rate Limiter chống Brute-force)
// ============================================================================
router.post('/register', authRateLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/login', authRateLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/google', authRateLimiter, (req, res, next) => authController.googleAuth(req, res, next));
router.post('/phone', authRateLimiter, (req, res, next) => authController.phoneAuth(req, res, next));

// ============================================================================
// 2. QUẢN LÝ PHIÊN ĐĂNG NHẬP & TOKEN
// ============================================================================
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      (req as any).user = verifyAccessToken(token);
    } catch {
      // Ignored: Controller sẽ fallback sang Refresh Token trong cookie/body
    }
  }
  authController.logout(req, res, next);
});

// ============================================================================
// 3. THAY ĐỔI MẬT KHẨU (Bắt buộc đăng nhập)
// ============================================================================
router.patch('/change-password', authenticate, (req, res, next) =>
  authController.changePassword(req, res, next)
);

// ============================================================================
// 4. QUÊN MẬT KHẨU (Gửi OTP Email & Đặt lại mật khẩu)
// ============================================================================
router.post('/forgot-password', authRateLimiter, (req, res, next) =>
  authController.forgotPassword(req, res, next)
);
router.post('/reset-password', authRateLimiter, (req, res, next) =>
  authController.resetPassword(req, res, next)
);

export default router;
