'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  Camera,
  GraduationCap,
  PlusCircle,
  MapPin,
  Check,
  Sparkles,
  Award,
  CalendarCheck,
} from 'lucide-react';
import { CoinQuestItem } from '@/data/voucherData';

interface VoucherQuestsProps {
  quests: CoinQuestItem[];
  claimedQuestIds: string[];
  onClaimQuest: (questId: string, coins: number) => void;
  resetAt?: string | null;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
  onCheckIn?: () => void;
}

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function getNextWeeklyReset(): Date {
  const now = new Date();
  const vnNow = new Date(now.getTime() + VN_OFFSET_MS);
  const daysUntilNextMonday = ((7 - vnNow.getUTCDay() + 1) % 7) || 7;
  const nextMondayUTC = new Date(
    Date.UTC(
      vnNow.getUTCFullYear(),
      vnNow.getUTCMonth(),
      vnNow.getUTCDate() + daysUntilNextMonday,
      0,
      0,
      0,
      0
    )
  );
  return new Date(nextMondayUTC.getTime() - VN_OFFSET_MS);
}

function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'Đang làm mới nhiệm vụ...';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days} ngày ${hours} giờ ${minutes} phút`;
  }
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút ${seconds}s`;
  }
  return `${minutes} phút ${seconds}s`;
}

export default function VoucherQuests({
  quests,
  claimedQuestIds,
  onClaimQuest,
  resetAt,
  isLoggedIn = true,
  onRequireAuth,
  onCheckIn,
}: VoucherQuestsProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = resetAt ? new Date(resetAt).getTime() : getNextWeeklyReset().getTime();
      const diff = targetTime - Date.now();
      setTimeLeft(formatRemainingTime(diff));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [resetAt]);

  const renderQuestIcon = (iconType: CoinQuestItem['iconType']) => {
    const iconClass = 'h-5 w-5';
    switch (iconType) {
      case 'review':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-fpt-orange border border-orange-100">
            <Camera className={iconClass} />
          </div>
        );
      case 'kyc':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <GraduationCap className={iconClass} />
          </div>
        );
      case 'post':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <PlusCircle className={iconClass} />
          </div>
        );
      case 'safepoint':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <MapPin className={iconClass} />
          </div>
        );
      case 'checkin':
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <CalendarCheck className={iconClass} />
          </div>
        );
      case 'other':
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Award className={iconClass} />
          </div>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-b from-orange-50/40 via-white to-white p-5 sm:p-7 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-fpt-orange text-white">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Nhiệm Vụ Kiếm Campus Coins Tuần Này
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Hoàn thành các hoạt động an toàn để tích lũy điểm thưởng đổi mã freeship và voucher giảm giá trực tiếp.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-1.5 text-xs font-bold text-slate-700 self-start sm:self-auto shrink-0">
          <Clock className="h-3.5 w-3.5 text-fpt-orange" />
          <span>LÀM MỚI NHIỆM VỤ SAU:</span>
          <span className="text-fpt-orange font-extrabold" suppressHydrationWarning>
            {timeLeft || 'Đang tính...'}
          </span>
        </div>
      </div>

      {/* Quests Grid (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
        {quests.map((quest) => {
          const isClaimed = claimedQuestIds.includes(quest.id) || quest.actionType === 'claimed';

          return (
            <div
              key={quest.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-orange-200 hover:shadow-xs transition-all"
            >
              <div className="flex items-start gap-3">
                {renderQuestIcon(quest.iconType)}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {quest.title}
                    </h4>
                    <span className="shrink-0 rounded-full bg-orange-100 border border-orange-200/70 px-2 py-0.5 text-[11px] font-extrabold text-fpt-orange">
                      +{quest.coins} Coins
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {quest.description}
                  </p>
                  {quest.managedBy && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      Bởi: {quest.managedBy}
                    </p>
                  )}
                </div>
              </div>

              {/* Quest Footer Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className={`font-semibold flex items-center gap-1 ${
                  isClaimed ? 'text-slate-400' : quest.actionType === 'claim' ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {quest.statusText}
                </span>

                <div>
                  {isClaimed ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 font-bold text-slate-400 cursor-default"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Đã nhận ✓</span>
                    </button>
                  ) : quest.actionType === 'link' && isLoggedIn ? (
                    <Link
                      href={quest.actionHref || '/create-post'}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer shadow-2xs"
                    >
                      <span>{quest.actionLabel}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isLoggedIn) {
                          onRequireAuth?.();
                          return;
                        }
                        if (quest.id === 'quest-checkin') {
                          onCheckIn?.();
                          return;
                        }
                        onClaimQuest(quest.id, quest.coins);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-fpt-orange px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-fpt-orange-hover active:scale-95 transition cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{quest.actionLabel}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
