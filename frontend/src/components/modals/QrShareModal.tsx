'use client';

import React from 'react';
import { useUserStore } from '@/stores/userStore';
import { X, QrCode, Copy } from 'lucide-react';

interface QrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export default function QrShareModal({
  isOpen,
  onClose,
  onToast,
}: QrShareModalProps) {
  const user = useUserStore((s) => s.user);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + '/profile');
      onToast('🔗 Đã sao chép liên kết hồ sơ vào bộ nhớ tạm!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-fpt-orange" />
            <span>Mã QR Hồ Sơ Sinh Viên</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR Code graphic */}
        <div className="mx-auto w-48 h-48 rounded-2xl border-2 border-slate-200 p-3 bg-white shadow-inner flex flex-col items-center justify-center">
          <div className="relative w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white p-4">
            <QrCode className="w-full h-full text-white" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-800">
            {user.name || 'Sinh viên FPT'}{user.cohort ? ` • ${user.cohort}` : ''}{user.major ? ` ${user.major}` : ''}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Quét mã để kết nối nhanh trên Campus {user.campus || 'FPT'}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-fpt-orange px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
          >
            <Copy className="h-4 w-4" />
            <span>Sao chép liên kết hồ sơ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
