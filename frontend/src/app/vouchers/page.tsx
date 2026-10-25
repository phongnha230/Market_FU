'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMarket } from '@/hooks/useMarket';
import { useVoucherStore, UserVoucher } from '@/stores/voucherStore';
import { profileService } from '@/services/profileService';
import {
  ShieldCheck,
  Sparkles,
  Ticket,
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  Coins,
  Building,
  Store,
  Coffee,
  Utensils,
  ChevronRight,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Truck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import {
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
import AuthPromptModal from '@/components/modals/AuthPromptModal';
import { useUserStore } from '@/stores/userStore';

export default function VouchersPage() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const {
    user,
    addCoins,
    saveVoucher,
    showToast,
  } = useMarket();

  // Tab điều hướng chính: 'store' (Kho đổi voucher) | 'my_vouchers' (Ví voucher cá nhân)
  const [pageView, setPageView] = useState<'store' | 'my_vouchers'>('store');
  const [myVouchersFilter, setMyVouchersFilter] = useState<'ALL' | 'UNUSED' | 'USED' | 'EXPIRED'>('ALL');
  const [selectedUserVoucher, setSelectedUserVoucher] = useState<UserVoucher | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isUsingVoucher, setIsUsingVoucher] = useState(false);

  // Store vouchers
  const availableVouchers = useVoucherStore((state) => state.availableVouchers);
  const myVouchers = useVoucherStore((state) => state.myVouchers);
  const fetchAvailableVouchers = useVoucherStore((state) => state.fetchAvailableVouchers);
  const fetchMyVouchers = useVoucherStore((state) => state.fetchMyVouchers);

  // Category filter state
  const [activeTab, setActiveTab] = useState<VoucherCategoryTab>('all');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [quests, setQuests] = useState<CoinQuestItem[]>(INITIAL_QUESTS);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Fetch real data on mount
  useEffect(() => {
    fetchAvailableVouchers();
    fetchMyVouchers();
    if (isLoggedIn) {
      profileService.getQuests().then((serverQuests) => {
        setQuests(serverQuests.map((quest) => {
          const template = INITIAL_QUESTS.find((item) => item.id === quest.id);
          return {
            ...(template || INITIAL_QUESTS[0]),
            id: quest.id,
            title: quest.title,
            description: quest.description,
            coins: quest.coins,
            isCompleted: quest.isCompleted,
            actionType: quest.isClaimed ? 'claimed' as const : quest.canClaim ? 'claim' as const : 'link' as const,
            statusText: quest.isClaimed ? '✓ Đã nhận thưởng' : quest.canClaim ? '✓ Đã đủ điều kiện nhận thưởng' : 'Chưa hoàn thành điều kiện nhiệm vụ',
            actionLabel: quest.isClaimed ? 'Đã nhận ✓' : quest.canClaim ? `Nhận ${quest.coins} Coins` : 'Xem điều kiện',
          };
        }));
      }).catch(() => {});
    }
    profileService
      .getProfile()
      .then((p: any) => {
        if (p && p.campusCoins !== undefined) {
          useUserStore.getState().updateProfile({ coins: p.campusCoins });
        }
      })
      .catch(() => {});
    profileService.getCheckInStatus().catch(() => {});
  }, [fetchAvailableVouchers, fetchMyVouchers, isLoggedIn]);

  // Map backend vouchers to VoucherItem format for standard rendering
  const mappedBackendVouchers: VoucherItem[] = availableVouchers.map((bv) => {
    let category: VoucherCategoryTab = 'coins';
    if (bv.partner === 'CAMPUS_SHIP' || bv.partner === 'OTHER') category = 'ship';
    else if (bv.partner === 'SEVEN_ELEVEN') category = 'dorm';

    const partnerLabel =
      bv.partnerLabel ||
      (bv.partner === 'CANTEEN'
        ? 'Căn Tin FPT'
        : bv.partner === 'PASSIO'
        ? 'Passio Coffee'
        : bv.partner === 'SEVEN_ELEVEN'
        ? '7-Eleven FPT'
        : bv.partner === 'CAMPUS_SHIP'
        ? 'FPT CampusShip'
        : 'CampusShip');

    let tagTheme: 'hot' | 'blue' | 'green' | 'purple' | 'slate' | 'amber' = 'hot';
    if (bv.partner === 'PASSIO') tagTheme = 'green';
    else if (bv.partner === 'SEVEN_ELEVEN') tagTheme = 'blue';
    else if (bv.partner === 'CAMPUS_SHIP' || bv.partner === 'OTHER') tagTheme = 'purple';

    let iconType: VoucherItem['iconType'] = 'coin';
    if (bv.partner === 'CAMPUS_SHIP' || bv.partner === 'OTHER') iconType = 'truck';
    else if (bv.partner === 'SEVEN_ELEVEN') iconType = 'dorm';

    return {
      id: bv.id,
      code: `FUV-${bv.partner}`,
      category,
      tagBadge: {
        label: partnerLabel.toUpperCase(),
        rightLabel: `Giảm ${bv.discountValue.toLocaleString('vi-VN')}đ`,
        theme: tagTheme,
      },
      iconType,
      title: bv.title,
      subBadge: bv.minOrderValue && bv.minOrderValue > 0
        ? `Đơn từ ${bv.minOrderValue.toLocaleString('vi-VN')}đ • ${bv.coinCost} Coins`
        : `Mọi đơn • ${bv.coinCost} Coins`,
      description:
        bv.description ||
        `Áp dụng giảm trực tiếp ${bv.discountValue.toLocaleString('vi-VN')}đ tại quầy ${partnerLabel} trong campus.`,
      totalLimit: bv.quantity + 40,
      claimedCount: 40,
      usedPercentage: Math.min(100, Math.round((40 / (bv.quantity + 40)) * 100)),
      usedText: `Còn ${bv.quantity} lượt đổi trong kho`,
      metaRightText: `HSD: ${bv.validDays || 30} ngày`,
      discount: bv.discountValue,
      expiry: `${bv.validDays || 30} ngày sau khi đổi`,
      actionType: 'redeem',
      coinCost: bv.coinCost,
      campuses: ['all'],
    };
  });

  // Danh sách Voucher hiển thị từ Backend Database
  const allDisplayVouchers: VoucherItem[] = mappedBackendVouchers;

  // Tab counts calculation
  const counts = {
    all: allDisplayVouchers.length,
    ship: allDisplayVouchers.filter((v) => v.category === 'ship').length,
    it: allDisplayVouchers.filter((v) => v.category === 'it').length,
    dorm: allDisplayVouchers.filter((v) => v.category === 'dorm').length,
    coins: allDisplayVouchers.filter((v) => v.category === 'coins').length,
  };

  // Filtered vouchers for Store
  const filteredVouchers = allDisplayVouchers.filter((voucher) => {
    if (activeTab !== 'all' && voucher.category !== activeTab) {
      return false;
    }
    if (selectedCampus !== 'all') {
      const matchCampus =
        voucher.campuses.includes('all') || voucher.campuses.includes(selectedCampus);
      if (!matchCampus) return false;
    }
    return true;
  });

  // Filtered My Vouchers
  const filteredMyVouchers = myVouchers.filter((uv) => {
    if (myVouchersFilter === 'ALL') return true;
    return uv.status === myVouchersFilter;
  });

  const unusedCount = myVouchers.filter((uv) => uv.status === 'UNUSED').length;

  // Action handlers
  const handleCheckIn = async () => {
    if (!isLoggedIn) {
      showToast('🔒 Vui lòng đăng nhập để điểm danh nhận Campus Coins!', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await profileService.checkInDaily();
      if (res.success) {
        useUserStore.getState().updateProfile({ coins: res.newBalance, dailyCheckedIn: true });
        const serverQuests = await profileService.getQuests();
        setQuests((current) => current.map((quest) => {
          const updated = serverQuests.find((item) => item.id === quest.id);
          return updated ? {
            ...quest,
            isCompleted: updated.isCompleted,
            actionType: updated.isClaimed ? 'claimed' : updated.canClaim ? 'claim' : 'link',
            statusText: updated.isClaimed ? '✓ Đã nhận thưởng' : updated.canClaim ? '✓ Đã đủ điều kiện nhận thưởng' : 'Chưa hoàn thành điều kiện nhiệm vụ',
            actionLabel: updated.isClaimed ? 'Đã nhận ✓' : updated.canClaim ? `Nhận ${updated.coins} Coins` : 'Xem điều kiện',
          } : quest;
        }));
        showToast(`🎉 Điểm danh thành công! Bạn nhận được +${res.coinsAdded} Campus Coins.`, 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Bạn đã điểm danh hôm nay rồi! Hãy quay lại vào ngày mai nhé.';
      showToast(msg, 'info');
      useUserStore.getState().updateProfile({ dailyCheckedIn: true });
    }
  };

  const handleApplyCode = async (code: string) => {
    if (!isLoggedIn) {
      showToast('🔒 Vui lòng đăng nhập để áp dụng mã ưu đãi!', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    const upperCode = code.toUpperCase().trim();
    const res = await useVoucherStore.getState().useVoucherCode(upperCode);

    if (res.success) {
      showToast(res.message || `🎟️ Áp dụng thành công mã "${upperCode}"!`, 'success');
      return;
    }

    const found = allDisplayVouchers.find((v) => v.code === upperCode);
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
      showToast(res.message || `Mã voucher "${upperCode}" không tồn tại hoặc đã hết hạn trên 5Campus!`, 'error');
    }
  };

  const handleSaveVoucher = (voucher: VoucherItem) => {
    if (!isLoggedIn) {
      showToast('🔒 Vui lòng đăng nhập để lưu voucher vào ví!', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    saveVoucher(voucher.id, {
      id: voucher.id,
      title: voucher.title,
      code: voucher.code,
      discount: voucher.discount,
      expiry: voucher.expiry,
    });
    showToast(`🎟️ Đã lưu "${voucher.title}" vào ví! Bạn có thể sử dụng khi thanh toán.`, 'success');
  };

  // Đổi voucher thật bằng Campus Coins (API Backend + Atomic Transaction)
  const handleRedeemVoucher = async (voucher: VoucherItem) => {
    if (!isLoggedIn) {
      showToast('🔒 Vui lòng đăng nhập để đổi voucher từ Campus Coins!', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    if (!voucher.coinCost) return;
    if (user.coins < voucher.coinCost) {
      showToast(`Số dư không đủ! Bạn cần ${voucher.coinCost} Coins, hiện có ${user.coins} Coins.`, 'warning');
      return;
    }

    try {
      const res = await useVoucherStore.getState().redeemVoucher(voucher.id);
      if (res.success && res.voucher) {
        showToast(`🎉 ${res.message || 'Đổi voucher thành công!'}`, 'success');
        // Mở ngay modal chi tiết mã QR của voucher vừa nhận
        setSelectedUserVoucher(res.voucher);
        // Tải lại dữ liệu ví và kho voucher
        await fetchMyVouchers();
        await fetchAvailableVouchers();
        profileService.getProfile().catch(() => {});
      } else {
        showToast(res.message || 'Không thể đổi voucher vào lúc này', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Có lỗi xảy ra khi đổi voucher', 'error');
    }
  };

  const [isRestoringVoucher, setIsRestoringVoucher] = useState(false);

  // Khôi phục voucher về ví khi lỡ bấm nhầm
  const handleRestoreVoucher = async (userVoucher: UserVoucher) => {
    setIsRestoringVoucher(true);
    try {
      const res = await useVoucherStore.getState().restoreVoucherCode(userVoucher.voucherCode);
      if (res.success) {
        showToast(`✅ ${res.message || 'Đã hoàn lại voucher về ví thành công!'}`, 'success');
        setSelectedUserVoucher((prev) =>
          prev && prev.id === userVoucher.id ? { ...prev, status: 'UNUSED', usedAt: undefined } : prev
        );
        await fetchMyVouchers();
      } else {
        showToast(res.message || 'Không thể hoàn lại mã này', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi khi hoàn lại voucher', 'error');
    } finally {
      setIsRestoringVoucher(false);
    }
  };

  // Sử dụng voucher tại quầy (Xác nhận đổi thưởng)
  const handleConfirmUseVoucher = async (userVoucher: UserVoucher) => {
    const isShip =
      userVoucher.voucher.partner === 'CAMPUS_SHIP' ||
      userVoucher.voucher.title.toLowerCase().includes('ship') ||
      userVoucher.voucher.title.toLowerCase().includes('vận chuyển');

    if (isShip) {
      showToast('⚠️ Voucher vận chuyển tự động áp dụng tại bước Checkout đơn hàng, không cần xác nhận tại quầy!', 'warning');
      return;
    }

    const confirmed = typeof window !== 'undefined'
      ? window.confirm(`Xác nhận bạn đã dùng ưu đãi "${userVoucher.voucher.title}" tại quầy đối tác?\n\nSau khi xác nhận, voucher sẽ được đóng lại.`)
      : true;
    if (!confirmed) return;
    setIsUsingVoucher(true);
    try {
      const res = await useVoucherStore.getState().useVoucherCode(userVoucher.voucherCode);
      if (res.success) {
        showToast(`✅ ${res.message || 'Xác nhận sử dụng voucher thành công!'}`, 'success');
        setSelectedUserVoucher((prev) =>
          prev ? { ...prev, status: 'USED', usedAt: new Date().toLocaleTimeString('vi-VN') } : null
        );
        await fetchMyVouchers();
      } else {
        showToast(res.message || 'Không thể sử dụng mã này', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi khi kích hoạt voucher', 'error');
    } finally {
      setIsUsingVoucher(false);
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClaimQuest = async (questId: string, _coinsAmount: number) => {
    if (!isLoggedIn) {
      showToast('🔒 Vui lòng đăng nhập để nhận thưởng nhiệm vụ!', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await profileService.claimQuest(questId);
      const added = res.coinsAdded;
      const serverQuests = await profileService.getQuests();
      setQuests((current) => current.map((quest) => {
        const updated = serverQuests.find((item) => item.id === quest.id);
        return updated ? { ...quest, isCompleted: updated.isCompleted, actionType: updated.isClaimed ? 'claimed' : updated.canClaim ? 'claim' : 'link', statusText: updated.isClaimed ? '✓ Đã nhận thưởng' : updated.canClaim ? '✓ Đã đủ điều kiện nhận thưởng' : 'Chưa hoàn thành điều kiện nhiệm vụ' } : quest;
      }));
      showToast(`🎉 Chúc mừng! Bạn nhận được +${added} Campus Coins từ nhiệm vụ.`, 'success');
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Nhiệm vụ này đã được nhận phần thưởng tuần này rồi!';
      showToast(errMsg, 'info');
    }
  };

  const handleReportSuccess = () => {
    showToast('🚩 Đã gửi báo cáo sai phạm tới Ban CTSV FPT Edu! Chúng tôi sẽ xác minh trong 24h.', 'success');
  };

  const liveQuests = quests;

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 sm:py-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Hero Banner & Coins Wallet */}
        <VoucherHeroBanner
          coins={user.coins}
          dailyCheckedIn={user.dailyCheckedIn}
          onCheckIn={handleCheckIn}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />

        {/* 2. Primary Navigation Switcher: Kho Đổi Voucher vs Ví Voucher Của Tôi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageView('store')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                pageView === 'store'
                  ? 'bg-fpt-orange text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Kho Đổi Voucher ({allDisplayVouchers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  showToast('🔒 Vui lòng đăng nhập để xem Ví voucher cá nhân của bạn!', 'warning');
                  setIsAuthModalOpen(true);
                  return;
                }
                setPageView('my_vouchers');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                pageView === 'my_vouchers'
                  ? 'bg-fpt-orange text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>Ví Voucher Của Tôi</span>
              {unusedCount > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    pageView === 'my_vouchers'
                      ? 'bg-white text-orange-600'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {unusedCount}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium px-2">
            {pageView === 'store' ? (
              <span>Đổi Coins lấy ưu đãi Căn tin, Passio Coffee, 7-Eleven & Freeship</span>
            ) : (
              <span>Mỗi mã voucher là độc quyền của bạn, dùng 1 lần tại quầy</span>
            )}
          </div>
        </div>

        {/* VIEW 1: KHO ĐỔI VOUCHER */}
        {pageView === 'store' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Search Bar */}
            <VoucherSearchBar onApplyCode={handleApplyCode} />

            {/* Category Tabs & Campus Selector */}
            <VoucherFilterBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              selectedCampus={selectedCampus}
              onCampusChange={setSelectedCampus}
              counts={counts}
            />

            {/* Section: Ưu Đãi Đang Khả Dụng */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Ưu Đãi Đang Khả Dụng Trong Kho
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Đồng bộ Live Admin
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Bảo trợ bởi Quỹ Trợ Giá Sinh Viên FPT Edu</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 -mt-2">
                Chọn &quot;Đổi ngay&quot; để quy đổi từ số dư Campus Coins. Mã sẽ được lưu trực tiếp vào Ví Voucher của bạn.
              </p>

              {/* Vouchers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVouchers.map((voucher) => {
                  const isSaved = (user.savedVoucherIds || []).includes(voucher.id);

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
                    Không tìm thấy voucher phù hợp cho danh mục đã chọn.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('all');
                      setSelectedCampus('all');
                    }}
                    className="mt-3 text-xs font-bold text-fpt-orange hover:underline cursor-pointer"
                  >
                    Xem lại tất cả mã ưu đãi
                  </button>
                </div>
              )}
            </div>

            {/* Weekly Coin Quests */}
            <div id="quests" className="scroll-mt-6">
              <VoucherQuests
                quests={liveQuests}
                claimedQuestIds={[]}
                onClaimQuest={handleClaimQuest}
              />
            </div>

            {/* Policy & Guarantee Banner */}
            <VoucherPolicyBanner
              onOpenPolicy={() => setIsPolicyOpen(true)}
              onReportViolation={() => setIsReportOpen(true)}
            />
          </div>
        )}

        {/* VIEW 2: VÍ VOUCHER CỦA TÔI (CÁ NHÂN HÓA 100%) */}
        {pageView === 'my_vouchers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(
                  [
                    { id: 'ALL', label: 'Tất cả mã của tôi', count: myVouchers.length },
                    { id: 'UNUSED', label: '🟢 Chưa sử dụng', count: unusedCount },
                    {
                      id: 'USED',
                      label: '✅ Đã sử dụng',
                      count: myVouchers.filter((v) => v.status === 'USED').length,
                    },
                    {
                      id: 'EXPIRED',
                      label: '⏳ Hết hạn',
                      count: myVouchers.filter((v) => v.status === 'EXPIRED').length,
                    },
                  ] as const
                ).map((tab) => {
                  const isActive = myVouchersFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMyVouchersFilter(tab.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                        isActive
                          ? 'bg-fpt-orange text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Mỗi mã thuộc quyền sở hữu riêng của bạn, không dùng chung</span>
              </div>
            </div>

            {/* Empty state */}
            {filteredMyVouchers.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 space-y-3">
                <Ticket className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">
                  {myVouchersFilter === 'UNUSED'
                    ? 'Bạn không có mã voucher nào chưa sử dụng'
                    : 'Bạn chưa có mã voucher nào trong mục này'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hãy dùng số dư Campus Coins để đổi suất cơm Căn tin 10k, Passio Coffee 15k hoặc mã freeship CampusShip tại kho đổi nhé!
                </p>
                <button
                  type="button"
                  onClick={() => setPageView('store')}
                  className="rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Store className="h-4 w-4" />
                  <span>Đến Kho Đổi Voucher Ngay</span>
                </button>
              </div>
            )}

            {/* List of User Vouchers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMyVouchers.map((uv) => {
                const isUnused = uv.status === 'UNUSED';
                const isUsed = uv.status === 'USED';

                const partnerName =
                  uv.voucher?.partner === 'CANTEEN'
                    ? 'Căn Tin FPT'
                    : uv.voucher?.partner === 'PASSIO'
                    ? 'Passio Coffee'
                    : uv.voucher?.partner === 'SEVEN_ELEVEN'
                    ? '7-Eleven FPT'
                    : 'CampusShip';

                return (
                  <div
                    key={uv.id}
                    className={`relative rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                      isUnused
                        ? 'border-orange-200 ring-1 ring-orange-200/50'
                        : isUsed
                        ? 'border-slate-200 opacity-85'
                        : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {partnerName}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isUnused
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isUsed
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isUnused ? '🟢 Sẵn sàng dùng' : isUsed ? '✅ Đã sử dụng' : '⏳ Đã hết hạn'}
                        </span>
                      </div>

                      {/* Title & value */}
                      <div className="my-3 space-y-1">
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {uv.voucher?.title || 'Voucher Sinh Viên 5Campus'}
                        </h4>
                        <div className="text-xs font-extrabold text-fpt-orange">
                          Giảm {(uv.voucher?.discountValue || 10000).toLocaleString('vi-VN')} VNĐ
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 pt-1">
                          {uv.voucher?.description || 'Áp dụng giảm trực tiếp khi thanh toán tại cơ sở.'}
                        </p>
                        <div className="pt-1">
                          {uv.voucher?.minOrderValue && uv.voucher.minOrderValue > 0 ? (
                            <span className="inline-block rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-extrabold text-purple-700">
                              Đơn tối thiểu: {uv.voucher.minOrderValue.toLocaleString('vi-VN')} đ
                            </span>
                          ) : (
                            <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                              Áp dụng mọi giá trị đơn
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Voucher Code Box */}
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-between font-mono text-xs font-bold text-slate-800">
                        <span className="tracking-wider">{uv.voucherCode}</span>
                        <button
                          type="button"
                          onClick={() => copyVoucherCode(uv.voucherCode)}
                          className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                          title="Sao chép mã"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Hạn dùng:</span>
                        <span className="font-semibold text-slate-700">{uv.expiredAt}</span>
                      </div>

                      {isUsed && uv.usedAt && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Thời gian dùng:</span>
                          <span className="font-semibold text-slate-700">{uv.usedAt}</span>
                        </div>
                      )}

                      {isUsed ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUserVoucher(uv)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <QrCode className="h-4 w-4" />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRestoreVoucher(uv)}
                            disabled={isRestoringVoucher}
                            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition flex items-center justify-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                            title="Khôi phục lại mã vào ví nếu bạn lỡ bấm dùng nhầm"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Hoàn lại ví</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedUserVoucher(uv)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-fpt-orange hover:bg-fpt-orange-hover text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {uv.voucher?.partner === 'CAMPUS_SHIP' ||
                          uv.voucher?.title?.toLowerCase().includes('ship') ||
                          uv.voucher?.title?.toLowerCase().includes('vận chuyển') ? (
                            <>
                              <Truck className="h-4 w-4" />
                              <span>Xem Hướng Dẫn Áp Mã Ship</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4" />
                              <span>Mở Mã QR & Quét Tại Quầy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: MÃ QR TẠI QUẦY CỦA VOUCHER CÁ NHÂN */}
      {selectedUserVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Mã Ưu Đãi Sinh Viên
                  </h3>
                  <span className="text-[10px] text-slate-500">Độc quyền riêng bạn • Dùng 1 lần</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserVoucher(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Voucher title & partner */}
            <div className="text-center space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                {selectedUserVoucher.voucher?.partner || 'ĐỐI TÁC 5CAMPUS'}
              </span>
              <h4 className="text-base font-extrabold text-slate-900">
                {selectedUserVoucher.voucher?.title}
              </h4>
              <div className="text-sm font-black text-fpt-orange">
                Giảm {(selectedUserVoucher.voucher?.discountValue || 10000).toLocaleString('vi-VN')} VNĐ
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  selectedUserVoucher.voucherCode
                )}`}
                alt="QR Code Voucher"
                className="w-48 h-48 rounded-xl object-contain bg-white p-2 shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 font-medium text-center">
                Đưa mã QR cho nhân viên thu ngân Căn tin / Passio / 7-Eleven để quét
              </p>
            </div>

            {/* Code string with copy */}
            <div className="flex items-center justify-between rounded-xl bg-orange-50/70 border border-orange-200 px-3 py-2">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-orange-600">
                  MÃ VOUCHER
                </div>
                <div className="font-mono text-sm font-black text-slate-900 tracking-wider">
                  {selectedUserVoucher.voucherCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyVoucherCode(selectedUserVoucher.voucherCode)}
                className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-bold text-fpt-orange border border-orange-200 hover:bg-orange-50 cursor-pointer shadow-2xs"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Expiry & Meta */}
            <div className="text-[11px] text-slate-500 flex justify-between px-1">
              <span>Hạn sử dụng:</span>
              <span className="font-bold text-slate-700">{selectedUserVoucher.expiredAt}</span>
            </div>

            {/* Confirmation button or Ship guide */}
            {selectedUserVoucher.status === 'UNUSED' ? (
              selectedUserVoucher.voucher?.partner === 'CAMPUS_SHIP' ||
              selectedUserVoucher.voucher?.title?.toLowerCase().includes('ship') ||
              selectedUserVoucher.voucher?.title?.toLowerCase().includes('vận chuyển') ? (
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-3.5 text-left">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-orange-950 mb-1">
                    <Truck className="h-4 w-4 text-fpt-orange shrink-0" />
                    <span>Ưu Đãi Vận Chuyển CampusShip Online</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 mb-2.5">
                    Mã này được <b>tự động áp dụng</b> giảm cước phí vận chuyển khi bạn thanh toán tại trang <b>Checkout</b> đơn hàng liên Campus. Bạn không cần và không nên bấm xác nhận tại quầy.
                  </p>
                  <Link
                    href="/posts"
                    onClick={() => setSelectedUserVoucher(null)}
                    className="w-full rounded-lg bg-fpt-orange hover:bg-orange-600 text-white py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Khám phá đồ & Dùng mã khi Checkout</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUsingVoucher}
                  onClick={() => handleConfirmUseVoucher(selectedUserVoucher)}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isUsingVoucher ? 'Đang xác nhận...' : 'Tôi đã dùng tại quầy (Xác nhận)'}</span>
                </button>
              )
            ) : (
              <div className="space-y-2">
                <div className="rounded-xl bg-slate-100 p-2.5 text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Voucher này đã được đánh dấu đã dùng</span>
                </div>
                <button
                  type="button"
                  disabled={isRestoringVoucher}
                  onClick={() => handleRestoreVoucher(selectedUserVoucher)}
                  className="w-full rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{isRestoringVoucher ? 'Đang khôi phục...' : 'Tôi bấm nhầm - Hoàn lại voucher vào ví'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionType="voucher"
        redirectUrl="/vouchers"
      />
    </div>
  );
}
