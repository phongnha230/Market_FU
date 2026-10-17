import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { ensureTestAuthUser } from '../helpers/authFixture';

describe('Integration Test: Notification Module (/api/notifications)', () => {
  let accessToken = '';
  before(async () => {
    accessToken = await ensureTestAuthUser('65f1a2b3c4d5e6f7a8b9c0d1', 'test_notification_user@fe.edu.vn', 'BUYER');
  });

  it('GET /api/notifications không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/notifications`);
      assert.strictEqual(response.status, 401);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });

  it('GET /api/notifications/unread-count không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/notifications/unread-count`);
      assert.strictEqual(response.status, 401);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'UNAUTHORIZED');
    } finally {
      server.close();
    }
  });

  it('POST /api/notifications/fcm-token không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/notifications/fcm-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'test-fcm-device-token' }),
      });
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('POST /api/notifications/fcm-token với token rỗng phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: '' }),
      });
      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('DELETE /api/notifications/fcm-token không có token phải trả về 401 UNAUTHORIZED', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/notifications/fcm-token`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'test-fcm-device-token' }),
      });
      assert.strictEqual(response.status, 401);
    } finally {
      server.close();
    }
  });

  it('DELETE /api/notifications/fcm-token với token rỗng phải trả về 422 VALIDATION_ERROR', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/notifications/fcm-token`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: '' }),
      });
      assert.strictEqual(response.status, 422);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });

  it('POST /api/notifications/fcm-token với deviceType WEB nhưng chuỗi rác phải trả về 400 INVALID_WEB_PUSH_SUBSCRIPTION', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: 'web-token-dummy-12345', deviceType: 'WEB' }),
      });
      assert.strictEqual(response.status, 400);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'INVALID_WEB_PUSH_SUBSCRIPTION');
    } finally {
      server.close();
    }
  });

  it('POST /api/notifications/fcm-token với deviceType WEB và JSON subscription hợp lệ phải trả về 201', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const validWebSub = JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        keys: { p256dh: 'test-p256dh-key', auth: 'test-auth-key' },
      });
      const response = await fetch(`http://localhost:${address.port}/api/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: validWebSub, deviceType: 'WEB' }),
      });
      assert.strictEqual(response.status, 201);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, true);
    } finally {
      server.close();
    }
  });

  it('POST /api/notifications/test-push với accessToken hợp lệ phải trả về 200 kèm devices count', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    try {
      const response = await fetch(`http://localhost:${address.port}/api/notifications/test-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: 'Unit Test Push',
          body: 'Nội dung kiểm thử tự động',
        }),
      });
      assert.strictEqual(response.status, 200);
      const data = (await response.json()) as any;
      assert.strictEqual(data.success, true);
      assert.strictEqual(typeof data.data.registeredDevicesCount, 'number');
    } finally {
      server.close();
    }
  });
});
