'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SafetyBanner() {
  return (
    <section className="py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Card className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/20 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Left Info Group */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  Giao dịch an toàn 100% trong khuôn viên FPT
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Chỉ giao dịch tài khoản sinh viên <span className="font-semibold text-emerald-700">@fpt.edu.vn</span> đã xác thực. Khuyến khích trao đổi trực tiếp tại Cổng trường hoặc Sảnh tòa nhà campus.
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                asChild
                variant="outline"
                className="rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition h-auto"
              >
                <Link href="/guidelines">
                  Quy tắc giao dịch
                </Link>
              </Button>
              <Button
                asChild
                className="rounded-xl bg-[#F27024] hover:bg-[#E05C10] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition h-auto"
              >
                <Link href="/safety">
                  Bảo vệ bạn
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
