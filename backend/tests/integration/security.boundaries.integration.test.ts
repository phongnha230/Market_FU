import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import app from '../../src/app';
import { ENV } from '../../src/config/env';

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Không thể khởi tạo test server');
  }
  try {
    return await run(`http://localhost:${address.port}`);
  } finally {
    server.close();
  }
}

describe('Security boundary regressions', () => {
  it('requires authentication to read payment status', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/payments/order/ORD-000001-ABCD/status`);
      assert.equal(response.status, 401);
    });
  });

  it('rejects payment webhooks without a signature in every environment', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/webhooks/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: 'ORD-000001-ABCD', amount: 100 }),
      });
      assert.equal(response.status, 401);
    });
  });

  it('rejects outgoing bank transfers even when the HMAC is valid', async () => {
    await withServer(async (baseUrl) => {
      const body = JSON.stringify({ transferType: 'out', orderCode: 'ORD-000001-ABCD', amount: 100 });
      const signature = createHmac('sha256', ENV.PAYMENT_WEBHOOK_SECRET).update(body).digest('hex');
      const response = await fetch(`${baseUrl}/api/webhooks/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-signature': signature },
        body,
      });
      assert.equal(response.status, 400);
      const payload = await response.json() as { error?: { code?: string } };
      assert.equal(payload.error?.code, 'PAYMENT_TRANSFER_NOT_INCOMING');
    });
  });

  it('caps public presence batch requests', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/presence/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from({ length: 101 }, (_, index) => `user-${index}`) }),
      });
      assert.equal(response.status, 400);
    });
  });

  it('does not allow public user lookup by email', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/users/${encodeURIComponent('student@fpt.edu.vn')}`);
      assert.equal(response.status, 400);
      const body = await response.json() as { error?: { code?: string } };
      assert.equal(body.error?.code, 'USER_ID_REQUIRED');
    });
  });

  it('does not allow public profile lookup by full name or email', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/profile/public/${encodeURIComponent('student@fpt.edu.vn')}`);
      assert.equal(response.status, 400);
      const body = await response.json() as { error?: { code?: string } };
      assert.equal(body.error?.code, 'USER_ID_REQUIRED');
    });
  });

  it('protects category seeding with authentication', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/categories/seed`, { method: 'POST' });
      assert.equal(response.status, 401);
    });
  });
});
