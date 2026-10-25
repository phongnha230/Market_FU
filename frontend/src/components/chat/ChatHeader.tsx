'use client';

import React from 'react';
import { Conversation } from '@/types/chat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ShieldCheck, Info, Trash2, ArrowLeft } from 'lucide-react';

function getInitials(name?: string): string {
  if (!name) return 'SV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ChatHeaderProps {
  conversation: Conversation;
  onShowToast: (msg: string) => void;
  onDeleteConv?: (id: string) => void;
  onBack?: () => void;
}

export default function ChatHeader({
  conversation,
  onShowToast,
  onDeleteConv,
  onBack,
}: ChatHeaderProps) {
  return (
    <div className="shrink-0 px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden flex items-center gap-1 -ml-1 mr-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-fpt-orange hover:border-orange-200 font-bold text-xs transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
            title="Quay lại danh sách hội thoại"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
        )}
        <div className="relative h-10 w-10 shrink-0">
          <Avatar className="h-10 w-10 border border-slate-200">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-xs">
              {getInitials(conversation.name)}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
              conversation.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
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
            {conversation.isOnline ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-emerald-700 font-semibold">Đang hoạt động</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0"></span>
                <span className="text-slate-500 font-medium">Không hoạt động</span>
              </>
            )}
            <span>•</span>
            <span className="truncate">{conversation.cohortCampus}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          title="Thông tin sinh viên"
          onClick={() =>
            onShowToast(
              `ℹ️ ${conversation.name} • ${conversation.cohortCampus || 'FPT Campus'} • Đã xác minh sinh viên FPT.`
            )
          }
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
        >
          <Info className="h-4 w-4" />
        </button>
        {onDeleteConv && (
          <button
            type="button"
            title="Xóa cuộc trò chuyện này"
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) {
                onDeleteConv(conversation.id);
              }
            }}
            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
