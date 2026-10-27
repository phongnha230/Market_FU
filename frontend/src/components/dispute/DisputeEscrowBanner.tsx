'use client';

import React from 'react';
import { ShieldCheck, Clock, Truck, MapPin } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

interface DisputeEscrowBannerProps {
  isSeller?: boolean;
  isInterCampus?: boolean;
  sellerCampus?: string;
  buyerCampus?: string;
}

export default function DisputeEscrowBanner({
  isSeller = false,
  isInterCampus = false,
  sellerCampus = 'Campus FPT',
  buyerCampus = 'Campus FPT',
}: DisputeEscrowBannerProps) {
  return (
    <Card className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-amber-50/40 p-5 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 px-3 py-0.5 text-xs font-bold hover:bg-orange-100">
              <ShieldCheck className="h-3.5 w-3.5 text-fpt-orange" />
              <span>Ví Escrow 5Campus Bảo Hộ</span>
            </Badge>

            <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              isInterCampus 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isInterCampus ? (
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Đơn Vận Chuyển Liên Campus ({sellerCampus} ➔ {buyerCampus})
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Giao dịch Safe-Point Nội bộ ({sellerCampus})
                </span>
              )}
            </Badge>
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {isSeller
              ? 'Hồ Sơ Yêu Cầu Trả Hàng & Đối Soát Escrow'
              : isInterCampus
              ? 'Yêu Cầu Trả Hàng & Hoàn Tiền Liên Campus'
              : 'Yêu Cầu Trả Hàng & Hoàn Tiền Trực Tiếp Safe-Point'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isSeller
              ? 'Khoản tiền giao dịch đang được giữ an toàn tại ví Escrow. Vui lòng kiểm tra lý do và bằng chứng từ Người mua để cùng thống nhất phương án xử lý công bằng.'
              : isInterCampus
              ? 'Khoản thanh toán của bạn (tiền hàng + phí ship) được phong tỏa an toàn trong Escrow. Sau khi bưu tá tiếp nhận kiện hàng hoàn trả, hệ thống sẽ thực hiện hoàn tiền theo quy định.'
              : 'Khoản thanh toán được bảo lưu an toàn 100% trong Escrow. Hai bên hẹn gặp trao trả lại đồ tại trạm Safe-Point trong trường, người bán bấm xác nhận là tiền về ví ngay.'}
          </p>
        </div>

        {/* Right Info Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 text-xs text-slate-600 shrink-0 self-start lg:self-auto min-w-[220px] shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 text-fpt-orange" />
            <span>Thời Hạn Phản Hồi</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">
            Trong vòng 24 giờ
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            {isSeller
              ? 'Người bán có 24h để đồng ý hoặc thương lượng giải pháp.'
              : 'Nếu đối tác không phản hồi trong 24h, Sàn sẽ tự động hỗ trợ.'}
          </p>
        </div>
      </div>
    </Card>
  );
}
