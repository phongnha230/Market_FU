'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Users,
  AlertTriangle,
  MapPin,
  Settings,
  Store,
  MoreVertical,
  X,
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';

const NAV_ITEMS = [
  { label: 'Tổng quan Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Tin đăng & Kiểm duyệt', href: '/admin/posts', icon: FileText, badge: '8', badgeColor: 'bg-amber-800 text-white' },
  { label: 'Xác minh Thẻ SV', href: '/admin/kyc', icon: ShieldCheck, badge: '14', badgeColor: 'bg-emerald-700 text-white' },
  { label: 'Người dùng & MSSV', href: '/admin/users', icon: Users },
  { label: 'Báo cáo & Gian lận', href: '/admin/reports', icon: AlertTriangle },
  { label: 'Safe-Handoff Hub', href: '/admin/safehandoff', icon: MapPin },
  { label: 'Cài đặt Hệ thống', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const admin = useAdminStore((s) => s.admin);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white text-slate-800 shadow-xl lg:shadow-xs font-sans transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 font-black text-white text-sm shadow-md shadow-orange-500/25">
              FPT
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 leading-tight">
                FPT 5Campus
              </div>
              <div className="text-[10px] font-black tracking-wider text-fpt-orange uppercase leading-tight mt-0.5">
                BQT HỆ THỐNG
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live System Status Pill */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-700">Safe System Live</span>
            </div>
            <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/80 shadow-2xs">
              5 Cơ sở
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-orange-50/90 text-orange-600 font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-fpt-orange' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Switch back to SV marketplace & Profile */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/70 px-3 py-2 text-xs font-bold transition shadow-2xs"
          >
            <Store className="h-4 w-4 text-blue-600" />
            <span>Về Marketplace SV</span>
          </Link>

          {/* User Card */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/70 p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 font-bold text-white text-xs shadow-xs">
                {admin?.avatarInitial || 'Q'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {admin?.name || 'Lê Minh Quân'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {admin?.role === 'superadmin' ? 'BQT Hola • SuperAdmin' : `BQT • ${admin?.campus?.toUpperCase()}`}
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
