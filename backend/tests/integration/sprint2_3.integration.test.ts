import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { generateTokens } from '../../src/utils/token';

describe('Integration Test: Sprint 2 & Sprint 3 Modules (/api/vouchers, /api/reviews, /api/orders, /api/admin)', () => {
  const buyerToken = generateTokens({
    userId: '65f1a2b3c4d5e6f7a8b9c101',
    role: 'BUYER',
    email: 'buyer.test@fpt.edu.vn',
  }).accessToken;

  // -------------------------------------------------------------
  // 1. CAMPUS VOUCHERS MODULE (/api/vouchers)
  // -------------------------------------------------------------
  describe('Campus Vouchers (/api/vouchers)', () => {
    it('GET /api/vouchers (Public): Phải trả về 200 OK kèm danh sách voucher', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/vouchers`);
        assert.strictEqual(response.status, 200);

        const body = (await response.json()) as any;
        assert.strictEqual(body.success, true);
        assert.ok(Array.isArray(body.data), 'data phải là mảng voucher');
      } finally {
        server.close();
      }
    });

    it('POST /api/vouchers/redeem không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/vouchers/redeem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voucherId: 'vouch_123' }),
        });
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('POST /api/vouchers/redeem có Token nhưng thiếu voucherId phải trả về 422 VALIDATION_ERROR', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/vouchers/redeem`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${buyerToken}`,
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

    it('GET /api/vouchers/my-vouchers không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/vouchers/my-vouchers`);
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('PATCH /api/vouchers/use với mã ngắn (< 5 ký tự) phải trả về 422 VALIDATION_ERROR', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/vouchers/use`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${buyerToken}`,
          },
          body: JSON.stringify({ voucherCode: 'FU' }),
        });
        assert.strictEqual(response.status, 422);
      } finally {
        server.close();
      }
    });
  });

  // -------------------------------------------------------------
  // 2. REVIEWS MODULE (/api/reviews)
  // -------------------------------------------------------------
  describe('Reviews (/api/reviews)', () => {
    it('GET /api/reviews/user/:userId (Public): Trả về 200 OK kèm danh sách review công khai', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/reviews/user/65f1a2b3c4d5e6f7a8b9c101`);
        assert.strictEqual(response.status, 200);
        const body = (await response.json()) as any;
        assert.strictEqual(body.success, true);
      } finally {
        server.close();
      }
    });

    it('POST /api/reviews không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: 'ord_1', rating: 5 }),
        });
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('POST /api/reviews với rating sai phạm vi (> 5) phải trả về 422 VALIDATION_ERROR', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${buyerToken}`,
          },
          body: JSON.stringify({ orderId: 'ord_1', rating: 10 }),
        });
        assert.strictEqual(response.status, 422);
      } finally {
        server.close();
      }
    });
  });

  // -------------------------------------------------------------
  // 3. ORDERS MODULE (/api/orders)
  // -------------------------------------------------------------
  describe('Orders (/api/orders)', () => {
    it('GET /api/orders không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/orders`);
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('POST /api/orders không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: 'prod_1', orderType: 'MEETUP' }),
        });
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('POST /api/orders/:id/handshake không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/orders/ord_123/handshake`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handshakeOtp: '1234' }),
        });
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });
  });

  // -------------------------------------------------------------
  // 4. REPORTS & ADMIN DASHBOARD (/api/reports, /api/admin)
  // -------------------------------------------------------------
  describe('Reports & Admin Moderation (/api/reports, /api/admin)', () => {
    it('POST /api/reports không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType: 'PRODUCT', targetId: 'p1', reason: 'Gian lận' }),
        });
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('POST /api/reports với lý do quá ngắn (< 5 ký tự) phải trả về 422 VALIDATION_ERROR', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${buyerToken}`,
          },
          body: JSON.stringify({ targetType: 'PRODUCT', targetId: 'p1', reason: 'abc' }),
        });
        assert.strictEqual(response.status, 422);
      } finally {
        server.close();
      }
    });

    it('GET /api/admin/reports không có Token trả về 401, role BUYER trả về 403 FORBIDDEN', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        // 1. Không token -> 401
        const resNoToken = await fetch(`http://localhost:${address.port}/api/admin/reports`);
        assert.strictEqual(resNoToken.status, 401);

        // 2. Có token nhưng role BUYER -> 403
        const resBuyer = await fetch(`http://localhost:${address.port}/api/admin/reports`, {
          headers: { 'Authorization': `Bearer ${buyerToken}` },
        });
        assert.strictEqual(resBuyer.status, 403);
      } finally {
        server.close();
      }
    });

    it('GET /api/admin/disputes với role BUYER phải bị chặn 403 FORBIDDEN', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/admin/disputes`, {
          headers: { 'Authorization': `Bearer ${buyerToken}` },
        });
        assert.strictEqual(response.status, 403);
      } finally {
        server.close();
      }
    });

    it('GET /api/admin/kyc-requests với role BUYER phải bị chặn 403 FORBIDDEN', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/admin/kyc-requests`, {
          headers: { 'Authorization': `Bearer ${buyerToken}` },
        });
        assert.strictEqual(response.status, 403);
      } finally {
        server.close();
      }
    });
  });

  // -------------------------------------------------------------
  // 5. CHAT & NOTIFICATIONS (/api/chats, /api/notifications)
  // -------------------------------------------------------------
  describe('Chat & Notifications Security', () => {
    it('GET /api/chats/conversations không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/chats/conversations`);
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('GET /api/notifications không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/notifications`);
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('GET /api/notifications/unread-count không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/notifications/unread-count`);
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });
  });

  // -------------------------------------------------------------
  // 6. PAYMENTS MODULE (/api/payments)
  // -------------------------------------------------------------
  describe('Payment Module (/api/payments)', () => {
    it('POST /api/payments/payos/create-link không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/payments/payos/create-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: 'ord_123' }),
        });
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });

    it('POST /api/payments/payos/create-link có Token nhưng thiếu orderId phải trả về 422 VALIDATION_ERROR', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/payments/payos/create-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${buyerToken}`,
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

    it('POST /api/payments/payos/webhook với body rỗng phải trả về 422 VALIDATION_ERROR', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/payments/payos/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        assert.strictEqual(response.status, 422);
      } finally {
        server.close();
      }
    });

    it('GET /api/payments/order/:orderId không có Token phải trả về 401 UNAUTHORIZED', async () => {
      const server = app.listen(0);
      const address = server.address() as any;
      try {
        const response = await fetch(`http://localhost:${address.port}/api/payments/order/ord_123`);
        assert.strictEqual(response.status, 401);
      } finally {
        server.close();
      }
    });
  });
});
