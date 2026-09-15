import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { generateTokens } from '../../src/utils/token';

describe('Integration Test: User Module (/api/users)', () => {
  const studentToken = generateTokens({
    userId: '65f1a2b3c4d5e6f7a8b9c001',
    role: 'STUDENT',
    email: 'student.user@fpt.edu.vn',
  }).accessToken;

  const adminToken = generateTokens({
    userId: '65f1a2b3c4d5e6f7a8b9c002',
    role: 'ADMIN',
    email: 'admin.user@fpt.edu.vn',
  }).accessToken;

  it('GET /api/users/:id với ID không tồn tại phải trả về 404 USER_NOT_FOUND', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '65f1a2b3c4d5e6f7a8b9c999';
      const response = await fetch(`http://localhost:${address.port}/api/users/${fakeId}`);
      assert.strictEqual(response.status, 404);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'USER_NOT_FOUND');
    } finally {
      server.close();
    }
  });

  it('GET /api/users/me và /api/users/profile không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const res1 = await fetch(`http://localhost:${address.port}/api/users/me`);
      assert.strictEqual(res1.status, 401);

      const res2 = await fetch(`http://localhost:${address.port}/api/users/profile`);
      assert.strictEqual(res2.status, 401);
    } finally {
      server.close();
    }
  });

  it('GET /api/users/me/favorites không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/users/me/favorites`);
      assert.strictEqual(response.status, 401);

      const body = (await response.json()) as any;
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });

  it('PATCH /api/users/me không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Nguyễn Văn A' }),
      });
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('PATCH /api/users/me/bank-account không có token phải trả về 401, có token nhưng thiếu trường phải trả về 422', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      // 1. Không có token -> 401
      const res401 = await fetch(`http://localhost:${address.port}/api/users/me/bank-account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName: 'TPBank' }),
      });
      assert.strictEqual(res401.status, 401);

      // 2. Có token nhưng thiếu accountNo, accountName -> 422
      const res422 = await fetch(`http://localhost:${address.port}/api/users/me/bank-account`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ bankName: 'TPBank' }),
      });
      assert.strictEqual(res422.status, 422);
      const body422 = (await res422.json()) as any;
      assert.strictEqual(body422.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('POST /api/users/me/kyc và /api/users/kyc/student-card không có token phải trả về 401', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const res1 = await fetch(`http://localhost:${address.port}/api/users/me/kyc`, {
        method: 'POST',
      });
      assert.strictEqual(res1.status, 401);

      const res2 = await fetch(`http://localhost:${address.port}/api/users/kyc/student-card`, {
        method: 'POST',
      });
      assert.strictEqual(res2.status, 401);
    } finally {
      server.close();
    }
  });

  it('GET /api/users (Admin route) không có token trả về 401, role STUDENT trả về 403', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      // 1. Không có token -> 401
      const res401 = await fetch(`http://localhost:${address.port}/api/users`);
      assert.strictEqual(res401.status, 401);

      // 2. Student token -> 403
      const res403 = await fetch(`http://localhost:${address.port}/api/users`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.strictEqual(res403.status, 403);
      const body403 = (await res403.json()) as any;
      assert.strictEqual(body403.error.code, 'FORBIDDEN');
    } finally {
      server.close();
    }
  });

  it('PATCH /api/users/:id/status (Admin route) không có token trả về 401, role STUDENT trả về 403', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const fakeId = '65f1a2b3c4d5e6f7a8b9c999';

      // 1. Không có token -> 401
      const res401 = await fetch(`http://localhost:${address.port}/api/users/${fakeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      assert.strictEqual(res401.status, 401);

      // 2. Student token -> 403
      const res403 = await fetch(`http://localhost:${address.port}/api/users/${fakeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ isActive: false }),
      });
      assert.strictEqual(res403.status, 403);

      // 3. Admin token nhưng body rỗng -> 422
      const res422 = await fetch(`http://localhost:${address.port}/api/users/${fakeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({}),
      });
      assert.strictEqual(res422.status, 422);
      const body422 = (await res422.json()) as any;
      assert.strictEqual(body422.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });
});
