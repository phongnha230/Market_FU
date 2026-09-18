'use client';

import React from 'react';
import { ShieldAlert, Flag, FileText } from 'lucide-react';

interface VoucherPolicyBannerProps {
  onOpenPolicy: () => void;
  onReportViolation: () => void;
}

export default function VoucherPolicyBanner({
  onOpenPolicy,
  onReportViolation,
}: VoucherPolicyBannerProps) {
  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 sm:p-6 text-slate-800 shadow-2xs">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Icon & Text */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 border border-amber-200">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              Chính sách bảo trợ sinh viên & Quy định sử dụng Voucher
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
              Trợ giá sinh viên được quản lý và kiểm duyệt trực tiếp bởi Đoàn Thanh niên & Ban Công tác Sinh viên (CTSV) Đại học FPT. Mọi hành vi gian lận câu đồ, tạo mã không hoặc gom voucher bán lại sẽ bị khóa vĩnh viễn quyền truy cập 5Campus SSO theo Quy chế Kỷ luật Học đường.
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <button
            type="button"
            onClick={onOpenPolicy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span>Xem Quy chế</span>
          </button>

          <button
            type="button"
            onClick={onReportViolation}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer shadow-2xs active:scale-95"
          >
            <Flag className="h-3.5 w-3.5 fill-white" />
            <span>Báo cáo sai phạm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
