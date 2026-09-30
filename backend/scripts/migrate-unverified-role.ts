import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Bắt đầu Migration: Cập nhật Role UNVERIFIED cho tài khoản cá nhân chưa xác thực...');

  // 1. Cập nhật cụ thể tài khoản emxinhnhatdoi17@gmail.com
  const specificUser = await prisma.user.findUnique({
    where: { email: 'emxinhnhatdoi17@gmail.com' },
    include: { profile: true },
  });

  if (specificUser) {
    await prisma.user.update({
      where: { id: specificUser.id },
      data: { role: UserRole.UNVERIFIED },
    });
    console.log(`✅ [TARGET] Đã cập nhật thành công tài khoản: emxinhnhatdoi17@gmail.com -> Role: UNVERIFIED`);
  } else {
    console.log(`ℹ️ [TARGET] Không tìm thấy tài khoản emxinhnhatdoi17@gmail.com trong DB.`);
  }

  // 2. Quét toàn bộ người dùng trong hệ thống
  const allUsers = await prisma.user.findMany({
    include: { profile: true },
  });

  let migratedCount = 0;
  let skippedCount = 0;

  for (const user of allUsers) {
    const emailLower = user.email.toLowerCase().trim();
    const isEduEmail = emailLower.endsWith('@fpt.edu.vn') || emailLower.endsWith('@fe.edu.vn');
    const isKycApproved = user.profile?.kyc?.status === 'APPROVED';

    // Bỏ qua nếu là ADMIN hoặc SELLER đã duyệt
    if (user.role === UserRole.ADMIN || user.role === UserRole.SELLER) {
      console.log(`⏩ [BỎ QUA] ${user.email} (Role: ${user.role})`);
      skippedCount++;
      continue;
    }

    // Nếu là sinh viên trường hoặc đã duyệt KYC -> Giữ BUYER
    if (isEduEmail || isKycApproved) {
      if (user.role !== UserRole.BUYER) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.BUYER },
        });
        console.log(`🎓 [GIỮ/NÂNG BUYER] ${user.email} (Mail trường hoặc đã duyệt KYC)`);
      } else {
        console.log(`⏩ [GIỮ BUYER] ${user.email} (Đã là BUYER hợp lệ)`);
      }
      skippedCount++;
      continue;
    }

    // Tài khoản dùng email cá nhân và chưa duyệt KYC Thẻ SV -> Chuyển về UNVERIFIED
    if (user.role !== UserRole.UNVERIFIED) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.UNVERIFIED },
      });
      console.log(`🔄 [MIGRATED] ${user.email} -> UNVERIFIED (Chưa xác thực SV)`);
      migratedCount++;
    } else {
      console.log(`⏩ [ĐÃ LÀ UNVERIFIED] ${user.email}`);
      skippedCount++;
    }
  }

  console.log(`\n🎉 Hoàn thành migration!`);
  console.log(`- Đã chuyển sang UNVERIFIED: ${migratedCount} tài khoản`);
  console.log(`- Giữ nguyên: ${skippedCount} tài khoản`);
}

main()
  .catch((err) => {
    console.error('❌ Lỗi khi chạy migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
