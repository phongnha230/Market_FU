import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { SETTING_ITEMS, ORDER_STATS } from '../constants/profile.constants';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useKycStore } from '../../../stores/kycStore';
import { profileMobileService } from '../../../services/profileMobileService';
import { socketMobileService } from '../../../services/socketMobileService';

export const useProfile = () => {
  const { user, logout, updateUserProfile } = useAuthStore();
  const { currentCampus } = useCampusStore();
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
    await syncProfileFromBackend();
    setIsRefreshing(false);
  }, [syncProfileFromBackend]);

  /**
   * Lắng nghe Realtime Socket khi Admin phê duyệt hoặc từ chối KYC
   */
  useEffect(() => {
    // 1. Tự động đồng bộ 1 lần khi màn hình khởi tạo
    syncProfileFromBackend();

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
  }, [syncProfileFromBackend, updateUserProfile, user?.coins]);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  return {
    user,
    currentCampus,
    settingItems: SETTING_ITEMS,
    orderStats: ORDER_STATS,
    isRefreshing,
    onRefresh,
    syncProfileFromBackend,
    handleLogout,
  };
};

export default useProfile;
