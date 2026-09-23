import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createConversationSchema,
  sendMessageSchema,
  queryConversationsSchema,
  queryMessagesSchema,
} from '../../src/modules/chats/chat.dto';
import {
  assistantChatSchema,
  querySessionsSchema,
} from '../../src/modules/ai/ai.dto';
import {
  registerDeviceTokenSchema,
  removeDeviceTokenSchema,
} from '../../src/modules/notifications/notification.dto';

describe('Unit Test: BE-DEV 2 (Chat, AI & Notification DTO Validation)', () => {
  describe('Chat Module Schemas', () => {
    it('createConversationSchema: Hợp lệ khi có productId', () => {
      const valid = createConversationSchema.safeParse({ productId: '65f1a2b3c4d5e6f7a8b9c0d1' });
      assert.strictEqual(valid.success, true);
    });

    it('createConversationSchema: Lỗi khi thiếu productId', () => {
      const invalid = createConversationSchema.safeParse({});
      assert.strictEqual(invalid.success, false);
    });

    it('sendMessageSchema: Chặn nếu offerPrice âm hoặc bằng 0', () => {
      const invalidNegative = sendMessageSchema.safeParse({
        messageType: 'OFFER_PRICE',
        offerPrice: -10000,
      });
      assert.strictEqual(invalidNegative.success, false);

      const invalidZero = sendMessageSchema.safeParse({
        messageType: 'OFFER_PRICE',
        offerPrice: 0,
      });
      assert.strictEqual(invalidZero.success, false);
    });

    it('sendMessageSchema: Hợp lệ khi tin nhắn văn bản hoặc mặc cả giá đúng', () => {
      const validText = sendMessageSchema.safeParse({
        text: 'Em muốn hẹn xem đồ ở thư viện',
        messageType: 'TEXT',
      });
      assert.strictEqual(validText.success, true);

      const validOffer = sendMessageSchema.safeParse({
        text: 'Em trả giá này nhé',
        messageType: 'OFFER_PRICE',
        offerPrice: 200000,
      });
      assert.strictEqual(validOffer.success, true);
    });

    it('queryConversationsSchema: Mặc định page = 1, limit = 20', () => {
      const parsed = queryConversationsSchema.parse({});
      assert.strictEqual(parsed.page, 1);
      assert.strictEqual(parsed.limit, 20);
    });

    it('queryMessagesSchema: Mặc định page = 1, limit = 30', () => {
      const parsed = queryMessagesSchema.parse({});
      assert.strictEqual(parsed.page, 1);
      assert.strictEqual(parsed.limit, 30);
    });
  });

  describe('AI Module Schemas', () => {
    it('assistantChatSchema: Hợp lệ khi có message', () => {
      const valid = assistantChatSchema.safeParse({
        message: 'Tìm ấm đun nước dưới 200k',
        campus: 'HOL',
        maxPrice: 200000,
      });
      assert.strictEqual(valid.success, true);
    });

    it('assistantChatSchema: Lỗi khi message rỗng', () => {
      const invalid = assistantChatSchema.safeParse({
        message: '',
      });
      assert.strictEqual(invalid.success, false);
    });

    it('assistantChatSchema: Chặn campus không thuộc hệ thống', () => {
      const invalid = assistantChatSchema.safeParse({
        message: 'Tìm đồ',
        campus: 'HANOI_NOT_FOUND',
      });
      assert.strictEqual(invalid.success, false);
    });

    it('querySessionsSchema: Mặc định page = 1, limit = 20', () => {
      const parsed = querySessionsSchema.parse({});
      assert.strictEqual(parsed.page, 1);
      assert.strictEqual(parsed.limit, 20);
    });
  });

  describe('Notification Module Schemas', () => {
    it('registerDeviceTokenSchema: Hợp lệ khi có token và deviceType', () => {
      const valid = registerDeviceTokenSchema.safeParse({
        token: 'fcm-device-token-xyz',
        deviceType: 'ANDROID',
      });
      assert.strictEqual(valid.success, true);
    });

    it('registerDeviceTokenSchema: Lỗi khi token rỗng', () => {
      const invalid = registerDeviceTokenSchema.safeParse({
        token: '',
      });
      assert.strictEqual(invalid.success, false);
    });

    it('removeDeviceTokenSchema: Hợp lệ khi có token', () => {
      const valid = removeDeviceTokenSchema.safeParse({
        token: 'fcm-device-token-xyz',
      });
      assert.strictEqual(valid.success, true);
    });

    it('removeDeviceTokenSchema: Lỗi khi token rỗng', () => {
      const invalid = removeDeviceTokenSchema.safeParse({
        token: '',
      });
      assert.strictEqual(invalid.success, false);
    });
  });
});
