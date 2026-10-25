import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../src/config/prisma';
import { productService } from '../../src/modules/products/product.service';

const unique = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

async function createListingFixture() {
  const suffix = unique();
  const seller = await prisma.user.create({
    data: {
      email: `seller.appeal.${suffix}@fpt.edu.vn`,
      role: 'SELLER',
      profile: { create: { fullName: 'Seller Appeal Test', campus: 'HOL' } },
    },
  });
  const admin = await prisma.user.create({
    data: {
      email: `admin.appeal.${suffix}@fpt.edu.vn`,
      role: 'ADMIN',
      profile: { create: { fullName: 'Admin Appeal Test', campus: 'HOL' } },
    },
  });
  const category = await prisma.category.create({
    data: { name: `Appeal Cat ${suffix}`, slug: `appeal-cat-${suffix}`, category: 'ELECTRONICS' },
  });
  const product = await prisma.product.create({
    data: {
      title: 'Ấm siêu tốc Lock&Lock',
      description: 'Ấm điện đun nước sinh viên',
      price: 150000,
      condition: 'USED_GOOD',
      categoryType: 'ELECTRONICS',
      status: 'AVAILABLE',
      approvedAt: new Date(),
      campus: 'HOL',
      sellerId: seller.id,
      categoryId: category.id,
      images: [{ imageUrl: 'https://example.com/am.jpg', isCover: true, displayOrder: 0 }],
    },
  });
  return { seller, admin, category, product };
}

async function cleanListingFixture(fixture: Awaited<ReturnType<typeof createListingFixture>>) {
  const userIds = [fixture.seller.id, fixture.admin.id];
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.product.deleteMany({ where: { id: fixture.product.id } });
  await prisma.category.deleteMany({ where: { id: fixture.category.id } });
  await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

describe('Product Takedown & Appeal Flow', () => {
  it('allows Admin to take down an AVAILABLE product, seller to appeal, and admin to approve appeal', async () => {
    const fixture = await createListingFixture();
    try {
      // 1. Admin gỡ tin đăng đang sống (AVAILABLE)
      const takenDown = await productService.rejectProduct(
        fixture.admin.id,
        fixture.product.id,
        'Thiết bị điện công suất lớn vi phạm an toàn PCCC KTX FPT.',
        fixture.product.updatedAt.toISOString()
      );
      assert.equal(takenDown.status, 'REJECTED');
      assert.equal(takenDown.rejectionReason, 'Thiết bị điện công suất lớn vi phạm an toàn PCCC KTX FPT.');

      // Kiểm tra trong DB
      const dbProductAfterTakedown = await prisma.product.findUnique({ where: { id: fixture.product.id } });
      assert.equal(dbProductAfterTakedown?.status, 'REJECTED');

      // 2. Seller gửi kháng nghị giải trình
      const appealResult = await productService.appealProduct(
        fixture.seller.id,
        fixture.product.id,
        'Ấm này là loại mini 500W đạt tiêu chuẩn cho phép của ban quản lý KTX'
      );
      assert.equal(appealResult.appealStatus, 'PENDING');
      assert.equal(appealResult.appealReason, 'Ấm này là loại mini 500W đạt tiêu chuẩn cho phép của ban quản lý KTX');

      // 3. Chống gửi kháng nghị trùng lặp khi đang PENDING
      await assert.rejects(
        productService.appealProduct(fixture.seller.id, fixture.product.id, 'Gửi lại lần nữa'),
        { code: 'APPEAL_ALREADY_PENDING' }
      );

      // 4. Admin chấp thuận kháng nghị và khôi phục bài đăng
      const restored = await productService.approveProduct(
        fixture.admin.id,
        fixture.product.id,
        appealResult.updatedAt.toISOString()
      );
      assert.equal(restored.status, 'AVAILABLE');
      assert.equal(restored.appealStatus, 'APPROVED');
      assert.equal(restored.rejectionReason, null);

      // Kiểm tra DB sản phẩm đã hiển thị lại
      const dbProductRestored = await prisma.product.findUnique({ where: { id: fixture.product.id } });
      assert.equal(dbProductRestored?.status, 'AVAILABLE');
    } finally {
      await cleanListingFixture(fixture);
    }
  });

  it('allows Admin to reject an appeal with reasons', async () => {
    const fixture = await createListingFixture();
    try {
      // 1. Gỡ tin
      const takenDown = await productService.rejectProduct(
        fixture.admin.id,
        fixture.product.id,
        'Ảnh không phải ảnh chụp thực tế hoặc tải từ mạng.',
        fixture.product.updatedAt.toISOString()
      );

      // 2. Seller gửi kháng nghị
      const appealResult = await productService.appealProduct(
        fixture.seller.id,
        fixture.product.id,
        'Ảnh này em chụp trong phòng KTX chứ không phải ảnh mạng'
      );

      // 3. Admin bác bỏ kháng nghị
      const rejectedAppeal = await productService.rejectAppeal(
        fixture.admin.id,
        fixture.product.id,
        'Hình ảnh trùng khớp 100% với ảnh trên Shopee Mall, vui lòng đăng ảnh chụp thực tế.',
        appealResult.updatedAt.toISOString()
      );
      assert.equal(rejectedAppeal.status, 'REJECTED');
      assert.equal(rejectedAppeal.appealStatus, 'REJECTED');
      assert.equal(
        rejectedAppeal.rejectionReason,
        'Hình ảnh trùng khớp 100% với ảnh trên Shopee Mall, vui lòng đăng ảnh chụp thực tế.'
      );
    } finally {
      await cleanListingFixture(fixture);
    }
  });
  it('prevents Seller from deleting approved products but allows deleting rejected products', async () => {
    const fixture = await createListingFixture();
    try {
      // 1. Seller cố tình gọi xóa bài đăng đã duyệt (AVAILABLE) -> Bị chặn
      await assert.rejects(
        async () => {
          await productService.deleteProduct(fixture.seller.id, 'SELLER', fixture.product.id);
        },
        (err: any) => {
          assert.equal(err.code, 'CANNOT_DELETE_APPROVED_PRODUCT');
          return true;
        }
      );

      // 2. Admin gỡ tin vi phạm -> Chuyển thành REJECTED
      await productService.rejectProduct(
        fixture.admin.id,
        fixture.product.id,
        'Vi phạm nội dung',
        fixture.product.updatedAt.toISOString()
      );

      // 3. Sau khi đã thành REJECTED, Seller được phép xóa tin
      const deleteResult = await productService.deleteProduct(
        fixture.seller.id,
        'SELLER',
        fixture.product.id
      );
      assert.equal(deleteResult.id, fixture.product.id);
    } finally {
      await cleanListingFixture(fixture);
    }
  });
});