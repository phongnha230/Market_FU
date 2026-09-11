import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="vi">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
