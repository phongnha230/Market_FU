'use client';

import React from 'react';
import { Bell, MapPin, ChevronDown, RefreshCw, CheckCircle } from 'lucide-react';
import { useAdminStore, AdminCampus } from '@/stores/adminStore';

const CAMPUS_OPTIONS: { value: AdminCampus; label: string }[] = [
  { value: 'all', label: 'Tất cả 5 cơ sở' },
  { value: 'hola', label: 'HL (Hòa Lạc)' },
  { value: 'hcm', label: 'SG (TP.HCM)' },
  { value: 'danang', label: 'ĐN (Đà Nẵng)' },
  { value: 'cantho', label: 'CT (Cần Thơ)' },
  { value: 'quynhon', label: 'QN (Quy Nhơn)' },
];

export default function AdminTopbar() {
  const admin = useAdminStore((s) => s.admin);
  const selectedCampus = useAdminStore((s) => s.selectedCampus);
  const setSelectedCampus = useAdminStore((s) => s.setSelectedCampus);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-xs">
      {/* Left: Campus Selector + Sync Status */}
      <div className="flex items-center gap-3">
        {/* Campus Dropdown */}
        <div className="relative flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 transition">
          <MapPin className="h-3.5 w-3.5 text-fpt-orange" />
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value as AdminCampus)}
            className="appearance-none bg-transparent pr-5 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            {CAMPUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
        </div>

        {/* Sync Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Đồng bộ máy chủ: Hoàn tất</span>
        </div>

        {/* Live Stats */}
        <div className="hidden lg:flex items-center gap-3 ml-3 border-l border-slate-200 pl-3 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-fpt-orange animate-pulse"></span>
            <span>Giao dịch hôm nay:</span>
            <span className="font-bold text-slate-800">248 tin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Hỗ trợ duyệt:</span>
            <span className="font-bold text-emerald-600">89.2%</span>
          </div>
        </div>
      </div>

      {/* Right: Notification + Admin Profile */}
      <div className="flex items-center gap-3">
        {/* System Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Hệ thống: Hoạt động bình thường
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          title="Thông báo"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white ring-2 ring-white">
            3
          </span>
        </button>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-fpt-orange text-[11px] font-extrabold text-white">
            {admin?.avatarInitial || 'A'}
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[12px] font-bold text-slate-900 leading-tight">{admin?.name || 'Admin'}</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight">
              {admin?.role === 'superadmin' ? 'ADMIN, TOÀN QUỐC' : `Admin ${admin?.campus?.toUpperCase()}`}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
