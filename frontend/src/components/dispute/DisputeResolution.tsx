'use client';

import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { CheckCircle2, RotateCcw, Coins } from 'lucide-react';

interface DisputeResolutionProps {
  resolutionPlan: 'return' | 'partial';
  onPlanChange: (plan: 'return' | 'partial') => void;
  selectedReason: string;
  onReasonChange: (reasonId: string) => void;
  productTitle?: string;
  refundAmount?: number;
  shippingFee?: number;
  isInterCampus?: boolean;
  partialRefundAmount?: number;
  onPartialRefundAmountChange?: (amount: number) => void;
}

export default function DisputeResolution({
  resolutionPlan,
  onPlanChange,
  selectedReason,
  onReasonChange,
  productTitle = 'món hàng',
  refundAmount = 0,
  shippingFee = 0,
  isInterCampus = false,
  partialRefundAmount,
  onPartialRefundAmountChange,
}: DisputeResolutionProps) {
  const reasons = isInterCampus
    ? [
        { id: 'defect', label: 'Thiết bị lỗi chức năng / Không hoạt động khi cắm test' },
        { id: 'damaged_shipping', label: 'Hàng bị cấn móp / Bể vỡ do khâu vận chuyển GHN' },
        { id: 'wrong-item', label: 'Giao sai sản phẩm / Khác xa hình ảnh và mô tả' },
        { id: 'missing', label: 'Thiếu phụ kiện / Thiếu quà tặng kèm cam kết' },
        { id: 'other', label: 'Lý do khác' },
      ]
    : [
        { id: 'defect', label: 'Thiết bị lỗi chức năng / Không hoạt động khi cắm test' },
        { id: 'wrong-item', label: 'Sản phẩm khác thỏa thuận khi gặp mặt' },
        { id: 'missing', label: 'Thiếu phụ kiện / Thiếu linh kiện kèm theo' },
        { id: 'fake', label: 'Nghi vấn thông số không đúng cam kết' },
        { id: 'other', label: 'Lý do khác' },
      ];

  const totalRefund100 = refundAmount + (isInterCampus ? shippingFee : 0);
  const formattedTotal = totalRefund100 > 0 ? `${totalRefund100.toLocaleString('vi-VN')}đ` : '100% số tiền';
  const currentPartial = partialRefundAmount ?? Math.round(refundAmount * 0.3);

  return (
    <>
      {/* SECTION 1: RESOLUTION PLAN */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>1. Phương án giải quyết mong muốn</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn cách bạn muốn xử lý món hàng và khoản tiền đang giữ trong Escrow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Option 1: Return & 100% Refund */}
          <div
            onClick={() => onPlanChange('return')}
            className={`rounded-2xl border p-4 cursor-pointer transition flex flex-col justify-between ${
              resolutionPlan === 'return'
                ? 'border-fpt-orange bg-orange-50/40 ring-2 ring-orange-200'
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
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <RotateCcw className="h-4 w-4 text-fpt-orange" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    Trả hàng & Hoàn tiền 100%
                  </span>
                  <Badge className="rounded bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0 border-none hover:bg-orange-100">
                    Phổ biến
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isInterCampus ? (
                    <>
                      Gửi trả lại {productTitle} qua bưu tá GHN hoặc bưu cục. Nhận lại{' '}
                      <strong className="text-slate-900">{formattedTotal}</strong> (bao gồm phí ship).
                    </>
                  ) : (
                    <>
                      Hẹn gặp trả lại {productTitle} tại trạm Safe-Point trong trường. Nhận lại{' '}
                      <strong className="text-slate-900">{formattedTotal}</strong> khi người bán nhận lại đồ.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Partial Refund & Keep Item */}
          <div
            onClick={() => onPlanChange('partial')}
            className={`rounded-2xl border p-4 cursor-pointer transition flex flex-col justify-between ${
              resolutionPlan === 'partial'
                ? 'border-fpt-orange bg-orange-50/40 ring-2 ring-orange-200'
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
              <div className="space-y-1 w-full">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    Giữ lại đồ & Hoàn tiền một phần
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bạn giữ lại món đồ để tự sửa chữa/tiếp tục dùng, đề xuất người bán bồi hoàn một khoản hỗ trợ.
                </p>
                {resolutionPlan === 'partial' && onPartialRefundAmountChange && (
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Số tiền bạn đề xuất bồi hoàn:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1000}
                        max={refundAmount}
                        step={1000}
                        value={currentPartial || ''}
                        onChange={(e) => onPartialRefundAmountChange(Number(e.target.value) || 0)}
                        className="w-36 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-900 focus:border-fpt-orange focus:ring-1 focus:ring-fpt-orange outline-none"
                      />
                      <span className="text-xs text-slate-500 font-medium">VNĐ (Tối đa {refundAmount.toLocaleString('vi-VN')}đ)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 2: DISPUTE REASONS */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            2. Lý do yêu cầu trả hàng
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn nguyên nhân phù hợp nhất để người bán nhanh chóng nắm rõ vấn đề.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          {reasons.map((r) => {
            const isSelected = selectedReason === r.id;
            return (
              <Button
                key={r.id}
                type="button"
                onClick={() => onReasonChange(r.id)}
                className={`h-auto rounded-full px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-none'
                }`}
              >
                {r.label}
              </Button>
            );
          })}
        </div>
      </Card>
    </>
  );
}
