import { useUserStore } from '../stores/userStore';
import { useCampusStore } from '../stores/useCampusStore';

/**
 * Hook tiện ích truy xuất thông tin xác thực & vai trò người dùng hiện tại
 */
export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, loginAsRole, register, logout, updateUserProfile } =
    useUserStore();
  const { currentCampus, setCampus } = useCampusStore();

  const isSeller = user?.role === 'SELLER';
  const isBuyer = user?.role === 'BUYER';
  const isKycVerified = !!(user?.isKycVerified || isSeller);
  const kycStatus = user?.kycStatus || 'NONE';

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isSeller,
    isBuyer,
    isKycVerified,
    kycStatus,
    currentCampus: user?.campus || currentCampus,
    setCampus,
    login,
    loginAsRole,
    register,
    logout,
    updateUserProfile,
  };
}

export default useAuth;
