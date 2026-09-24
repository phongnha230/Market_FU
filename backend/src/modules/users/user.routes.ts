import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// ============================================================================
// 1. CÁC ROUTE PROFILE DÀNH CHO USER HIỆN TẠI (Hỗ trợ tương thích ngược)
// Khuyến nghị: Các client mới nên gọi trực tiếp qua `/api/profile`
// ============================================================================
router.get('/me', authenticate, userController.getMyProfile);
router.get('/me/favorites', authenticate, userController.getMyFavorites);
router.get('/profile', authenticate, userController.getMyProfile);
router.patch('/me', authenticate, userController.updateMyProfile);
router.patch('/me/bank-account', authenticate, userController.updateBankAccount);
router.post('/me/kyc', authenticate, upload.single('cardImage'), userController.submitKyc);
router.post('/kyc/student-card', authenticate, upload.single('cardImage'), userController.submitKyc);

// ============================================================================
// 2. CÁC ROUTE QUẢN TRỊ USER & PUBLIC USER DETAIL
// ============================================================================
// Admin xem danh sách tất cả users
router.get('/', authenticate, authorize('ADMIN'), userController.getUsers);

// Redis ZSET: Bảng xếp hạng sinh viên uy tín nhất (đặt trước :id)
router.get('/leaderboard/reputation', userController.getReputationLeaderboard);

// Chi tiết user theo ID
router.get('/:id', userController.getUserById);

// Admin khóa/mở khóa tài khoản user
router.patch('/:id/status', authenticate, authorize('ADMIN'), userController.updateUserStatus);

export default router;
