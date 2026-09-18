'use client';

import React from 'react';

interface DisputeStepperProps {
  currentStep?: number;
}

export default function DisputeStepper({ currentStep = 1 }: DisputeStepperProps) {
  const steps = [
    { number: 1, title: '1. Gửi yêu cầu', desc: 'Khởi tạo bằng chứng thực tế' },
    { number: 2, title: '2. Người bán phản hồi', desc: 'Hạn chót 24h quy định' },
    { number: 3, title: '3. Gửi Safe-Hub / Ship', desc: 'Miễn phí qua CampusShip' },
    { number: 4, title: '4. Hoàn tiền Escrow 100%', desc: 'Về ví ngay khi quét nhận' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          return (
            <div
              key={step.number}
              className={`flex flex-col items-center ${isActive ? '' : 'opacity-70'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`h-7 w-7 rounded-full font-bold text-xs flex items-center justify-center ${
                    isActive
                      ? 'bg-fpt-orange text-white font-extrabold shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    isActive ? 'text-fpt-orange font-extrabold' : 'text-slate-700'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{step.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
