'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-sans">
        {/* Responsive Sidebar Drawer */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <AdminTopbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
