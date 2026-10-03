'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostSuccessModalProps {
  isOpen: boolean;
  createdStatus: string;
  title: string;
  campus: string;
  createdPostId?: string | null;
  getCampusShortName: (campus: string) => string;
}

export default function PostSuccessModal({
  isOpen,
  createdStatus,
  title,
  campus,
  createdPostId,
  getCampusShortName,
}: PostSuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl text-center space-y-4">
        <div
          className={cn(
            'mx-auto flex h-14 w-14 items-center justify-center rounded-full',
            createdStatus === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          )}
        >
          {createdStatus === 'PENDING_APPROVAL' ? (
            <Clock className="h-8 w-8" />
          ) : (
            <CheckCircle2 className="h-8 w-8" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {createdStatus === 'PENDING_APPROVAL'
              ? 'Đăng tin thành công! Đang chờ kiểm duyệt'
              : 'Đăng tin thành công! Đã xuất bản'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            {createdStatus === 'PENDING_APPROVAL' ? (
              <>
                Tin đăng &quot;<span className="font-semibold text-slate-800">{title}</span>&quot; đã được gửi lên hệ thống và đang chờ Ban Quản Trị ({getCampusShortName(campus)}) phê duyệt trước khi hiển thị công khai.
              </>
            ) : (
              <>
                Tin đăng &quot;<span className="font-semibold text-slate-800">{title}</span>&quot; đã được xuất bản lên kênh sinh viên FPT 5Campus ({getCampusShortName(campus)}) và sẵn sàng giao dịch.
              </>
            )}
          </p>
          {createdStatus === 'PENDING_APPROVAL' && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-semibold text-amber-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Quy trình an toàn: BQT sẽ duyệt tin trong 15-30 phút
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-3">
          {createdStatus === 'PENDING_APPROVAL' ? (
            <>
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="w-full sm:w-auto rounded-xl bg-fpt-orange px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
              >
                Về trang cá nhân theo dõi
              </button>
              <button
                type="button"
                onClick={() => router.push(createdPostId ? `/posts/${createdPostId}` : '/posts')}
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Xem trước bài viết
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push(createdPostId ? `/posts/${createdPostId}` : '/posts')}
                className="w-full sm:w-auto rounded-xl bg-fpt-orange px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
              >
                Xem bài vừa đăng
              </button>
              <button
                type="button"
                onClick={() => router.push('/posts')}
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Chợ Khám phá
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
