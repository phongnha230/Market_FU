import { create } from 'zustand';

interface AuthAlertState {
  isOpen: boolean;
  message: string;
  triggerSessionExpired: (customMessage?: string) => void;
  close: () => void;
}

let lastTriggerTime = 0;

export const useAuthAlertStore = create<AuthAlertState>((set) => ({
  isOpen: false,
  message:
    'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng đầy đủ các tính năng an toàn.',
  triggerSessionExpired: (customMessage?: string) => {
    const now = Date.now();
    // Chống trigger lặp lại nhiều lần nếu nhiều request / socket cùng lỗi một lúc (debounce 3 giây)
    if (now - lastTriggerTime < 3000) return;
    lastTriggerTime = now;

    set({
      isOpen: true,
      message:
        customMessage ||
        'Phiên đăng nhập của bạn đã hết hạn hoặc không còn hợp lệ. Vui lòng đăng nhập lại để tiếp tục sử dụng đầy đủ các tính năng.',
    });
  },
  close: () => set({ isOpen: false }),
}));
