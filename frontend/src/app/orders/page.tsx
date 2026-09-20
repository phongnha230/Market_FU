'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderTabs from '@/components/orders/OrderTabs';
import OrderCard from '@/components/orders/OrderCard';
import OrderTrackingModal from '@/components/orders/OrderTrackingModal';
import OrderAiBotModal from '@/components/orders/OrderAiBotModal';
import OrderQrModal from '@/components/orders/OrderQrModal';
import OrderSidebar from '@/components/orders/OrderSidebar';
import { useMarket } from '@/context/MarketContext';
import { OrderItem } from '@/stores/orderStore';
import { ShieldCheck, MapPin, QrCode, Phone } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, updateOrderStatus, products: allProducts, showToast } = useMarket();

  const [activeMainTab, setActiveMainTab] = useState<'buying' | 'selling' | 'listings' | 'handoff'>('buying');
  const [activeProgressFilter, setActiveProgressFilter] = useState<string>('shipping');

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<OrderItem | null>(null);

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const handleConfirmReceived = (orderCode: string) => {
    updateOrderStatus(orderCode, 'delivered', 'Giao thành công tại sảnh KTX');
    showToast(`Đã xác nhận nhận hàng an toàn đơn ${orderCode}! Chuyển sang biểu mẫu đánh giá...`, 'success');
    setTimeout(() => {
      router.push(`/orders/review?code=${encodeURIComponent(orderCode)}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* 1. TOP HEADER BANNER */}
        <Card className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 sm:px-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2.5 text-fpt-orange shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-fpt-orange">
                  FPT STUDENT IDENTITY SHIELD
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] text-slate-500">SSO Xác thực theo thời gian thực</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Đơn hàng
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant="outline" className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50">
              ESCROW 48H ACTIVE
            </Badge>
            <span className="text-xs text-slate-500 font-medium">
              Mã SV: <strong>HE172819</strong>
            </span>
          </div>
        </Card>

        {/* 2. MAIN ORDERS CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAIN COLUMN: TABS & ORDER CARDS (9 COLS) */}
          <div className="lg:col-span-9 space-y-5">
            {/* Tabs */}
            <OrderTabs
              activeMainTab={activeMainTab}
              onMainTabChange={setActiveMainTab}
              activeProgressFilter={activeProgressFilter}
              onProgressFilterChange={setActiveProgressFilter}
              ordersCount={orders.length}
            />

            {/* URGENT SAFE-HANDOFF APPOINTMENT BANNER */}
            <Card className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="rounded bg-emerald-200/80 text-emerald-900 px-2 py-0.5 text-[10px] font-extrabold uppercase border-none hover:bg-emerald-200/80">
                      HÔM NAY • 16:30
                    </Badge>
                    <span className="font-extrabold text-sm text-slate-900">
                      Lịch hẹn Safe-Handoff tại Sảnh Tòa Alpha
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-tight">
                    Gặp sinh viên <strong>Hoàng Long (HE180293)</strong> để nhận Ram DDR4 16GB. Khu vực có Camera giám sát an ninh và bàn test thiết bị của CLB IT.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsQrModalOpen(true)}
                  className="h-auto inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-xs transition cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5 text-fpt-orange" />
                  <span>Mở mã QR Điểm Hẹn</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => showToast('Đang kết nối tổng đài bảo mật nội bộ đến bạn Hoàng Long...', 'info')}
                  className="h-auto rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-700 transition cursor-pointer"
                  title="Gọi điện bảo mật"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* DYNAMIC ORDERS LIST FOR BUYING TAB */}
            {activeMainTab === 'buying' && (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onConfirmReceived={handleConfirmReceived}
                    onOpenTracking={(ord) => setSelectedTrackingOrder(ord)}
                    onOpenAiBot={() => setIsAiBotOpen(true)}
                  />
                ))}
              </div>
            )}

            {/* TAB 3: LISTINGS / SELLING */}
            {activeMainTab === 'listings' && (
              <div className="space-y-4">
                <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Tin đăng bán của bạn</h3>
                      <p className="text-xs text-slate-500">Các món đồ đang hiển thị trên kênh sinh viên FPT 5Campus</p>
                    </div>
                    <Button
                      asChild
                      className="h-auto rounded-xl bg-fpt-orange px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition"
                    >
                      <Link href="/create-post">
                        + Đăng bán món mới
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allProducts
                      .filter((p) => p.seller.name.includes('Quân') || p.id.startsWith('fpt-post-'))
                      .map((prod) => (
                        <Card key={prod.id} className="flex flex-row items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition shadow-none">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                            <Image src={prod.imageUrl} alt={prod.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{prod.title}</h4>
                            <p className="text-xs font-extrabold text-fpt-orange mt-0.5">{formatVND(prod.price)}</p>
                            <span className="text-[10px] text-slate-500">{prod.location}</span>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            className="h-auto rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 transition"
                          >
                            <Link href={`/posts/${prod.id}`}>
                              Xem
                            </Link>
                          </Button>
                        </Card>
                      ))}
                  </div>
                </Card>
              </div>
            )}

            {/* SAFE-POINTS DIRECTORY FOOTER BAR */}
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:px-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-600 shrink-0">
                  <MapPin className="h-5 w-5 text-fpt-orange" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    Cần hỗ trợ giao nhận trực tiếp tại cơ sở?
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bàn điều phối Sinh Viên có mặt tại 5 Thư viện Campus từ 08:00 - 21:00 hàng ngày.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => showToast('Safe-Points: Tòa Alpha, Thư viện Gamma, Dom E & Dom A (Hola), Q.9 (HCM), Tòa F (Đà Nẵng)', 'info')}
                className="h-auto shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Xem danh sách Safe-Points 5 Campus
              </Button>
            </Card>
          </div>

          {/* SIDEBAR: ASSISTANT & PROTECTION (3 COLS) */}
          <OrderSidebar onOpenAiBot={() => setIsAiBotOpen(true)} />
        </div>
      </main>

      {/* MODALS */}
      <OrderQrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <OrderAiBotModal
        isOpen={isAiBotOpen}
        onClose={() => setIsAiBotOpen(false)}
        onShowToast={(msg) => showToast(msg, 'info')}
      />
      <OrderTrackingModal
        order={selectedTrackingOrder}
        onClose={() => setSelectedTrackingOrder(null)}
      />

      <Footer />
    </div>
  );
}
