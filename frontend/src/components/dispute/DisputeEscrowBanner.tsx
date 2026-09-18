'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';

interface DisputeEscrowBannerProps {
  initialSeconds?: number;
}

export default function DisputeEscrowBanner({
  initialSeconds = 38 * 3600 + 14 * 60 + 39,
}: DisputeEscrowBannerProps) {
  const { formattedHours, formattedMinutes, formattedSeconds } = useCountdown(initialSeconds);

  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#7B341E] via-[#8B3A1C] to-[#A0451A] p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-xs border border-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-orange-200">
            <ShieldAlert className="h-3.5 w-3.5 text-orange-300" />
            <span>FPT 5CAMPUS SAFE-ESCROW SYSTEM</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight uppercase">
            TRẠNG THÁI: TIỀN ĐÃ ĐƯỢC TẠM KHÓA TRONG VÍ ESCROW CỦA SÀN 5CAMPUS
          </h1>

          <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
            Khoản thanh toán của bạn được đóng băng an toàn trong hệ thống giám sát liên trường. Người bán chỉ được giải ngân khi bạn xác nhận hài lòng hoặc sau khi Ban Công tác Sinh viên (CTSV) hoàn tất đối soát khách quan.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 p-4 sm:p-5 text-center shrink-0 self-start lg:self-auto min-w-[240px]">
          <div className="text-[11px] font-bold text-orange-200 uppercase tracking-wider">
            THỜI GIAN BẢO LƯU CÒN LẠI
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white my-1">
            {formattedHours} : {formattedMinutes} : {formattedSeconds}
          </div>
          <div className="text-[10px] text-orange-200/80">
            Tự động hoàn tiền khi quá hạn
          </div>
        </div>
      </div>
    </div>
  );
}
