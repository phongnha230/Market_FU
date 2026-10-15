import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../src/config/prisma';
import { AppError } from '../../src/middlewares/error.middleware';
import { claimQuestSchema } from '../../src/modules/profile/profile.dto';
import { QuestService } from '../../src/modules/profile/quest.service';

type Restore = () => void;

function replace(target: object, property: string, value: unknown): Restore {
  const original = (target as Record<string, unknown>)[property];
  Object.defineProperty(target, property, { configurable: true, value });
  return () => Object.defineProperty(target, property, { configurable: true, value: original });
}

function mockQuestDatabase(options: { eligible: boolean; duplicate?: boolean }) {
  const fakeQuest = {
    id: 'quest-object-id',
    questCode: 'quest-server-reward',
    title: 'Server controlled quest',
    description: 'Verified task',
    rewardCoins: 75,
    conditionType: 'APPROVED_KYC',
    cadence: 'ONCE',
    isActive: true,
    iconType: 'kyc',
    managedBy: 'Admin',
  };
  const restorers: Restore[] = [
    replace(prisma.quest, 'upsert', async () => ({})),
    replace(prisma.quest, 'findUnique', async () => fakeQuest),
    replace(prisma.profile, 'findUnique', async () => ({ kyc: { status: options.eligible ? 'APPROVED' : 'PENDING' } })),
  ];
  restorers.push(replace(prisma, '$transaction', async (operation: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      questClaim: {
        create: async () => {
          if (options.duplicate) throw { code: 'P2002' };
          return {};
        },
      },
      profile: { update: async () => ({ campusCoins: 175 }) },
      coinTransaction: { create: async () => ({}) },
    };
    return operation(tx);
  }));
  return () => restorers.reverse().forEach((restore) => restore());
}

function mockCheckInQuest(alreadyCheckedIn: boolean): Restore {
  const quest = {
    id: 'checkin-id',
    questCode: 'quest-checkin',
    title: 'Daily check-in',
    description: 'Check in today',
    rewardCoins: 20,
    conditionType: 'DAILY_CHECKIN',
    cadence: 'DAILY',
    isActive: true,
    iconType: 'checkin',
    managedBy: 'System',
  };
  const restorers = [
    replace(prisma.quest, 'upsert', async () => ({})),
    replace(prisma.quest, 'findUnique', async () => quest),
    replace(prisma.quest, 'findMany', async () => [quest]),
    replace(prisma.questClaim, 'findUnique', async () => null),
    replace(prisma.dailyCheckIn, 'findFirst', async () => alreadyCheckedIn ? { id: 'checkin-record' } : null),
  ];
  return () => restorers.reverse().forEach((restore) => restore());
}

describe('Quest reward security', () => {
  it('ignores a client supplied coin amount', () => {
    assert.deepEqual(claimQuestSchema.parse({ questId: 'quest-server-reward', amount: 200 }), {
      questId: 'quest-server-reward',
    });
  });

  it('uses the configured server reward after verifying completion', async () => {
    const restore = mockQuestDatabase({ eligible: true });
    try {
      const result = await new QuestService().claim('user-id', 'quest-server-reward');
      assert.equal(result.coinsAdded, 75);
      assert.equal(result.newBalance, 175);
    } finally {
      restore();
    }
  });

  it('rejects a quest whose completion cannot be verified', async () => {
    const restore = mockQuestDatabase({ eligible: false });
    try {
      await assert.rejects(
        new QuestService().claim('user-id', 'quest-server-reward'),
        (error: unknown) => error instanceof AppError && error.code === 'QUEST_NOT_COMPLETION_VERIFIED'
      );
    } finally {
      restore();
    }
  });

  it('turns duplicate concurrent claims into a conflict', async () => {
    const restore = mockQuestDatabase({ eligible: true, duplicate: true });
    try {
      await assert.rejects(
        new QuestService().claim('user-id', 'quest-server-reward'),
        (error: unknown) => error instanceof AppError && error.statusCode === 409
      );
    } finally {
      restore();
    }
  });

  it('uses the existing daily check-in payout instead of minting a second quest reward', async () => {
    const restore = mockCheckInQuest(false);
    try {
      const [quest] = await new QuestService().getForUser('user-id');
      assert.equal(quest.canClaim, true);
      assert.equal(quest.isClaimed, false);
      await assert.rejects(
        new QuestService().claim('user-id', 'quest-checkin'),
        (error: unknown) => error instanceof AppError && error.code === 'QUEST_CLAIM_USES_CHECKIN'
      );
    } finally {
      restore();
    }
  });

  it('marks the check-in quest complete after its existing reward is credited', async () => {
    const restore = mockCheckInQuest(true);
    try {
      const [quest] = await new QuestService().getForUser('user-id');
      assert.equal(quest.isClaimed, true);
      assert.equal(quest.canClaim, false);
    } finally {
      restore();
    }
  });
});
