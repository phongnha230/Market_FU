import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'FU Second-hand Market | Sàn đồ cũ sinh viên FPT',
  description: 'Nền tảng mua bán trao đổi đồ cũ uy tín cho sinh viên Đại học FPT',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Chống lỗi Hydration Mismatch & crash từ Extension trình duyệt (Bitdefender: bis_skin_checked, Urban VPN: M_ID, IDM, ColorZilla...) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 1. Dọn dẹp & xóa thuộc tính tự chèn (bis_skin_checked, bis_register, cz-shortcut-listen...)
                  var EXT_ATTRS = ['bis_skin_checked', 'bis_register', 'cz-shortcut-listen'];
                  
                  var cleanNode = function(el) {
                    if (!el || el.nodeType !== 1) return;
                    for (var i = 0; i < EXT_ATTRS.length; i++) {
                      if (el.hasAttribute(EXT_ATTRS[i])) {
                        el.removeAttribute(EXT_ATTRS[i]);
                      }
                    }
                  };

                  if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes') {
                          if (EXT_ATTRS.indexOf(m.attributeName) !== -1) {
                            m.target.removeAttribute(m.attributeName);
                          }
                        } else if (m.type === 'childList') {
                          for (var j = 0; j < m.addedNodes.length; j++) {
                            var node = m.addedNodes[j];
                            if (node.nodeType === 1) {
                              cleanNode(node);
                              var matches = node.querySelectorAll ? node.querySelectorAll('[bis_skin_checked], [bis_register], [cz-shortcut-listen]') : [];
                              for (var k = 0; k < matches.length; k++) {
                                cleanNode(matches[k]);
                              }
                            }
                          }
                        }
                      }
                    });

                    if (document.documentElement) {
                      observer.observe(document.documentElement, {
                        attributes: true,
                        attributeFilter: EXT_ATTRS,
                        childList: true,
                        subtree: true
                      });
                    }
                  }

                  // 2. Chặn Next.js Dev Error Overlay bắt các lỗi từ Extension Chrome hoặc hydration do extension
                  var origError = console.error;
                  var origWarn = console.warn;

                  var isExtensionMsg = function(args) {
                    for (var i = 0; i < args.length; i++) {
                      var arg = args[i];
                      var str = '';
                      if (typeof arg === 'string') {
                        str = arg;
                      } else if (arg && typeof arg === 'object') {
                        str = (arg.message || '') + ' ' + (arg.stack || '') + ' ' + (arg.componentStack || '');
                      }
                      str = str.toLowerCase();
                      if (
                        str.indexOf('bis_skin_checked') !== -1 ||
                        str.indexOf('bis_register') !== -1 ||
                        str.indexOf('cz-shortcut-listen') !== -1 ||
                        str.indexOf('chrome-extension://') !== -1 ||
                        str.indexOf('m_id') !== -1 ||
                        str.indexOf('200.js') !== -1
                      ) {
                        return true;
                      }
                    }
                    return false;
                  };

                  console.error = function() {
                    if (isExtensionMsg(arguments)) return;
                    return origError.apply(console, arguments);
                  };

                  console.warn = function() {
                    if (isExtensionMsg(arguments)) return;
                    return origWarn.apply(console, arguments);
                  };

                  // 3. Chặn các uncaught exception từ runtime extension
                  window.addEventListener('error', function(e) {
                    var file = (e.filename || '').toLowerCase();
                    var stack = (e.error && e.error.stack || '').toLowerCase();
                    var msg = (e.message || '').toLowerCase();
                    if (
                      file.indexOf('chrome-extension://') !== -1 ||
                      stack.indexOf('chrome-extension://') !== -1 ||
                      msg.indexOf('m_id') !== -1 ||
                      stack.indexOf('200.js') !== -1 ||
                      msg.indexOf('bis_skin_checked') !== -1 ||
                      msg.indexOf('bis_register') !== -1
                    ) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                      return true;
                    }
                  }, true);

                  window.addEventListener('unhandledrejection', function(e) {
                    var reason = String(e.reason && e.reason.stack || e.reason || '').toLowerCase();
                    if (
                      reason.indexOf('chrome-extension://') !== -1 ||
                      reason.indexOf('m_id') !== -1 ||
                      reason.indexOf('200.js') !== -1 ||
                      reason.indexOf('bis_skin_checked') !== -1
                    ) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                    }
                  }, true);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
