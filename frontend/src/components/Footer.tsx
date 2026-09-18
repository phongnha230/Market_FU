'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-12">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand intro & Trust badges (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-10 w-48">
                <Image
                  src="/fpt-5campus-logo.png"
                  alt="FPT 5Campus Marketplace"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              Mạng lưới trao đổi, nhượng lại giáo trình, thiết bị công nghệ và đồ dùng sinh hoạt tiện ích dành riêng cho sinh viên Đại học FPT toàn quốc.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>FPT Edu Internal Network</span>
              </div>
            </div>
          </div>

          {/* Column 2: 5 Campuses Directory (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Chi nhánh 5 Campuses
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="text-fpt-orange font-bold">•</span>
                <span>
                  <strong className="text-slate-800">Hà Nội:</strong> Khu CNC Hòa Lạc, Thạch Thất
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-fpt-orange font-bold">•</span>
                <span>
                  <strong className="text-slate-800">Đà Nẵng:</strong> Khu đô thị FPT City, Ngũ Hành Sơn
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-fpt-orange font-bold">•</span>
                <span>
                  <strong className="text-slate-800">TP. HCM:</strong> Lô E2a-7, Đường D1 Khu CNC, TP. Thủ Đức
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-fpt-orange font-bold">•</span>
                <span>
                  <strong className="text-slate-800">Cần Thơ:</strong> Số 600 Đường Nguyễn Văn Cừ, Ninh Kiều
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-fpt-orange font-bold">•</span>
                <span>
                  <strong className="text-slate-800">Quy Nhơn:</strong> Khu đô thị An Phú Thịnh, Bình Định
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Student Support & Terms (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Hỗ trợ sinh viên & Điều khoản
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/guidelines"
                  className="text-slate-600 hover:text-fpt-orange transition-colors"
                >
                  Quy chế hoạt động & Quy tắc giao dịch
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="text-slate-600 hover:text-fpt-orange transition-colors"
                >
                  Chính sách bảo vệ FPT Care & Safe-Handoff
                </Link>
              </li>
              <li>
                <Link
                  href="/orders/dispute"
                  className="text-slate-600 hover:text-fpt-orange transition-colors"
                >
                  Báo cáo tin xấu & Khiếu nại vi phạm
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-slate-600 hover:text-fpt-orange transition-colors"
                >
                  Trung tâm hỗ trợ CSKH sinh viên
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2024 FPT 5Campus Marketplace. Vận hành bởi Cộng đồng sinh viên FPT University.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/privacy" className="hover:text-slate-800 transition">
              Chính sách bảo mật
            </Link>
            <span>•</span>
            <Link href="/standards" className="hover:text-slate-800 transition">
              Tiêu chuẩn cộng đồng
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-800 transition">
              Liên hệ ban điều phối
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
