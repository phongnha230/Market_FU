'use client';

import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface DisputeSidebarProps {
  itemPrice?: number;
  shippingFee?: number;
  totalEscrow?: number;
  onShowToast: (msg: string) => void;
  isSeller?: boolean;
  isInterCampus?: boolean;
  resolutionPlan?: 'return' | 'partial';
  partialRefundAmount?: number;
}

export default function DisputeSidebar({
  itemPrice = 0,
  shippingFee = 0,
  totalEscrow = 0,
  onShowToast,
  isSeller = false,
  isInterCampus = false,
  resolutionPlan = 'return',
  partialRefundAmount,
}: DisputeSidebarProps) {
  const actualShipping = isInterCampus ? shippingFee : 0;
  const isPartial = resolutionPlan === 'partial';
  const refundAmountDisplay = isPartial
    ? (partialRefundAmount ?? Math.round(itemPrice * 0.3))
    : itemPrice + actualShipping;

  return (
    <div className="space-y-4">
      {/* CARD 1: CHI TIẾT SỐ TIỀN HOÀN TRẢ */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Chi tiết số tiền bảo lưu
          </span>
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Giá trị sản phẩm:</span>
            <span className="font-semibold text-slate-800">
              {itemPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Phí vận chuyển:</span>
            {isInterCampus ? (
              <span className="font-semibold text-slate-800">
                {actualShipping.toLocaleString('vi-VN')}đ
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">0đ (Safe-Point)</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Phương án yêu cầu:</span>
            <span className="font-medium text-slate-700">
              {isPartial ? 'Bồi hoàn một phần' : 'Trả hàng hoàn 100%'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
            <span>{isSeller ? 'Khoản Escrow đang giữ:' : 'Dự kiến hoàn lại:'}</span>
            <span className="text-base font-black text-fpt-orange">
              {refundAmountDisplay.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Tiền hoàn sẽ chuyển trực tiếp vào Ví FPT Marketplace</span>
        </div>
      </Card>

      {/* CARD 2: QUY TRÌNH XỬ LÝ MINH BẠCH */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
          {isInterCampus ? (
            <Truck className="h-4 w-4 text-blue-600" />
          ) : (
            <MapPin className="h-4 w-4 text-emerald-600" />
          )}
          <span>
            {isInterCampus ? 'Quy trình Trả hàng Liên Campus' : 'Quy trình Trả hàng Safe-Point'}
          </span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          {isInterCampus ? (
            <>
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Thời hạn phản hồi 24h:</strong> Người bán có 24h để đồng ý hoặc thương lượng giải pháp với bạn.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Chuyển hoàn miễn phí:</strong> Bưu tá GHN nhận kiện hàng tận nơi hoặc gửi tại bưu cục mà không tốn thêm cước.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Hoàn tiền tự động:</strong> Ngay khi bưu tá quét mã nhận hàng hoàn trả, khoản tiền sẽ được hoàn về ví của bạn.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Hẹn gặp tại trường:</strong> Hai bên hẹn gặp tại trạm Safe-Point (Sảnh thư viện/Căn tin) để trao lại món đồ.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Kiểm tra trực tiếp:</strong> Người bán nhận lại sản phẩm và bấm xác nhận hoàn trả trên ứng dụng.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Hoàn tiền tức thì:</strong> Tiền trong Escrow lập tức được chuyển hoàn về ví của người mua.
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* CARD 3: HỖ TRỢ KHI CẦN */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
          <span>Cần trợ giúp thêm?</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Nếu hai bên không đạt được thỏa thuận chung, Ban Quản Trị Sàn sẽ hỗ trợ xem xét bằng chứng và đưa ra phán quyết công bằng trong vòng 24 giờ.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onShowToast('Bộ phận hỗ trợ sinh viên FPT Market luôn sẵn sàng hỗ trợ trực tuyến qua mục Trợ giúp.')
          }
          className="h-auto w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-none"
        >
          Liên hệ Hỗ trợ Sàn 5Campus
        </Button>
      </Card>
    </div>
  );
}
