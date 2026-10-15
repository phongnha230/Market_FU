import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { ensureTestAuthUser } from '../helpers/authFixture';

describe('Integration Test: Voucher Module (/api/vouchers)', () => {
  let studentToken = '';
  let adminToken = '';
  before(async () => {
    studentToken = await ensureTestAuthUser('65f1a2b3c4d5e6f7a8b9c001', 'student.test@fpt.edu.vn', 'BUYER');
    adminToken = await ensureTestAuthUser('65f1a2b3c4d5e6f7a8b9c002', 'admin.test@fpt.edu.vn', 'ADMIN');
  });

  // 1. LẤY DANH SÁCH VOUCHER CÔNG KHAI
  it('GET /api/vouchers (Public) phải trả về 200 OK kèm danh sách voucher và meta phân trang', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/vouchers`);
      assert.strictEqual(response.status, 200);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data), 'data phải là một mảng');
      assert.ok(body.meta, 'phải có meta phân trang');
      assert.strictEqual(body.meta.page, 1);
    } finally {
      server.close();
    }
  });

  // 2. XEM VOUCHER CÁ NHÂN KHI CHƯA ĐĂNG NHẬP
  it('GET /api/vouchers/me không có Token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/vouchers/me`);
      assert.strictEqual(response.status, 401);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });

  // 3. TẠO VOUCHER MỚI (PHÂN QUYỀN ADMIN)
  it('POST /api/vouchers không có Token phải bị từ chối 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Voucher Cơm Căn Tin 10k',
          partner: 'CANTEEN',
          coinCost: 100,
          discountValue: 10000,
        }),
      });

      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('POST /api/vouchers với role BUYER phải bị từ chối 403 FORBIDDEN', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          title: 'Voucher Cơm Căn Tin 10k',
          partner: 'CANTEEN',
          coinCost: 100,
          discountValue: 10000,
        }),
      });

      assert.strictEqual(response.status, 403);
      const body = (await response.json()) as any;
      assert.strictEqual(body.error.code, 'FORBIDDEN');
    } finally {
      server.close();
    }
  });

  it('POST /api/vouchers với role ADMIN nhưng dữ liệu sai validation phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'V', // Quá ngắn (< 3 ký tự)
          partner: 'UNKNOWN_PARTNER',
          coinCost: -50,
          discountValue: 0,
        }),
      });

      assert.strictEqual(response.status, 422);
      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  // 4. QUÉT MÃ SỬ DỤNG VOUCHER
  it('POST /api/vouchers/use với body thiếu voucherCode phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/vouchers/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({}),
      });

      assert.strictEqual(response.status, 422);
      const body = (await response.json()) as any;
      assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });
});
