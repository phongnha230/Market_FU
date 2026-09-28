'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthAlertStore } from '@/stores/authAlertStore';
import { ShieldAlert, LogIn, X, Clock, AlertTriangle } from 'lucide-react';

export default function SessionExpiredModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, message, close } = useAuthAlertStore();

  if (!isOpen) return null;

  const handleGoLogin = () => {
    close();
    const currentRedirect = pathname || '/';
    router.push(`/login?redirect=${encodeURIComponent(currentRedirect)}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          aria-label="Đóng cảnh báo"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs">
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
            </span>
            <ShieldAlert className="h-7 w-7 text-fpt-orange" />
          </div>

          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1 rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
              <Clock className="h-3 w-3" />
              <span>Bảo mật phiên đăng nhập</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">
              Phiên đăng nhập đã hết hạn
            </h3>
          </div>
        </div>

        {/* Message Banner */}
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 text-xs text-slate-700 leading-relaxed space-y-2">
          <p className="font-medium text-slate-800">
            {message}
          </p>
          <p className="text-[11px] text-slate-500">
            Để bảo vệ an toàn cho tài khoản và dữ liệu trao đổi của bạn tại FPT 5Campus, phiên làm việc sẽ tự động hết hạn sau một khoảng thời gian nhất định.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleGoLogin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-fpt-orange to-amber-600 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:brightness-105 transition active:scale-98 cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>Đăng nhập lại ngay</span>
          </button>

          <button
            type="button"
            onClick={close}
            className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 py-2 transition cursor-pointer"
          >
            Để sau (Tiếp tục duyệt ở chế độ khách vãn lai)
          </button>
        </div>
      </div>
    </div>
  );
}
