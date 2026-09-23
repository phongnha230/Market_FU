import { PrismaClient, UserRole, CampusLocation } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Admin accounts into MongoDB...');

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@2025', salt);

  // 1. Super Admin Account
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
          },
        },
      },
      include: { profile: true },
    });
    console.log('✅ SuperAdmin created:', superAdmin.email, '(ID:', superAdmin.id, ')');
  } else {
    const updated = await prisma.user.update({
      where: { email: 'admin@fpt.edu.vn' },
      data: {
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    console.log('✅ SuperAdmin updated:', updated.email);
  }

  // 2. Campus Moderator Account
  const modPasswordHash = await bcrypt.hash('Mod@Hola2025', salt);
  const existingMod = await prisma.user.findUnique({
    where: { email: 'mod.hola@fpt.edu.vn' },
    include: { profile: true },
  });

  if (!existingMod) {
    const campusMod = await prisma.user.create({
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
      include: { profile: true },
    });
    console.log('✅ CampusMod created:', campusMod.email, '(ID:', campusMod.id, ')');
  } else {
    const updatedMod = await prisma.user.update({
      where: { email: 'mod.hola@fpt.edu.vn' },
      data: {
        passwordHash: modPasswordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    console.log('✅ CampusMod updated:', updatedMod.email);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
