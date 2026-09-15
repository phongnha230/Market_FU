import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { VoucherService } from './voucher.service';
import {
  redeemVoucherSchema,
  queryMyVouchersSchema,
  useVoucherSchema,
  createVoucherAdminSchema,
} from './voucher.dto';

const voucherService = new VoucherService();

export class VoucherController {
  // GET /api/vouchers
  async getAvailableVouchers(req: Request, res: Response, next: NextFunction) {
    try {
      const vouchers = await voucherService.getAvailableVouchers();
      res.json({
        success: true,
        message: 'Lấy danh sách voucher khả dụng thành công',
        data: vouchers,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/vouchers/redeem
  async redeemVoucher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = redeemVoucherSchema.parse(req.body);
      const result = await voucherService.redeemVoucher(req.user!.userId, input);
      res.status(201).json({
        success: true,
        message: 'Đổi voucher thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/vouchers/my-vouchers
  async getMyVouchers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryMyVouchersSchema.parse(req.query);
      const result = await voucherService.getMyVouchers(req.user!.userId, query);
      res.json({
        success: true,
        message: 'Lấy danh sách voucher cá nhân thành công',
        data: result.vouchers,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/vouchers/use
  async useVoucher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = useVoucherSchema.parse(req.body);
      const result = await voucherService.useVoucher(input);
      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/vouchers/admin/create
  async createVoucher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = createVoucherAdminSchema.parse(req.body);
      const voucher = await voucherService.createVoucher(input);
      res.status(201).json({
        success: true,
        message: 'Tạo voucher mới thành công',
        data: voucher,
      });
    } catch (error) {
      next(error);
    }
  }
}
