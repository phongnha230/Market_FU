'use client';

import React from 'react';
import { OrderItem } from '@/stores/orderStore';
import { X } from 'lucide-react';

interface OrderTrackingModalProps {
  order: OrderItem | null;
  onClose: () => void;
}

export default function OrderTrackingModal({
  order,
  onClose,
}: OrderTrackingModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Chi tiết hành trình vận chuyển
            </h3>
            <p className="text-xs text-slate-500">{order.code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
            <div>
              <div className="font-bold text-slate-800">Kho Q.9 Rời bến (TP.HCM)</div>
              <div className="text-[11px] text-slate-400">
                09:15 - Hôm qua • Đóng thùng xốp chống sốc
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-3 w-3 rounded-full bg-fpt-orange animate-ping mt-1 shrink-0"></div>
            <div>
              <div className="font-bold text-fpt-orange">
                Hub FPT Đà Nẵng (Đang trung chuyển)
              </div>
              <div className="text-[11px] text-slate-600">
                Đã thông quan trạm trung chuyển Miền Trung qua xe buýt liên campus FPT Line #01
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-3 w-3 rounded-full bg-slate-300 mt-1 shrink-0"></div>
            <div>
              <div className="font-medium text-slate-500">
                Trung chuyển Nội Bài (Hà Nội)
              </div>
              <div className="text-[11px] text-slate-400">
                Dự kiến 06:00 Sáng mai
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-3 w-3 rounded-full bg-slate-300 mt-1 shrink-0"></div>
            <div>
              <div className="font-medium text-slate-500">
                Trạm nhận KTX Dom B (Hola Campus)
              </div>
              <div className="text-[11px] text-slate-400">
                Dự kiến 14:00 Ngày mai • Giao tại sảnh
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
