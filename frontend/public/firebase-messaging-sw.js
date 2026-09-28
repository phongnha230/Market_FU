// Firebase Cloud Messaging & Web Push Service Worker for FPT 5Campus Marketplace

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Lắng nghe sự kiện Push từ máy chủ FCM hoặc WebPush
self.addEventListener('push', (event) => {
  let data = {
    title: 'FPT 5Campus Marketplace',
    body: 'Bạn có thông báo mới từ hệ thống!',
    targetUrl: '/',
    icon: '/fpt-5campus-logo.png',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data.title = payload.title || payload.notification?.title || data.title;
      data.body = payload.body || payload.notification?.body || data.body;
      data.targetUrl = payload.targetUrl || payload.data?.targetUrl || payload.data?.url || '/';
      data.icon = payload.icon || '/fpt-5campus-logo.png';
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/fpt-5campus-logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.targetUrl,
    },
    actions: [
      { action: 'open', title: 'Xem ngay' },
      { action: 'close', title: 'Bỏ qua' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Xử lý khi người dùng click vào thông báo Desktop ở góc màn hình
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Nếu có sẵn tab web thì focus vào tab đó và điều hướng
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.navigate) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Nếu chưa có tab nào thì mở tab mới
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
