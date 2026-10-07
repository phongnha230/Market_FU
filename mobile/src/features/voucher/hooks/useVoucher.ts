import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { INITIAL_QUESTS } from '../constants/voucher.constants';
import {
  VoucherPageView,
  VoucherCategoryKey,
  MyVoucherFilterKey,
  CoinQuestItem,
  Voucher,
  UserVoucher,
} from '../types/voucher.types';
import { useVoucherStore } from '../../../stores/voucherStore';
import { useWalletStore } from '../../../stores/walletStore';
import { useUserStore } from '../../../stores/userStore';
import { profileMobileService } from '../../../services/profileMobileService';

export const useVoucher = () => {
  const { isAuthenticated, user, updateUser } = useUserStore();
  const { getWallet, addCoins } = useWalletStore();
  const wallet = getWallet();
  const coins = user?.coins !== undefined ? user.coins : wallet.coins;

  // Stores
  const availableVouchers = useVoucherStore((state) => state.availableVouchers);
  const myVouchers = useVoucherStore((state) => state.myVouchers);
  const fetchAvailableVouchers = useVoucherStore((state) => state.fetchAvailableVouchers);
  const fetchMyVouchers = useVoucherStore((state) => state.fetchMyVouchers);
  const redeemVoucherStore = useVoucherStore((state) => state.redeemVoucher);
  const useVoucherCodeStore = useVoucherStore((state) => state.useVoucherCode);

  // UI States
  const [pageView, setPageView] = useState<VoucherPageView>('store');
  const [activeCategory, setActiveCategory] = useState<VoucherCategoryKey>('all');
  const [myVoucherFilter, setMyVoucherFilter] = useState<MyVoucherFilterKey>('ALL');
  const [selectedUserVoucher, setSelectedUserVoucher] = useState<UserVoucher | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Check-in & Quests state
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [quests, setQuests] = useState<CoinQuestItem[]>(INITIAL_QUESTS);

  // 1. Tải dữ liệu ban đầu
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchAvailableVouchers(),
        isAuthenticated ? fetchMyVouchers() : Promise.resolve(),
      ]);

      if (isAuthenticated) {
        // Tải trạng thái điểm danh
        try {
          const status = await profileMobileService.getCheckInStatus();
          setCheckedInToday(!!status.checkedInToday);
          setStreak(status.streak || 0);
        } catch {
          // ignore
        }

        // Đồng bộ số dư xu từ profile backend
        try {
          const p = await profileMobileService.getMyProfile();
          if (p && p.coins !== undefined) {
            updateUser({ coins: p.coins });
          }
        } catch {
          // ignore
        }
      }
    } catch (e: any) {
      console.log('⚠️ [Voucher loadData error]:', e?.message);
    }
  }, [isAuthenticated, fetchAvailableVouchers, fetchMyVouchers, updateUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // 2. Lọc danh sách Voucher trong Kho
  const filteredAvailableVouchers = useMemo(() => {
    return availableVouchers.filter((v) => {
      if (activeCategory === 'coins') {
        return v.partner === 'CANTEEN' || v.partner === 'PASSIO';
      }
      if (activeCategory === 'dorm') {
        return v.partner === 'SEVEN_ELEVEN';
      }
      if (activeCategory === 'ship') {
        return v.partner === 'OTHER' || v.title.toLowerCase().includes('vận chuyển');
      }
      return true;
    });
  }, [availableVouchers, activeCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: availableVouchers.length,
      coins: availableVouchers.filter((v) => v.partner === 'CANTEEN' || v.partner === 'PASSIO').length,
      dorm: availableVouchers.filter((v) => v.partner === 'SEVEN_ELEVEN').length,
      ship: availableVouchers.filter((v) => v.partner === 'OTHER' || v.title.toLowerCase().includes('vận chuyển')).length,
    };
  }, [availableVouchers]);

  // 3. Lọc danh sách Voucher trong Ví
  const filteredMyVouchers = useMemo(() => {
    return myVouchers.filter((uv) => {
      if (myVoucherFilter === 'ALL') return true;
      return uv.status === myVoucherFilter;
    });
  }, [myVouchers, myVoucherFilter]);

  const unusedCount = useMemo(() => {
    return myVouchers.filter((uv) => uv.status === 'UNUSED').length;
  }, [myVouchers]);

  // 4. Điểm danh nhận Xu (+20 Coins)
  const handleCheckIn = useCallback(async () => {
    if (!isAuthenticated) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để điểm danh nhận Campus Coins!');
      return;
    }
    if (checkedInToday) {
      Alert.alert('Thông báo', 'Bạn đã nhận xu điểm danh hôm nay rồi! Hãy quay lại vào ngày mai.');
      return;
    }

    setIsCheckingIn(true);
    try {
      const res = await profileMobileService.checkInDaily();
      const earned = res?.coinsEarned || 20;
      addCoins(earned);
      updateUser({ coins: coins + earned });
      setCheckedInToday(true);
      setStreak(res?.streak || streak + 1);

      Alert.alert(
        '🎉 Điểm danh thành công!',
        `Bạn nhận được +${earned} Campus Coins. Chuỗi điểm danh: ${res?.streak || streak + 1} ngày liên tiếp.`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Bạn đã điểm danh hôm nay rồi!';
      setCheckedInToday(true);
      Alert.alert('Điểm danh', msg);
    } finally {
      setIsCheckingIn(false);
    }
  }, [isAuthenticated, checkedInToday, coins, streak, addCoins, updateUser]);

  // 5. Đổi Voucher bằng Campus Coins
  const handleRedeemVoucher = useCallback(
    async (voucher: Voucher) => {
      if (!isAuthenticated) {
        Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để đổi mã ưu đãi!');
        return;
      }

      if (coins < voucher.coinCost) {
        Alert.alert(
          'Số dư không đủ',
          `Bạn hiện có ${coins} xu, cần thêm ${voucher.coinCost - coins} xu để đổi voucher "${voucher.title}". Hãy làm thêm nhiệm vụ nhé!`
        );
        return;
      }

      Alert.alert(
        'Xác nhận đổi voucher',
        `Bạn có đồng ý dùng ${voucher.coinCost} Campus Coins để đổi voucher "${voucher.title}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đổi ngay',
            onPress: async () => {
              try {
                const res = await redeemVoucherStore(voucher.id);
                if (res.success && res.voucher) {
                  Alert.alert('🎉 Đổi thành công!', res.message);
                  // Mở ngay modal chi tiết QR code của voucher vừa đổi
                  setSelectedUserVoucher(res.voucher);
                  // Refresh ví
                  fetchMyVouchers().catch(() => {});
                } else {
                  Alert.alert('Thông báo', res.message || 'Không thể đổi voucher vào lúc này.');
                }
              } catch (err: any) {
                Alert.alert('Lỗi', err?.message || 'Có lỗi xảy ra khi đổi voucher.');
              }
            },
          },
        ]
      );
    },
    [isAuthenticated, coins, redeemVoucherStore, fetchMyVouchers]
  );

  // 6. Xác nhận sử dụng Voucher tại quầy
  const handleConfirmUseVoucher = useCallback(
    async (voucher: UserVoucher) => {
      try {
        const res = await useVoucherCodeStore(voucher.voucherCode);
        if (res.success) {
          Alert.alert('✅ Thành công', res.message || 'Voucher đã được xác nhận sử dụng thành công!');
          setSelectedUserVoucher((prev) =>
            prev ? { ...prev, status: 'USED', usedAt: new Date().toLocaleTimeString('vi-VN') } : null
          );
          fetchMyVouchers().catch(() => {});
        } else {
          Alert.alert('Thông báo', res.message || 'Không thể áp dụng mã voucher này.');
        }
      } catch (err: any) {
        Alert.alert('Lỗi', err?.message || 'Lỗi khi kích hoạt voucher.');
      }
    },
    [useVoucherCodeStore, fetchMyVouchers]
  );

  // 7. Áp dụng mã ưu đãi trực tiếp
  const handleApplyCode = useCallback(
    async (code: string) => {
      if (!isAuthenticated) {
        Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để áp dụng mã ưu đãi!');
        return;
      }
      try {
        const res = await useVoucherCodeStore(code);
        if (res.success) {
          Alert.alert('🎉 Áp dụng thành công', res.message || `Đã sử dụng mã ${code}!`);
          fetchMyVouchers().catch(() => {});
        } else {
          Alert.alert('Không thể áp dụng', res.message || `Mã "${code}" không hợp lệ hoặc đã dùng.`);
        }
      } catch (err: any) {
        Alert.alert('Lỗi', err?.message || 'Không thể áp dụng mã.');
      }
    },
    [isAuthenticated, useVoucherCodeStore, fetchMyVouchers]
  );

  // 8. Nhận thưởng nhiệm vụ tuần
  const handleClaimQuest = useCallback(
    async (quest: CoinQuestItem) => {
      if (!isAuthenticated) {
        Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để nhận thưởng nhiệm vụ!');
        return;
      }

      if (quest.id === 'quest-checkin') {
        handleCheckIn();
        return;
      }

      try {
        const res = await profileMobileService.claimQuest(quest.id, quest.coins);
        const earned = res?.coinsEarned || quest.coins;
        addCoins(earned);
        updateUser({ coins: coins + earned });

        setQuests((prev) =>
          prev.map((q) =>
            q.id === quest.id
              ? { ...q, isCompleted: true, actionType: 'claimed', statusText: '✓ Đã nhận thưởng' }
              : q
          )
        );

        Alert.alert('🎉 Nhận thưởng thành công!', `Bạn nhận được +${earned} Campus Coins từ nhiệm vụ.`);
      } catch (err: any) {
        // Fallback optimistic
        addCoins(quest.coins);
        updateUser({ coins: coins + quest.coins });

        setQuests((prev) =>
          prev.map((q) =>
            q.id === quest.id
              ? { ...q, isCompleted: true, actionType: 'claimed', statusText: '✓ Đã nhận thưởng' }
              : q
          )
        );

        Alert.alert('🎉 Nhận thưởng thành công!', `Bạn nhận được +${quest.coins} Campus Coins từ nhiệm vụ.`);
      }
    },
    [isAuthenticated, coins, handleCheckIn, addCoins, updateUser]
  );

  return {
    isAuthenticated,
    pageView,
    setPageView,
    activeCategory,
    setActiveCategory,
    categoryCounts,
    myVoucherFilter,
    setMyVoucherFilter,
    availableVouchers: filteredAvailableVouchers,
    totalAvailableCount: availableVouchers.length,
    myVouchers: filteredMyVouchers,
    totalMyVouchersCount: myVouchers.length,
    unusedCount,
    selectedUserVoucher,
    setSelectedUserVoucher,
    coins,
    checkedInToday,
    streak,
    isCheckingIn,
    quests,
    refreshing,
    onRefresh,
    handleCheckIn,
    handleRedeemVoucher,
    handleConfirmUseVoucher,
    handleApplyCode,
    handleClaimQuest,
  };
};

export default useVoucher;
