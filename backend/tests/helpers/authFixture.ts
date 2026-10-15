import { UserRole } from '@prisma/client';
import { prisma } from '../../src/config/prisma';
import { generateTokens } from '../../src/utils/token';

export async function ensureTestAuthUser(userId: string, email: string, role: UserRole): Promise<string> {
  const user = await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email, role, isActive: true, tokenVersion: 0 },
    update: { email, role, isActive: true, tokenVersion: 0 },
    select: { id: true, email: true, role: true, tokenVersion: true },
  });
  await prisma.profile.upsert({
    where: { userId },
    create: { userId, fullName: 'Automated Test User', campus: 'HOL' },
    update: { fullName: 'Automated Test User' },
  });
  return generateTokens({ userId: user.id, email: user.email, role: user.role }, user.tokenVersion).accessToken;
}
