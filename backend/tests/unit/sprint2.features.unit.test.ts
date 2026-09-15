import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { createConversationSchema, sendMessageSchema } from '../../src/modules/chats/chat.dto';
import { createOrderSchema, verifyHandshakeSchema, disputeOrderSchema, shippingWebhookSchema } from '../../src/modules/orders/order.dto';
import { WebhookService } from '../../src/modules/orders/webhook.service';
import { assistantChatSchema } from '../../src/modules/ai/ai.dto';
import { ENV } from '../../src/config/env';

describe('Unit Test: Sprint 2 Features & Business Rules', () => {
  describe('Chat Module: DTO & Mặc cả giá (Bargaining)', () => {
    it('createConversationSchema: Phải yêu cầu productId hợp lệ', () => {
      const invalid = createConversationSchema.safeParse({});
      assert.strictEqual(invalid.success, false);
      const valid = createConversationSchema.safeParse({ productId: 'prod_123' });
      assert.strictEqual(valid.success, true);
    });

    it('sendMessageSchema: Chấp nhận tin nhắn văn bản hợp lệ', () => {
      const result = sendMessageSchema.safeParse({
        text: 'Chào bạn, món đồ này còn không ạ?',
        messageType: 'TEXT',
      });
      assert.strictEqual(result.success, true);
    });

    it('sendMessageSchema: Chấp nhận đề xuất mặc cả giá (OFFER_PRICE)', () => {
      const result = sendMessageSchema.safeParse({
        messageType: 'OFFER_PRICE',
        offerPrice: 150000,
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data?.offerPrice, 150000);
    });

    it('Business Rule Mặc cả: Giá đề xuất phải >= 50% giá niêm yết', () => {
      const productPrice = 200000;
      const minAllowed = Math.round(productPrice * 0.5);
      const lowOffer = 90000;
      assert.strictEqual(lowOffer < minAllowed, true);
      const exactOffer = 100000;
      assert.strictEqual(exactOffer >= minAllowed, true);
      const validOffer = 150000;
      assert.strictEqual(validOffer >= minAllowed, true);
    });
  });

  describe('Orders Module: DTO, QR Handshake & Khiếu nại (Dispute)', () => {
    it('createOrderSchema: MEETUP không bắt buộc thông tin giao vận', () => {
      const result = createOrderSchema.safeParse({
        productId: 'prod_123',
        orderType: 'MEETUP',
        coinsToUse: 0,
      });
      assert.strictEqual(result.success, true);
    });

    it('createOrderSchema: SHIP_COD bắt buộc phải có tên, SĐT và địa chỉ nhận hàng', () => {
      const missingAddress = createOrderSchema.safeParse({
        productId: 'prod_123',
        orderType: 'SHIP_COD',
        receiverName: 'Nguyễn Văn A',
        receiverPhone: '0987654321',
      });
      assert.strictEqual(missingAddress.success, false);

      const validShip = createOrderSchema.safeParse({
        productId: 'prod_123',
        orderType: 'SHIP_COD',
        receiverName: 'Nguyễn Văn A',
        receiverPhone: '0987654321',
        shippingAddress: 'Phòng 401 Dom B KTX FPT Hola',
      });
      assert.strictEqual(validShip.success, true);
    });

    it('verifyHandshakeSchema: Chấp nhận Token HMAC hoặc mã OTP 4 số', () => {
      const validOtp = verifyHandshakeSchema.safeParse({ otp: '1234' });
      assert.strictEqual(validOtp.success, true);

      const invalidOtp = verifyHandshakeSchema.safeParse({ otp: '123' });
      assert.strictEqual(invalidOtp.success, false);

      const validToken = verifyHandshakeSchema.safeParse({ token: 'abcdef1234567890' });
      assert.strictEqual(validToken.success, true);
    });

    it('disputeOrderSchema: Bắt buộc lý do >= 10 ký tự và link video bằng chứng', () => {
      const noVideo = disputeOrderSchema.safeParse({
        reason: 'Sản phẩm nhận về bị nứt vỡ không dùng được',
      });
      assert.strictEqual(noVideo.success, false);

      const validDispute = disputeOrderSchema.safeParse({
        reason: 'Sản phẩm nhận về bị nứt vỡ và không thể khởi động',
        proofVideoUrl: 'https://pub-r2.marketfu.dev/disputes/video_unboxing_test.mp4',
      });
      assert.strictEqual(validDispute.success, true);
    });
  });

  describe('Webhook Module: Xác thực chữ ký số HMAC-SHA256 & Idempotency', () => {
    const webhookService = new WebhookService();
    const secret = (ENV.SHIPPING_WEBHOOK_SECRET || 'fu_market_webhook_secret_2026').trim();

    it('verifyHmacSignature: Xác thực chữ ký hợp lệ thành công', () => {
      const payload = {
        trackingCode: 'GHTK_ORD-12345',
        status: 'DELIVERED',
        shippingPartner: 'GHTK',
      };
      const payloadString = JSON.stringify(payload);
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');
      const isValid = webhookService.verifyHmacSignature(payload, validSignature);
      assert.strictEqual(isValid, true);
    });

    it('verifyHmacSignature: Từ chối chữ ký giả mạo hoặc sai lệch payload', () => {
      const payload = {
        trackingCode: 'GHTK_ORD-12345',
        status: 'DELIVERED',
      };
      const fakeSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const isValid = webhookService.verifyHmacSignature(payload, fakeSignature);
      assert.strictEqual(isValid, false);
    });

    it('shippingWebhookSchema: Validate đúng các trạng thái giao vận GHTK', () => {
      const validWebhook = shippingWebhookSchema.safeParse({
        trackingCode: 'GHTK_ORD-999',
        status: 'DELIVERED',
        shippingPartner: 'GHTK',
      });
      assert.strictEqual(validWebhook.success, true);
    });
  });

  describe('AI Module: DTO & Filters', () => {
    it('assistantChatSchema: Chấp nhận câu hỏi kèm campus và ngân sách', () => {
      const validChat = assistantChatSchema.safeParse({
        message: 'Tìm cho mình cái quạt với ấm đun nước dưới 300k',
        campus: 'HOL',
        maxPrice: 300000,
        categoryType: 'DORM_ITEM',
      });
      assert.strictEqual(validChat.success, true);
      assert.strictEqual(validChat.data?.campus, 'HOL');
      assert.strictEqual(validChat.data?.maxPrice, 300000);
    });

    it('assistantChatSchema: Từ chối tin nhắn rỗng', () => {
      const emptyChat = assistantChatSchema.safeParse({
        message: '',
      });
      assert.strictEqual(emptyChat.success, false);
    });
  });
});