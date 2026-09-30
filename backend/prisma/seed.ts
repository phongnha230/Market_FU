import {
  PrismaClient,
  UserRole,
  CampusLocation,
  KycStatus,
  ProductCategory,
  ItemCondition,
  ProductStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu (Seeding Database FU Market)...');

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Password123@', salt);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123@', salt);

  // =========================================================================
  // 1. TÀI KHOẢN SINH VIÊN (BUYER) - ĐÃ XÁC THỰC KYC SINH VIÊN
  // =========================================================================
  const existingBuyer = await prisma.user.findUnique({
    where: { email: 'buyer@fpt.edu.vn' },
    include: { profile: true },
  });

  let buyerId: string;
  if (!existingBuyer) {
    const buyer = await prisma.user.create({
      data: {
        email: 'buyer@fpt.edu.vn',
        passwordHash: commonPasswordHash,
        role: UserRole.BUYER,
        isActive: true,
        profile: {
          create: {
            fullName: 'Nguyễn Văn Mua (Sinh Viên Đã Xác Thực)',
            phoneNumber: '0987654321',
            campus: CampusLocation.HOL,
            campusCoins: 500, // Đủ Xu để test giảm giá đơn hàng hoặc đổi Voucher
            reputationScore: 100,
            kyc: {
              studentId: 'HE170001',
              cardImageUrl: 'https://api.marketfu.com/uploads/sample-student-card.webp',
              status: KycStatus.APPROVED,
              type: 'STUDENT',
              verifiedAt: new Date(),
            },
            bankAccount: {
              bankName: 'MB Bank',
              accountNo: '0987654321',
              accountName: 'NGUYEN VAN MUA',
            },
          },
        },
      },
      include: { profile: true },
    });
    buyerId = buyer.id;
    console.log('✅ Đã tạo tài khoản Buyer đã xác thực sinh viên:', buyer.email, '(MSSV: HE170001)');
  } else {
    buyerId = existingBuyer.id;
    await prisma.user.update({
      where: { email: 'buyer@fpt.edu.vn' },
      data: {
        passwordHash: commonPasswordHash,
        role: UserRole.BUYER,
        isActive: true,
      },
    });
    await prisma.profile.upsert({
      where: { userId: buyerId },
      update: {
        campusCoins: 500,
        kyc: {
          studentId: 'HE170001',
          cardImageUrl: 'https://api.marketfu.com/uploads/sample-student-card.webp',
          status: KycStatus.APPROVED,
          type: 'STUDENT',
          verifiedAt: new Date(),
        },
        bankAccount: {
          bankName: 'MB Bank',
          accountNo: '0987654321',
          accountName: 'NGUYEN VAN MUA',
        },
      },
      create: {
        userId: buyerId,
        fullName: 'Nguyễn Văn Mua (Sinh Viên Đã Xác Thực)',
        phoneNumber: '0987654321',
        campus: CampusLocation.HOL,
        campusCoins: 500,
        reputationScore: 100,
        kyc: {
          studentId: 'HE170001',
          cardImageUrl: 'https://api.marketfu.com/uploads/sample-student-card.webp',
          status: KycStatus.APPROVED,
          type: 'STUDENT',
          verifiedAt: new Date(),
        },
        bankAccount: {
          bankName: 'MB Bank',
          accountNo: '0987654321',
          accountName: 'NGUYEN VAN MUA',
        },
      },
    });
    console.log('✅ Đã cập nhật tài khoản Buyer (Xác thực KYC sinh viên):', existingBuyer.email);
  }

  // Tài khoản sinh viên namntk17@fe.edu.vn (Khớp với nút bấm demo nhanh)
  const existingNam = await prisma.user.findUnique({
    where: { email: 'namntk17@fe.edu.vn' },
  });
  if (!existingNam) {
    await prisma.user.create({
      data: {
        email: 'namntk17@fe.edu.vn',
        passwordHash: commonPasswordHash,
        role: UserRole.BUYER,
        isActive: true,
        profile: {
          create: {
            fullName: 'Nguyễn Tuấn Nam (K17 SE)',
            phoneNumber: '0981112233',
            campus: CampusLocation.HOL,
            campusCoins: 500,
            reputationScore: 100,
            kyc: {
              studentId: 'SE172819',
              cardImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
              status: KycStatus.APPROVED,
              type: 'STUDENT',
              verifiedAt: new Date(),
            },
          },
        },
      },
    });
    console.log('✅ Đã tạo tài khoản demo Sinh viên:', 'namntk17@fe.edu.vn');
  } else {
    await prisma.user.update({
      where: { email: 'namntk17@fe.edu.vn' },
      data: { passwordHash: commonPasswordHash },
    });
  }

  // =========================================================================
  // 1b. TÀI KHOẢN KHÁCH VÃNG LAI (UNVERIFIED) - CHƯA XÁC THỰC THẺ SINH VIÊN
  // =========================================================================
  const existingUnverified = await prisma.user.findUnique({
    where: { email: 'guest@gmail.com' },
  });
  if (!existingUnverified) {
    await prisma.user.create({
      data: {
        email: 'guest@gmail.com',
        passwordHash: commonPasswordHash,
        role: UserRole.UNVERIFIED,
        isActive: true,
        profile: {
          create: {
            fullName: 'Khách Vãng Lai (Chưa Xác Thực)',
            phoneNumber: '0977889900',
            campus: CampusLocation.HOL,
            campusCoins: 0,
            reputationScore: 100,
            kyc: {
              studentId: '',
              cardImageUrl: '',
              status: KycStatus.NONE,
              type: 'STUDENT',
            },
          },
        },
      },
    });
    console.log('✅ Đã tạo tài khoản demo Khách chưa xác thực (UNVERIFIED):', 'guest@gmail.com');
  }

  // =========================================================================
  const existingSeller = await prisma.user.findUnique({
    where: { email: 'seller@fpt.edu.vn' },
    include: { profile: true },
  });

  let sellerId: string;
  if (!existingSeller) {
    const seller = await prisma.user.create({
      data: {
        email: 'seller@fpt.edu.vn',
        passwordHash: commonPasswordHash,
        role: UserRole.SELLER,
        isActive: true,
        profile: {
          create: {
            fullName: 'Trần Thị Bán (Người Bán Tích Xanh)',
            phoneNumber: '0912345678',
            campus: CampusLocation.HOL,
            campusCoins: 1000, // Đủ Xu để test Đẩy tin / Ghim bài viết
            reputationScore: 100,
            avatarBadge: 'TOP_SELLER',
            kyc: {
              studentId: 'SE160002',
              cardImageUrl: 'https://api.marketfu.com/uploads/sample-seller-card.webp',
              status: KycStatus.APPROVED,
              type: 'SELLER',
              verifiedAt: new Date(),
            },
            bankAccount: {
              bankName: 'Vietcombank',
              accountNo: '012345678999',
              accountName: 'TRAN THI BAN',
            },
          },
        },
      },
      include: { profile: true },
    });
    sellerId = seller.id;
    console.log('✅ Đã tạo tài khoản Seller đã xác thực:', seller.email, '(MSSV: SE160002)');
  } else {
    sellerId = existingSeller.id;
    await prisma.user.update({
      where: { email: 'seller@fpt.edu.vn' },
      data: {
        passwordHash: commonPasswordHash,
        role: UserRole.SELLER,
        isActive: true,
      },
    });
    await prisma.profile.upsert({
      where: { userId: sellerId },
      update: {
        campusCoins: 1000,
        avatarBadge: 'TOP_SELLER',
        kyc: {
          studentId: 'SE160002',
          cardImageUrl: 'https://api.marketfu.com/uploads/sample-seller-card.webp',
          status: KycStatus.APPROVED,
          type: 'SELLER',
          verifiedAt: new Date(),
        },
        bankAccount: {
          bankName: 'Vietcombank',
          accountNo: '012345678999',
          accountName: 'TRAN THI BAN',
        },
      },
      create: {
        userId: sellerId,
        fullName: 'Trần Thị Bán (Người Bán Tích Xanh)',
        phoneNumber: '0912345678',
        campus: CampusLocation.HOL,
        campusCoins: 1000,
        reputationScore: 100,
        avatarBadge: 'TOP_SELLER',
        kyc: {
          studentId: 'SE160002',
          cardImageUrl: 'https://api.marketfu.com/uploads/sample-seller-card.webp',
          status: KycStatus.APPROVED,
          type: 'SELLER',
          verifiedAt: new Date(),
        },
        bankAccount: {
          bankName: 'Vietcombank',
          accountNo: '012345678999',
          accountName: 'TRAN THI BAN',
        },
      },
    });
    console.log('✅ Đã cập nhật tài khoản Seller (Xác thực KYC người bán):', existingSeller.email);
  }

  // =========================================================================
  // 3. TÀI KHOẢN QUẢN TRỊ VIÊN (SUPER ADMIN)
  // =========================================================================
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: 'admin@fpt.edu.vn' },
    include: { profile: true },
  });

  if (!existingSuperAdmin) {
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@fpt.edu.vn',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        isActive: true,
        profile: {
          create: {
            fullName: 'Lê Minh Quân (SuperAdmin)',
            campus: CampusLocation.HOL,
            campusCoins: 10000,
            reputationScore: 100,
            avatarBadge: 'TOP_SELLER',
            kyc: {
              studentId: 'ADMIN001',
              cardImageUrl: 'https://api.marketfu.com/uploads/sample-admin-card.webp',
              status: KycStatus.APPROVED,
              type: 'STUDENT',
              verifiedAt: new Date(),
            },
          },
        },
      },
      include: { profile: true },
    });
    console.log('✅ Đã tạo SuperAdmin:', superAdmin.email);
  } else {
    await prisma.user.update({
      where: { email: 'admin@fpt.edu.vn' },
      data: {
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    await prisma.profile.upsert({
      where: { userId: existingSuperAdmin.id },
      update: {
        campusCoins: 10000,
        avatarBadge: 'TOP_SELLER',
      },
      create: {
        userId: existingSuperAdmin.id,
        fullName: 'Lê Minh Quân (SuperAdmin)',
        campus: CampusLocation.HOL,
        campusCoins: 10000,
        reputationScore: 100,
        avatarBadge: 'TOP_SELLER',
      },
    });
    console.log('✅ Đã cập nhật SuperAdmin:', existingSuperAdmin.email);
  }

  // =========================================================================
  // 4. TÀI KHOẢN CAMPUS MODERATOR
  // =========================================================================
  const modPasswordHash = await bcrypt.hash('Password123@', salt);
  const existingMod = await prisma.user.findUnique({
    where: { email: 'mod.hola@fpt.edu.vn' },
    include: { profile: true },
  });

  if (!existingMod) {
    await prisma.user.create({
      data: {
        email: 'mod.hola@fpt.edu.vn',
        passwordHash: modPasswordHash,
        role: UserRole.ADMIN,
        isActive: true,
        profile: {
          create: {
            fullName: 'Nguyễn Thị Hà (CampusMod)',
            campus: CampusLocation.HOL,
            campusCoins: 5000,
            reputationScore: 100,
          },
        },
      },
    });
    console.log('✅ Đã tạo CampusMod: mod.hola@fpt.edu.vn');
  } else {
    await prisma.user.update({
      where: { email: 'mod.hola@fpt.edu.vn' },
      data: {
        passwordHash: modPasswordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    console.log('✅ Đã cập nhật CampusMod: mod.hola@fpt.edu.vn');
  }

  // =========================================================================
  // 5. SEED DANH MỤC SẢN PHẨM (CATEGORIES)
  // =========================================================================
  const categoriesData = [
    {
      name: 'Giáo trình & Sách học',
      slug: 'giao-trinh',
      category: ProductCategory.BOOKS,
      description: 'Giáo trình và sách ôn thi chuyên ngành FPT University',
    },
    {
      name: 'Đồ dùng KTX & Phòng trọ',
      slug: 'do-dung-ktx',
      category: ProductCategory.DORM_ITEM,
      description: 'Quạt, ấm siêu tốc, đệm, tủ vải và đồ dùng sinh hoạt',
    },
    {
      name: 'Đồ điện tử & Công nghệ',
      slug: 'dien-tu',
      category: ProductCategory.ELECTRONICS,
      description: 'Laptop, chuột, bàn phím, tai nghe và phụ kiện máy tính',
    },
    {
      name: 'Phương tiện đi lại',
      slug: 'xe-co',
      category: ProductCategory.VEHICLE,
      description: 'Xe máy, xe đạp điện, xe đạp di chuyển trong campus',
    },
  ];

  let mainCategoryId: string | undefined;
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        category: cat.category,
        description: cat.description,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        category: cat.category,
        description: cat.description,
        isActive: true,
      },
    });
    if (cat.slug === 'giao-trinh') {
      mainCategoryId = upserted.id;
    }
  }
  console.log('✅ Đã khởi tạo các danh mục sản phẩm (Categories)');

  // =========================================================================
  // 6. SEED TRẠM GIAO DỊCH AN TOÀN (SAFE-HANDOFF HUB)
  // =========================================================================
  await prisma.safeHandoffHub.upsert({
    where: { code: 'HL-01' },
    update: {
      name: 'Trạm Safe-Handoff Sảnh Beta',
      campus: CampusLocation.HOL,
      storageCapacity: '100 kiện',
      cameras: '2 Cam HD',
      staffCount: '4 cán bộ',
      status: 'Hoạt động',
      isOperating: true,
      operatingHours: '07:30 - 21:00',
      locationDetails: 'Sảnh tầng 1 tòa nhà Beta, cạnh quầy tư vấn',
      notes: 'Trạm giao nhận an toàn có camera giám sát và nhân viên hỗ trợ',
    },
    create: {
      name: 'Trạm Safe-Handoff Sảnh Beta',
      code: 'HL-01',
      campus: CampusLocation.HOL,
      storageCapacity: '100 kiện',
      cameras: '2 Cam HD',
      staffCount: '4 cán bộ',
      status: 'Hoạt động',
      isOperating: true,
      operatingHours: '07:30 - 21:00',
      locationDetails: 'Sảnh tầng 1 tòa nhà Beta, cạnh quầy tư vấn',
      notes: 'Trạm giao nhận an toàn có camera giám sát và nhân viên hỗ trợ',
    },
  });
  console.log('✅ Đã khởi tạo Trạm Safe-Handoff mẫu: HL-01 (Sảnh Beta)');

  // =========================================================================
  // 7. SEED SẢN PHẨM MẪU SẴN CỦA SELLER (DEMO PRODUCT)
  // =========================================================================
  const existingProduct = await prisma.product.findFirst({
    where: { sellerId, status: ProductStatus.AVAILABLE },
  });

  if (!existingProduct) {
    const demoProduct = await prisma.product.create({
      data: {
        sellerId,
        categoryId: mainCategoryId,
        categoryType: ProductCategory.BOOKS,
        title: 'Giáo trình Kỹ thuật lập trình C (FPT)',
        description: 'Sách còn mới 95%, đầy đủ bài tập và ví dụ minh họa, hỗ trợ pass môn PRF192',
        price: 50000,
        originalPrice: 120000,
        condition: ItemCondition.LIKE_NEW_99,
        quantity: 1,
        campus: CampusLocation.HOL,
        meetupLocation: 'Sảnh tòa nhà Beta Campus Hòa Lạc',
        allowShipping: true,
        status: ProductStatus.AVAILABLE,
        hashtags: ['giaotrinh', 'c', 'prf192', 'fpt'],
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
            isCover: true,
            displayOrder: 0,
          },
        ],
      },
    });
    console.log('✅ Đã tạo sản phẩm mẫu có sẵn:', demoProduct.title, '(ID:', demoProduct.id, ')');
  } else {
    await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
            isCover: true,
            displayOrder: 0,
          },
        ],
      },
    });
    console.log('✅ Đã cập nhật ảnh sản phẩm của Seller hợp lệ:', existingProduct.title);
  }

  console.log('\n🎉 Hoàn tất quá trình Seed dữ liệu! Các tài khoản sẵn sàng:');
  console.log('   👨‍🎓 Buyer (Sinh viên):  buyer@fpt.edu.vn   / Password123@ (KYC Approved)');
  console.log('   🛒 Seller (Người bán):  seller@fpt.edu.vn  / Password123@ (KYC Approved, Top Seller)');
  console.log('   👑 Admin (Quản trị):    admin@fpt.edu.vn   / AdminPassword123@');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi trong quá trình seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
