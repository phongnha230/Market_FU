'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { useAdminStore } from '@/stores/adminStore';

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    useAdminStore.getState().ensureAdminToken().catch(() => {});
  }, []);

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
