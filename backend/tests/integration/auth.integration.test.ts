import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';

describe('Integration Test: Auth Module (/api/auth)', () => {
  // 1. ĐĂNG KÝ (REGISTER)
  it('POST /api/auth/register với email sai định dạng phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email-string',
          password: 'password123',
          fullName: 'Nguyễn Văn A',
        }),
      });

      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('POST /api/auth/register với password quá ngắn (< 6 ký tự) phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student@fpt.edu.vn',
          password: '123',
          fullName: 'Nguyễn Văn A',
        }),
      });

      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  // 2. ĐĂNG NHẬP (LOGIN)
  it('POST /api/auth/login với body thiếu trường phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student@fpt.edu.vn',
        }),
      });

      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('POST /api/auth/login với tài khoản không tồn tại phải trả về 401 INVALID_CREDENTIALS', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'unknown_account_xyz_999@fpt.edu.vn',
          password: 'password123',
        }),
      });

      assert.strictEqual(response.status, 401);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'INVALID_CREDENTIALS');
    } finally {
      server.close();
    }
  });

  // 3. REFRESH TOKEN & LOGOUT
  it('POST /api/auth/refresh-token không có token phải trả về 401 REFRESH_TOKEN_MISSING', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      assert.strictEqual(response.status, 401);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'REFRESH_TOKEN_MISSING');
    } finally {
      server.close();
    }
  });

  it('POST /api/auth/logout phải trả về 200 OK', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/logout`, {
        method: 'POST',
      });

      assert.strictEqual(response.status, 200);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, true);
    } finally {
      server.close();
    }
  });

  // 4. GOOGLE & PHONE AUTH
  it('POST /api/auth/google thiếu idToken phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('POST /api/auth/phone thiếu idToken phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  // 5. CHANGE PASSWORD & FORGOT PASSWORD
  it('PATCH /api/auth/change-password không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'oldPassword123',
          newPassword: 'newPassword123',
          confirmPassword: 'newPassword123',
        }),
      });

      assert.strictEqual(response.status, 401);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });

  it('POST /api/auth/forgot-password với email sai format phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
        }),
      });

      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('POST /api/auth/forgot-password với email không tồn tại phải trả về 200 (chống user enumeration)', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent_test_student_99999@fpt.edu.vn',
        }),
      });

      assert.strictEqual(response.status, 200);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, true);
    } finally {
      server.close();
    }
  });

  it('POST /api/auth/reset-password với mật khẩu xác nhận không khớp phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@fpt.edu.vn',
          otp: '123456',
          newPassword: 'password123',
          confirmPassword: 'differentPassword456',
        }),
      });

      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });
});
