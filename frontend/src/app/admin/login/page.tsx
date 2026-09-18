'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-orange-500"></div>
        <span className="text-sm font-medium">Đang chuyển hướng về trang đăng nhập hệ thống...</span>
      </div>
    </div>
  );
}
