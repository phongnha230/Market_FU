'use client';

import React from 'react';

interface DisputeResolutionProps {
  resolutionPlan: 'return' | 'partial';
  onPlanChange: (plan: 'return' | 'partial') => void;
  selectedReason: string;
  onReasonChange: (reasonId: string) => void;
}

export default function DisputeResolution({
  resolutionPlan,
  onPlanChange,
  selectedReason,
  onReasonChange,
}: DisputeResolutionProps) {
  const reasons = [
    { id: 'defect', label: '✓ Lỗi kỹ thuật / Không lên nguồn / Sọc màn hình' },
    { id: 'wrong-spec', label: 'Sai lệch thông số với bài đăng' },
    { id: 'missing', label: 'Thiếu phụ kiện cáp Type-C & Nguồn' },
    { id: 'damaged', label: 'Nứt vỡ do khâu vận chuyển CampusShip' },
  ];

  return (
    <>
      {/* SECTION 1: RESOLUTION PLAN */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            1. Chọn phương án xử lý mong muốn
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Khoản tiền trong ví Escrow sẽ được điều chuyển theo đúng giải pháp được hai bên thống nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Option 1 */}
          <label
            onClick={() => onPlanChange('return')}
            className={`rounded-2xl border p-4 cursor-pointer transition flex flex-col justify-between ${
              resolutionPlan === 'return'
                ? 'border-fpt-orange bg-orange-50/50 ring-2 ring-orange-200'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="radio"
                name="resolutionPlan"
                checked={resolutionPlan === 'return'}
                onChange={() => onPlanChange('return')}
                className="mt-1 text-fpt-orange focus:ring-fpt-orange"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    Trả hàng & Hoàn tiền 100%
                  </span>
                  <span className="rounded bg-orange-200 text-orange-900 text-[10px] font-extrabold px-1.5 py-0.2">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Gửi lại màn hình qua bưu cục Safe-Handoff Point. Nhận lại toàn bộ <strong>1.225.000đ</strong> sau khi quét mã bưu kiện.
                </p>
              </div>
            </div>
          </label>

          {/* Option 2 */}
          <label
            onClick={() => onPlanChange('partial')}
            className={`rounded-2xl border p-4 cursor-pointer transition flex flex-col justify-between ${
              resolutionPlan === 'partial'
                ? 'border-fpt-orange bg-orange-50/50 ring-2 ring-orange-200'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="radio"
                name="resolutionPlan"
                checked={resolutionPlan === 'partial'}
                onChange={() => onPlanChange('partial')}
                className="mt-1 text-fpt-orange focus:ring-fpt-orange"
              />
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Yêu cầu bồi hoàn một phần
                </span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Giữ lại màn hình để tự sửa chữa tại sảnh Alpha. Đề xuất hoàn lại <strong>300.000đ</strong> phí linh kiện từ Escrow.
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* SECTION 2: DISPUTE REASONS */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            2. Lý do khiếu nại chính
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lựa chọn phản ánh chính xác tình trạng thực tế để tải và ban CTSV thẩm định nhanh.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {reasons.map((r) => {
            const isSelected = selectedReason === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onReasonChange(r.id)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
