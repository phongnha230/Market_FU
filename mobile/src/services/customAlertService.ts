import { Alert } from 'react-native';
import { useAlertStore, AlertButton, AlertOptions } from '../stores/alertStore';

/**
 * Cài đặt Global Custom Alert thay thế cho Alert.alert native của Android/iOS
 * Giúp mọi màn hình và component gọi Alert.alert(...) đều hiển thị giao diện Modal đẹp mắt
 */
export const installCustomAlert = () => {
  // @ts-ignore
  if (Alert.__isCustomAlertInstalled) {
    return;
  }

  const originalAlert = Alert.alert.bind(Alert);

  Alert.alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => {
    try {
      useAlertStore.getState().showAlert(title, message, buttons, options);
    } catch {
      // Fallback về alert gốc nếu có sự cố
      originalAlert(title, message, buttons as any, options as any);
    }
  };

  // @ts-ignore
  Alert.__isCustomAlertInstalled = true;
};

export const showCustomAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) => {
  useAlertStore.getState().showAlert(title, message, buttons, options);
};
