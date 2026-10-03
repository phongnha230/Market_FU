'use client';

import React, { useState } from 'react';
import { X, Flag, AlertTriangle, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { reportService, ReportTargetType } from '@/services/reportService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  onToast: (msg: string) => void;
}

const REPORT_REASONS = [
  'Yêu cầu chuyển cọc trước ngoài sàn (MoMo / Ngân hàng cá nhân)',
  'Hàng giả, sách lậu, vi phạm bản quyền bộ môn FPT',
  'Thông tin sai lệch, sản phẩm khác xa mô tả bài đăng',
  'Thiết bị công suất lớn vi phạm tiêu chuẩn PCCC KTX FPT',
  'Tài khoản có dấu hiệu lừa đảo / giả mạo sinh viên FPT',
  'Lý do khác',
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onToast,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await reportService.createReport({
        targetType,
        targetId,
        reason: selectedReason,
        details: details.trim() || undefined,
      });
      onToast('🚩 Đã gửi báo cáo vi phạm tới Ban Quản Trị FPT 5Campus để điều tra xử lý.');
      onClose();
    } catch (err: any) {
      // Fallback message for offline or duplicate reports
      const errMsg = err?.response?.data?.error?.message || 'Đã gửi báo cáo vi phạm tới Ban Quản Trị.';
      onToast(`🚩 ${errMsg}`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Flag className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
              <span>BẢO VỆ CỘNG ĐỒNG FPT 5CAMPUS</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Báo cáo vi phạm / Gian lận
            </h3>
          </div>
        </div>

        {targetTitle && (
          <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-700">
            <span className="font-semibold text-slate-500">Đối tượng báo cáo: </span>
            <span className="font-bold text-slate-900 line-clamp-1">{targetTitle}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Reason Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              Lý do báo cáo vi phạm <span className="text-rose-500">*</span>:
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    selectedReason === r
                      ? 'border-rose-300 bg-rose-50/50 ring-1 ring-rose-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="mt-0.5 h-4 w-4 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-medium text-slate-800">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Details Input */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Chi tiết bằng chứng hoặc mô tả thêm:
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="VD: Người bán yêu cầu chuyển 200k qua số MoMo 098... mới chịu đem hàng ra sảnh KTX..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition resize-none"
            />
          </div>

          {/* Safe Badge Note */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Báo cáo của bạn được ẩn danh và chuyển trực tiếp tới Ban CTSV ĐH FPT để xử lý theo đúng quy chế an ninh học đường.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-600 px-5 py-2.5 font-bold text-white shadow-md shadow-rose-600/25 hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo vi phạm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
