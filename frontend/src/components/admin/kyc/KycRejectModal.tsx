'use client';

import React, { useState, useEffect } from 'react';
import { KycApplication } from '@/stores/kycStore';
import { XCircle, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KycRejectModalProps {
  isOpen: boolean;
  app: KycApplication | null;
  onClose: () => void;
  onConfirm: (reason: string, note: string) => void;
}

const COMMON_REASONS = [
  'Ảnh chụp thẻ bị mờ hoặc lóa sáng, không đọc rõ mã số SV',
  'Mã số sinh viên (MSSV) trên thẻ không khớp với thông tin đăng ký',
  'Thẻ sinh viên đã hết hạn hoặc không thuộc hệ đào tạo FPT University',
  'Cần bổ sung rõ nét cả 2 mặt trước và mặt sau của thẻ sinh viên',
];

export default function KycRejectModal({
  isOpen,
  app,
  onClose,
  onConfirm,
}: KycRejectModalProps) {
  const [rejectReason, setRejectReason] = useState(COMMON_REASONS[0]);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRejectReason(COMMON_REASONS[0]);
      setRejectNote('Vui lòng chụp lại ảnh thẻ góc thẳng, đủ ánh sáng và thấy rõ mã số sinh viên để BQT kiểm tra.');
    }
  }, [isOpen]);

  if (!isOpen || !app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Từ chối thẩm định & Báo cáo lý do</h3>
              <p className="text-xs text-slate-500">
                Sinh viên: <strong>{app.fullName}</strong> ({app.email})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">
            Chọn lý do phổ biến (Gửi qua email & thông báo in-app):
          </label>
          <div className="space-y-1.5">
            {COMMON_REASONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRejectReason(item)}
                className={cn(
                  'w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between',
                  rejectReason === item
                    ? 'border-rose-500 bg-rose-50/60 font-bold text-rose-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                )}
              >
                <span>{item}</span>
                {rejectReason === item && <Check className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Ghi chú bổ sung từ Admin (hướng dẫn sinh viên cần bổ sung gì):
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Ví dụ: Vui lòng chụp lại ảnh thẻ không bị bóng lóa đèn trần, để rõ góc và số thẻ..."
              className="w-full h-20 rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Hệ thống sẽ tự động gửi email báo cáo chi tiết đến <strong>{app.email}</strong> và gửi thông báo Notification trên ứng dụng để sinh viên biết và bổ sung lại hồ sơ.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(rejectReason, rejectNote)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-xs font-black text-white hover:bg-rose-700 transition cursor-pointer shadow-sm active:scale-95"
          >
            Xác nhận từ chối & Gửi thông báo
          </button>
        </div>
      </div>
    </div>
  );
}
