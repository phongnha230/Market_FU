'use client';

import React from 'react';
import { Bell, MapPin, ChevronDown, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { useAdminStore, AdminCampus } from '@/stores/adminStore';

const CAMPUS_OPTIONS: { value: AdminCampus; label: string }[] = [
  { value: 'all', label: 'Tất cả 5 Cơ sở FPT' },
  { value: 'hola', label: 'Hòa Lạc (Hà Nội)' },
  { value: 'hcm', label: 'TP.HCM (Quận 9)' },
  { value: 'danang', label: 'Đà Nẵng' },
  { value: 'cantho', label: 'Cần Thơ' },
  { value: 'quynhon', label: 'Quy Nhơn' },
];

export default function AdminTopbar() {
  const admin = useAdminStore((s) => s.admin);
  const selectedCampus = useAdminStore((s) => s.selectedCampus);
  const setSelectedCampus = useAdminStore((s) => s.setSelectedCampus);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 shadow-2xs font-sans">
      {/* Left: Campus Selector + Live Quick Stats */}
      <div className="flex items-center gap-3">
        {/* Campus Dropdown */}
        <div className="relative flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 transition shadow-2xs">
          <MapPin className="h-3.5 w-3.5 text-fpt-orange" />
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value as AdminCampus)}
            className="appearance-none bg-transparent pr-5 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            {CAMPUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
        </div>

        {/* Quick Stat 1: Giao dịch hôm nay */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-2">
          <ArrowLeftRight className="h-3.5 w-3.5 text-emerald-600" />
          <span>Giao dịch hôm nay:</span>
          <span className="font-bold text-slate-900">248 tin</span>
        </div>

        <span className="hidden md:inline text-slate-300">•</span>

        {/* Quick Stat 2: Hồ sơ đã duyệt */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
          <span>Hồ sơ đã duyệt:</span>
          <span className="font-bold text-orange-600">99.2%</span>
        </div>

        <span className="hidden lg:inline text-slate-300">•</span>

        {/* Quick Stat 3: Hệ thống hoạt động */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống: Hoạt động bình thường</span>
        </div>
      </div>

      {/* Right: Notification + Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Badge */}
        <button
          type="button"
          className="relative flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          title="Thông báo hệ thống"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white ring-2 ring-white">
            3
          </span>
        </button>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-2 pl-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 font-black text-[12px] text-white shadow-xs">
            {admin?.avatarInitial || 'Q'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {admin?.name || 'Lê Minh Quân'}
            </div>
            <div className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase leading-tight mt-0.5">
              ADMIN TOÀN QUỐC
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
