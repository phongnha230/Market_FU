import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../src/config/prisma';
import { orderService } from '../../src/modules/orders/order.service';
import { productService } from '../../src/modules/products/product.service';
import { queryProductSchema } from '../../src/modules/products/product.dto';
import { VoucherService } from '../../src/modules/vouchers/voucher.service';
import { notificationService } from '../../src/modules/notifications/notification.service';
import { generateTokens } from '../../src/utils/token';
import app from '../../src/app';

const unique = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

async function createListingFixture() {
  const suffix = unique();
  const seller = await prisma.user.create({
    data: { email: `seller.guards.${suffix}@fpt.edu.vn`, role: 'SELLER', profile: { create: { fullName: 'Seller Guards', campus: 'HOL' } } },
  });
  const buyer = await prisma.user.create({
    data: { email: `buyer.guards.${suffix}@fpt.edu.vn`, role: 'BUYER', profile: { create: { fullName: 'Buyer Guards', campus: 'HOL' } } },
  });
  const admin = await prisma.user.create({
    data: { email: `admin.guards.${suffix}@fpt.edu.vn`, role: 'ADMIN', profile: { create: { fullName: 'Admin Guards', campus: 'HOL' } } },
  });
  const category = await prisma.category.create({ data: { name: `Guards ${suffix}`, slug: `guards-${suffix}`, category: 'ELECTRONICS' } });
  const product = await prisma.product.create({
    data: {
      title: 'Sản phẩm kiểm thử bảo vệ giao dịch', description: 'Sản phẩm còn tốt và đủ phụ kiện',
      price: 200000, condition: 'USED_GOOD', categoryType: 'ELECTRONICS',
      status: 'AVAILABLE', approvedAt: new Date(), campus: 'HOL', sellerId: seller.id, categoryId: category.id,
      images: [{ imageUrl: 'https://example.com/original.jpg', isCover: true, displayOrder: 0 }],
    },
  });
  return { seller, buyer, admin, category, product };
}

async function cleanListingFixture(fixture: Awaited<ReturnType<typeof createListingFixture>>) {
  const userIds = [fixture.seller.id, fixture.buyer.id, fixture.admin.id];
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.coinTransaction.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.order.deleteMany({ where: { productId: fixture.product.id } });
  await prisma.message.deleteMany({ where: { conversation: { productId: fixture.product.id } } });
  await prisma.conversation.deleteMany({ where: { productId: fixture.product.id } });
  await prisma.product.delete({ where: { id: fixture.product.id } });
  await prisma.category.delete({ where: { id: fixture.category.id } });
  await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

describe('Commerce guards', () => {
  it('requires the seller to accept the exact live offer price', async () => {
    const fixture = await createListingFixture();
    try {
      const conversation = await prisma.conversation.create({
        data: { buyerId: fixture.buyer.id, sellerId: fixture.seller.id, productId: fixture.product.id },
      });
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId: fixture.seller.id, text: '[OFFER_ACCEPTED] 100000', offerPrice: 100000 },
      });
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId: fixture.buyer.id, text: '[OFFER_ACCEPTED] 90000', offerPrice: 90000 },
      });
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId: fixture.seller.id, text: '[OFFER_ACCEPTED] 120000', createdAt: new Date(Date.now() - 31 * 60 * 1000) },
      });
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId: fixture.seller.id, text: '[OFFER_ACCEPTED] 130000', offerPrice: 130000, createdAt: new Date(Date.now() - 31 * 60 * 1000) },
      });
      const createAt = (agreedPrice: number) => orderService.createOrder(fixture.buyer.id, {
        productId: fixture.product.id, orderType: 'MEETUP', paymentMethod: 'CASH', coinsUsed: 0, agreedPrice,
      });
      await assert.rejects(createAt(1), { code: 'OFFER_NOT_ACCEPTED' });
      await assert.rejects(createAt(90000), { code: 'OFFER_NOT_ACCEPTED' });
      await assert.rejects(createAt(120000), { code: 'OFFER_NOT_ACCEPTED' });
      await assert.rejects(createAt(130000), { code: 'OFFER_EXPIRED' });
      assert.equal(await prisma.order.count({ where: { productId: fixture.product.id } }), 0);
      const order = await createAt(100000);
      assert.equal(order.payment.price, 100000);
    } finally {
      await cleanListingFixture(fixture);
    }
  });

  it('re-reviews changed content and rejects stale admin decisions', async () => {
    const fixture = await createListingFixture();
    const server = app.listen(0);
    try {
      const priceOnly = await productService.updateProduct(fixture.seller.id, fixture.product.id, { price: 190000 });
      assert.equal(priceOnly.status, 'AVAILABLE');
      const reviewedAt = priceOnly.updatedAt.toISOString();
      const pending = await productService.updateProduct(fixture.seller.id, fixture.product.id, { description: 'Mô tả mới cần kiểm duyệt trước khi bán' });
      assert.equal(pending.status, 'PENDING_APPROVAL');
      assert.equal(pending.approvedAt, null);

      const address = server.address();
      assert.ok(address && typeof address !== 'string');
      const publicList = await fetch(`http://localhost:${address.port}/api/products?sellerId=${fixture.seller.id}`);
      const body = await publicList.json() as { data: Array<{ id: string }> };
      assert.equal(body.data.some((item) => item.id === fixture.product.id), false);
      const forgedPublicList = await fetch(`http://localhost:${address.port}/api/products?sellerId=${fixture.seller.id}&status=PENDING_APPROVAL&allStatuses=true`);
      const forgedBody = await forgedPublicList.json() as { data: Array<{ id: string }> };
      assert.equal(forgedBody.data.some((item) => item.id === fixture.product.id), false);
      await assert.rejects(productService.getProductById(fixture.product.id), { code: 'PRODUCT_NOT_FOUND' });
      assert.equal((await productService.getProductById(fixture.product.id, undefined, fixture.seller.id)).id, fixture.product.id);
      const ownerList = await productService.getProducts(queryProductSchema.parse({ sellerId: fixture.seller.id }), { ownerId: fixture.seller.id });
      assert.equal(ownerList.products.some((item) => item.id === fixture.product.id), true);

      const adminToken = generateTokens({ userId: fixture.admin.id, role: fixture.admin.role, email: fixture.admin.email }).accessToken;
      const missingVersion = await fetch(`http://localhost:${address.port}/api/products/admin/${fixture.product.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({}),
      });
      assert.equal(missingVersion.status, 422);

      await assert.rejects(productService.approveProduct(fixture.admin.id, fixture.product.id, reviewedAt), { code: 'PRODUCT_REVIEW_STALE' });
      const approved = await productService.approveProduct(fixture.admin.id, fixture.product.id, pending.updatedAt.toISOString());
      assert.equal(approved.status, 'AVAILABLE');
      await assert.rejects(productService.approveProduct(fixture.admin.id, fixture.product.id, pending.updatedAt.toISOString()), { code: 'PRODUCT_REVIEW_STALE' });

      await productService.updateProductStatus(fixture.seller.id, fixture.product.id, 'HIDDEN');
      const hiddenEdit = await productService.updateProduct(fixture.seller.id, fixture.product.id, { description: 'Tin đã ẩn nhưng nội dung mới vẫn phải chờ duyệt' });
      assert.equal(hiddenEdit.status, 'PENDING_APPROVAL');
      await productService.approveProduct(fixture.admin.id, fixture.product.id, hiddenEdit.updatedAt.toISOString());

      const imagePending = await productService.updateProduct(fixture.seller.id, fixture.product.id, { imageUrls: ['https://example.com/changed.jpg'] });
      assert.equal(imagePending.status, 'PENDING_APPROVAL');
      await assert.rejects(productService.updateProductStatus(fixture.seller.id, fixture.product.id, 'AVAILABLE'), { code: 'PRODUCT_REVIEW_REQUIRED' });
      await assert.rejects(productService.renewProduct(fixture.seller.id, fixture.product.id), { code: 'PRODUCT_RENEWAL_NOT_ALLOWED' });
      await assert.rejects(productService.rejectProduct(fixture.admin.id, fixture.product.id, 'Ảnh không phù hợp', approved.updatedAt.toISOString()), { code: 'PRODUCT_REVIEW_STALE' });
      const rejected = await productService.rejectProduct(fixture.admin.id, fixture.product.id, 'Ảnh không phù hợp', imagePending.updatedAt.toISOString());
      assert.equal(rejected.status, 'REJECTED');
      await prisma.product.update({ where: { id: fixture.product.id }, data: { status: 'RESERVED' } });
      await assert.rejects(productService.updateProduct(fixture.seller.id, fixture.product.id, { price: 180000 }), { code: 'PRODUCT_NOT_EDITABLE' });
    } finally {
      server.close();
      await cleanListingFixture(fixture);
    }
  });

  it('records the committed voucher balance and keeps success when notification fails', async () => {
    const fixture = await createListingFixture();
    const voucherIds: string[] = [];
    const service = new VoucherService();
    try {
      await prisma.profile.update({ where: { userId: fixture.buyer.id }, data: { campusCoins: 100 } });
      for (const cost of [10, 20, 5]) {
        const voucher = await prisma.voucher.create({ data: { title: `Voucher guards ${cost}`, coinCost: cost, discountValue: 1000, quantity: 2 } });
        voucherIds.push(voucher.id);
      }
      const first = await service.redeemVoucher(fixture.buyer.id, voucherIds[0]);
      const second = await service.redeemVoucher(fixture.buyer.id, voucherIds[1]);
      assert.equal(first.remainingCoins, 90);
      assert.equal(second.remainingCoins, 70);

      const notificationMock = mock.method(notificationService, 'sendNotification', async () => { throw new Error('push unavailable'); });
      try {
        const third = await service.redeemVoucher(fixture.buyer.id, voucherIds[2]);
        assert.equal(third.remainingCoins, 65);
      } finally {
        notificationMock.mock.restore();
      }
      const ledger = await prisma.coinTransaction.findMany({ where: { userId: fixture.buyer.id, type: 'REDEEM_VOUCHER' }, orderBy: { createdAt: 'asc' } });
      assert.deepEqual(ledger.map((entry) => entry.balanceAfter), [90, 70, 65]);
      assert.equal((await prisma.profile.findUniqueOrThrow({ where: { userId: fixture.buyer.id } })).campusCoins, 65);

      const concurrent = await Promise.allSettled([
        service.redeemVoucher(fixture.buyer.id, voucherIds[0]),
        service.redeemVoucher(fixture.buyer.id, voucherIds[1]),
      ]);
      const successfulCosts = concurrent.flatMap((result, index) => result.status === 'fulfilled' ? [index === 0 ? 10 : 20] : []);
      const finalBalance = (await prisma.profile.findUniqueOrThrow({ where: { userId: fixture.buyer.id } })).campusCoins;
      assert.equal(finalBalance, 65 - successfulCosts.reduce((sum, cost) => sum + cost, 0));
      assert.equal(await prisma.coinTransaction.count({ where: { userId: fixture.buyer.id, type: 'REDEEM_VOUCHER' } }), 3 + successfulCosts.length);
      assert.equal(await prisma.userVoucher.count({ where: { userId: fixture.buyer.id } }), 3 + successfulCosts.length);
    } finally {
      await prisma.userVoucher.deleteMany({ where: { userId: fixture.buyer.id } });
      await prisma.voucher.deleteMany({ where: { id: { in: voucherIds } } });
      await cleanListingFixture(fixture);
    }
  });
});
