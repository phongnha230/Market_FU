import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { authenticateOptional, AuthRequest } from '../../src/middlewares/auth.middleware';
import { generateTokens } from '../../src/utils/token';
import { aiService } from '../../src/modules/ai/ai.service';
import { AppError } from '../../src/middlewares/error.middleware';
import { prisma } from '../../src/config/prisma';
import { ensureTestAuthUser } from '../helpers/authFixture';

describe('Unit Test: AI Service & Optional Authentication Guardrails', () => {
  before(async () => {
    await ensureTestAuthUser('65f1a2b3c4d5e6f7a8b9c0d1', 'sinhvien@fpt.edu.vn', 'BUYER');
  });

  after(async () => {
    await prisma.$disconnect();
    setTimeout(() => process.exit(0), 500);
  });
  describe('authenticateOptional Middleware', () => {
    it('Cho phép request không có token tiếp tục bình thường (req.user = undefined)', () => {
      const req: Partial<AuthRequest> = {
        headers: {},
      };
      let nextCalled = false;
      const res: any = {};
      const next = () => {
        nextCalled = true;
      };

      authenticateOptional(req as AuthRequest, res, next);
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user, undefined);
    });

    it('Cho phép request với token hợp lệ gắn req.user chính xác', async () => {
      const { accessToken } = generateTokens({
        userId: '65f1a2b3c4d5e6f7a8b9c0d1',
        email: 'sinhvien@fpt.edu.vn',
        role: 'BUYER',
      });

      const req: Partial<AuthRequest> = {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      };
      const res: any = {};
      await new Promise<void>((resolve, reject) => {
        authenticateOptional(req as AuthRequest, res, (error?: unknown) => error ? reject(error) : resolve());
      });
      assert.strictEqual(req.user?.userId, '65f1a2b3c4d5e6f7a8b9c0d1');
      assert.strictEqual(req.user?.email, 'sinhvien@fpt.edu.vn');
      assert.strictEqual(req.user?.role, 'BUYER');
    });

    it('Xử lý token sai/hết hạn mà không ném lỗi 401 (coi như khách vãng lai)', () => {
      const req: Partial<AuthRequest> = {
        headers: {
          authorization: 'Bearer invalid-token-string-xyz',
        },
      };
      let nextCalled = false;
      const res: any = {};
      const next = () => {
        nextCalled = true;
      };

      assert.doesNotThrow(() => {
        authenticateOptional(req as AuthRequest, res, next);
      });
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user, undefined);
    });
  });

  describe('AI Service Chat Logic & Moderation', () => {
    it('Chặn tin nhắn vi phạm quy chuẩn an toàn học đường (thuốc cấm, vũ khí)', async () => {
      await assert.rejects(
        async () => {
          await aiService.assistantChat(undefined, {
            message: 'Ở đây có bán pod thuốc lá điện tử hoặc cần sa không bạn?',
            campus: 'HOL',
          });
        },
        (err: any) => {
          assert.ok(err instanceof AppError);
          assert.strictEqual(err.statusCode, 400);
          assert.strictEqual(err.code, 'CONTENT_MODERATION_BLOCKED');
          return true;
        }
      );
    });

    it('Hỗ trợ khách vãng lai (Guest Mode) hỏi đáp mà không crash Prisma MongoDB', async () => {
      const result = await aiService.assistantChat(undefined, {
        message: 'Có bao nhiêu cách mua hàng trên sàn vậy bạn?',
        campus: 'HOL',
      });

      assert.ok(result);
      assert.ok(result.message);
      assert.strictEqual(result.message.senderRole, 'MODEL');
      assert.strictEqual(result.session.id, 'guest_session');
      assert.ok(result.message.content.length > 0);
      assert.ok(
        result.message.content.includes('Safe Handoff') ||
          result.message.content.includes('hình thức mua hàng') ||
          result.message.content.includes('SHIP_COD') ||
          result.message.content.includes('Cóc')
      );
    });

    it('Câu hỏi chào hỏi thông thường không bị bốc sản phẩm ngẫu nhiên', async () => {
      const result = await aiService.assistantChat(undefined, {
        message: 'Xin chào Cóc AI',
        campus: 'HOL',
      });

      assert.ok(result);
      assert.ok(result.message.content && result.message.content.length > 5);
      // Không bị bốc sản phẩm ngẫu nhiên vào câu trả lời
      assert.strictEqual(result.suggestedProducts.length, 0);
    });

    it('Tìm kiếm sản phẩm theo từ khóa bàn phím trả về nhiều lựa chọn liên quan đa phân khúc', async () => {
      const result = await aiService.assistantChat(undefined, {
        message: 'mình muốn mua bàn phím',
        campus: 'HOL',
      });

      assert.ok(result);
      assert.ok(result.message.content.length > 0);
      // Trong DB có 3 bàn phím AVAILABLE (HOL 90k, QN 120k, QN 850k), hệ thống phải tìm thấy ít nhất 2 sản phẩm
      assert.ok(result.suggestedProducts.length >= 2, 'Phải gợi ý từ 2 sản phẩm trở lên nếu có trong DB');
    });
  });
});
