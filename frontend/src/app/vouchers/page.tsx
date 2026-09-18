'use client';

import React, { useState } from 'react';
import { useMarket } from '@/hooks/useMarket';
import { ShieldCheck, Sparkles } from 'lucide-react';
import {
  INITIAL_VOUCHERS,
  INITIAL_QUESTS,
  VoucherItem,
  CoinQuestItem,
} from '@/data/voucherData';
import VoucherHeroBanner from '@/components/vouchers/VoucherHeroBanner';
import VoucherSearchBar from '@/components/vouchers/VoucherSearchBar';
import VoucherFilterBar, { VoucherCategoryTab } from '@/components/vouchers/VoucherFilterBar';
import VoucherCard from '@/components/vouchers/VoucherCard';
import VoucherQuests from '@/components/vouchers/VoucherQuests';
import VoucherPolicyBanner from '@/components/vouchers/VoucherPolicyBanner';
import VoucherModals from '@/components/vouchers/VoucherModals';

export default function VouchersPage() {
  const {
    user,
    addCoins,
    saveVoucher,
    checkInDaily,
    claimQuestCoins,
    showToast,
  } = useMarket();

  // State management
  const [activeTab, setActiveTab] = useState<VoucherCategoryTab>('all');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [vouchers, setVouchers] = useState<VoucherItem[]>(INITIAL_VOUCHERS);
  const [quests, setQuests] = useState<CoinQuestItem[]>(INITIAL_QUESTS);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Tab counts calculation
  const counts = {
    all: vouchers.length,
    ship: vouchers.filter((v) => v.category === 'ship').length,
    it: vouchers.filter((v) => v.category === 'it').length,
    dorm: vouchers.filter((v) => v.category === 'dorm').length,
    coins: vouchers.filter((v) => v.category === 'coins').length,
  };

  // Filtered vouchers
  const filteredVouchers = vouchers.filter((voucher) => {
    // 1. Category filter
    if (activeTab !== 'all' && voucher.category !== activeTab) {
      return false;
    }
    // 2. Campus filter
    if (selectedCampus !== 'all') {
      const matchCampus =
        voucher.campuses.includes('all') || voucher.campuses.includes(selectedCampus);
      if (!matchCampus) return false;
    }
    return true;
  });

  // Action handlers
  const handleCheckIn = () => {
    const res = checkInDaily();
    if (res.success) {
      showToast('🎉 Điểm danh thành công! Bạn nhận được +20 Campus Coins.', 'success');
    } else {
      showToast('Bạn đã điểm danh hôm nay rồi! Hãy quay lại vào ngày mai nhé.', 'info');
    }
  };

  const handleApplyCode = (code: string) => {
    const upperCode = code.toUpperCase();
    const found = vouchers.find((v) => v.code === upperCode);

    if (found) {
      saveVoucher(found.id, {
        id: found.id,
        title: found.title,
        code: found.code,
        discount: found.discount,
        expiry: found.expiry,
      });
      showToast(`🎟️ Áp dụng thành công mã "${found.code}"! Đã lưu ưu đãi vào ví của bạn.`, 'success');
    } else {
      showToast(`Mã voucher "${upperCode}" không tồn tại hoặc đã hết hạn trên 5Campus!`, 'error');
    }
  };

  const handleSaveVoucher = (voucher: VoucherItem) => {
    saveVoucher(voucher.id, {
      id: voucher.id,
      title: voucher.title,
      code: voucher.code,
      discount: voucher.discount,
      expiry: voucher.expiry,
    });
    showToast(`🔖 Đã lưu "${voucher.title}" vào ví! Sẽ tự áp dụng khi thanh toán.`, 'success');
  };

  const handleRedeemVoucher = (voucher: VoucherItem) => {
    if (!voucher.coinCost) return;
    if (user.coins < voucher.coinCost) {
      showToast(`Bạn không đủ Coins! Cần thêm ${voucher.coinCost - user.coins} Coins nữa.`, 'warning');
      return;
    }

    addCoins(-voucher.coinCost);
    saveVoucher(voucher.id, {
      id: voucher.id,
      title: voucher.title,
      code: voucher.code,
      discount: voucher.discount,
      expiry: voucher.expiry,
    });
    showToast(`🪙 Đổi thành công! Đã trừ ${voucher.coinCost} Coins và cộng voucher vào ví.`, 'success');
  };

  const handleClaimQuest = (questId: string, coinsAmount: number) => {
    const res = claimQuestCoins(questId, coinsAmount);
    if (res.success) {
      showToast(`🎉 Chúc mừng! Bạn nhận được +${coinsAmount} Campus Coins từ nhiệm vụ.`, 'success');
    } else {
      showToast('Nhiệm vụ này đã được nhận phần thưởng tuần này rồi!', 'info');
    }
  };

  const handleReportSuccess = () => {
    showToast('🚩 Đã gửi báo cáo sai phạm tới Ban CTSV FPT Edu! Chúng tôi sẽ xác minh trong 24h.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Hero Banner & Coins Wallet */}
        <VoucherHeroBanner
          coins={user.coins}
          dailyCheckedIn={user.dailyCheckedIn}
          onCheckIn={handleCheckIn}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />

        {/* 2. Voucher Search Bar & Quick Hot Suggestions */}
        <VoucherSearchBar onApplyCode={handleApplyCode} />

        {/* 3. Category Tabs & Campus Selector */}
        <VoucherFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedCampus={selectedCampus}
          onCampusChange={setSelectedCampus}
          counts={counts}
        />

        {/* 4. Section: Ưu Đãi Đang Khả Dụng */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Ưu Đãi Đang Khả Dụng
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="h-3 w-3" />
                Xác thực FPT
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Bảo trợ bởi Quỹ Trợ Giá Sinh Viên FPT Edu</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 -mt-2">
            Chọn &quot;Lưu mã vào ví&quot; hoặc &quot;Dùng ngay&quot; khi đặt mua giáo trình hoặc đồ án trên sàn
          </p>

          {/* Vouchers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVouchers.map((voucher) => {
              const isSaved =
                (user.savedVoucherIds || []).includes(voucher.id) ||
                voucher.actionType === 'saved';

              return (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  isSaved={isSaved}
                  userCoins={user.coins}
                  onSave={handleSaveVoucher}
                  onRedeem={handleRedeemVoucher}
                />
              );
            })}
          </div>

          {filteredVouchers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              <p className="text-sm font-semibold">
                Không tìm thấy voucher phù hợp cho cơ sở đã chọn.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  setSelectedCampus('all');
                }}
                className="mt-3 text-xs font-bold text-fpt-orange hover:underline cursor-pointer"
              >
                Xem lại tất cả mã toàn quốc
              </button>
            </div>
          )}
        </div>

        {/* 5. Weekly Coin Quests */}
        <VoucherQuests
          quests={quests}
          claimedQuestIds={user.claimedQuestIds || []}
          onClaimQuest={handleClaimQuest}
        />

        {/* 6. Policy & Guarantee Banner */}
        <VoucherPolicyBanner
          onOpenPolicy={() => setIsPolicyOpen(true)}
          onReportViolation={() => setIsReportOpen(true)}
        />
      </div>

      {/* Modals */}
      <VoucherModals
        isHistoryOpen={isHistoryOpen}
        onCloseHistory={() => setIsHistoryOpen(false)}
        isPolicyOpen={isPolicyOpen}
        onClosePolicy={() => setIsPolicyOpen(false)}
        isReportOpen={isReportOpen}
        onCloseReport={() => setIsReportOpen(false)}
        coins={user.coins}
        onReportSuccess={handleReportSuccess}
      />
    </div>
  );
}
