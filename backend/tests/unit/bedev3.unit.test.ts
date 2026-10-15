import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createOrderSchema,
  verifyHandshakeSchema,
  updateShippingStatusSchema,
  queryOrdersSchema,
  cancelOrderSchema,
} from '../../src/modules/orders/order.dto';
import {
  webhookPaymentSchema,
  checkPaymentStatusSchema,
} from '../../src/modules/payments/payment.dto';
import {
  createReviewSchema,
  queryUserReviewsSchema,
} from '../../src/modules/reviews/review.dto';

describe('Unit Test: BE-DEV 3 (Orders, Payments & Blind Reviews)', () => {
  describe('Order Module Schemas', () => {
    it('createOrderSchema: Hợp lệ khi tạo đơn MEETUP không cần thông tin shipping', () => {
      const result = createOrderSchema.safeParse({
        productId: '65f1a2b3c4d5e6f7a8b9c0d1',
        orderType: 'MEETUP',
        paymentMethod: 'CASH',
      });
      assert.strictEqual(result.success, true);
    });

    it('createOrderSchema: Bắt buộc thông tin shipping khi orderType = SHIP_COD', () => {
      const invalid = createOrderSchema.safeParse({
        productId: '65f1a2b3c4d5e6f7a8b9c0d1',
        orderType: 'SHIP_COD',
      });
      assert.strictEqual(invalid.success, false);

      const valid = createOrderSchema.safeParse({
        productId: '65f1a2b3c4d5e6f7a8b9c0d1',
        orderType: 'SHIP_COD',
        shipping: {
          receiverName: 'Nguyễn Văn A',
          receiverPhone: '0987654321',
          shippingAddress: 'Phòng 302, KTX Dom A, Campus Hòa Lạc',
        },
      });
      assert.strictEqual(valid.success, true);
    });

    it('createOrderSchema: Chặn coinsUsed là số âm', () => {
      const invalid = createOrderSchema.safeParse({
        productId: '65f1a2b3c4d5e6f7a8b9c0d1',
        orderType: 'MEETUP',
        coinsUsed: -50,
      });
      assert.strictEqual(invalid.success, false);
    });

    it('verifyHandshakeSchema: Hợp lệ khi có handshakeToken hoặc handshakeOtp 4 số (Task 3.1)', () => {
      const validToken = verifyHandshakeSchema.safeParse({
        handshakeToken: 'ORD-883921-AB12.' + 'a'.repeat(64),
      });
      assert.strictEqual(validToken.success, true);

      const validOtp = verifyHandshakeSchema.safeParse({
        handshakeOtp: '8392',
      });
      assert.strictEqual(validOtp.success, true);

      // Accept 4-6 digits and reject longer or non-numeric values.
      assert.strictEqual(verifyHandshakeSchema.safeParse({ handshakeOtp: '839201' }).success, true);
      assert.strictEqual(verifyHandshakeSchema.safeParse({ handshakeOtp: '8392017' }).success, false);
      assert.strictEqual(verifyHandshakeSchema.safeParse({ handshakeOtp: 'abcd' }).success, false);

      const invalid = verifyHandshakeSchema.safeParse({});
      assert.strictEqual(invalid.success, false);
    });

    it('createReviewSchema: Chấp nhận proofVideoUrl + images (thưởng +200 Xu kèm video test)', () => {
      const valid = createReviewSchema.safeParse({
        orderId: '65f1a2b3c4d5e6f7a8b9c0d1',
        rating: 5,
        comment: 'Đồ đúng mô tả, đã quay video test cắm điện 24h.',
        proofVideoUrl: 'https://cdn.marketfu.dev/videos/test-quat.mp4',
        images: ['https://cdn.marketfu.dev/reviews/1.webp'],
      });
      assert.strictEqual(valid.success, true);

      const badUrl = createReviewSchema.safeParse({
        orderId: '65f1a2b3c4d5e6f7a8b9c0d1',
        rating: 5,
        proofVideoUrl: 'not-a-url',
      });
      assert.strictEqual(badUrl.success, false);
    });

    it('updateShippingStatusSchema: Chỉ cho phép SHIPPING', () => {
      const valid = updateShippingStatusSchema.safeParse({
        status: 'SHIPPING',
        trackingCode: 'TRACK123456',
      });
      assert.strictEqual(valid.success, true);

      const invalid = updateShippingStatusSchema.safeParse({
        status: 'INVALID_STATUS',
      });
      assert.strictEqual(invalid.success, false);
      assert.strictEqual(updateShippingStatusSchema.safeParse({ status: 'DELIVERED' }).success, false);
    });

    it('queryOrdersSchema: Mặc định page = 1, limit = 20', () => {
      const parsed = queryOrdersSchema.parse({});
      assert.strictEqual(parsed.page, 1);
      assert.strictEqual(parsed.limit, 20);
    });
  });

  describe('Payment Webhook Schemas', () => {
    it('webhookPaymentSchema: Nhận diện payload hợp lệ từ SePay / VietQR', () => {
      const parsed = webhookPaymentSchema.safeParse({
        orderCode: 'ORD-88392-HCM-HL',
        transferAmount: 1225000,
        gateway: 'MBBank',
        content: 'Chuyen tien ORD-88392-HCM-HL',
      });
      assert.strictEqual(parsed.success, true);
    });

    it('checkPaymentStatusSchema: Yêu cầu bắt buộc orderCode', () => {
      const valid = checkPaymentStatusSchema.safeParse({ orderCode: 'ORD-88392-HCM-HL' });
      assert.strictEqual(valid.success, true);

      const invalid = checkPaymentStatusSchema.safeParse({ orderCode: '' });
      assert.strictEqual(invalid.success, false);
    });

    it('shippingWebhookSchema: Hợp lệ với payload webhook từ GHTK hoặc GHN', () => {
      const { shippingWebhookSchema } = require('../../src/modules/orders/webhook.dto');
      const valid = shippingWebhookSchema.safeParse({
        order_code: 'ORD-88392-HCM-HL',
        status: 'delivered',
        tracking_order_code: 'TRACK123456',
        status_report: [{ ErrorCode: '0', ErrorText: 'Giao hàng thành công' }],
      });
      assert.strictEqual(valid.success, true);
    });
  });

  describe('Review Module Schemas', () => {
    it('createReviewSchema: Hợp lệ với rating từ 1 đến 5', () => {
      const valid = createReviewSchema.safeParse({
        orderId: '65f1a2b3c4d5e6f7a8b9c0d1',
        rating: 5,
        comment: 'Bạn bán nhiệt tình, đúng giờ tại sảnh Alpha!',
      });
      assert.strictEqual(valid.success, true);
    });

    it('createReviewSchema: Chặn rating < 1 hoặc > 5', () => {
      const zeroStar = createReviewSchema.safeParse({
        orderId: '65f1a2b3c4d5e6f7a8b9c0d1',
        rating: 0,
      });
      assert.strictEqual(zeroStar.success, false);

      const sixStar = createReviewSchema.safeParse({
        orderId: '65f1a2b3c4d5e6f7a8b9c0d1',
        rating: 6,
      });
      assert.strictEqual(sixStar.success, false);
    });

    it('queryUserReviewsSchema: Mặc định page = 1, limit = 20', () => {
      const parsed = queryUserReviewsSchema.parse({});
      assert.strictEqual(parsed.page, 1);
      assert.strictEqual(parsed.limit, 20);
    });
  });

  describe('Campus Shipping Matrix & Fee Calculation', () => {
    const { calculateShippingFee } = require('../../src/modules/orders/shipping-matrix');
    const { estimateShippingSchema } = require('../../src/modules/orders/order.dto');

    it('calculateShippingFee: MEETUP nội bộ luôn miễn phí (fee = 0)', () => {
      const res = calculateShippingFee({
        orderType: 'MEETUP',
        fromCampus: 'HOL',
        toCampus: 'HOL',
      });
      assert.strictEqual(res.shippingFee, 0);
      assert.match(res.routeTitle, /Safe Handoff/);
    });

    it('calculateShippingFee: Nội bộ cùng campus giao KTX = 10.000đ', () => {
      const res = calculateShippingFee({
        orderType: 'SHIP_COD',
        fromCampus: 'HOL',
        toCampus: 'HOL',
      });
      assert.strictEqual(res.shippingFee, 10000);
      assert.strictEqual(res.estimatedDays, 'Giao trong ngày');
    });

    it('calculateShippingFee: Cận vùng Đà Nẵng ⇄ Quy Nhơn = 20.000đ', () => {
      const res = calculateShippingFee({
        orderType: 'SHIP_COD',
        fromCampus: 'DAD',
        toCampus: 'QN',
      });
      assert.strictEqual(res.shippingFee, 20000);
      assert.strictEqual(res.estimatedDays, '1 ngày');
    });

    it('calculateShippingFee: Tuyến Bắc - Nam (Hà Nội ⇄ TP.HCM) = 40.000đ', () => {
      const res = calculateShippingFee({
        orderType: 'SHIP_COD',
        fromCampus: 'HOL',
        toCampus: 'HCM',
      });
      assert.strictEqual(res.shippingFee, 40000);
      assert.strictEqual(res.estimatedDays, '2 - 3 ngày');
    });

    it('estimateShippingSchema: Kiểm tra hợp lệ và chặn campus không hợp lệ', () => {
      const valid = estimateShippingSchema.safeParse({
        fromCampus: 'QN',
        toCampus: 'DAD',
        orderType: 'SHIP_COD',
      });
      assert.strictEqual(valid.success, true);

      const invalid = estimateShippingSchema.safeParse({
        fromCampus: 'TOKYO',
      });
      assert.strictEqual(invalid.success, false);
    });
  });
});
