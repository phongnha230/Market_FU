import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { generateTokens } from '../../src/utils/token';

describe('E2E Test: Voucher Lifecycle Workflow (Admin & Student)', () => {
  const adminToken = generateTokens({
    userId: '65f1a2b3c4d5e6f7a8b9c002',
    role: 'ADMIN',
    email: 'admin.e2e@fpt.edu.vn',
  }).accessToken;

  const studentToken = generateTokens({
    userId: '65f1a2b3c4d5e6f7a8b9c001',
    role: 'BUYER',
    email: 'student.e2e@fpt.edu.vn',
  }).accessToken;

  it('Luồng E2E: Admin tạo voucher -> Khách xem danh sách -> Admin sửa -> Admin xóa', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }
    const baseUrl = `http://localhost:${address.port}`;

    try {
      // ── BƯỚC 1: ADMIN TẠO MỚI VOUCHER ──
      const createRes = await fetch(`${baseUrl}/api/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Voucher E2E Cà Phê Passio 20k',
          description: 'Áp dụng cho mọi đồ uống tại Passio cơ sở Hòa Lạc',
          partner: 'PASSIO',
          coinCost: 200,
          discountValue: 20000,
          quantity: 50,
          validDays: 15,
        }),
      });

      assert.strictEqual(createRes.status, 201, 'Admin tạo voucher phải thành công mã 201');
      const createData = (await createRes.json()) as any;
      assert.strictEqual(createData.success, true);
      const voucherId = createData.data.id;
      assert.ok(voucherId, 'Voucher tạo mới phải có id');

      // ── BƯỚC 2: SINH VIÊN XEM DANH SÁCH VOUCHER ──
      const listRes = await fetch(`${baseUrl}/api/vouchers?partner=PASSIO`);
      assert.strictEqual(listRes.status, 200);
      const listData = (await listRes.json()) as any;
      assert.strictEqual(listData.success, true);
      const found = listData.data.find((v: any) => v.id === voucherId);
      assert.ok(found, 'Voucher vừa tạo phải xuất hiện trong danh sách công khai');

      // ── BƯỚC 3: XEM CHI TIẾT VOUCHER ──
      const detailRes = await fetch(`${baseUrl}/api/vouchers/${voucherId}`);
      assert.strictEqual(detailRes.status, 200);
      const detailData = (await detailRes.json()) as any;
      assert.strictEqual(detailData.data.title, 'Voucher E2E Cà Phê Passio 20k');
      assert.strictEqual(detailData.data.coinCost, 200);

      // ── BƯỚC 4: ADMIN CHỈNH SỬA VOUCHER ──
      const updateRes = await fetch(`${baseUrl}/api/vouchers/${voucherId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          coinCost: 180, // Giảm giá Xu khuyến mãi
          quantity: 100,
        }),
      });
      assert.strictEqual(updateRes.status, 200);
      const updateData = (await updateRes.json()) as any;
      assert.strictEqual(updateData.data.coinCost, 180);
      assert.strictEqual(updateData.data.quantity, 100);

      // ── BƯỚC 5: SINH VIÊN XEM VÍ VOUCHER CÁ NHÂN ──
      const myVouchersRes = await fetch(`${baseUrl}/api/vouchers/me`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.strictEqual(myVouchersRes.status, 200);
      const myVouchersData = (await myVouchersRes.json()) as any;
      assert.ok(Array.isArray(myVouchersData.data));

      // ── BƯỚC 6: ADMIN XÓA VOUCHER ──
      const deleteRes = await fetch(`${baseUrl}/api/vouchers/${voucherId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(deleteRes.status, 200);

      // ── BƯỚC 7: KIỂM TRA LẠI KHÔNG TÌM THẤY ──
      const checkRes = await fetch(`${baseUrl}/api/vouchers/${voucherId}`);
      assert.strictEqual(checkRes.status, 404);
    } finally {
      server.close();
    }
  });
});
