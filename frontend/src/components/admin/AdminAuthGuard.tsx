'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isLoggedIn = useAdminStore((s) => s.isLoggedIn);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAdminStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useAdminStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.replace('/login');
    }
  }, [hasHydrated, isLoggedIn, router]);

  if (!hasHydrated || !isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-orange-500"></div>
          <span className="text-sm font-medium">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
