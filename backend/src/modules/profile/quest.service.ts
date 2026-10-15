import { randomUUID } from 'crypto';
import { QuestCadence } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { QuestAdminInput } from './profile.dto';
import { emitToUser } from '../../utils/socket';

const DEFAULT_QUESTS: Array<{
  questCode: string;
  title: string;
  description: string;
  rewardCoins: number;
  conditionType: string;
  cadence: QuestCadence;
  iconType: string;
}> = [
  { questCode: 'quest-checkin', title: 'Điểm danh nhận Xu hàng ngày', description: 'Điểm danh hôm nay để nhận thưởng.', rewardCoins: 20, conditionType: 'DAILY_CHECKIN', cadence: 'DAILY', iconType: 'checkin' },
  { questCode: 'quest-kyc', title: 'Xác thực KYC Thẻ Sinh Viên', description: 'Hoàn tất xác thực KYC sinh viên.', rewardCoins: 100, conditionType: 'APPROVED_KYC', cadence: 'ONCE', iconType: 'kyc' },
  { questCode: 'quest-post', title: 'Đăng bán món đồ học tập', description: 'Có tin đăng đang hoạt động trong tuần này.', rewardCoins: 30, conditionType: 'CREATED_LISTING', cadence: 'WEEKLY', iconType: 'post' },
  { questCode: 'quest-safepoint', title: 'Giao dịch tại Safe-Handoff Point', description: 'Hoàn tất giao dịch có điểm hẹn an toàn trong tuần này.', rewardCoins: 40, conditionType: 'COMPLETED_SAFE_HANDOFF', cadence: 'WEEKLY', iconType: 'safepoint' },
  { questCode: 'quest-review', title: 'Đánh giá giao dịch', description: 'Viết đánh giá giao dịch trong tuần này.', rewardCoins: 50, conditionType: 'COMPLETED_REVIEW', cadence: 'WEEKLY', iconType: 'review' },
];

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

const REQUIRED_CADENCE: Record<string, QuestCadence> = {
  DAILY_CHECKIN: 'DAILY',
  APPROVED_KYC: 'ONCE',
  CREATED_LISTING: 'WEEKLY',
  COMPLETED_REVIEW: 'WEEKLY',
  COMPLETED_SAFE_HANDOFF: 'WEEKLY',
};

function assertSupportedCadence(conditionType: string, cadence: QuestCadence): void {
  if (REQUIRED_CADENCE[conditionType] !== cadence) {
    throw new AppError('Chu kỳ không phù hợp với điều kiện nhiệm vụ', 400, 'QUEST_CADENCE_UNSUPPORTED');
  }
}

function getCycle(cadence: QuestCadence, now = new Date()) {
  if (cadence === 'ONCE') {
    return { cycleKey: 'ONCE', startAt: new Date(0), resetAt: null as Date | null };
  }
  const vietnamNow = new Date(now.getTime() + VN_OFFSET_MS);
  const start = new Date(Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth(), vietnamNow.getUTCDate()));
  let cycleKey: string;
  if (cadence === 'WEEKLY') {
    const daysSinceMonday = (start.getUTCDay() + 6) % 7;
    start.setUTCDate(start.getUTCDate() - daysSinceMonday);
    cycleKey = `W:${start.toISOString().slice(0, 10)}`;
    start.setUTCDate(start.getUTCDate() + 7);
  } else {
    cycleKey = `D:${start.toISOString().slice(0, 10)}`;
    start.setUTCDate(start.getUTCDate() + 1);
  }
  const resetAt = new Date(start.getTime() - VN_OFFSET_MS);
  const startAt = new Date(resetAt.getTime() - (cadence === 'WEEKLY' ? 7 : 1) * 24 * 60 * 60 * 1000);
  return { cycleKey, startAt, resetAt };
}

function todayInVietnam(now = new Date()): string {
  return new Date(now.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

export class QuestService {
  private async ensureDefaults(): Promise<void> {
    await Promise.all(DEFAULT_QUESTS.map((quest) => prisma.quest.upsert({
      where: { questCode: quest.questCode },
      create: { ...quest, isActive: true, managedBy: 'Ban Quản Trị Sàn' },
      update: {},
    })));
  }

  private async isEligible(userId: string, conditionType: string, startAt: Date): Promise<boolean> {
    switch (conditionType) {
      case 'DAILY_CHECKIN':
        return Boolean(await prisma.dailyCheckIn.findFirst({ where: { userId, dateStr: todayInVietnam() }, select: { id: true } }));
      case 'APPROVED_KYC': {
        const profile = await prisma.profile.findUnique({ where: { userId }, select: { kyc: true } });
        return profile?.kyc?.status === 'APPROVED';
      }
      case 'CREATED_LISTING':
        return Boolean(await prisma.product.findFirst({ where: { sellerId: userId, status: 'AVAILABLE', createdAt: { gte: startAt } }, select: { id: true } }));
      case 'COMPLETED_REVIEW':
        return Boolean(await prisma.review.findFirst({ where: { reviewerId: userId, createdAt: { gte: startAt } }, select: { id: true } }));
      case 'COMPLETED_SAFE_HANDOFF':
        return Boolean(await prisma.order.findFirst({
          where: {
            OR: [{ buyerId: userId }, { sellerId: userId }],
            status: 'COMPLETED',
            safePointHubId: { not: null },
            updatedAt: { gte: startAt },
          },
          select: { id: true },
        }));
      default:
        return false;
    }
  }

  async getForUser(userId: string) {
    await this.ensureDefaults();
    const quests = await prisma.quest.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
    const output = await Promise.all(quests.map(async (quest) => {
      const cycle = getCycle(quest.cadence);
      const [claim, eligible] = await Promise.all([
        prisma.questClaim.findUnique({ where: { userId_questId_cycleKey: { userId, questId: quest.id, cycleKey: cycle.cycleKey } }, select: { id: true } }),
        this.isEligible(userId, quest.conditionType, cycle.startAt),
      ]);
      return {
        id: quest.questCode,
        title: quest.title,
        description: quest.description,
        coins: quest.rewardCoins,
        conditionType: quest.conditionType,
        cadence: quest.cadence,
        iconType: quest.iconType,
        managedBy: quest.managedBy,
        isCompleted: Boolean(claim) || eligible,
        isClaimed: quest.conditionType === 'DAILY_CHECKIN' ? eligible : Boolean(claim),
        canClaim: quest.conditionType === 'DAILY_CHECKIN' ? !eligible : Boolean(eligible && !claim),
        resetAt: cycle.resetAt?.toISOString(),
      };
    }));
    return output;
  }

  async getAllForAdmin() {
    await this.ensureDefaults();
    const quests = await prisma.quest.findMany({ orderBy: { createdAt: 'asc' } });
    return Promise.all(quests.map(async (quest) => ({
      ...quest,
      claimsThisCycle: await prisma.questClaim.count({
        where: { questId: quest.id, cycleKey: getCycle(quest.cadence).cycleKey },
      }),
    })));
  }

  async create(input: QuestAdminInput) {
    await this.ensureDefaults();
    assertSupportedCadence(input.conditionType, input.cadence);
    if (input.conditionType === 'DAILY_CHECKIN') {
      throw new AppError('Dùng nhiệm vụ điểm danh hệ thống; không thể tạo bản sao', 400, 'QUEST_CONDITION_RESERVED');
    }
    return prisma.quest.create({
      data: {
        questCode: `quest-${randomUUID()}`,
        title: input.title,
        description: input.description,
        rewardCoins: input.rewardCoins,
        conditionType: input.conditionType,
        cadence: input.cadence,
        isActive: input.isActive ?? true,
        iconType: input.iconType,
        managedBy: input.managedBy,
      },
    });
  }

  async update(questCode: string, input: Partial<QuestAdminInput>) {
    await this.ensureDefaults();
    const quest = await prisma.quest.findUnique({ where: { questCode } });
    if (!quest) throw new AppError('Không tìm thấy nhiệm vụ', 404, 'QUEST_NOT_FOUND');
    if (input.conditionType === 'DAILY_CHECKIN' && questCode !== 'quest-checkin') {
      throw new AppError('Điểm danh là điều kiện dành riêng cho nhiệm vụ hệ thống', 400, 'QUEST_CONDITION_RESERVED');
    }
    if (questCode === 'quest-checkin' && (input.conditionType && input.conditionType !== 'DAILY_CHECKIN' || input.cadence && input.cadence !== 'DAILY')) {
      throw new AppError('Không thể thay đổi điều kiện của nhiệm vụ điểm danh hệ thống', 400, 'QUEST_CONDITION_RESERVED');
    }
    assertSupportedCadence(input.conditionType || quest.conditionType, input.cadence || quest.cadence);
    return prisma.quest.update({ where: { id: quest.id }, data: input });
  }

  async claim(userId: string, questCode: string) {
    await this.ensureDefaults();
    const quest = await prisma.quest.findUnique({ where: { questCode } });
    if (!quest || !quest.isActive) throw new AppError('Nhiệm vụ không tồn tại hoặc đã tắt', 404, 'QUEST_NOT_FOUND');
    const cycle = getCycle(quest.cadence);
    if (quest.conditionType === 'DAILY_CHECKIN') {
      throw new AppError('Nhiệm vụ điểm danh được nhận qua thao tác điểm danh', 400, 'QUEST_CLAIM_USES_CHECKIN');
    }
    if (!await this.isEligible(userId, quest.conditionType, cycle.startAt)) {
      throw new AppError('Bạn chưa hoàn thành điều kiện nhiệm vụ', 400, 'QUEST_NOT_COMPLETION_VERIFIED');
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.questClaim.create({ data: { userId, questId: quest.id, cycleKey: cycle.cycleKey } });
        const profile = await tx.profile.update({
          where: { userId },
          data: { campusCoins: { increment: quest.rewardCoins } },
          select: { campusCoins: true },
        });
        await tx.coinTransaction.create({
          data: {
            userId,
            amount: quest.rewardCoins,
            type: 'QUEST_REWARD',
            referenceId: quest.questCode,
            balanceAfter: profile.campusCoins,
            description: `Thưởng nhiệm vụ [${quest.title}] (+${quest.rewardCoins} Xu)`,
          },
        });
        return profile.campusCoins;
      });
      emitToUser(userId, 'profile:coins_updated', { campusCoins: result, reward: quest.rewardCoins, source: 'QUEST_REWARD' });
      return { success: true, coinsAdded: quest.rewardCoins, newBalance: result, questId: quest.questCode };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        throw new AppError('Bạn đã nhận thưởng nhiệm vụ trong chu kỳ này rồi', 409, 'QUEST_ALREADY_CLAIMED');
      }
      throw error;
    }
  }
}

export const questService = new QuestService();
