import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { ensureTestAuthUser } from '../helpers/authFixture';

describe('Integration Test: Report, Dispute & KYC Module (/api/reports)', () => {
  let studentToken = '';
  let adminToken = '';
  before(async () => {
    studentToken = await ensureTestAuthUser('65f1a2b3c4d5e6f7a8b9c001', 'student.test@fpt.edu.vn', 'BUYER');
    adminToken = await ensureTestAuthUser('65f1a2b3c4d5e6f7a8b9c002', 'admin.test@fpt.edu.vn', 'ADMIN');
  });

  // 1. TỐ CÁO VI PHẠM (REPORTS)
  it('POST /api/reports không có Token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'PRODUCT',
          targetId: '65f1a2b3c4d5e6f7a8b9c0d1',
          reason: 'Hàng giả',
        }),
      });

      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('POST /api/reports với targetType sai phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          targetType: 'COMMENT', // Sai enum
          targetId: '65f1a2b3c4d5e6f7a8b9c0d1',
          reason: 'Nói xấu',
        }),
      });

      assert.strictEqual(response.status, 422);
      const body = (await response.json()) as any;
      assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('GET /api/reports với role BUYER phải bị từ chối 403 FORBIDDEN', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/reports`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.strictEqual(response.status, 403);
    } finally {
      server.close();
    }
  });

  it('GET /api/reports với role ADMIN phải trả về 200 OK kèm danh sách và meta phân trang', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/reports`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.strictEqual(response.status, 200);
      const body = (await response.json()) as any;
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data), 'data phải là mảng');
      assert.ok(body.meta, 'phải có meta');
    } finally {
      server.close();
    }
  });

  // 2. KHIẾU NẠI ĐỔI TRẢ (DISPUTES)
  it('POST /api/reports/disputes với proofVideoUrl sai định dạng URL phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/reports/disputes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          orderId: '65f1a2b3c4d5e6f7a8b9c0d1',
          reason: 'Hàng không hoạt động khi cắm điện test',
          proofVideoUrl: 'not_a_valid_url',
        }),
      });

      assert.strictEqual(response.status, 422);
      const body = (await response.json()) as any;
      assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('GET /api/reports/disputes với role BUYER phải bị 403 FORBIDDEN, role ADMIN trả về 200 OK', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      // 1. Buyer
      const resBuyer = await fetch(`http://localhost:${address.port}/api/reports/disputes`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.strictEqual(resBuyer.status, 403);

      // 2. Admin
      const resAdmin = await fetch(`http://localhost:${address.port}/api/reports/disputes`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(resAdmin.status, 200);
      const body = (await resAdmin.json()) as any;
      assert.strictEqual(body.success, true);
    } finally {
      server.close();
    }
  });

  it('GET /api/reports/disputes/:id không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeDisputeId = '65f1a2b3c4d5e6f7a8b9c0d1';
      const resNoToken = await fetch(`http://localhost:${address.port}/api/reports/disputes/${fakeDisputeId}`);
      assert.strictEqual(resNoToken.status, 401);

      const resNotFound = await fetch(`http://localhost:${address.port}/api/reports/disputes/${fakeDisputeId}`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.strictEqual(resNotFound.status, 404);
    } finally {
      server.close();
    }
  });

  // 3. DUYỆT THẺ SINH VIÊN KYC
  it('GET /api/reports/kyc/verifications với role BUYER phải bị 403 FORBIDDEN, role ADMIN trả về 200 OK', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const resBuyer = await fetch(`http://localhost:${address.port}/api/reports/kyc/verifications`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.strictEqual(resBuyer.status, 403);

      const resAdmin = await fetch(`http://localhost:${address.port}/api/reports/kyc/verifications`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(resAdmin.status, 200);
      const body = (await resAdmin.json()) as any;
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data));
    } finally {
      server.close();
    }
  });

  it('PATCH /api/reports/kyc/:id/reject thiếu reason phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/reports/kyc/65f1a2b3c4d5e6f7a8b9c0d1/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
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
