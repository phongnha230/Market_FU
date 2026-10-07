'use client';

import React from 'react';
import Image from 'next/image';
import { Conversation } from '@/types/chat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  CheckCircle2,
  CheckCheck,
  SlidersHorizontal,
  ShieldCheck,
  MessageSquare,
  Trash2,
} from 'lucide-react';

function getInitials(name?: string): string {
  if (!name) return 'SV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConvId?: string | null;
  onSelectConv: (id: string) => void;
  onDeleteConv?: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterTab: 'all' | 'buy' | 'sell' | 'unread';
  onFilterChange: (tab: 'all' | 'buy' | 'sell' | 'unread') => void;
  onMarkAllRead: () => void;
  onShowToast: (msg: string) => void;
  isSeller?: boolean;
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
  isSeller = false,
  onDeleteConv,
}: ChatSidebarProps) {
  // Tính toán số lượng thực tế từ danh sách hội thoại
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const buyConversations = conversations.filter((c) => c.role === 'seller'); // Mình đang hỏi mua từ người bán
  const sellConversations = conversations.filter((c) => c.role === 'buyer'); // Người khác mua hàng của mình và nhắn cho mình
  const unreadConversations = conversations.filter((c) => (c.unreadCount || 0) > 0);

  // Lọc danh sách hội thoại
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

  // Dynamic Tabs theo đúng quyền và dữ liệu thực tế:
  // 1. Tab Tất cả luôn có
  // 2. Tab Hỏi mua (Đang mua): Chỉ hiển thị khi có cuộc trò chuyện hỏi mua (buyConversations.length > 0)
  // 3. Tab Khách mua (Bán hàng): CHỈ ĐƯỢC PHÉP HIỂN THỊ KHI:
  //    - Người dùng đã là Seller (isSeller === true)
  //    - VÀ có người khác mua hàng và nhắn tôi (sellConversations.length > 0)
  // 4. Tab Chưa đọc: Chỉ hiển thị khi có tin nhắn chưa đọc
  const tabs: { id: 'all' | 'buy' | 'sell' | 'unread'; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
  ];

  if (buyConversations.length > 0) {
    tabs.push({ id: 'buy', label: `Hỏi mua (${buyConversations.length})` });
  }

  if (isSeller && sellConversations.length > 0) {
    tabs.push({ id: 'sell', label: `Khách mua (${sellConversations.length})` });
  }

  if (unreadConversations.length > 0) {
    tabs.push({ id: 'unread', label: `Chưa đọc (${unreadConversations.length})` });
  }

  // Tự động chuyển về tab 'all' nếu tab hiện tại không khả dụng trong tabs
  React.useEffect(() => {
    if (!tabs.some((t) => t.id === filterTab)) {
      onFilterChange('all');
    }
  }, [tabs, filterTab, onFilterChange]);

  return (
    <div className="lg:col-span-4 border-r border-slate-200 flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="shrink-0 p-3.5 sm:p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">Tin nhắn</h2>
            {totalUnread > 0 && (
              <span className="rounded-full bg-fpt-orange px-2 py-0.5 text-[11px] font-extrabold text-white">
                {totalUnread} mới
              </span>
            )}
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

        {/* Dynamic Filter Tabs */}
        {tabs.length > 1 && (
          <div className="mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
            {tabs.map((tab) => {
              const isActive = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onFilterChange(tab.id)}
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
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full text-slate-400">
            <MessageSquare className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-500">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có tin nhắn'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConv(conv.id)}
                className={`group relative flex items-start gap-3 p-3.5 border-b border-slate-100 transition cursor-pointer hover:bg-slate-50 ${
                  isSelected ? 'bg-orange-50/60' : 'bg-white'
                }`}
              >
                {/* Active Indicator Bar - Always visible on selected conversation */}
                {isSelected && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-fpt-orange rounded-r" />
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-11 w-11 border border-slate-200">
                    <AvatarImage src={conv.avatar} alt={conv.name} />
                    <AvatarFallback className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-xs">
                      {getInitials(conv.name)}
                    </AvatarFallback>
                  </Avatar>
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
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {conv.time}
                      </span>
                      {onDeleteConv && (
                        <button
                          type="button"
                          title="Xóa cuộc trò chuyện này"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConv(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
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

                {/* Product thumbnail (Safe with fallback, never broken) */}
                {conv.productImage && conv.productImage.trim().length > 0 && (
                  <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img
                      src={conv.productImage}
                      alt="Product"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none');
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
      )}
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
