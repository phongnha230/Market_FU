import { useState, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastState {
  message: string | null;
  type: ToastType;
}

export function useToast(defaultDuration = 3500) {
  const [toast, setToast] = useState<ToastState>({
    message: null,
    type: 'info',
  });

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      setToast({ message, type });
      setTimeout(() => {
        setToast((prev) => (prev.message === message ? { message: null, type: 'info' } : prev));
      }, defaultDuration);
    },
    [defaultDuration]
  );

  const hideToast = useCallback(() => {
    setToast({ message: null, type: 'info' });
  }, []);

  return {
    toastMessage: toast.message,
    toastType: toast.type,
    showToast,
    hideToast,
  };
}
