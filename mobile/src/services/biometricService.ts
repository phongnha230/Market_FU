import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BIOMETRICS_STORAGE_KEY = '@fu_biometrics_enabled';

export interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
  types: LocalAuthentication.AuthenticationType[];
  label: string;
}

export const biometricService = {
  /**
   * Kiểm tra khả năng hỗ trợ sinh trắc học của thiết bị
   */
  async getStatus(): Promise<BiometricStatus> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      const types = hasHardware ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];

      let label = 'Vân tay / FaceID';
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        label = 'FaceID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        label = 'Vân tay';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        label = 'Mống mắt';
      }

      return {
        hasHardware,
        isEnrolled,
        types,
        label,
      };
    } catch (error) {
      console.warn('⚠️ [biometricService] getStatus error:', error);
      return {
        hasHardware: false,
        isEnrolled: false,
        types: [],
        label: 'Sinh trắc học',
      };
    }
  },

  /**
   * Đọc cài đặt lưu trữ từ AsyncStorage
   */
  async isEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BIOMETRICS_STORAGE_KEY);
      return value === 'true';
    } catch (error) {
      console.warn('⚠️ [biometricService] isEnabled read error:', error);
      return false;
    }
  },

  /**
   * Lưu trạng thái Bật/Tắt vào AsyncStorage
   */
  async setEnabled(enabled: boolean): Promise<boolean> {
    try {
      if (enabled) {
        await AsyncStorage.setItem(BIOMETRICS_STORAGE_KEY, 'true');
      } else {
        await AsyncStorage.removeItem(BIOMETRICS_STORAGE_KEY);
      }
      return true;
    } catch (error) {
      console.warn('⚠️ [biometricService] setEnabled write error:', error);
      return false;
    }
  },

  /**
   * Gọi xác thực sinh trắc học native (Fingerprint / FaceID)
   */
  async authenticate(
    promptMessage = 'Xác thực để mở khóa FU SecondHand',
    fallbackLabel = 'Nhập mật khẩu máy'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { success: false, error: 'NO_HARDWARE' };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { success: false, error: 'NOT_ENROLLED' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel,
        cancelLabel: 'Hủy',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        error: result.error || 'AUTHENTICATION_FAILED',
      };
    } catch (error: any) {
      console.warn('⚠️ [biometricService] authenticate error:', error);
      return { success: false, error: error?.message || 'UNKNOWN_ERROR' };
    }
  },

  /**
   * Hủy phiên xác thực (Android)
   */
  async cancel(): Promise<void> {
    try {
      await LocalAuthentication.cancelAuthenticate();
    } catch {
      // Ignored
    }
  },
};
