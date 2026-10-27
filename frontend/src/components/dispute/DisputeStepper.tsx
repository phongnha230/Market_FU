'use client';

import React from 'react';

interface DisputeStepperProps {
  currentStep?: number;
  isSeller?: boolean;
  isInterCampus?: boolean;
}

export default function DisputeStepper({
  currentStep = 1,
  isSeller = false,
  isInterCampus = false,
}: DisputeStepperProps) {
  const steps = isSeller
    ? [
        { number: 1, title: '1. Tiếp nhận hồ sơ', desc: 'Người mua gửi lý do & bằng chứng' },
        { number: 2, title: '2. Phản hồi phương án', desc: 'Đồng ý hoặc đề xuất bồi hoàn' },
        { number: 3, title: isInterCampus ? '3. Nhận hàng chuyển hoàn' : '3. Kiểm tra tại Safe-Point', desc: isInterCampus ? 'Bưu cục giao lại đồ' : 'Hai bên gặp trực tiếp' },
        { number: 4, title: '4. Quyết toán Escrow', desc: 'Hoàn tất giao dịch' },
      ]
    : isInterCampus
    ? [
        { number: 1, title: '1. Gửi yêu cầu', desc: 'Đính kèm ảnh / video lỗi' },
        { number: 2, title: '2. Xác nhận hoàn trả', desc: 'Người bán phản hồi trong 24h' },
        { number: 3, title: '3. Bưu cục chuyển hoàn', desc: 'Bưu tá lấy hoặc gửi quầy GHN' },
        { number: 4, title: '4. Hoàn tiền Escrow', desc: 'Nhận lại tiền khi đối soát' },
      ]
    : [
        { number: 1, title: '1. Gửi yêu cầu', desc: 'Mô tả vấn đề & lý do trả' },
        { number: 2, title: '2. Hẹn điểm Safe-Point', desc: 'Thống nhất giờ hẹn trong trường' },
        { number: 3, title: '3. Trao trả sản phẩm', desc: 'Kiểm tra tại trạm Safe-Point' },
        { number: 4, title: '4. Hoàn tiền ngay', desc: 'Tiền về ví khi xác nhận xong' },
      ];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isPassed = step.number < currentStep;

          return (
            <div
              key={step.number}
              className={`flex flex-col items-center transition ${
                isActive ? 'opacity-100' : isPassed ? 'opacity-90' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`h-6 w-6 rounded-full font-bold text-xs flex items-center justify-center transition ${
                    isActive
                      ? 'bg-fpt-orange text-white shadow-xs ring-2 ring-orange-200'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isPassed ? '✓' : step.number}
                </div>
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    isActive ? 'text-fpt-orange' : isPassed ? 'text-slate-900' : 'text-slate-600'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 leading-tight">{step.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
