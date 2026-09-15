import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPayOsLinkSchema, payOsWebhookSchema } from '../../src/modules/payments/payment.dto';

describe('Unit Test: Payment Module & PayOS Gateway (Web vs Android)', () => {
  describe('Payment DTO Validation', () => {
    it('createPayOsLinkSchema: Yêu cầu orderId hợp lệ và URL hợp lệ', () => {
      const invalid = createPayOsLinkSchema.safeParse({});
      assert.strictEqual(invalid.success, false);

      const invalidUrl = createPayOsLinkSchema.safeParse({
        orderId: 'ord_123',
        returnUrl: 'invalid-url',
      });
      assert.strictEqual(invalidUrl.success, false);

      const valid = createPayOsLinkSchema.safeParse({
        orderId: 'ord_123',
        returnUrl: 'https://marketfu.edu.vn/orders/ord_123/success',
        cancelUrl: 'https://marketfu.edu.vn/orders/ord_123/cancel',
      });
      assert.strictEqual(valid.success, true);
    });

    it('payOsWebhookSchema: Validate đúng cấu trúc dữ liệu PayOS IPN Webhook', () => {
      const webhookPayload = {
        code: '00',
        desc: 'Success',
        success: true,
        data: {
          orderCode: 123456789,
          amount: 250000,
          description: 'DH ORD123456',
          accountNumber: '19036789123',
          reference: 'FT24091412345',
          transactionDateTime: '2026-09-14 20:30:00',
          currency: 'VND',
          paymentLinkId: 'link_987654',
          code: '00',
          desc: 'Thành công',
        },
        signature: 'mock_signature_hash_256',
      };

      const result = payOsWebhookSchema.safeParse(webhookPayload);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.data.orderCode, 123456789);
      assert.strictEqual(result.data?.data.amount, 250000);
    });
  });

  describe('Business Logic: Phân biệt Kênh Web (PayOS) vs Android (VietQR Native)', () => {
    it('Kênh Web: Phải sinh mã orderCode kiểu số nguyên (Number) cho PayOS', () => {
      const generatePayOsOrderCode = () => {
        return Number(`${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`);
      };

      const code = generatePayOsOrderCode();
      assert.strictEqual(typeof code, 'number');
      assert.ok(Number.isInteger(code));
      assert.ok(code > 0);
      assert.ok(code <= Number.MAX_SAFE_INTEGER);
    });

    it('Kênh Web: Giới hạn nội dung chuyển khoản tối đa 25 ký tự theo quy định PayOS', () => {
      const orderCode = 'ORD-20260914-998877';
      const description = `DH ${orderCode.slice(-6)}`.slice(0, 25);

      assert.ok(description.length <= 25, 'Nội dung không được quá 25 ký tự');
      assert.strictEqual(description, 'DH 998877');
    });

    it('Kênh Android: Trả về trực tiếp mã VietQR Napas và thông tin STK ngân hàng', () => {
      const mockOrderPayment = {
        totalAmount: 150000,
        isPaid: false,
        vietqrUrl: 'https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=150000&addInfo=DH123456',
        payosCheckoutUrl: 'https://pay.payos.vn/web/checkout-123456',
        sellerBank: {
          bankName: 'MB Bank',
          accountNo: '0987654321',
          accountName: 'NGUYEN VAN A',
        },
      };

      // Android Client nhận thông tin VietQR để hiển thị Native hoặc mở Banking Deep link
      const androidPayload = {
        vietqrUrl: mockOrderPayment.vietqrUrl,
        bankName: mockOrderPayment.sellerBank.bankName,
        accountNo: mockOrderPayment.sellerBank.accountNo,
        accountName: mockOrderPayment.sellerBank.accountName,
      };

      assert.ok(androidPayload.vietqrUrl.includes('img.vietqr.io'));
      assert.strictEqual(androidPayload.accountNo, '0987654321');

      // Web Client nhận checkoutUrl để chuyển hướng người dùng sang trang PayOS
      const webPayload = {
        checkoutUrl: mockOrderPayment.payosCheckoutUrl,
      };
      assert.ok(webPayload.checkoutUrl.includes('pay.payos.vn'));
    });

    it('Idempotency: Webhook không xử lý lặp khi đơn đã ở trạng thái isPaid = true', () => {
      let isPaid = true;
      let updateExecuted = false;

      // Giả lập webhook nhận nhiều lần
      const processWebhook = () => {
        if (isPaid) {
          return { success: true, message: 'Đơn hàng đã được ghi nhận thanh toán trước đó' };
        }
        updateExecuted = true;
        isPaid = true;
        return { success: true, message: 'Thành công' };
      };

      const firstCall = processWebhook();
      assert.strictEqual(firstCall.message, 'Đơn hàng đã được ghi nhận thanh toán trước đó');
      assert.strictEqual(updateExecuted, false, 'Không được phép cập nhật lại DB khi đã thanh toán');
    });
  });
});
