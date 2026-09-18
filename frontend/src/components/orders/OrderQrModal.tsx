'use client';

import React from 'react';
import { QrCode, X } from 'lucide-react';

interface OrderQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderQrModal({
  isOpen,
  onClose,
}: OrderQrModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
          <QrCode className="h-6 w-6" />
        </div>
        <h3 className="font-extrabold text-base text-slate-900">Mã QR Safe-Handoff Point</h3>
        <p className="text-xs text-slate-500 mt-1">
          Đưa mã này cho nhân viên quầy bàn giao tại Sảnh Tòa Alpha lúc 16:30 để xác thực giao nhận.
        </p>
        <div className="my-4 mx-auto w-40 h-40 bg-slate-100 rounded-xl p-3 border border-slate-200 flex items-center justify-center">
          <div className="text-xs font-mono font-bold text-slate-700 text-center">
            [SAFE-POINT-ALPHA]
            <br />
            HE172819-RAM-DDR4
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
