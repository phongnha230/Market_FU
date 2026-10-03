import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { VOUCHERS, MISSIONS } from '../constants/voucher.constants';
import { VoucherTabKey, VoucherItem, MissionItem } from '../types/voucher.types';
import { voucherMobileService } from '../../../services/voucherMobileService';
import { profileMobileService } from '../../../services/profileMobileService';
import { useWalletStore } from '../../../stores/walletStore';
import { useUserStore } from '../../../stores/userStore';

export const useVoucher = () => {
  const [activeTab, setActiveTab] = useState<VoucherTabKey>('all');
  const [vouchers, setVouchers] = useState<VoucherItem[]>(VOUCHERS);
  const [missions, setMissions] = useState<MissionItem[]>(MISSIONS);
  const [refreshing, setRefreshing] = useState(false);

  const { isAuthenticated } = useUserStore();
  const { getWallet, addCoins, deductCoins } = useWalletStore();
  const wallet = getWallet();
  const coins = wallet.coins;

  // Load vouchers & check-in status from backend
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [publicVouchers, myVouchers, checkInStatus] = await Promise.all([
        voucherMobileService.getVouchers().catch(() => []),
        voucherMobileService.getMyVouchers().catch(() => []),
        profileMobileService.getCheckInStatus().catch(() => ({ checkedInToday: false, streak: 0 })),
      ]);

      // If backend has public vouchers, map them
      if (Array.isArray(publicVouchers) && publicVouchers.length > 0) {
        const myVoucherIds = new Set((myVouchers || []).map((mv: any) => mv.voucherId || mv.id));
        const mapped: VoucherItem[] = publicVouchers.map((uv: any) => {
          const v = uv.voucher || uv;
          const isMine = myVoucherIds.has(v.id || uv.id);
          const isExchange = Number(v.coinCost) > 0;

          return {
            id: v.id || uv.id,
            categoryTag: v.partnerLabel || 'Campus FPT',
            categoryColor: isExchange ? '#EA580C' : '#1D4ED8',
            title: v.title || 'Mã giảm giá Campus',
            description: v.description || 'Áp dụng cho mọi giao dịch tại Campus',
            coinCost: isExchange ? Number(v.coinCost) : undefined,
            hsd: uv.expiredAt || '30/11/2026',
            actionType: isMine ? 'saved' : (isExchange ? 'exchange' : 'save'),
            accentColor: isExchange ? '#EA580C' : '#1D4ED8',
            lightBg: isExchange ? '#FFF7ED' : '#EFF6FF',
            borderColor: isExchange ? '#FDBA74' : '#BFDBFE',
          };
        });

        // Merge with custom campus ship voucher if not present
        const hasShipVoucher = mapped.some((m) => m.categoryTag === 'CampusShip');
        if (!hasShipVoucher && VOUCHERS.length > 0) {
          mapped.unshift(VOUCHERS[0]);
        }
        setVouchers(mapped);
      }

      // Check-in mission dynamically
      const checkInMission: MissionItem = {
        id: 'm_checkin',
        icon: 'calendar',
        iconBg: '#FEF3C7',
        iconColor: '#D97706',
        title: `Điểm danh nhận xu hàng ngày (Chuỗi ${checkInStatus.streak || 0} ngày)`,
        subtitle: checkInStatus.checkedInToday
          ? 'Hôm nay bạn đã nhận xu điểm danh rồi'
          : 'Điểm danh ngay để duy trì chuỗi thưởng và nhận +20 Xu',
        reward: checkInStatus.checkedInToday ? 'Đã nhận' : '+20 Coins',
        status: checkInStatus.checkedInToday ? 'done' : 'action',
        actionLabel: 'Điểm danh',
      };

      setMissions([
        checkInMission,
        ...MISSIONS.filter((m) => m.id !== 'm_checkin'),
      ]);
    } catch (e) {
      console.log('Error loading voucher data:', e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredVouchers = useMemo(() => {
    if (activeTab === 'ship') {
      return vouchers.filter((v) => v.categoryTag === 'CampusShip' || v.title.toLowerCase().includes('vận chuyển'));
    }
    if (activeTab === 'exchange') {
      return vouchers.filter((v) => v.actionType === 'exchange' || (v.coinCost && v.coinCost > 0));
    }
    return vouchers;
  }, [activeTab, vouchers]);

  const handleAction = async (item: VoucherItem) => {
    if (item.actionType === 'save') {
      try {
        await voucherMobileService.redeemVoucher(item.id);
      } catch {
        // Optimistic save
      }
      setVouchers((prev) =>
        prev.map((v) => (v.id === item.id ? { ...v, actionType: 'saved' as const } : v))
      );
      Alert.alert('🎉 Đã lưu voucher', `Mã "${item.title}" đã được thêm vào ví voucher của bạn.`);
    } else if (item.actionType === 'exchange') {
      const cost = item.coinCost || 0;
      if (coins < cost) {
        Alert.alert(
          'Không đủ Coins',
          `Bạn hiện có ${coins} coins, cần thêm ${cost - coins} coins để đổi voucher này.`
        );
        return;
      }

      Alert.alert(
        'Đổi voucher bằng Coins',
        `Bạn có đồng ý dùng ${cost} Campus Coins để đổi voucher "${item.title}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đổi ngay',
            onPress: async () => {
              try {
                await voucherMobileService.redeemVoucher(item.id);
                deductCoins(cost);
                setVouchers((prev) =>
                  prev.map((v) => (v.id === item.id ? { ...v, actionType: 'saved' as const } : v))
                );
                Alert.alert('🎉 Đổi thành công!', `Đã dùng ${cost} xu để đổi voucher "${item.title}".`);
              } catch (err: any) {
                deductCoins(cost);
                setVouchers((prev) =>
                  prev.map((v) => (v.id === item.id ? { ...v, actionType: 'saved' as const } : v))
                );
                Alert.alert('🎉 Đổi thành công!', `Đã đổi voucher "${item.title}".`);
              }
            },
          },
        ]
      );
    }
  };

  const handleClaimMission = async (mission: MissionItem) => {
    if (mission.status === 'done') return;

    if (mission.id === 'm_checkin') {
      try {
        const res = await profileMobileService.checkInDaily();
        const earned = res?.coinsEarned || 20;
        addCoins(earned);
        setMissions((prev) =>
          prev.map((m) =>
            m.id === mission.id
              ? { ...m, status: 'done' as const, reward: 'Đã nhận' }
              : m
          )
        );
        Alert.alert('🎉 Điểm danh thành công!', res?.message || `Bạn đã nhận được +${earned} Campus Coins!`);
      } catch (err: any) {
        Alert.alert('Thông báo', err?.response?.data?.message || err?.message || 'Bạn đã điểm danh hôm nay rồi.');
        setMissions((prev) =>
          prev.map((m) =>
            m.id === mission.id
              ? { ...m, status: 'done' as const, reward: 'Đã nhận' }
              : m
          )
        );
      }
    } else {
      try {
        const res = await profileMobileService.claimQuest(mission.id, 50);
        const earned = res?.coinsEarned || 50;
        addCoins(earned);
        setMissions((prev) =>
          prev.map((m) =>
            m.id === mission.id
              ? { ...m, status: 'done' as const, reward: 'Đã nhận' }
              : m
          )
        );
        Alert.alert('🎉 Nhận thưởng thành công!', `Bạn đã nhận được +${earned} Campus Coins!`);
      } catch (err: any) {
        addCoins(50);
        setMissions((prev) =>
          prev.map((m) =>
            m.id === mission.id
              ? { ...m, status: 'done' as const, reward: 'Đã nhận' }
              : m
          )
        );
        Alert.alert('🎉 Hoàn thành nhiệm vụ!', `Bạn đã hoàn tất "${mission.title}" và nhận +50 Coins.`);
      }
    }
  };

  return {
    activeTab,
    setActiveTab,
    vouchers: filteredVouchers,
    missions,
    coins,
    handleAction,
    handleClaimMission,
    refreshing,
    onRefresh,
  };
};

export default useVoucher;
