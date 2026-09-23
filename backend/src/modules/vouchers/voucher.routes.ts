import { Router } from 'express';
import { voucherController } from './voucher.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// 1. Xem danh sách Voucher cá nhân (Đặt trước :id)
// /me là endpoint chuẩn, /my-vouchers là alias tương thích ngược (B4-8)
router.get('/me', authenticate, (req, res, next) =>
  voucherController.getMyVouchers(req, res, next)
);
router.get('/my-vouchers', authenticate, (req, res, next) =>
  voucherController.getMyVouchers(req, res, next)
);

// 2. Quét mã sử dụng Voucher
router.post('/use', authenticate, (req, res, next) =>
  voucherController.useVoucher(req, res, next)
);

// 3. Xem danh sách Voucher công khai
router.get('/', (req, res, next) => voucherController.getVouchers(req, res, next));

// 4. Xem chi tiết 1 Voucher
router.get('/:id', (req, res, next) => voucherController.getVoucherById(req, res, next));

// 5. Đổi Voucher bằng Xu
router.post('/:id/redeem', authenticate, (req, res, next) =>
  voucherController.redeemVoucher(req, res, next)
);

// 6. Quản trị Voucher (Dành cho ADMIN)
router.post('/', authenticate, authorize('ADMIN'), (req, res, next) =>
  voucherController.createVoucher(req, res, next)
);
router.patch('/:id', authenticate, authorize('ADMIN'), (req, res, next) =>
  voucherController.updateVoucher(req, res, next)
);
router.delete('/:id', authenticate, authorize('ADMIN'), (req, res, next) =>
  voucherController.deleteVoucher(req, res, next)
);

export default router;
