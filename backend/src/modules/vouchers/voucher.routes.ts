import { Router } from 'express';
import { voucherController } from './voucher.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// 1. Xem danh sách Voucher cá nhân (Đặt trước :id)
// /me là endpoint chuẩn, /my-vouchers là alias tương thích ngược (B4-8)
router.get('/me', authenticate, voucherController.getMyVouchers);
router.get('/my-vouchers', authenticate, voucherController.getMyVouchers);

// 2. Quét mã sử dụng Voucher
router.post('/use', authenticate, voucherController.useVoucher);
router.post('/restore', authenticate, voucherController.restoreVoucher);

// 3. Xem danh sách Voucher công khai
router.get('/', voucherController.getVouchers);

// 4. Xem chi tiết 1 Voucher
router.get('/:id', voucherController.getVoucherById);

// 5. Đổi Voucher bằng Xu
router.post('/:id/redeem', authenticate, voucherController.redeemVoucher);

// 6. Quản trị Voucher (Dành cho ADMIN)
router.post('/', authenticate, authorize('ADMIN'), voucherController.createVoucher);
router.patch('/:id', authenticate, authorize('ADMIN'), voucherController.updateVoucher);
router.delete('/:id', authenticate, authorize('ADMIN'), voucherController.deleteVoucher);

export default router;
