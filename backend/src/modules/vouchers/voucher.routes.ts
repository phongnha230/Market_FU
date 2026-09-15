import { Router } from 'express';
import { VoucherController } from './voucher.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();
const voucherController = new VoucherController();

// 1. Xem kho voucher khả dụng (Public hoặc Sinh viên)
router.get('/', voucherController.getAvailableVouchers.bind(voucherController));

// 2. Đổi Xu lấy Voucher (Yêu cầu đăng nhập)
router.post('/redeem', authenticate, voucherController.redeemVoucher.bind(voucherController));

// 3. Xem danh sách Voucher cá nhân đã đổi (Yêu cầu đăng nhập)
router.get('/my-vouchers', authenticate, voucherController.getMyVouchers.bind(voucherController));

// 4. Quét mã sử dụng Voucher tại quầy (Nhân viên / Admin)
router.patch('/use', authenticate, voucherController.useVoucher.bind(voucherController));

// 5. [ADMIN] Tạo thêm loại voucher mới
router.post('/admin/create', authenticate, authorize('ADMIN'), voucherController.createVoucher.bind(voucherController));

export default router;
