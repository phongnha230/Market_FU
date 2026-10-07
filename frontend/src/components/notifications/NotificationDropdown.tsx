'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Package,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Trash2,
  AlertCircle,
  FileEdit,
  Volume2,
} from 'lucide-react';
import { useNotificationStore, NotificationItem, NotificationType } from '@/stores/notificationStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { showDesktopNotification } from '@/utils/webPush';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'CHAT' | 'ORDER' | 'KYC'>('all');
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!isLoggedIn) {
    return (
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2.5 z-50 w-[320px] rounded-2xl bg-white shadow-2xl border border-slate-200/90 p-5 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-fpt-orange">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">Chưa đăng nhập</h4>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng đăng nhập để xem thông báo riêng tư của bạn.
          </p>
        </div>
        <Button
          asChild
          className="w-full bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold rounded-xl h-9"
        >
          <Link href="/login" onClick={onClose}>
            Đăng nhập ngay
          </Link>
        </Button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredList = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.isRead;
    if (activeFilter === 'CHAT') return item.type === 'CHAT';
    if (activeFilter === 'ORDER') return item.type === 'ORDER';
    if (activeFilter === 'KYC') return item.type === 'KYC';
    return true;
  });

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.targetUrl) {
      router.push(item.targetUrl);
      onClose();
    }
  };

  const getItemIcon = (type: NotificationType) => {
    switch (type) {
      case 'CHAT':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
        );
      case 'KYC':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
        );
      case 'ORDER':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Package className="h-4.5 w-4.5" />
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        );
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2.5 z-50 w-[350px] sm:w-[410px] rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Dropdown Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-orange-50/70 via-white to-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-fpt-orange">
            <Bell className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Thông báo</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-black text-white">
              {unreadCount} mới
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-fpt-orange transition-colors cursor-pointer"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Đã đọc tất cả</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-50/70 border-b border-slate-100 overflow-x-auto text-[11px]">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'unread', label: `Chưa đọc (${unreadCount})` },
          { key: 'CHAT', label: 'Tin nhắn' },
          { key: 'KYC', label: 'Duyệt Thẻ SV' },
          { key: 'ORDER', label: 'Đơn hàng' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key as any)}
            className={cn(
              'px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer',
              activeFilter === tab.key
                ? 'bg-white text-fpt-orange shadow-2xs border border-orange-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Bell className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-600">Không có thông báo nào</p>
            <p className="text-[11px] text-slate-400">
              {activeFilter === 'unread' ? 'Bạn đã đọc tất cả thông báo rồi!' : 'Các hoạt động mua bán và duyệt thẻ sẽ xuất hiện tại đây.'}
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'group relative p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start',
                !item.isRead && 'bg-orange-50/30'
              )}
            >
              {/* Type Icon */}
              {getItemIcon(item.type)}

              {/* Main Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-baseline justify-between gap-1">
                  <h4 className={cn('text-xs line-clamp-1', !item.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700')}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.createdAt}</span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {item.body}
                </p>

                {/* Admin Feedback Box (For rejected KYC) */}
                {item.adminFeedback && (
                  <div className="mt-1.5 rounded-lg bg-rose-50 border border-rose-100 p-2 text-[10px] text-rose-800 space-y-0.5">
                    <div className="flex items-center gap-1 font-bold text-rose-900">
                      <AlertCircle className="h-3 w-3 text-rose-600" />
                      <span>Lý do BQT từ chối:</span>
                    </div>
                    <p className="pl-4 text-rose-700 italic">{item.adminFeedback}</p>
                  </div>
                )}

                {/* Interactive Action Buttons */}
                <div className="pt-1 flex items-center justify-between">
                  {item.actionText ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-bold py-0.5 px-2 rounded-md transition shadow-2xs',
                        item.type === 'KYC'
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : item.type === 'CHAT'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      )}
                    >
                      {item.type === 'KYC' && <FileEdit className="h-3 w-3" />}
                      {item.type === 'CHAT' && <MessageSquare className="h-3 w-3" />}
                      {item.type === 'ORDER' && <ExternalLink className="h-3 w-3" />}
                      <span>{item.actionText}</span>
                    </span>
                  ) : <span />}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    title="Xóa thông báo này"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Unread dot */}
              {!item.isRead && (
                <span className="h-2 w-2 rounded-full bg-fpt-orange shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Dropdown Footer: Test push button & Click into full page */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => {
            showDesktopNotification({
              title: '💬 Khách mua Trần Văn Đạt nhắn tin',
              body: 'Anh ơi, giáo trình CSD201 anh đăng pass ở Dom E còn không ạ? Chiều em qua lấy nhé!',
              targetUrl: '/chat',
            });
          }}
          className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-bold text-fpt-orange transition cursor-pointer active:scale-98"
          title="Bấm để bắn thử thông báo góc màn hình máy tính Windows"
        >
          <Volume2 className="h-3.5 w-3.5" />
          <span>Thử bắn thông báo góc màn hình Desktop</span>
        </button>

        <Link
          href="/notifications"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-fpt-orange transition shadow-2xs group"
        >
          <span>Xem tất cả thông báo chi tiết</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
