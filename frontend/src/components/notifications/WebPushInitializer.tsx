'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Volume2 } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { webPushService, playNotificationChime } from '@/services/webPushService';
import { socketClient } from '@/services/socketClient';

const BANNER_DISMISS_KEY = 'marketfu_push_banner_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

export default function WebPushInitializer() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const currentUser = useUserStore((state) => state.user);

  const [showBanner, setShowBanner] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !webPushService.isSupported()) return;

    const currentPermission = webPushService.getPermissionState();

    if (currentPermission === 'granted') {
      // Đã cấp quyền: Tự động đồng bộ Push Subscription lên Backend
      webPushService.subscribeUser(false).catch(() => {});
    } else if (currentPermission === 'default') {
      // Chưa từng hỏi quyền: Kiểm tra xem gần đây đã bấm "Để sau" chưa
      const dismissedAt = localStorage.getItem(BANNER_DISMISS_KEY);
      const now = Date.now();
      if (!dismissedAt || now - Number(dismissedAt) > DISMISS_DURATION_MS) {
        // Trì hoãn 2.5s sau khi load trang mới hiện banner để không làm phiền người dùng
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn]);

  // Lắng nghe sự kiện Socket.io để phát chuông & hiển thị thông báo khi tab đang ở nền
  useEffect(() => {
    if (!isLoggedIn) return;

    // 1. Khi có thông báo đơn hàng / hệ thống mới
    const unsubNotification = socketClient.onNewNotification((noti: any) => {
      playNotificationChime();

      // Nếu người dùng đang thu nhỏ hoặc xem tab khác thì kích hoạt Desktop Notification
      if (typeof window !== 'undefined' && document.hidden && Notification.permission === 'granted') {
        try {
          const n = new Notification(noti.title || 'Market FU Thông báo', {
            body: noti.body || 'Bạn có thông báo mới từ hệ thống!',
            icon: '/fpt-5campus-logo.png',
            badge: '/fpt-5campus-logo.png',
            tag: `noti-${noti.id || Date.now()}`,
          });
          n.onclick = () => {
            window.focus();
            if (noti.targetUrl) {
              window.location.href = noti.targetUrl;
            }
            n.close();
          };
        } catch {}
      }
    });

    // 2. Khi có tin nhắn chat hoặc đề xuất giá mới
    const unsubMessage = socketClient.onReceiveMessage((msg: any) => {
      // Chỉ phát chuông nếu tin nhắn từ người khác gửi đến
      if (msg.senderId && msg.senderId !== currentUser.id) {
        playNotificationChime();

        if (typeof window !== 'undefined' && document.hidden && Notification.permission === 'granted') {
          try {
            const senderName = msg.sender?.profile?.fullName || msg.sender?.email || 'Người mua/bán';
            const bodyText = msg.type === 'OFFER_PRICE'
              ? `Đã gửi đề xuất mặc cả mới: ${Number(msg.content).toLocaleString('vi-VN')} đ`
              : msg.content || 'Đã gửi một tin nhắn mới cho bạn';

            const n = new Notification(`Tin nhắn từ ${senderName}`, {
              body: bodyText,
              icon: '/fpt-5campus-logo.png',
              badge: '/fpt-5campus-logo.png',
              tag: `chat-${msg.conversationId || Date.now()}`,
            });
            n.onclick = () => {
              window.focus();
              window.location.href = `/chat?id=${msg.conversationId}`;
              n.close();
            };
          } catch {}
        }
      }
    });

    return () => {
      unsubNotification();
      unsubMessage();
    };
  }, [isLoggedIn, currentUser.id]);

  const handleEnablePush = async () => {
    setIsSubscribing(true);
    try {
      const sub = await webPushService.subscribeUser(true);
      if (sub) {
        playNotificationChime();
        setJustEnabled(true);
        setShowBanner(false);
        setTimeout(() => setJustEnabled(false), 5000);
      } else {
        setShowBanner(false);
      }
    } catch {
      setShowBanner(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(BANNER_DISMISS_KEY, String(Date.now()));
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Toast thông báo đã kích hoạt thành công */}
      {justEnabled && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-4 py-3 text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold">Đã bật chuông & thông báo Web Push!</strong>
            <p className="text-emerald-100 text-[11px]">
              Bạn sẽ nhận được chuông báo khi có khách trả giá hoặc nhắn tin dù đã tắt tab.
            </p>
          </div>
        </div>
      )}

      {/* Floating Banner mời bật thông báo */}
      {showBanner && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-white p-4 shadow-2xl border border-orange-200/90 ring-1 ring-black/5 animate-in slide-in-from-bottom-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 tracking-tight">
                  Bật Thông Báo Trình Duyệt?
                </h4>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Đừng bỏ lỡ khi có sinh viên <strong>trả giá mặc cả</strong> hoặc <strong>gửi tin nhắn mua đồ</strong> ngay cả khi bạn đang tắt web hay dùng ứng dụng khác!
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={isSubscribing}
                  className="rounded-xl bg-fpt-orange hover:bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isSubscribing ? 'Đang kích hoạt...' : 'Bật chuông ngay'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
