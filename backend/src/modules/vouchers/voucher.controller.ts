import { Request, Response, NextFunction } from 'express';
import { VoucherService } from './voucher.service';
import {
  CreateVoucherSchema,
  UpdateVoucherSchema,
  QueryVouchersSchema,
  QueryUserVouchersSchema,
  UseVoucherSchema,
} from './voucher.dto';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

const voucherService = new VoucherService();

export class VoucherController {
  /**
   * 1. Lấy danh sách Voucher công khai
   */
  async getVouchers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = QueryVouchersSchema.parse(req.query);
      const result = await voucherService.getVouchers(query);
      return sendSuccess(res, result.vouchers, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 2. Lấy chi tiết Voucher theo ID
   */
  async getVoucherById(req: Request, res: Response, next: NextFunction) {
    try {
      const voucher = await voucherService.getVoucherById(req.params.id as string);
      return sendSuccess(res, voucher);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 3. Tạo mới Voucher (Admin)
   */
  async createVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateVoucherSchema.parse(req.body);
      const voucher = await voucherService.createVoucher(input);
      return sendSuccess(res, voucher, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 4. Cập nhật Voucher (Admin)
   */
  async updateVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const input = UpdateVoucherSchema.parse(req.body);
      const voucher = await voucherService.updateVoucher(req.params.id as string, input);
      return sendSuccess(res, voucher);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 5. Xóa Voucher (Admin)
   */
  async deleteVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await voucherService.deleteVoucher(req.params.id as string);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 6. Đổi Voucher bằng Campus Coins
   */
  async redeemVoucher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const voucherId = req.params.id as string;
      const result = await voucherService.redeemVoucher(userId, voucherId);
      return sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 7. Xem danh sách Voucher cá nhân đã đổi
   */
  async getMyVouchers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const query = QueryUserVouchersSchema.parse(req.query);
      const result = await voucherService.getMyVouchers(userId, query);
      return sendSuccess(res, result.userVouchers, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 8. Quét mã sử dụng Voucher
   */
  async useVoucher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = UseVoucherSchema.parse(req.body);
      const requester = req.user!;
      const result = await voucherService.useVoucher(input, requester);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const voucherController = new VoucherController();
