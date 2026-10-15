import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { ensureTestAuthUser } from '../helpers/authFixture';

describe('Integration Test: Category Module (/api/categories)', () => {
  let studentToken = '';
  let adminToken = '';
  before(async () => {
    studentToken = await ensureTestAuthUser('65f1a2b3c4d5e6f7a8b9c001', 'student.test@fpt.edu.vn', 'BUYER');
    adminToken = await ensureTestAuthUser('65f1a2b3c4d5e6f7a8b9c002', 'admin.test@fpt.edu.vn', 'ADMIN');
  });

  it('GET /api/categories (Public) phải trả về 200 OK kèm danh sách danh mục', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/categories`);
      assert.strictEqual(response.status, 200);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data), 'data phải là mảng');
    } finally {
      server.close();
    }
  });

  it('GET /api/categories/:slug với slug không tồn tại phải trả về 404 CATEGORY_NOT_FOUND', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/categories/slug-chua-tung-ton-tai-xyz-123`);
      assert.strictEqual(response.status, 404);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'CATEGORY_NOT_FOUND');
    } finally {
      server.close();
    }
  });

  it('POST /api/categories không có Token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sách giáo trình', icon: 'book' }),
      });
      assert.strictEqual(response.status, 401);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });

  it('POST /api/categories với role STUDENT phải bị từ chối 403 FORBIDDEN', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ name: 'Sách giáo trình', icon: 'book' }),
      });
      assert.strictEqual(response.status, 403);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'FORBIDDEN');
    } finally {
      server.close();
    }
  });

  it('POST /api/categories với role ADMIN nhưng thiếu body phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({}),
      });
      assert.strictEqual(response.status, 422);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('PUT & PATCH /api/categories/:id không có quyền ADMIN phải trả về 401 hoặc 403', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '65f1a2b3c4d5e6f7a8b9c999';

      // Test PUT không có token
      const putRes = await fetch(`http://localhost:${address.port}/api/categories/${fakeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Update Category' }),
      });
      assert.strictEqual(putRes.status, 401);

      // Test PATCH với student token (thiếu quyền ADMIN)
      const patchRes = await fetch(`http://localhost:${address.port}/api/categories/${fakeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ name: 'Update Category' }),
      });
      assert.strictEqual(patchRes.status, 403);
    } finally {
      server.close();
    }
  });

  it('DELETE /api/categories/:id không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '65f1a2b3c4d5e6f7a8b9c999';
      const response = await fetch(`http://localhost:${address.port}/api/categories/${fakeId}`, {
        method: 'DELETE',
      });
      assert.strictEqual(response.status, 401);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });
});
