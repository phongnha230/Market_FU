'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ToastType } from '@/hooks/useToast';

interface ToastNotificationProps {
  message: string | null;
  type?: ToastType;
  onClose?: () => void;
}

export default function ToastNotification({
  message,
  type = 'info',
  onClose,
}: ToastNotificationProps) {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200 cursor-pointer hover:bg-slate-900 transition"
    >
      {getIcon()}
      <span>{message}</span>
    </div>
  );
}
