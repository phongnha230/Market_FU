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

        </div>
      </div>
    </AdminAuthGuard>
  );
}
