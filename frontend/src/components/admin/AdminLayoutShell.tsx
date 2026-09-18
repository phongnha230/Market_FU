'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <AdminAuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-sans">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>

          {/* Footer Bar */}
          <footer className="shrink-0 flex items-center justify-between border-t border-slate-200 bg-white px-5 py-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Hạ tầng AI & Edu SSO Gateway: Hoạt động 99.98%
              </span>
              <span>Giám sát: Admin BQT Hòa Lạc và quản lý 5 bộ gi...</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-700">FPT 5Campus OS v3.4.1</span>
              <span>Hỗ trợ kỹ thuật: safe@fpt.edu.vn</span>
            </div>
          </footer>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
