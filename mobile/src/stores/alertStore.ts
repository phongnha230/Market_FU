import { create } from 'zustand';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
  type?: AlertType;
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
  type: AlertType;
  showAlert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => void;
  hideAlert: () => void;
}

const detectAlertType = (
  title?: string,
  message?: string,
  buttons?: AlertButton[]
): AlertType => {
  const combined = `${title || ''} ${message || ''}`.toLowerCase();
  if (
    combined.includes('🎉') ||
    combined.includes('thành công') ||
    combined.includes('hoàn tất') ||
    combined.includes('chúc mừng')
  ) {
    return 'success';
  }
  if (
    combined.includes('lỗi') ||
    combined.includes('thất bại') ||
    combined.includes('sai') ||
    combined.includes('không thể')
  ) {
    return 'error';
  }
  if (
    combined.includes('không đủ') ||
    combined.includes('thiếu') ||
    combined.includes('chưa') ||
    combined.includes('cảnh báo') ||
    combined.includes('hết hạn')
  ) {
    return 'warning';
  }
  if (buttons && buttons.length > 1) {
    return 'confirm';
  }
  return 'info';
};

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: undefined,
  buttons: [],
  options: undefined,
  type: 'info',

  showAlert: (title, message, buttons, options) => {
    const inferredType = options?.type || detectAlertType(title, message, buttons);
    set({
      visible: true,
      title: title || 'Thông báo',
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'Đã hiểu', style: 'default' }],
      options,
      type: inferredType,
    });
  },

  hideAlert: () => {
    set({ visible: false });
  },
}));

export default useAlertStore;
