import React from 'react';
import Link from 'next/link';
import { Sparkles, Coins, ShieldCheck, Truck, Award, Calendar, ChevronRight, Info } from 'lucide-react';
import CompactHeader from '@/components/layout/CompactHeader';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';

interface VoucherHeroBannerProps {
  coins: number;
  dailyCheckedIn: boolean;
  onCheckIn: () => void;
  onOpenHistory: () => void;
}

export default function VoucherHeroBanner({
  coins,
  dailyCheckedIn,
  onCheckIn,
  onOpenHistory,
}: VoucherHeroBannerProps) {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const user = useUserStore((state) => state.user);
  const coinValueVND = (coins * 1000).toLocaleString('vi-VN');
  const targetCoins = 500;
  const progressPercent = Math.min(100, Math.round((coins / targetCoins) * 100));
  const remainingCoins = Math.max(0, targetCoins - coins);

  return (
    <div className="w-full space-y-3">
      {/* Compact in-container Header matching Image 2 */}
      <CompactHeader
        breadcrumbs={[
          { label: 'Tiện ích & Ưu đãi' },
          { label: 'Kho Voucher & Campus Coins' },
        ]}
        activeTab="vouchers"
      />

      {/* Hero Banner Box */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF5E0E] via-[#F26F21] to-[#FF7B29] p-6 lg:p-8 text-white shadow-lg">
        {/* Subtle decorative background circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-black/5 blur-xl"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Heading & Feature Tags */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-md uppercase text-orange-50">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FPT STUDENT REWARDS & COIN HUB</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
              Kho Voucher & Đặc Quyền Sinh Viên FPT 5Campus
            </h1>

            <p className="text-sm sm:text-base text-orange-100/95 font-medium leading-relaxed max-w-xl">
              Săn mã miễn phí vận chuyển CampusShip, trợ giá giáo trình đồ án và đổi điểm thưởng Campus Coins mỗi ngày cho sinh viên 5 cơ sở toàn quốc.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                <Truck className="h-3.5 w-3.5 text-orange-200" />
                <span>CampusShip Liên Tỉnh</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>SSO FPT Edu Escrow</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                <Coins className="h-3.5 w-3.5 text-amber-300" />
                <span>1 Coin = 1.000 VNĐ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Campus Coins Wallet Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white p-5 sm:p-6 text-slate-900 shadow-xl border border-orange-100/60">
              {/* Wallet Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  VÍ CAMPUS COINS CỦA BẠN
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  DIAMOND STUDENT
                </span>
              </div>

              {/* Coins Total */}
              <div className="pt-3.5 pb-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {coins}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-fpt-orange">Coins</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenHistory}
                    className="flex items-center gap-1 text-xs font-semibold text-fpt-orange hover:text-orange-700 transition cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Xem Lịch Sử Thẻ SV</span>
                  </button>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  = {coinValueVND}đ khi thanh toán đơn hoặc trừ ship •{' '}
                  <span className="text-slate-700 font-semibold">
                    {isLoggedIn
                      ? `${user.cohort || 'K17'} ${user.major || 'SE'} • ${user.campus || 'Hola'} Campus`
                      : 'Chưa đăng nhập ví'}
                  </span>
                </div>
              </div>

              {/* Tier Progress Bar */}
              <div className="my-3 rounded-xl bg-orange-50/70 p-3 border border-orange-100">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Tiến trình đạt cấp Master Pioneer</span>
                  <span className="text-fpt-orange font-bold">{coins} / {targetCoins} Coins</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-orange-200/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-fpt-orange transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-[11px] text-slate-500 leading-tight">
                  Tích lũy thêm <strong className="text-fpt-orange font-bold">{remainingCoins} Coins</strong> để mở khóa trợ giá in đồ án lên 100% tại xưởng Hola & HCM!
                </p>
              </div>

              {/* Check-in Button */}
              <button
                type="button"
                onClick={onCheckIn}
                disabled={dailyCheckedIn}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-bold transition-all shadow-xs',
                  dailyCheckedIn
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default'
                    : 'bg-orange-50/80 border border-fpt-orange/60 text-fpt-orange hover:bg-fpt-orange hover:text-white cursor-pointer active:scale-98'
                )}
              >
                <Calendar className="h-4 w-4" />
                {dailyCheckedIn ? (
                  <span>✓ Đã điểm danh hôm nay (+20 Coins)</span>
                ) : (
                  <span>Điểm danh nhận +20 Coins hôm nay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
