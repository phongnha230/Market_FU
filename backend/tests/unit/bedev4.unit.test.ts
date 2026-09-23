import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CreateVoucherSchema,
  UpdateVoucherSchema,
  QueryVouchersSchema,
  UseVoucherSchema,
} from '../../src/modules/vouchers/voucher.dto';
import {
  CreateReportSchema,
  ResolveReportSchema,
  CreateDisputeSchema,
  ResolveDisputeSchema,
  ApproveKycSchema,
  RejectKycSchema,
  QueryKycSchema,
} from '../../src/modules/reports/report.dto';

describe('Unit Test: BE-DEV 4 (Vouchers, Reports, Disputes & KYC Moderation)', () => {
  describe('Voucher Module Schemas', () => {
    it('CreateVoucherSchema: Hợp lệ với đầy đủ thông tin chuẩn', () => {
      const valid = CreateVoucherSchema.safeParse({
        title: 'Voucher Cơm Căn Tin 15k',
        partner: 'CANTEEN',
        coinCost: 150,
        discountValue: 15000,
        quantity: 50,
        validDays: 30,
      });
      assert.strictEqual(valid.success, true);
    });

    it('CreateVoucherSchema: Lỗi khi coinCost hoặc discountValue <= 0', () => {
      const invalid = CreateVoucherSchema.safeParse({
        title: 'Voucher Lỗi',
        partner: 'PASSIO',
        coinCost: 0,
        discountValue: -5000,
      });
      assert.strictEqual(invalid.success, false);
    });

    it('UseVoucherSchema: Hợp lệ với mã voucher chuẩn', () => {
      const valid = UseVoucherSchema.safeParse({
        voucherCode: 'FUV-CAN-8F2B1C9D',
      });
      assert.strictEqual(valid.success, true);
    });

    it('QueryVouchersSchema: Tự động coerce page và limit mặc định', () => {
      const parsed = QueryVouchersSchema.parse({});
      assert.strictEqual(parsed.page, 1);
      assert.strictEqual(parsed.limit, 20);
    });
  });

  describe('Report & Dispute Module Schemas', () => {
    it('CreateReportSchema: Hợp lệ khi tố cáo sản phẩm hoặc người dùng', () => {
      const valid = CreateReportSchema.safeParse({
        targetType: 'PRODUCT',
        targetId: '65f1a2b3c4d5e6f7a8b9c0d1',
        reason: 'Hàng giả/Lừa đảo',
        details: 'Người bán giao đồ hỏng không giống ảnh chụp',
      });
      assert.strictEqual(valid.success, true);
    });

    it('CreateReportSchema: Lỗi khi targetType không hợp lệ', () => {
      const invalid = CreateReportSchema.safeParse({
        targetType: 'ORDER', // Không hợp lệ
        targetId: '65f1a2b3c4d5e6f7a8b9c0d1',
        reason: 'Lỗi giao diện',
      });
      assert.strictEqual(invalid.success, false);
    });

    it('ResolveReportSchema: Cho phép BAN_USER, HIDE_PRODUCT, DISMISS', () => {
      const ban = ResolveReportSchema.safeParse({ action: 'BAN_USER' });
      const hide = ResolveReportSchema.safeParse({ action: 'HIDE_PRODUCT' });
      const dismiss = ResolveReportSchema.safeParse({ action: 'DISMISS' });
      const invalid = ResolveReportSchema.safeParse({ action: 'DELETE_EVERYTHING' });

      assert.strictEqual(ban.success, true);
      assert.strictEqual(hide.success, true);
      assert.strictEqual(dismiss.success, true);
      assert.strictEqual(invalid.success, false);
    });

    it('CreateDisputeSchema: Bắt buộc proofVideoUrl phải là URL hợp lệ', () => {
      const valid = CreateDisputeSchema.safeParse({
        orderId: '65f1a2b3c4d5e6f7a8b9c0d1',
        reason: 'Quạt cắm điện không quay cánh, phát tiếng kêu lạ',
        proofVideoUrl: 'https://storage.marketfu.com/videos/proof-test.mp4',
      });
      assert.strictEqual(valid.success, true);

      const invalidUrl = CreateDisputeSchema.safeParse({
        orderId: '65f1a2b3c4d5e6f7a8b9c0d1',
        reason: 'Quạt hỏng',
        proofVideoUrl: 'not-a-valid-url',
      });
      assert.strictEqual(invalidUrl.success, false);
    });

    it('ResolveDisputeSchema: Chấp thuận REFUND_BUYER hoặc PAY_SELLER', () => {
      const refund = ResolveDisputeSchema.safeParse({ decision: 'REFUND_BUYER' });
      const pay = ResolveDisputeSchema.safeParse({ decision: 'PAY_SELLER' });
      const invalid = ResolveDisputeSchema.safeParse({ decision: 'SPLIT_MONEY' });

      assert.strictEqual(refund.success, true);
      assert.strictEqual(pay.success, true);
      assert.strictEqual(invalid.success, false);
    });
  });

  describe('KYC Moderation Schemas', () => {
    it('ApproveKycSchema: Mặc định bonusCoins = 200', () => {
      const parsed = ApproveKycSchema.parse({});
      assert.strictEqual(parsed.bonusCoins, 200);
    });

    it('RejectKycSchema: Yêu cầu bắt buộc phải có lý do từ chối >= 5 ký tự', () => {
      const valid = RejectKycSchema.safeParse({
        reason: 'Hình ảnh thẻ sinh viên bị nhòe và lóa sáng, không thấy rõ MSSV',
      });
      assert.strictEqual(valid.success, true);

      const tooShort = RejectKycSchema.safeParse({ reason: 'Mờ' });
      assert.strictEqual(tooShort.success, false);
    });

    it('QueryKycSchema: Chỉ chấp nhận PENDING, APPROVED, REJECTED; từ chối NONE (B4-8)', () => {
      const pending = QueryKycSchema.safeParse({ status: 'PENDING' });
      const approved = QueryKycSchema.safeParse({ status: 'APPROVED' });
      const rejected = QueryKycSchema.safeParse({ status: 'REJECTED' });
      const noneStatus = QueryKycSchema.safeParse({ status: 'NONE' });

      assert.strictEqual(pending.success, true);
      assert.strictEqual(approved.success, true);
      assert.strictEqual(rejected.success, true);
      assert.strictEqual(noneStatus.success, false);
    });
  });
});
