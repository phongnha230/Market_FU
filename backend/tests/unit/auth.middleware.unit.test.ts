import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { authenticate, authorize, AuthRequest } from '../../src/middlewares/auth.middleware';
import { generateTokens } from '../../src/utils/token';
import { AppError } from '../../src/middlewares/error.middleware';

describe('Unit Test: Auth Middleware (authenticate & authorize)', () => {
  const mockRes = {} as any;

  describe('authenticate() middleware', () => {
    it('Thiếu Header Authorization phải quăng lỗi AppError 401 UNAUTHORIZED', () => {
      const req = { headers: {} } as AuthRequest;
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      assert.throws(
        () => authenticate(req, mockRes, next),
        (err: any) => {
          return err instanceof AppError && err.statusCode === 401 && err.code === 'UNAUTHORIZED';
        }
      );
      assert.strictEqual(nextCalled, false);
    });

    it('Header Authorization không có tiền tố "Bearer " phải quăng lỗi AppError 401 UNAUTHORIZED', () => {
      const req = { headers: { authorization: 'Basic 123456' } } as AuthRequest;
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      assert.throws(
        () => authenticate(req, mockRes, next),
        (err: any) => {
          return err instanceof AppError && err.statusCode === 401 && err.code === 'UNAUTHORIZED';
        }
      );
      assert.strictEqual(nextCalled, false);
    });

    it('Token bị giả mạo hoặc sai chữ ký phải quăng lỗi AppError 401 INVALID_TOKEN', () => {
      const req = { headers: { authorization: 'Bearer token.gia.mao' } } as AuthRequest;
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      assert.throws(
        () => authenticate(req, mockRes, next),
        (err: any) => {
          return err instanceof AppError && err.statusCode === 401 && err.code === 'INVALID_TOKEN';
        }
      );
      assert.strictEqual(nextCalled, false);
    });

    it('Token hợp lệ phải gán req.user và gọi next()', () => {
      const payload = {
        userId: '65f1a2b3c4d5e6f7a8b9c001',
        role: 'STUDENT',
        email: 'test@fpt.edu.vn',
      };
      const { accessToken } = generateTokens(payload);
      const req = { headers: { authorization: `Bearer ${accessToken}` } } as AuthRequest;

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      authenticate(req, mockRes, next);

      assert.strictEqual(nextCalled, true);
      assert.ok(req.user, 'req.user phải được gán');
      assert.strictEqual(req.user.userId, payload.userId);
      assert.strictEqual(req.user.email, payload.email);
      assert.strictEqual(req.user.role, payload.role);
    });
  });

  describe('authorize() middleware', () => {
    it('Chưa có req.user phải quăng lỗi AppError 401 UNAUTHORIZED', () => {
      const req = {} as AuthRequest;
      const guard = authorize('ADMIN');

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      assert.throws(
        () => guard(req, mockRes, next),
        (err: any) => {
          return err instanceof AppError && err.statusCode === 401 && err.code === 'UNAUTHORIZED';
        }
      );
      assert.strictEqual(nextCalled, false);
    });

    it('Người dùng role STUDENT truy cập tài nguyên ADMIN phải bị từ chối 403 FORBIDDEN', () => {
      const req = {
        user: {
          userId: '65f1a2b3c4d5e6f7a8b9c001',
          role: 'STUDENT',
          email: 'student@fpt.edu.vn',
        },
      } as AuthRequest;

      const guard = authorize('ADMIN');
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      assert.throws(
        () => guard(req, mockRes, next),
        (err: any) => {
          return err instanceof AppError && err.statusCode === 403 && err.code === 'FORBIDDEN';
        }
      );
      assert.strictEqual(nextCalled, false);
    });

    it('Người dùng có đúng role ADMIN phải được cho phép và gọi next()', () => {
      const req = {
        user: {
          userId: '65f1a2b3c4d5e6f7a8b9c002',
          role: 'ADMIN',
          email: 'admin@fpt.edu.vn',
        },
      } as AuthRequest;

      const guard = authorize('ADMIN');
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      guard(req, mockRes, next);
      assert.strictEqual(nextCalled, true, 'next() phải được gọi');
    });

    it('Hỗ trợ nhiều roles (ví dụ ADMIN hoặc MODERATOR)', () => {
      const req = {
        user: {
          userId: '65f1a2b3c4d5e6f7a8b9c003',
          role: 'MODERATOR',
          email: 'mod@fpt.edu.vn',
        },
      } as AuthRequest;

      const guard = authorize('ADMIN', 'MODERATOR');
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      guard(req, mockRes, next);
      assert.strictEqual(nextCalled, true, 'next() phải được gọi');
    });
  });
});
