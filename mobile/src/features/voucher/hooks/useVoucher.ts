import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import { withRefreshTimeout } from '../../../utils/safeRefresh';

export const useVoucher = () => {
  let navigation: any;
  try {
    navigation = useNavigation();
  } catch {}

  const { isAuthenticated, user, updateUser } = useUserStore();
  const { getWallet, addCoins } = useWalletStore();
  const wallet = getWallet();
  const coins = user?.coins !== undefined ? user.coins : wallet.coins;

  const promptAuth = useCallback(
    (message: string) => {
      Alert.alert(
        'Yêu cầu đăng nhập',
        message,
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Đăng nhập ngay',
            onPress: () => {
              if (navigation && navigation.navigate) {
                navigation.navigate('Login');
              }
            },
          },
        ]
      );
    },
    [navigation]
  );

  // Stores
  const availableVouchers = useVoucherStore((state) => state.availableVouchers);
  const myVouchers = useVoucherStore((state) => state.myVouchers);
  const fetchAvailableVouchers = useVoucherStore((state) => state.fetchAvailableVouchers);
  const fetchMyVouchers = useVoucherStore((state) => state.fetchMyVouchers);
  const redeemVoucherStore = useVoucherStore((state) => state.redeemVoucher);
  const applyVoucherCodeStore = useVoucherStore((state) => state.applyVoucherCode);

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

        try {
          const serverQuests = await profileMobileService.getQuests();
          setQuests(serverQuests.map((quest) => {
            const template = INITIAL_QUESTS.find((item) => item.id === quest.id) || INITIAL_QUESTS[0];
            return {
              ...template,
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
        } catch {
          // Keep the built-in quest presentation while offline.
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
    if (refreshing) return;
    await withRefreshTimeout(loadData, setRefreshing, 2000);
  }, [refreshing, loadData]);

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
        return v.partner === 'CAMPUS_SHIP' || v.partner === 'OTHER' || v.title.toLowerCase().includes('vận chuyển') || v.title.toLowerCase().includes('ship');
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
      ship: availableVouchers.filter((v) => v.partner === 'CAMPUS_SHIP' || v.partner === 'OTHER' || v.title.toLowerCase().includes('vận chuyển') || v.title.toLowerCase().includes('ship')).length,
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
      setQuests((previous) => previous.map((quest) => quest.id === 'quest-checkin'
        ? { ...quest, isCompleted: true, actionType: 'claimed', statusText: '✓ Đã nhận thưởng', actionLabel: 'Đã nhận ✓' }
        : quest));
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
  }, [isAuthenticated, checkedInToday, coins, streak, addCoins, updateUser, promptAuth]);

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
        const res = await applyVoucherCodeStore(voucher.voucherCode);
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
    [applyVoucherCodeStore, fetchMyVouchers]
  );

  // 7. Áp dụng mã ưu đãi trực tiếp
  const handleApplyCode = useCallback(
    async (code: string) => {
      if (!isAuthenticated) {
        Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để áp dụng mã ưu đãi!');
        return;
      }
      try {
        const res = await applyVoucherCodeStore(code);
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
    [isAuthenticated, applyVoucherCodeStore, fetchMyVouchers]
  );

  // 8. Nhận thưởng nhiệm vụ tuần
  const handleClaimQuest = useCallback(
    async (quest: CoinQuestItem) => {
      if (!isAuthenticated) {
        Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để nhận thưởng nhiệm vụ!');
        return;
      }

      try {
        const res = await profileMobileService.claimQuest(quest.id);
        const earned = res.coinsAdded;
        addCoins(earned);
        updateUser({ coins: res.newBalance });
        if (quest.id === 'quest-checkin') setCheckedInToday(true);
        const refreshedQuests = await profileMobileService.getQuests();
        setQuests((prev) => prev.map((item) => {
          const updated = refreshedQuests.find((candidate) => candidate.id === item.id);
          return updated ? {
            ...item,
            isCompleted: updated.isCompleted,
            actionType: updated.isClaimed ? 'claimed' : updated.canClaim ? 'claim' : 'link',
            statusText: updated.isClaimed ? '✓ Đã nhận thưởng' : updated.canClaim ? '✓ Đã đủ điều kiện nhận thưởng' : 'Chưa hoàn thành điều kiện nhiệm vụ',
            actionLabel: updated.isClaimed ? 'Đã nhận ✓' : updated.canClaim ? `Nhận ${updated.coins} Coins` : 'Xem điều kiện',
          } : item;
        }));

        Alert.alert('🎉 Nhận thưởng thành công!', `Bạn nhận được +${earned} Campus Coins từ nhiệm vụ.`);
      } catch (err: any) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          'Nhiệm vụ này đã được nhận phần thưởng trong tuần!';
        Alert.alert('Nhiệm vụ tuần', msg);
      }
    },
    [isAuthenticated, addCoins, updateUser]
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
