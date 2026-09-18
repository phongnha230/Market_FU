'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Conversation } from '@/types/chat';
import { ShieldCheck, Info, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
  onShowToast: (msg: string) => void;
}

export default function ChatHeader({
  conversation,
  onShowToast,
}: ChatHeaderProps) {
  return (
    <div className="shrink-0 px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
          <Image
            src={conversation.avatar}
            alt={conversation.name}
            fill
            className="object-cover"
          />
          {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              {conversation.name}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <ShieldCheck className="h-3 w-3" />
              Đã xác thực thẻ SV FPT
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-emerald-700 font-medium">Đang hoạt động</span>
            <span>•</span>
            <span className="truncate">{conversation.cohortCampus} (Khu KTX Dom A)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
        >
          Xem hồ sơ
        </Link>
        <button
          type="button"
          onClick={() =>
            onShowToast(
              'ℹ️ Thông tin người bán: Sinh viên K18, 28 giao dịch thành công, tỷ lệ phản hồi 98%.'
            )
          }
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <Info className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            onShowToast(
              '⚙️ Tùy chọn: Chặn người dùng, Báo cáo lừa đảo, Xóa hội thoại.'
            )
          }
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
