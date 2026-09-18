'use client';

import React from 'react';
import Image from 'next/image';
import { Conversation } from '@/types/chat';
import {
  Search,
  CheckCircle2,
  CheckCheck,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConvId: string;
  onSelectConv: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterTab: 'all' | 'buy' | 'sell' | 'unread';
  onFilterChange: (tab: 'all' | 'buy' | 'sell' | 'unread') => void;
  onMarkAllRead: () => void;
  onShowToast: (msg: string) => void;
}

export default function ChatSidebar({
  conversations,
  selectedConvId,
  onSelectConv,
  searchQuery,
  onSearchChange,
  filterTab,
  onFilterChange,
  onMarkAllRead,
  onShowToast,
}: ChatSidebarProps) {
  const filteredConversations = conversations.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pinnedProduct.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (filterTab === 'buy') return c.role === 'seller';
    if (filterTab === 'sell') return c.role === 'buyer';
    if (filterTab === 'unread') return (c.unreadCount || 0) > 0;
    return true;
  });

  return (
    <div className="lg:col-span-4 border-r border-slate-200 flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="shrink-0 p-3.5 sm:p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">Tin nhắn</h2>
            <span className="rounded-full bg-fpt-orange px-2 py-0.5 text-[11px] font-extrabold text-white">
              2 mới
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              type="button"
              title="Đánh dấu tất cả đã đọc"
              onClick={onMarkAllRead}
              className="p-1.5 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Tùy chọn hiển thị"
              onClick={() =>
                onShowToast('⚙️ Sắp xếp: Tin nhắn mới nhất được ưu tiên ghim lên đầu.')
              }
              className="p-1.5 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm người bán, sản phẩm..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-fpt-orange transition"
          />
        </div>

        {/* 4 Filter Tabs */}
        <div className="mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'buy', label: 'Mua hàng (2)' },
            { id: 'sell', label: 'Bán hàng (1)' },
            { id: 'unread', label: 'Chưa đọc' },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id as any)}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer shrink-0 text-[11px] ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredConversations.map((conv) => {
          const isSelected = conv.id === selectedConvId;
          return (
            <div
              key={conv.id}
              onClick={() => onSelectConv(conv.id)}
              className={`relative flex items-start gap-3 p-3.5 border-b border-slate-100 transition cursor-pointer hover:bg-slate-50 ${
                isSelected ? 'bg-orange-50/60' : 'bg-white'
              }`}
            >
              {/* Active Indicator Bar - Always visible on selected conversation */}
              {isSelected && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-fpt-orange rounded-r" />
              )}

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="relative h-11 w-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                  <Image
                    src={conv.avatar}
                    alt={conv.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {conv.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1">
                    {conv.name}
                    {conv.verified && (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {conv.time}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                  <span className="rounded bg-slate-100 px-1 py-0.2 text-[10px] font-semibold text-slate-700">
                    {conv.roleLabel}
                  </span>
                  <span className="truncate">{conv.cohortCampus}</span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-600 truncate leading-snug">
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount ? (
                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-fpt-orange text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                </div>
              </div>

              {/* Product thumbnail */}
              {conv.productImage && (
                <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <Image
                    src={conv.productImage}
                    alt="Product"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Left Column Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-medium text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Bảo vệ người mua FPT Care
        </span>
        <button
          type="button"
          onClick={() =>
            onShowToast(
              '📜 Quy chuẩn trao đổi: Giao dịch trung thực, cấm cọc trước, tuân thủ nội quy FPT.'
            )
          }
          className="hover:text-slate-800 underline font-medium cursor-pointer"
        >
          Quy chuẩn
        </button>
      </div>
    </div>
  );
}
