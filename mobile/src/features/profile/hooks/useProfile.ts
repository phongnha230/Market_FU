import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { SETTING_ITEMS } from '../constants/profile.constants';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useKycStore } from '../../../stores/kycStore';
import { useOrderStore } from '../../../stores/orderStore';
import { profileMobileService } from '../../../services/profileMobileService';
import { socketMobileService } from '../../../services/socketMobileService';

import { useNavigation } from '@react-navigation/native';

export const useProfile = () => {
  const navigation = useNavigation<any>();
  const { user, logout, updateUserProfile } = useAuthStore();
  const { currentCampus } = useCampusStore();
  const { orders, fetchOrders } = useOrderStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Đồng bộ hồ sơ mới nhất từ Backend (bao gồm kết quả phê duyệt từ Admin)
   */
  const syncProfileFromBackend = useCallback(async () => {
    try {
      const latestProfile = await profileMobileService.getMyProfile();
      if (latestProfile) {
        await updateUserProfile(latestProfile);
        console.log('🔄 [Mobile Profile]: Đã đồng bộ trạng thái mới nhất từ Backend:', latestProfile.kycStatus, latestProfile.role);
      }
    } catch (err: any) {
      // Offline fallback: giữ nguyên trạng thái local store hiện có
      console.log('ℹ️ [Mobile Profile]: Không thể tải profile từ backend (chế độ offline):', err?.message);
    }
  }, [updateUserProfile]);

  /**
   * Kéo xuống để làm mới (Pull-to-refresh)
   */
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      syncProfileFromBackend(),
      fetchOrders().catch(() => {}),
    ]);
    setIsRefreshing(false);
  }, [syncProfileFromBackend, fetchOrders]);

  /**
   * Lắng nghe Realtime Socket khi Admin phê duyệt hoặc từ chối KYC
   */
  useEffect(() => {
    // 1. Tự động đồng bộ 1 lần khi màn hình khởi tạo
    syncProfileFromBackend();
    fetchOrders().catch(() => {});

    // 2. Đăng ký listener sự kiện Socket từ Admin Backend
    const unsubscribe = socketMobileService.onKycStatusUpdated(async (data) => {
      console.log('📢 [Mobile Event]: Nhận thông báo phán quyết KYC từ Admin:', data);

      if (data.status === 'APPROVED') {
        const isSellerKyc = data.type === 'SELLER';
        await updateUserProfile({
          isKycVerified: true,
          kycStatus: 'APPROVED',
          role: isSellerKyc ? 'SELLER' : 'BUYER',
          avatarBadge: isSellerKyc ? 'TOP_SELLER' : undefined,
          coins: (user?.coins || 0) + (data.bonusCoins || 200),
        });

        // Cập nhật KycStore
        const kycStore = useKycStore.getState();
        kycStore.simulateApproveKyc().catch(() => {});

        Alert.alert(
          '🎉 Hồ sơ đã được Admin phê duyệt!',
          `Chúc mừng bạn! Admin đã duyệt hồ sơ ${isSellerKyc ? 'Người Bán (Seller)' : 'Sinh viên FPT'}. Bạn được nhận ngay +${data.bonusCoins || 200} Xu vào ví!`
        );
      } else if (data.status === 'REJECTED') {
        await updateUserProfile({
          isKycVerified: false,
          kycStatus: 'REJECTED',
        });

        Alert.alert(
          '⚠️ Hồ sơ KYC bị từ chối',
          `Lý do từ Admin: ${data.reason || 'Ảnh thẻ không rõ nét hoặc thông tin không khớp với hệ thống FAP'}. Vui lòng gửi lại ảnh rõ hơn.`
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [syncProfileFromBackend, fetchOrders, updateUserProfile, user?.coins]);

  const isSeller = user?.role === 'SELLER';
  const userId = user?.id || '';

  /**
   * Tính toán số lượng đơn hàng theo dữ liệu thực tế của user (không dùng mock data ảo)
   */
  const dynamicOrderStats = useMemo(() => {
    if (!userId) {
      return [
        { id: 'o1', label: isSeller ? 'Chờ duyệt' : 'Chờ xác nhận', count: 0, icon: 'time-outline' },
        { id: 'o2', label: 'Chờ Handoff', count: 0, icon: 'hand-left-outline' },
        { id: 'o3', label: 'Đang giao', count: 0, icon: 'bicycle-outline' },
        { id: 'o4', label: 'Đã hoàn tất', count: 0, icon: 'checkmark-done-outline' },
      ];
    }

    // Nếu là Seller: tính đơn bán của mình hoặc đơn mua. Nếu là Buyer: chỉ tính đơn mua của mình.
    const myOrders = orders.filter((o) =>
      isSeller ? (o.sellerId === userId || o.buyerId === userId) : (o.buyerId === userId)
    );

    const pendingCount = myOrders.filter(
      (o) => o.status === 'PENDING_SAFEPOINT' || (o.status as any) === 'PENDING'
    ).length;

    const escrowCount = myOrders.filter(
      (o) => o.status === 'ESCROW_PAID' || (o.status as any) === 'PAID'
    ).length;

    const shippingCount = myOrders.filter(
      (o) => o.status === 'HANDOVER_CONFIRMED' || (o.status as any) === 'SHIPPING' || (o.status as any) === 'DELIVERED'
    ).length;

    const completedCount = myOrders.filter(
      (o) => o.status === 'COMPLETED'
    ).length;

    return [
      { id: 'o1', label: isSeller ? 'Chờ duyệt' : 'Chờ xác nhận', count: pendingCount, icon: 'time-outline' },
      { id: 'o2', label: 'Chờ Handoff', count: escrowCount, icon: 'hand-left-outline' },
      { id: 'o3', label: 'Đang giao', count: shippingCount, icon: 'bicycle-outline' },
      { id: 'o4', label: 'Đã hoàn tất', count: completedCount, icon: 'checkmark-done-outline' },
    ];
  }, [orders, userId, isSeller]);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          logout();
          if (navigation?.navigate) {
            navigation.navigate('Login');
          }
        },
      },
    ]);
  };

  return {
    user,
    currentCampus,
    settingItems: SETTING_ITEMS,
    orderStats: dynamicOrderStats,
    isRefreshing,
    onRefresh,
    syncProfileFromBackend,
    handleLogout,
  };
};

export default useProfile;
