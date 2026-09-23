import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// ============================================================================
// 1. CÁC ROUTE PROFILE DÀNH CHO USER HIỆN TẠI (Hỗ trợ tương thích ngược)
// Khuyến nghị: Các client mới nên gọi trực tiếp qua `/api/profile`
// ============================================================================
router.get('/me', authenticate, (req, res, next) => userController.getMyProfile(req, res, next));
router.get('/me/favorites', authenticate, (req, res, next) =>
  userController.getMyFavorites(req, res, next)
);
router.get('/profile', authenticate, (req, res, next) => userController.getMyProfile(req, res, next));
router.patch('/me', authenticate, (req, res, next) => userController.updateMyProfile(req, res, next));
router.patch('/me/bank-account', authenticate, (req, res, next) =>
  userController.updateBankAccount(req, res, next)
);
router.post('/me/kyc', authenticate, upload.single('cardImage'), (req, res, next) =>
  userController.submitKyc(req, res, next)
);
router.post('/kyc/student-card', authenticate, upload.single('cardImage'), (req, res, next) =>
  userController.submitKyc(req, res, next)
);

// ============================================================================
// 2. CÁC ROUTE QUẢN TRỊ USER & PUBLIC USER DETAIL
// ============================================================================
// Admin xem danh sách tất cả users
router.get('/', authenticate, authorize('ADMIN'), (req, res, next) =>
  userController.getUsers(req, res, next)
);

// Redis ZSET: Bảng xếp hạng sinh viên uy tín nhất (đặt trước :id)
router.get('/leaderboard/reputation', (req, res, next) =>
  userController.getReputationLeaderboard(req, res, next)
);

// Chi tiết user theo ID
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));

// Admin khóa/mở khóa tài khoản user
router.patch('/:id/status', authenticate, authorize('ADMIN'), (req, res, next) =>
  userController.updateUserStatus(req, res, next)
);

export default router;
