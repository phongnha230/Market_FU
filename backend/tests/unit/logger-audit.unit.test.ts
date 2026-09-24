import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { logger } from '../../src/config/logger';
import { auditLogger } from '../../src/utils/auditLogger';
import {
  requestTracingMiddleware,
  getRequestId,
  requestContextStore,
} from '../../src/middlewares/tracing.middleware';
import { sendError } from '../../src/utils/response';

describe('Unit Test: Structured Logging, Request Tracing & Audit Trail for VPS', () => {
  describe('1. Request Tracing & Correlation (x-request-id)', () => {
    it('getRequestId trả về mã fallback an toàn khi ở ngoài HTTP context', () => {
      const id = getRequestId();
      assert.ok(id, 'Phải có requestId');
      assert.ok(id.startsWith('req_sys_'), 'ID ngoài request phải có tiền tố req_sys_');
    });

    it('requestTracingMiddleware sinh x-request-id mới nếu client không gửi', () => {
      let nextCalled = false;
      const req: any = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        method: 'GET',
        url: '/api/products',
      };
      const res: any = {
        headers: {} as Record<string, string>,
        setHeader(key: string, value: string) {
          this.headers[key.toLowerCase()] = value;
        },
      };

      requestTracingMiddleware(req, res, () => {
        nextCalled = true;
        assert.ok(res.headers['x-request-id'], 'Header x-request-id phải được gán');
        assert.equal(req.id, res.headers['x-request-id']);
        assert.equal(getRequestId(), req.id, 'getRequestId bên trong context phải khớp req.id');
      });

      assert.equal(nextCalled, true);
    });

    it('requestTracingMiddleware tái sử dụng x-request-id do client/gateway gửi lên', () => {
      const customId = 'client-custom-req-12345';
      const req: any = {
        headers: { 'x-request-id': customId },
        socket: { remoteAddress: '10.0.0.1' },
        method: 'POST',
        url: '/api/orders',
      };
      const res: any = {
        headers: {} as Record<string, string>,
        setHeader(key: string, value: string) {
          this.headers[key.toLowerCase()] = value;
        },
      };

      requestTracingMiddleware(req, res, () => {
        assert.equal(res.headers['x-request-id'], customId);
        assert.equal(req.id, customId);
        assert.equal(getRequestId(), customId);
      });
    });
  });

  describe('2. Structured Logger & Error Formatting', () => {
    it('logger.info, warn, error ghi log an toàn không ném exception', () => {
      assert.doesNotThrow(() => {
        logger.info('Test info message', { module: 'TEST' });
        logger.warn('Test warn message', { warningCode: 'W_01' });
        logger.error('Test error message', new Error('Simulated error'), { errContext: true });
        logger.http('GET /api/test 200 45ms', {
          method: 'GET',
          url: '/api/test',
          status: 200,
          durationMs: 45,
          clientIp: '127.0.0.1',
        });
      });
    });

    it('rotateAndCleanLogs chạy an toàn và không gây crash server', async () => {
      const result = await logger.rotateAndCleanLogs();
      assert.ok(typeof result.compressed === 'number');
      assert.ok(typeof result.deleted === 'number');
    });
  });

  describe('3. Financial & Transaction Audit Trail', () => {
    it('auditLogger ghi nhận đầy đủ các sự kiện Escrow, Handshake, Payment, KYC', () => {
      assert.doesNotThrow(() => {
        auditLogger.recordEscrowHold({
          orderId: 'ord_123',
          orderCode: 'ORD-TEST-001',
          buyerId: 'buyer_1',
          sellerId: 'seller_2',
          amount: 250000,
          coinsUsed: 20,
          paymentMethod: 'VIETQR',
        });

        auditLogger.recordEscrowRelease({
          orderId: 'ord_123',
          orderCode: 'ORD-TEST-001',
          sellerId: 'seller_2',
          amount: 250000,
          reason: 'Bàn giao đồ thành công tại trạm Alpha',
        });

        auditLogger.recordRefund({
          orderId: 'ord_123',
          orderCode: 'ORD-TEST-001',
          buyerId: 'buyer_1',
          amount: 250000,
          coinsRefunded: 20,
          reason: 'Hàng lỗi, admin duyệt khiếu nại',
          actor: 'ADMIN',
        });

        auditLogger.recordHandshakeVerified({
          orderId: 'ord_123',
          orderCode: 'ORD-TEST-001',
          buyerId: 'buyer_1',
          sellerId: 'seller_2',
          hubCode: 'HL-01',
          method: 'QR_SCAN',
        });

        auditLogger.recordPaymentWebhook({
          gateway: 'PAYOS',
          orderCode: 'ORD-TEST-001',
          transactionId: 'TX_999888',
          amount: 250000,
          isSuccess: true,
        });

        auditLogger.recordKycDecision({
          targetUserId: 'user_student_1',
          adminId: 'admin_sys',
          decision: 'APPROVED',
          studentId: 'HE160000',
          bonusCoinsAwarded: 200,
        });

        auditLogger.recordLockCollision({
          resourceKey: 'lock:product:prod_99',
          ttlMs: 5000,
        });
      });
    });
  });

  describe('4. API Error Response Tracing (requestId trong sendError)', () => {
    it('sendError tự động đính kèm requestId để client dễ đối soát lỗi với VPS', () => {
      let sentStatus = 0;
      let sentJson: any = null;

      const res: any = {
        status(code: number) {
          sentStatus = code;
          return this;
        },
        json(data: any) {
          sentJson = data;
          return this;
        },
      };

      requestContextStore.run(
        {
          requestId: 'trace-id-abc-xyz',
          startTime: Date.now(),
        },
        () => {
          sendError(res, 'Món đồ đã được bán', 400, 'PRODUCT_NOT_AVAILABLE');
        }
      );

      assert.equal(sentStatus, 400);
      assert.ok(sentJson);
      assert.equal(sentJson.success, false);
      assert.equal(sentJson.error.code, 'PRODUCT_NOT_AVAILABLE');
      assert.equal(sentJson.error.message, 'Món đồ đã được bán');
      assert.equal(sentJson.error.requestId, 'trace-id-abc-xyz', 'Phải có requestId trong payload lỗi');
    });
  });
});
