'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Package,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Trash2,
  AlertCircle,
  FileEdit,
  ArrowRight,
  Filter,
  Volume2,
} from 'lucide-react';
import { useNotificationStore, NotificationItem, NotificationType } from '@/stores/notificationStore';
import { cn } from '@/lib/utils';
import { useMarket } from '@/context/MarketContext';
import { showDesktopNotification } from '@/utils/webPush';

export default function NotificationsPage() {
  const router = useRouter();
  const { showToast } = useMarket();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'CHAT' | 'KYC' | 'ORDER'>('all');

  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);
  const clearAll = useNotificationStore((state) => state.clearAll);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.isRead;
    if (activeTab === 'CHAT') return item.type === 'CHAT';
    if (activeTab === 'KYC') return item.type === 'KYC';
    if (activeTab === 'ORDER') return item.type === 'ORDER';
    return true;
  });

  const handleAction = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.targetUrl) {
      router.push(item.targetUrl);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'CHAT':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-2xs">
            <MessageSquare className="h-5 w-5" />
          </div>
        );
      case 'KYC':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-2xs">
            <ShieldAlert className="h-5 w-5" />
          </div>
        );
      case 'ORDER':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-2xs">
            <Package className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-fpt-orange shadow-2xs">
            <Sparkles className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans py-4 sm:py-6">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 flex-1 w-full space-y-5">
        {/* Breadcrumb Header */}
        <CompactHeader
          showBackButton={true}
          backHref="/"
          breadcrumbs={[{ label: 'Thông báo hệ thống' }]}
        />

        {/* Page Top Title Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-fpt-orange">
              <Bell className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hộp thư Thông báo
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật tin nhắn khách hàng, duyệt thẻ sinh viên KYC và các giao dịch mua bán đồ FPT
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                showDesktopNotification({
                  title: '💬 Khách mua Trần Văn Đạt vừa gửi tin nhắn',
                  body: 'Em chào anh, giáo trình CSD201 anh đăng pass ở Dom E còn không ạ? Chiều em qua lấy nhé!',
                  targetUrl: '/chat',
                });
                showToast('🚀 Đã bắn thông báo Push ra góc màn hình máy tính!');
              }}
              className="gap-1.5 rounded-xl border-orange-200 bg-orange-50 text-xs font-bold text-fpt-orange hover:bg-orange-100 cursor-pointer shadow-2xs"
              title="Bấm để thử hiển thị thông báo góc dưới bên phải màn hình máy tính"
            >
              <Volume2 className="h-4 w-4" />
              <span>Test Push Desktop</span>
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  markAllAsRead();
                  showToast('Đã đánh dấu đọc tất cả thông báo');
                }}
                className="gap-1.5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>Đã đọc tất cả ({unreadCount})</span>
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearAll();
                  showToast('Đã làm trống hộp thư thông báo');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Tất cả', count: notifications.length },
            { key: 'unread', label: 'Chưa đọc', count: unreadCount },
            { key: 'CHAT', label: 'Tin nhắn mua bán', count: notifications.filter((n) => n.type === 'CHAT').length },
            { key: 'KYC', label: 'Duyệt Thẻ SV / KYC', count: notifications.filter((n) => n.type === 'KYC').length },
            { key: 'ORDER', label: 'Đơn hàng', count: notifications.filter((n) => n.type === 'ORDER').length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0',
                activeTab === tab.key
                  ? 'bg-fpt-orange text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-slate-200 p-12 text-center bg-white space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Không có thông báo nào</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Hiện không có thông báo thuộc danh mục này. Khi có người nhắn tin hoặc kết quả duyệt thẻ SV, bạn sẽ thấy thông báo tại đây.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl mt-2">
                <Link href="/">Quay về trang chủ</Link>
              </Button>
            </Card>
          ) : (
            filteredNotifications.map((item) => (
              <Card
                key={item.id}
                onClick={() => handleAction(item)}
                className={cn(
                  'group relative rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start',
                  !item.isRead && 'bg-orange-50/20 border-orange-200/80 ring-1 ring-orange-200/40'
                )}
              >
                {/* Icon */}
                {getIcon(item.type)}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          'text-sm',
                          !item.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'
                        )}
                      >
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-black text-white">
                          MỚI
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{item.createdAt}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.body}
                  </p>

                  {/* KYC Feedback details if rejected */}
                  {item.adminFeedback && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-900">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>Ban Quản Trị FPT phản hồi chi tiết:</span>
                      </div>
                      <p className="text-rose-800 leading-relaxed font-medium pl-5">
                        "{item.adminFeedback}"
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      {item.actionText && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(item);
                          }}
                          className={cn(
                            'gap-1.5 rounded-xl text-xs font-bold h-auto py-2 px-3.5 shadow-2xs cursor-pointer',
                            item.type === 'KYC'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : item.type === 'CHAT'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          )}
                        >
                          {item.type === 'KYC' && <FileEdit className="h-3.5 w-3.5" />}
                          {item.type === 'CHAT' && <MessageSquare className="h-3.5 w-3.5" />}
                          {item.type === 'ORDER' && <ExternalLink className="h-3.5 w-3.5" />}
                          <span>{item.actionText}</span>
                        </Button>
                      )}

                      {item.type === 'CHAT' && (
                        <Link
                          href="/chat"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                        >
                          <span>Mở hộp thư chat</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                        showToast('Đã xóa thông báo');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
