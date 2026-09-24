import { Alert } from 'react-native';
import { SETTING_ITEMS, ORDER_STATS } from '../constants/profile.constants';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useCampusStore } from '../../../stores/useCampusStore';

export const useProfile = () => {
  const { user, logout } = useAuthStore();
  const { currentCampus } = useCampusStore();

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
    handleLogout,
  };
};

export default useProfile;
