'use client';

import React from 'react';
import {
  Truck,
  Laptop,
  BookOpen,
  GraduationCap,
  Bike,
  Coins,
  Check,
  Bookmark,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { VoucherItem } from '@/data/voucherData';

interface VoucherCardProps {
  voucher: VoucherItem;
  isSaved: boolean;
  userCoins: number;
  onSave: (voucher: VoucherItem) => void;
  onRedeem: (voucher: VoucherItem) => void;
}

export default function VoucherCard({
  voucher,
  isSaved,
  userCoins,
  onSave,
  onRedeem,
}: VoucherCardProps) {
  // Render icon based on iconType
  const renderIcon = () => {
    const iconClass = 'h-6 w-6';
    switch (voucher.iconType) {
      case 'truck':
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-fpt-orange border border-orange-100">
            <Truck className={iconClass} />
          </div>
        );
      case 'laptop':
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <Laptop className={iconClass} />
          </div>
        );
      case 'book':
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <BookOpen className={iconClass} />
          </div>
        );
      case 'graduation':
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
            <GraduationCap className={iconClass} />
          </div>
        );
      case 'bike':
      case 'dorm':
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 border border-slate-200">
            <Bike className={iconClass} />
          </div>
        );
      case 'coin':
      default:
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Coins className={iconClass} />
          </div>
        );
    }
  };

  // Badge color theme
  const getBadgeStyle = () => {
    switch (voucher.tagBadge.theme) {
      case 'hot':
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white';
      case 'blue':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
      case 'green':
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'slate':
        return 'bg-gradient-to-r from-slate-700 to-slate-800 text-white';
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      default:
        return 'bg-slate-800 text-white';
    }
  };

  const hasEnoughCoins = voucher.coinCost ? userCoins >= voucher.coinCost : true;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-orange-200">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2 border-b border-dashed border-slate-100 pb-3">
        <span
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase shadow-2xs ${getBadgeStyle()}`}
        >
          {voucher.tagBadge.label}
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          {voucher.tagBadge.rightLabel}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="my-3.5 flex items-start gap-3.5">
        {renderIcon()}

        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-fpt-orange transition-colors">
            {voucher.title}
          </h3>

          <div className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-600 tracking-wider uppercase">
            {voucher.subBadge}
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
            {voucher.description}
          </p>
        </div>
      </div>

      {/* Usage Progress & Meta Status */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-600">{voucher.usedText}</span>
            <span className="text-fpt-orange">{voucher.metaRightText}</span>
          </div>

          {/* Progress Bar (if applicable) */}
          {voucher.category !== 'coins' && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  voucher.usedPercentage > 80 ? 'bg-fpt-orange' : 'bg-slate-400'
                }`}
                style={{ width: `${voucher.usedPercentage}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          {isSaved ? (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 px-3 text-xs font-bold text-emerald-700 shadow-2xs"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Đã lưu vào ví (Dùng ngay khi thanh toán)</span>
            </button>
          ) : voucher.actionType === 'auto' ? (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 py-2.5 px-3 text-xs font-bold text-slate-500"
            >
              <Clock className="h-4 w-4 text-purple-500" />
              <span>Tự động kích hoạt khi mua</span>
            </button>
          ) : voucher.actionType === 'redeem' ? (
            <button
              type="button"
              onClick={() => onRedeem(voucher)}
              disabled={!hasEnoughCoins}
              className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-all shadow-xs ${
                hasEnoughCoins
                  ? 'bg-fpt-orange text-white hover:bg-fpt-orange-hover cursor-pointer active:scale-98'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>
                {hasEnoughCoins
                  ? `Đổi ngay (${voucher.coinCost} Coins)`
                  : `Cần thêm ${voucher.coinCost! - userCoins} Coins`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSave(voucher)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-fpt-orange bg-white py-2.5 px-3 text-xs font-bold text-fpt-orange hover:bg-orange-50/60 transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <Bookmark className="h-4 w-4" />
              <span>Lưu mã vào ví</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
