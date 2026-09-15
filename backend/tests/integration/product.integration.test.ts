import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';

describe('Integration Test: RESTful Product & User Endpoints', () => {
  it('GET /api/products (Public) phải trả về 200 OK kèm meta pagination', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/products`);
      assert.strictEqual(response.status, 200);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data), 'data phải là mảng sản phẩm');
      assert.ok(body.meta, 'phải có pagination meta');
      assert.strictEqual(typeof body.meta.page, 'number');
    } finally {
      server.close();
    }
  });

  it('GET /api/products/:id với ID không tồn tại phải trả về 404 PRODUCT_NOT_FOUND', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`http://localhost:${address.port}/api/products/${fakeId}`);
      assert.strictEqual(response.status, 404);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'PRODUCT_NOT_FOUND');
    } finally {
      server.close();
    }
  });

  it('PATCH /api/products/:id không có token phải trả về 401 Unauthorized', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`http://localhost:${address.port}/api/products/${fakeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Cập nhật tiêu đề' }),
      });
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('DELETE /api/products/:id không có token phải trả về 401 Unauthorized', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`http://localhost:${address.port}/api/products/${fakeId}`, {
        method: 'DELETE',
      });
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('PUT /api/products/:id/favorite (RESTful Idempotent Add) không có token phải trả về 401', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`http://localhost:${address.port}/api/products/${fakeId}/favorite`, {
        method: 'PUT',
      });
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('DELETE /api/products/:id/favorite (RESTful Idempotent Remove) không có token phải trả về 401', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`http://localhost:${address.port}/api/products/${fakeId}/favorite`, {
        method: 'DELETE',
      });
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('GET /api/users/me/favorites (Canonical Favorite Resource) không có token phải trả về 401', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/users/me/favorites`);
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('POST /api/products/:id/renewals và /boosts không có token phải trả về 401', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '507f1f77bcf86cd799439011';
      const renewRes = await fetch(`http://localhost:${address.port}/api/products/${fakeId}/renewals`, {
        method: 'POST',
      });
      assert.strictEqual(renewRes.status, 401);

      const boostRes = await fetch(`http://localhost:${address.port}/api/products/${fakeId}/boosts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'BUMP' }),
      });
      assert.strictEqual(boostRes.status, 401);
    } finally {
      server.close();
    }
  });

  it('PATCH /api/categories/:id không có token phải trả về 401', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`http://localhost:${address.port}/api/categories/${fakeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Đồ dùng học tập mới' }),
      });
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });
});
