import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'FU Second-hand Market | Sàn đồ cũ sinh viên FPT',
  description: 'Nền tảng mua bán trao đổi đồ cũ uy tín cho sinh viên Đại học FPT',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50" suppressHydrationWarning>
        {/* Chống lỗi Hydration Mismatch & crash từ Extension trình duyệt (Urban VPN: M_ID, Bitdefender: bis_skin_checked, IDM...) */}
        <Script
          id="anti-extension-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // 1. Chặn thuộc tính bis_skin_checked tự chèn gây lỗi Hydration
                var origSetAttr = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, val) {
                  if (name === 'bis_skin_checked') return;
                  return origSetAttr.apply(this, arguments);
                };

                // 2. Chặn Next.js Dev Error Overlay bắt các lỗi từ Extension Chrome (Urban VPN: M_ID, executors/200.js...)
                window.addEventListener('error', function(e) {
                  var file = (e.filename || '').toLowerCase();
                  var stack = (e.error && e.error.stack || '').toLowerCase();
                  var msg = (e.message || '').toLowerCase();
                  if (
                    file.indexOf('chrome-extension://') !== -1 ||
                    stack.indexOf('chrome-extension://') !== -1 ||
                    msg.indexOf('m_id') !== -1 ||
                    stack.indexOf('200.js') !== -1 ||
                    msg.indexOf('bis_skin_checked') !== -1
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var reason = String(e.reason && e.reason.stack || e.reason || '');
                  if (
                    reason.indexOf('chrome-extension://') !== -1 ||
                    reason.indexOf('M_ID') !== -1 ||
                    reason.indexOf('200.js') !== -1
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              } catch(e) {}
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
