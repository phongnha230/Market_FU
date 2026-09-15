import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { generateTokens } from '../../src/utils/token';

describe('End-to-End (E2E) Test: Client-Server Full Cycle', () => {
  const buyerToken = generateTokens({
    userId: '65f1a2b3c4d5e6f7a8b9c901',
    role: 'BUYER',
    email: 'e2e.buyer@fpt.edu.vn',
  }).accessToken;

  it('E2E: Phải áp dụng đầy đủ Security Headers (Helmet, CORS, CORP) cho client', async () => {
    const server = app.listen(0);
    const address = server.address() as any;

    try {
      const response = await fetch(`http://localhost:${address.port}/api/health`, {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3000',
        },
      });

      assert.strictEqual(response.status, 200);

      // Kiểm tra Cross-Origin-Resource-Policy cho phép load ảnh tĩnh
      const corp = response.headers.get('cross-origin-resource-policy');
      assert.strictEqual(corp, 'cross-origin', 'Header CORP phải là cross-origin');

      // Kiểm tra JSON response chuẩn
      const data = (await response.json()) as any;
      assert.strictEqual(typeof data, 'object');
      assert.strictEqual(data.status, 'ok');
    } finally {
      server.close();
    }
  });

  it('E2E: Public Flow - Sinh viên chưa đăng nhập có thể xem Danh mục, Tìm kiếm và Kho Voucher', async () => {
    const server = app.listen(0);
    const address = server.address() as any;

    try {
      // 1. Xem danh mục sản phẩm
      const catRes = await fetch(`http://localhost:${address.port}/api/categories`);
      assert.strictEqual(catRes.status, 200);
      const catData = (await catRes.json()) as any;
      assert.strictEqual(catData.success, true);
      assert.ok(Array.isArray(catData.data));

      // 2. Tìm kiếm / lọc bài viết
      const prodRes = await fetch(`http://localhost:${address.port}/api/products?campus=HOL&page=1&limit=10`);
      assert.strictEqual(prodRes.status, 200);
      const prodData = (await prodRes.json()) as any;
      assert.strictEqual(prodData.success, true);

      // 3. Xem kho voucher ăn uống trường
      const vouchRes = await fetch(`http://localhost:${address.port}/api/vouchers`);
      assert.strictEqual(vouchRes.status, 200);
      const vouchData = (await vouchRes.json()) as any;
      assert.strictEqual(vouchData.success, true);
      assert.ok(Array.isArray(vouchData.data));
    } finally {
      server.close();
    }
  });

  it('E2E: Security Flow - Chặn toàn bộ thao tác tạo đơn, đổi voucher, gửi tin nhắn nếu không có Token', async () => {
    const server = app.listen(0);
    const address = server.address() as any;

    try {
      // 1. Chặn xem profile
      const profRes = await fetch(`http://localhost:${address.port}/api/profile/me`);
      assert.strictEqual(profRes.status, 401);

      // 2. Chặn tạo đơn hàng
      const orderRes = await fetch(`http://localhost:${address.port}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'p1', orderType: 'MEETUP' }),
      });
      assert.strictEqual(orderRes.status, 401);

      // 3. Chặn đổi voucher
      const redeemRes = await fetch(`http://localhost:${address.port}/api/vouchers/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherId: 'v1' }),
      });
      assert.strictEqual(redeemRes.status, 401);

      // 4. Chặn xem hội thoại chat
      const chatRes = await fetch(`http://localhost:${address.port}/api/chats/conversations`);
      assert.strictEqual(chatRes.status, 401);
    } finally {
      server.close();
    }
  });

  it('E2E: RBAC Flow - Sinh viên có Token nhưng không có quyền Admin sẽ bị từ chối 403 ở Dashboard Quản trị', async () => {
    const server = app.listen(0);
    const address = server.address() as any;

    try {
      // 1. Truy cập danh sách tố cáo Admin
      const repRes = await fetch(`http://localhost:${address.port}/api/admin/reports`, {
        headers: { 'Authorization': `Bearer ${buyerToken}` },
      });
      assert.strictEqual(repRes.status, 403);
      const repBody = (await repRes.json()) as any;
      assert.strictEqual(repBody.success, false);

      // 2. Truy cập khiếu nại tranh chấp Admin
      const dispRes = await fetch(`http://localhost:${address.port}/api/admin/disputes`, {
        headers: { 'Authorization': `Bearer ${buyerToken}` },
      });
      assert.strictEqual(dispRes.status, 403);

      // 3. Truy cập duyệt KYC Thẻ SV Admin
      const kycRes = await fetch(`http://localhost:${address.port}/api/admin/kyc-requests`, {
        headers: { 'Authorization': `Bearer ${buyerToken}` },
      });
      assert.strictEqual(kycRes.status, 403);
    } finally {
      server.close();
    }
  });
});
