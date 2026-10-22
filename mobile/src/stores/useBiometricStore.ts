import { create } from 'zustand';
import { biometricService, BiometricStatus } from '../services/biometricService';
import { useAuthStore } from './userStore';

interface BiometricState {
  isBiometricsEnabled: boolean;
  isLocked: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricLabel: string;
  isAuthenticating: boolean;
  isReady: boolean;

  // Actions
  initialize: () => Promise<void>;
  toggleBiometrics: (enable: boolean) => Promise<{ success: boolean; message: string }>;
  unlockApp: () => Promise<boolean>;
  lockApp: () => void;
  setAuthenticating: (val: boolean) => void;
}

export const useBiometricStore = create<BiometricState>((set, get) => ({
  isBiometricsEnabled: false,
  isLocked: false,
  hasHardware: false,
  isEnrolled: false,
  biometricLabel: 'Vân tay / FaceID',
  isAuthenticating: false,
  isReady: false,

  initialize: async () => {
    try {
      const status: BiometricStatus = await biometricService.getStatus();
      const isEnabled = await biometricService.isEnabled();
      const currentUser = useAuthStore.getState().user;

      // Nếu người dùng đã đăng nhập VÀ đã bật khóa sinh trắc học -> Khóa app ngay khi khởi động
      const shouldLock = isEnabled && !!currentUser;

      set({
        hasHardware: status.hasHardware,
        isEnrolled: status.isEnrolled,
        biometricLabel: status.label,
        isBiometricsEnabled: isEnabled,
        isLocked: shouldLock,
        isReady: true,
      });

      // Nếu bị khóa, tự động kích hoạt popup quét sinh trắc học ngay
      if (shouldLock) {
        setTimeout(() => {
          get().unlockApp();
        }, 350);
      }
    } catch (error) {
      console.warn('⚠️ [useBiometricStore] initialize error:', error);
      set({ isReady: true });
    }
  },

  toggleBiometrics: async (enable: boolean) => {
    const { hasHardware, isEnrolled, biometricLabel } = get();

    if (enable) {
      if (!hasHardware) {
        return {
          success: false,
          message: 'Thiết bị của bạn không hỗ trợ cảm biến vân tay hoặc FaceID.',
        };
      }

      if (!isEnrolled) {
        return {
          success: false,
          message:
            'Chưa có dữ liệu sinh trắc học trên máy. Vui lòng cài đặt Vân tay / FaceID trong phần Cài đặt của điện thoại trước.',
        };
      }

      set({ isAuthenticating: true });
      const authResult = await biometricService.authenticate(
        `Xác thực ${biometricLabel} để kích hoạt khóa bảo vệ ứng dụng`
      );
      set({ isAuthenticating: false });

      if (!authResult.success) {
        return {
          success: false,
          message: 'Xác thực không thành công. Chưa thể kích hoạt bảo mật.',
        };
      }

      await biometricService.setEnabled(true);
      set({ isBiometricsEnabled: true });
      return {
        success: true,
        message: `Đã kích hoạt bảo mật bằng ${biometricLabel}!`,
      };
    } else {
      // Khi tắt khóa sinh trắc học, yêu cầu xác thực để tránh người khác tự ý tắt
      set({ isAuthenticating: true });
      const authResult = await biometricService.authenticate(
        `Xác thực ${biometricLabel} để tắt khóa bảo vệ ứng dụng`
      );
      set({ isAuthenticating: false });

      if (!authResult.success) {
        return {
          success: false,
          message: 'Xác thực không thành công. Không thể tắt bảo mật.',
        };
      }

      await biometricService.setEnabled(false);
      set({ isBiometricsEnabled: false, isLocked: false });
      return {
        success: true,
        message: 'Đã tắt khóa sinh trắc học cho ứng dụng.',
      };
    }
  },

  unlockApp: async () => {
    const { isAuthenticating, biometricLabel } = get();
    if (isAuthenticating) return false;

    set({ isAuthenticating: true });
    try {
      const result = await biometricService.authenticate(
        `Mở khóa FU SecondHand bằng ${biometricLabel}`
      );
      set({ isAuthenticating: false });

      if (result.success) {
        set({ isLocked: false });
        return true;
      }
      return false;
    } catch (e) {
      set({ isAuthenticating: false });
      return false;
    }
  },

  lockApp: () => {
    const { isBiometricsEnabled } = get();
    const currentUser = useAuthStore.getState().user;
    if (isBiometricsEnabled && !!currentUser) {
      set({ isLocked: true });
    }
  },

  setAuthenticating: (val: boolean) => set({ isAuthenticating: val }),
}));
