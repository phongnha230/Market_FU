import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';

describe('Integration Test: Profile Endpoints', () => {
  it('GET /api/profile không có token phải trả về 401 Unauthorized', async () => {
    const server = app.listen(0);
    const address = server.address();

    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    const port = address.port;

    try {
      const response = await fetch(`http://localhost:${port}/api/profile`);
      assert.strictEqual(response.status, 401, 'Truy cập profile không có token phải trả về 401');

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });

  it('PATCH /api/profile/bank-account không có token phải trả về 401', async () => {
    const server = app.listen(0);
    const address = server.address();

    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    const port = address.port;

    try {
      const response = await fetch(`http://localhost:${port}/api/profile/bank-account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: 'MB Bank',
          accountNo: '123456789',
          accountName: 'TEST USER',
        }),
      });
      assert.strictEqual(response.status, 401, 'Cập nhật ngân hàng không token phải trả về 401');
    } finally {
      server.close();
    }
  });

  it('GET /api/profile/public/:userId với ID không tồn tại phải trả về 404', async () => {
    const server = app.listen(0);
    const address = server.address();

    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    const port = address.port;

    try {
      // Dùng 1 ID 24 ký tự hex hợp lệ của MongoDB ObjectId
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`http://localhost:${port}/api/profile/public/${fakeId}`);
      assert.strictEqual(response.status, 404, 'Xem profile người dùng không tồn tại phải trả về 404');

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'SELLER_NOT_FOUND');
    } finally {
      server.close();
    }
  });

  it('POST /api/profile/seller-onboarding không có token phải trả về 401 Unauthorized', async () => {
    const server = app.listen(0);
    const address = server.address();

    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    const port = address.port;

    try {
      const response = await fetch(`http://localhost:${port}/api/profile/seller-onboarding`, {
        method: 'POST',
      });
      assert.strictEqual(response.status, 401, 'Nộp hồ sơ seller không có token phải trả về 401');

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });
});
