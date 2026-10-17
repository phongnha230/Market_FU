import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { generateTokens } from '../../src/utils/token';
import { prisma } from '../../src/config/prisma';

describe('E2E Test Suite: Luồng giao dịch Mua & Bán (Buyer <-> Seller)', () => {
  before(async () => {
    // Dọn dẹp sạch các user test e2e cũ nếu có
    const testUsers = await prisma.user.findMany({
      where: { email: { contains: '.e2e@fpt.edu.vn' } },
      select: { id: true },
    });
    const userIds = testUsers.map((u) => u.id);
    if (userIds.length > 0) {
      await prisma.report.deleteMany({ where: { reporterId: { in: userIds } } });
      await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.coinTransaction.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.order.deleteMany({ where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] } });
      await prisma.product.deleteMany({ where: { sellerId: { in: userIds } } });
      await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
  });

  it('Luồng 1 (Safe Point Handshake): Buyer đặt mua MEETUP -> Seller xác thực QR/OTP -> Hoàn tất & Giải ngân Escrow', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }
    const baseUrl = `http://localhost:${address.port}`;

    let buyerId: string | null = null;
    let sellerId: string | null = null;
    let productId: string | null = null;
    let orderId: string | null = null;

    try {
      // 1. Tạo Dữ liệu Test: Seller & Buyer & Product
      const seller = await prisma.user.create({
        data: {
          email: `seller.meetup.${Date.now()}@fpt.edu.vn`,
          role: 'SELLER',
          profile: {
            create: {
              fullName: 'Người Bán E2E Handshake',
              campus: 'HOL',
              reputationScore: 100,
            },
          },
        },
      });
      sellerId = seller.id;

      const buyer = await prisma.user.create({
        data: {
          email: `buyer.meetup.${Date.now()}@fpt.edu.vn`,
          role: 'BUYER',
          profile: {
            create: {
              fullName: 'Người Mua E2E Handshake',
              campus: 'HOL',
              campusCoins: 50, // 50 FPT Coins
              reputationScore: 100,
            },
          },
        },
      });
      buyerId = buyer.id;

      const category = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Đồ điện tử E2E', slug: 'do-dien-tu-e2e', category: 'ELECTRONICS' },
      });

      const product = await prisma.product.create({
        data: {
          title: 'Tai nghe Sony WH-1000XM4 Likenew',
          description: 'Tai nghe chống ồn mới 99% nguyên hộp',
          price: 3500000,
          condition: 'LIKE_NEW_99',
          categoryType: 'ELECTRONICS',
          status: 'AVAILABLE',
          campus: 'HOL',
          meetupLocation: 'Sảnh Thư viện Alfa Laval',
          sellerId: seller.id,
          categoryId: category.id,
          images: [{ imageUrl: 'https://example.com/sony.jpg', isCover: true, displayOrder: 0 }],
        },
      });
      productId = product.id;

      const buyerToken = generateTokens({ userId: buyer.id, role: buyer.role, email: buyer.email }).accessToken;
      const sellerToken = generateTokens({ userId: seller.id, role: seller.role, email: seller.email }).accessToken;

      // 2. Buyer gọi API tạo đơn hàng (MEETUP + Dùng 10 FPT Coin giảm giá)
      const createRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          orderType: 'MEETUP',
          paymentMethod: 'CASH',
          coinsUsed: 10,
        }),
      });

      assert.strictEqual(createRes.status, 201, 'Tạo đơn hàng MEETUP phải trả về 201 Created');
      const createData = (await createRes.json()) as any;
      assert.strictEqual(createData.success, true);
      const order = createData.data;
      orderId = order.id;

      assert.strictEqual(order.status, 'PENDING');
      assert.strictEqual(order.orderType, 'MEETUP');
      assert.ok(order.handshake?.handshakeOtp, 'Đơn hàng MEETUP phải chứa OTP Handshake');

      // Kiểm tra Trạng thái Sản phẩm đã đổi sang RESERVED
      const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
      assert.strictEqual(updatedProduct?.status, 'RESERVED', 'Sản phẩm phải được khóa sang RESERVED');

      // 3. Seller xác thực Handshake OTP của Buyer tại điểm hẹn
      const handshakeRes = await fetch(`${baseUrl}/api/orders/${order.id}/handshake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sellerToken}`,
        },
        body: JSON.stringify({
          handshakeOtp: order.handshake.handshakeOtp,
        }),
      });

      assert.strictEqual(handshakeRes.status, 200, 'Xác thực OTP Handshake thành công phải trả về 200 OK');
      const handshakeData = (await handshakeRes.json()) as any;
      assert.strictEqual(handshakeData.success, true);
      assert.strictEqual(handshakeData.data.status, 'COMPLETED', 'Đơn hàng phải đổi trạng thái sang COMPLETED');

      // 4. Kiểm tra Database Assertions
      const completedProduct = await prisma.product.findUnique({ where: { id: product.id } });
      assert.strictEqual(completedProduct?.status, 'SOLD', 'Sản phẩm phải chuyển sang SOLD sau khi Handshake');

      const sellerProfile = await prisma.profile.findUnique({ where: { userId: seller.id } });
      const buyerProfile = await prisma.profile.findUnique({ where: { userId: buyer.id } });

      assert.strictEqual(sellerProfile?.reputationScore, 105, 'Seller được +5 điểm uy tín (100 -> 105)');
      assert.strictEqual(buyerProfile?.reputationScore, 105, 'Buyer được +5 điểm uy tín (100 -> 105)');
      assert.strictEqual(buyerProfile?.campusCoins, 40, 'Buyer bị trừ 10 FPT Coin (50 - 10 = 40)');

    } finally {
      if (orderId) await prisma.order.deleteMany({ where: { id: orderId } });
      if (productId) await prisma.product.deleteMany({ where: { id: productId } });
      const userIds = [buyerId, sellerId].filter(Boolean) as string[];
      if (userIds.length > 0) {
        await prisma.report.deleteMany({ where: { reporterId: { in: userIds } } });
        await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.coinTransaction.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }
      server.close();
    }
  });

  it('Luồng 2 (Giao hàng Inter-Campus SHIP_COD): Buyer đặt mua -> Seller gửi hàng (SHIPPING) -> Giao KTX (DELIVERED) -> Buyer Confirm Delivery', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }
    const baseUrl = `http://localhost:${address.port}`;

    let buyerId: string | null = null;
    let sellerId: string | null = null;
    let productId: string | null = null;
    let orderId: string | null = null;

    try {
      const seller = await prisma.user.create({
        data: {
          email: `seller.ship.${Date.now()}@fpt.edu.vn`,
          role: 'SELLER',
          profile: {
            create: {
              fullName: 'Người Bán E2E Shipping',
              campus: 'HOL',
              reputationScore: 100,
            },
          },
        },
      });
      sellerId = seller.id;

      const buyer = await prisma.user.create({
        data: {
          email: `buyer.ship.${Date.now()}@fpt.edu.vn`,
          role: 'BUYER',
          profile: {
            create: {
              fullName: 'Người Mua E2E Shipping',
              campus: 'HCM',
              reputationScore: 100,
            },
          },
        },
      });
      buyerId = buyer.id;

      const category = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Sách giáo trình E2E', slug: 'sach-giao-trinh-e2e', category: 'BOOKS' },
      });

      const product = await prisma.product.create({
        data: {
          title: 'Sách Software Engineering Pressman',
          description: 'Sách chuyên ngành CNTT FPT',
          price: 120000,
          condition: 'USED_GOOD',
          categoryType: 'BOOKS',
          status: 'AVAILABLE',
          campus: 'HOL',
          sellerId: seller.id,
          categoryId: category.id,
          images: [{ imageUrl: 'https://example.com/book.jpg', isCover: true, displayOrder: 0 }],
        },
      });
      productId = product.id;

      const buyerToken = generateTokens({ userId: buyer.id, role: buyer.role, email: buyer.email }).accessToken;
      const sellerToken = generateTokens({ userId: seller.id, role: seller.role, email: seller.email }).accessToken;

      // 1. Buyer đặt đơn giao hàng SHIP_COD
      const createRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          orderType: 'SHIP_COD',
          paymentMethod: 'VIETQR',
          shipping: {
            receiverName: 'Nguyễn Văn Mua',
            receiverPhone: '0987654321',
            destinationCampus: 'HCM',
            shippingAddress: 'Phòng 302 KTX Dom A, FPT HCM',
          },
        }),
      });

      assert.strictEqual(createRes.status, 201);
      const createData = (await createRes.json()) as any;
      const order = createData.data;
      orderId = order.id;

      assert.strictEqual(order.orderType, 'SHIP_COD');
      assert.strictEqual(order.status, 'PENDING');

      // 2. Seller cập nhật trạng thái vận đơn sang SHIPPING
      const shipRes = await fetch(`${baseUrl}/api/orders/${order.id}/shipping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sellerToken}`,
        },
        body: JSON.stringify({
          status: 'SHIPPING',
          shippingPartner: 'GHN',
          trackingCode: 'GHN123456789',
        }),
      });

      assert.strictEqual(shipRes.status, 200);
      const shipData = (await shipRes.json()) as any;
      assert.strictEqual(shipData.data.status, 'SHIPPING');

      // 3. Seller/Bưu tá cập nhật trạng thái vận đơn sang DELIVERED (Đã giao tới KTX)
      const deliverRes = await fetch(`${baseUrl}/api/orders/${order.id}/shipping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sellerToken}`,
        },
        body: JSON.stringify({
          status: 'DELIVERED',
        }),
      });

      assert.strictEqual(deliverRes.status, 422);

      const stillShipping = await prisma.order.findUnique({ where: { id: order.id } });
      assert.strictEqual(stillShipping?.status, 'SHIPPING');

      // Simulate the trusted carrier callback state for the buyer-confirmation flow.
      const deliveredAt = new Date();
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'DELIVERED',
          payment: { ...stillShipping!.payment, isPaid: true, paidAt: deliveredAt },
          shipping: { ...stillShipping!.shipping!, deliveredAt },
        },
      });

      // 4. Buyer bấm Xác nhận đã nhận hàng (Confirm Delivery)
      const confirmRes = await fetch(`${baseUrl}/api/orders/${order.id}/confirm-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
      });

      assert.strictEqual(confirmRes.status, 200);
      const confirmData = (await confirmRes.json()) as any;
      assert.strictEqual(confirmData.data.status, 'COMPLETED');

    } finally {
      if (orderId) await prisma.order.deleteMany({ where: { id: orderId } });
      if (productId) await prisma.product.deleteMany({ where: { id: productId } });
      const userIds = [buyerId, sellerId].filter(Boolean) as string[];
      if (userIds.length > 0) {
        await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.coinTransaction.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }
      server.close();
    }
  });

  it('Luồng 3 (Hủy đơn hàng PENDING): Hoàn sản phẩm, coin và voucher đúng một lần', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }
    const baseUrl = `http://localhost:${address.port}`;

    let buyerId: string | null = null;
    let sellerId: string | null = null;
    let productId: string | null = null;
    let orderId: string | null = null;
    let voucherId: string | null = null;
    let userVoucherId: string | null = null;

    try {
      const seller = await prisma.user.create({
        data: {
          email: `seller.cancel.${Date.now()}@fpt.edu.vn`,
          role: 'SELLER',
          profile: { create: { fullName: 'Seller Cancel E2E', campus: 'HOL' } },
        },
      });
      sellerId = seller.id;

      const buyer = await prisma.user.create({
        data: {
          email: `buyer.cancel.${Date.now()}@fpt.edu.vn`,
          role: 'BUYER',
          profile: { create: { fullName: 'Buyer Cancel E2E', campus: 'HOL', campusCoins: 20 } },
        },
      });
      buyerId = buyer.id;

      const category = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Đồ gia dụng E2E', slug: 'do-gia-dung-e2e', category: 'DORM_ITEM' },
      });

      const product = await prisma.product.create({
        data: {
          title: 'Ấm siêu tốc Lock&Lock',
          description: 'Dùng tốt cho phòng KTX',
          price: 150000,
          condition: 'USED_GOOD',
          categoryType: 'DORM_ITEM',
          status: 'AVAILABLE',
          campus: 'HOL',
          sellerId: seller.id,
          categoryId: category.id,
          images: [{ imageUrl: 'https://example.com/kettle.jpg', isCover: true, displayOrder: 0 }],
        },
      });
      productId = product.id;

      const voucher = await prisma.voucher.create({
        data: {
          title: 'Voucher hủy đơn E2E',
          coinCost: 0,
          discountValue: 10000,
        },
      });
      voucherId = voucher.id;
      const userVoucher = await prisma.userVoucher.create({
        data: {
          userId: buyer.id,
          voucherId: voucher.id,
          voucherCode: `CANCEL-E2E-${Date.now()}`,
          expiredAt: new Date(Date.now() + 86400000),
        },
      });
      userVoucherId = userVoucher.id;

      const buyerToken = generateTokens({ userId: buyer.id, role: buyer.role, email: buyer.email }).accessToken;

      // 1. Tạo đơn kèm sử dụng 5 coins
      const createRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          orderType: 'MEETUP',
          coinsUsed: 5,
          voucherCode: userVoucher.voucherCode,
        }),
      });

      const createData = (await createRes.json()) as any;
      orderId = createData.data.id;

      // Coin bị trừ còn 15
      let buyerProf = await prisma.profile.findUnique({ where: { userId: buyer.id } });
      assert.strictEqual(buyerProf?.campusCoins, 15);
      assert.strictEqual((await prisma.userVoucher.findUnique({ where: { id: userVoucher.id } }))?.status, 'USED');

      // 2. Buyer hủy đơn
      const cancelRes = await fetch(`${baseUrl}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({ reason: 'Đổi ý không mua nữa' }),
      });

      assert.strictEqual(cancelRes.status, 200);
      const cancelData = (await cancelRes.json()) as any;
      assert.strictEqual(cancelData.data.status, 'CANCELLED');

      // 3. Verify Database State
      const restoredProduct = await prisma.product.findUnique({ where: { id: product.id } });
      assert.strictEqual(restoredProduct?.status, 'AVAILABLE', 'Sản phẩm phải được khôi phục về AVAILABLE');

      buyerProf = await prisma.profile.findUnique({ where: { userId: buyer.id } });
      assert.strictEqual(buyerProf?.campusCoins, 20, 'FPT Coin phải được hoàn trả lại đầy đủ (15 + 5 = 20)');
      assert.strictEqual((await prisma.userVoucher.findUnique({ where: { id: userVoucher.id } }))?.status, 'UNUSED');

      const repeatedCancel = await fetch(`${baseUrl}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
        body: JSON.stringify({ reason: 'Hủy lặp' }),
      });
      assert.strictEqual(repeatedCancel.status, 400);
      assert.strictEqual((await prisma.profile.findUnique({ where: { userId: buyer.id } }))?.campusCoins, 20);

    } finally {
      if (orderId) await prisma.order.deleteMany({ where: { id: orderId } });
      if (userVoucherId) await prisma.userVoucher.deleteMany({ where: { id: userVoucherId } });
      if (voucherId) await prisma.voucher.deleteMany({ where: { id: voucherId } });
      if (productId) await prisma.product.deleteMany({ where: { id: productId } });
      const userIds = [buyerId, sellerId].filter(Boolean) as string[];
      if (userIds.length > 0) {
        await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.coinTransaction.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }
      server.close();
    }
  });
});
