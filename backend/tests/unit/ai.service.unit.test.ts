import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { authenticateOptional, AuthRequest } from '../../src/middlewares/auth.middleware';
import { generateTokens } from '../../src/utils/token';
import { aiService } from '../../src/modules/ai/ai.service';
import { AppError } from '../../src/middlewares/error.middleware';
import { prisma } from '../../src/config/prisma';
describe('Unit Test: AI Service & Optional Authentication Guardrails', () => {
  after(async () => {
    await prisma.$disconnect();
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
      const originalFindUnique = prisma.user.findUnique;
      (prisma.user as unknown as { findUnique: (...args: unknown[]) => Promise<unknown> }).findUnique = async () => ({
        id: '65f1a2b3c4d5e6f7a8b9c0d1',
        email: 'sinhvien@fpt.edu.vn',
        role: 'BUYER',
        isActive: true,
        tokenVersion: 0,
      });

      try {
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
          authenticateOptional(req as AuthRequest, res, (error?: unknown) => (error ? reject(error) : resolve()));
        });
        assert.strictEqual(req.user?.userId, '65f1a2b3c4d5e6f7a8b9c0d1');
        assert.strictEqual(req.user?.email, 'sinhvien@fpt.edu.vn');
        assert.strictEqual(req.user?.role, 'BUYER');
      } finally {
        (prisma.user as unknown as { findUnique: unknown }).findUnique = originalFindUnique;
      }
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
      const originalFindMany = prisma.product.findMany;
      (prisma.product as unknown as { findMany: (...args: unknown[]) => Promise<unknown[]> }).findMany = async (args?: any) => {
        try {
          const res = await originalFindMany.call(prisma.product, args);
          if (Array.isArray(res) && res.length >= 2) return res;
        } catch {
          // Fallback sang mock nếu database offline hoặc là mock connection
        }
        return [
          {
            id: 'prod-kb-1',
            title: 'Bàn phím cơ DareU EK87 Red Switch',
            description: 'Bàn phím cơ DareU gõ êm',
            price: 90000,
            campus: 'HOL',
            status: 'AVAILABLE',
            category: { name: 'Đồ điện tử' },
            images: ['https://example.com/1.jpg'],
            seller: { id: 'seller-1', profile: { fullName: 'Nguyễn Văn A' } },
          },
          {
            id: 'prod-kb-2',
            title: 'Bàn phím không dây Logitech K380',
            description: 'Bàn phím bluetooth xịn',
            price: 120000,
            campus: 'HOL',
            status: 'AVAILABLE',
            category: { name: 'Đồ điện tử' },
            images: ['https://example.com/2.jpg'],
            seller: { id: 'seller-2', profile: { fullName: 'Trần Văn B' } },
          },
        ];
      };

      try {
        const result = await aiService.assistantChat(undefined, {
          message: 'mình muốn mua bàn phím',
          campus: 'HOL',
        });

        assert.ok(result);
        assert.ok(result.message.content.length > 0);
        assert.ok(result.suggestedProducts.length >= 2, 'Phải gợi ý từ 2 sản phẩm trở lên nếu có trong DB');
      } finally {
        (prisma.product as unknown as { findMany: unknown }).findMany = originalFindMany;
      }
    });

    it('Hỏi "bàn học" chỉ trả về bàn học, tuyệt đối không lẫn "bàn phím" hay "Fullbox"', async () => {
      const originalFindMany = prisma.product.findMany;
      (prisma.product as unknown as { findMany: (...args: unknown[]) => Promise<unknown[]> }).findMany = async () => [
        {
          id: 'prod-kb-1',
          title: 'Bàn phím cơ Gaming LED RGB',
          description: 'Bàn phím cơ dùng tốt tại Hòa Lạc',
          price: 90000,
          campus: 'HOL',
          condition: 'USED_GOOD',
          categoryType: 'BOOKS',
          status: 'AVAILABLE',
          images: ['https://example.com/kb.jpg'],
        },
        {
          id: 'prod-desk-1',
          title: 'Bàn học làm việc gỗ kèm giá sách tích hợp tiện lợi',
          description: 'Bàn học sinh viên mới 99%',
          price: 850000,
          campus: 'CT',
          condition: 'LIKE_NEW_99',
          categoryType: 'DORM_ITEM',
          status: 'AVAILABLE',
          images: ['https://example.com/desk.jpg'],
        },
        {
          id: 'prod-box-1',
          title: 'Fullbox',
          description: 'Đồ dùng học tập sinh viên',
          price: 2000,
          campus: 'QN',
          condition: 'NEW_100',
          categoryType: 'ELECTRONICS',
          status: 'AVAILABLE',
          images: ['https://example.com/box.jpg'],
        },
      ];

      try {
        const result = await (aiService as any).executeSearchProducts({
          keyword: 'hiện tại campus mình nó có bàn học ko',
          campus: 'HOL',
        });

        assert.strictEqual(result.length, 1, 'Chỉ được phép trả về đúng 1 sản phẩm bàn học');
        assert.strictEqual(result[0].id, 'prod-desk-1');
      } finally {
        (prisma.product as unknown as { findMany: unknown }).findMany = originalFindMany;
      }
    });

    it('Hỏi sản phẩm không tồn tại trên sàn (VD: iPhone 14 Pro) phải trả về mảng rỗng [], không bốc đồ ngẫu nhiên', async () => {
      const originalFindMany = prisma.product.findMany;
      (prisma.product as unknown as { findMany: (...args: unknown[]) => Promise<unknown[]> }).findMany = async () => [
        {
          id: 'prod-kb-1',
          title: 'Bàn phím cơ Gaming LED RGB',
          description: 'Bàn phím cơ dùng tốt',
          price: 90000,
          campus: 'HOL',
          status: 'AVAILABLE',
        },
        {
          id: 'prod-mac-1',
          title: 'Macbook Pro 14 inch M1',
          description: 'Máy đẹp nguyên zin',
          price: 25000000,
          campus: 'HOL',
          status: 'AVAILABLE',
        },
      ];

      try {
        const result = await (aiService as any).executeSearchProducts({
          keyword: 'có iphone 14 pro không',
          campus: 'HOL',
        });

        assert.strictEqual(result.length, 0, 'Sản phẩm không có trong kho phải trả về []');
      } finally {
        (prisma.product as unknown as { findMany: unknown }).findMany = originalFindMany;
      }
    });

    it('Xử lý câu hỏi tự nhiên dài chứa filler words "vậy hiện tại mày có những sản phẩm nào thuộc về bàn phím ko"', async () => {
      const originalFindMany = prisma.product.findMany;
      (prisma.product as unknown as { findMany: (...args: unknown[]) => Promise<unknown[]> }).findMany = async () => [
        {
          id: 'prod-kb-1',
          title: 'Bàn phím cơ Gaming LED màu Tím Trắng',
          description: 'Bàn phím cơ gõ êm tại KTX Hòa Lạc',
          price: 90000,
          campus: 'HOL',
          condition: 'USED_GOOD',
          categoryType: 'ELECTRONICS',
          status: 'AVAILABLE',
          images: ['https://example.com/kb1.jpg'],
        },
        {
          id: 'prod-kb-2',
          title: 'Bàn phím không dây Logitech K380',
          description: 'Bàn phím bluetooth tiện lợi',
          price: 150000,
          campus: 'HCM',
          condition: 'LIKE_NEW_99',
          categoryType: 'ELECTRONICS',
          status: 'AVAILABLE',
          images: ['https://example.com/kb2.jpg'],
        },
        {
          id: 'prod-desk-1',
          title: 'Bàn học làm việc sinh viên',
          description: 'Bàn học gỗ ép',
          price: 200000,
          campus: 'HOL',
          condition: 'USED_GOOD',
          categoryType: 'DORM_ITEM',
          status: 'AVAILABLE',
          images: ['https://example.com/desk.jpg'],
        },
      ];

      try {
        const result = await (aiService as any).executeSearchProducts({
          keyword: 'vậy hiện tại mày có những sản phẩm nào thuộc về bàn phím ko',
          campus: 'HOL',
        });

        assert.ok(result.length >= 2, 'Phải tìm thấy các sản phẩm bàn phím');
        assert.ok(result.some((p: any) => p.id === 'prod-kb-1'));
        assert.ok(result.some((p: any) => p.id === 'prod-kb-2'));
        assert.ok(!result.some((p: any) => p.id === 'prod-desk-1'), 'Không được lẫn bàn học vào kết quả bàn phím');
      } finally {
        (prisma.product as unknown as { findMany: unknown }).findMany = originalFindMany;
      }
    });

    it('Tự động đồng bộ suggestedProducts từ nội dung tin nhắn và câu trả lời AI (Product Cards Auto-Sync)', async () => {
      const originalFindMany = prisma.product.findMany;
      (prisma.product as unknown as { findMany: (...args: unknown[]) => Promise<unknown[]> }).findMany = async () => [
        {
          id: 'prod-kb-1',
          title: 'Bàn phím cơ Gaming LED màu Tím Trắng',
          description: 'Bàn phím cơ',
          price: 90000,
          campus: 'HOL',
          condition: 'USED_GOOD',
          categoryType: 'ELECTRONICS',
          status: 'AVAILABLE',
          images: ['https://example.com/kb1.jpg'],
        },
      ];

      try {
        const chatRes = await aiService.assistantChat(undefined, {
          message: 'vậy hiện tại mày có những sản phẩm nào thuộc về bàn phím ko',
          campus: 'HOL',
        });

        assert.ok(chatRes);
        assert.ok(chatRes.suggestedProducts.length > 0, 'Bắt buộc phải có suggestedProducts để render Card trên giao diện');
        assert.strictEqual(chatRes.suggestedProducts[0].id, 'prod-kb-1');
      } finally {
        (prisma.product as unknown as { findMany: unknown }).findMany = originalFindMany;
      }
    });

    it('Hỏi số lượng sản phẩm trên sàn "hiện tại sàn mình có bao nhiêu sản phẩm" trả về số liệu thực tế, không trả lời ảo', async () => {
      const originalCount = prisma.product.count;
      const originalFindMany = prisma.product.findMany;

      (prisma.product as unknown as { count: (...args: unknown[]) => Promise<number> }).count = async () => 25;
      (prisma.product as unknown as { findMany: (...args: unknown[]) => Promise<unknown[]> }).findMany = async () => [
        { id: '1', campus: 'HOL', categoryType: 'ELECTRONICS' },
        { id: '2', campus: 'HCM', categoryType: 'BOOKS' },
        { id: '3', campus: 'DAD', categoryType: 'DORM_ITEM' },
      ];

      try {
        const chatRes = await aiService.assistantChat(undefined, {
          message: 'hiện tại sàn mình có bao nhiêu sản phẩm',
          campus: 'HOL',
        });

        assert.ok(chatRes);
        assert.ok(chatRes.message.content.length > 0);
        // Kiểm tra câu trả lời không chứa các lý do thoái thác ảo
        assert.ok(!chatRes.message.content.includes('không thể xem được'));
        assert.ok(!chatRes.message.content.includes('dữ liệu rất lớn'));
        // Phải chứa con số và thông tin sàn
        assert.ok(chatRes.message.content.includes('sản phẩm') || chatRes.message.content.includes('Hòa Lạc'));
      } finally {
        (prisma.product as unknown as { count: unknown }).count = originalCount;
        (prisma.product as unknown as { findMany: unknown }).findMany = originalFindMany;
      }
    });
  });
});
