'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Users,
  AlertTriangle,
  MapPin,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';

const NAV_ITEMS = [
  { label: 'Tổng quan Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Tin đăng & Kiểm duyệt', href: '/admin/posts', icon: FileText, badge: 18 },
  { label: 'Xác minh Thẻ SV', href: '/admin/kyc', icon: ShieldCheck, badge: 14 },
  { label: 'Người dùng & MSSV', href: '/admin/users', icon: Users },
  { label: 'Báo cáo & Gian lận', href: '/admin/reports', icon: AlertTriangle, badge: 2 },
  { label: 'Safe-Handoff Hub', href: '/admin/safehandoff', icon: MapPin },
  { label: 'Cài đặt Hệ thống', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdminStore((s) => s.admin);
  const logout = useAdminStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    // Clear cookie
    document.cookie = 'admin_logged_in=; Max-Age=0; path=/';
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#0F1B2D] text-white shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fpt-orange font-black text-white text-sm shadow">
          FPT
        </div>
        <div>
          <div className="text-[13px] font-extrabold tracking-wide text-white leading-tight">
            FPT 5Campus
          </div>
          <div className="text-[9px] font-bold tracking-widest text-orange-300 uppercase leading-tight mt-0.5">
            Admin Operations
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-2.5 text-[11px] font-medium text-slate-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <span>Hạ tầng cổng kết nối</span>
        <span className="ml-auto text-emerald-400 font-bold">Online</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-fpt-orange text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1 leading-tight">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-red-500/90 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Version + Admin info + Logout */}
      <div className="border-t border-white/10">
        {/* Version */}
        <div className="flex items-center justify-between px-5 py-2 text-[10px] text-slate-500">
          <span>Phiên bản V2.4</span>
          <span>Production 5Campus</span>
          <button
            type="button"
            title="Cài đặt phiên bản"
            className="rounded p-0.5 hover:text-slate-300 cursor-pointer"
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow">
            {admin?.avatarInitial || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-[12px] font-bold text-white">{admin?.name || 'Admin'}</div>
            <div className="truncate text-[10px] text-slate-400">
              {admin?.role === 'superadmin' ? 'BQT Hòa Lạc • SuperAdmin' : `BQT ${admin?.campus}`}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
