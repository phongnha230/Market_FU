'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import OrderTabs from '@/components/orders/OrderTabs';
import OrderCard from '@/components/orders/OrderCard';
import OrderTrackingModal from '@/components/orders/OrderTrackingModal';
import OrderShipModal from '@/components/orders/OrderShipModal';
import OrderAiBotModal from '@/components/orders/OrderAiBotModal';
import OrderQrModal from '@/components/orders/OrderQrModal';
import OrderSidebar from '@/components/orders/OrderSidebar';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
import { useMarket } from '@/context/MarketContext';
import { useUserStore } from '@/stores/userStore';
import { OrderItem, useOrderStore } from '@/stores/orderStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { orderService } from '@/services/orderService';
import { ShieldCheck, MapPin, QrCode, Phone, Lock, Store } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, updateOrderStatus, products: allProducts, showToast } = useMarket();
  const userData = useUserStore((state) => state.user);
  const isSeller = userData.kycStatus === 'approved_seller';

  const [activeMainTab, setActiveMainTab] = useState<'buying' | 'selling' | 'listings' | 'handoff'>('buying');
  const [activeProgressFilter, setActiveProgressFilter] = useState<string>('shipping');

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState<OrderItem | null>(null);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<OrderItem | null>(null);
  const [selectedShipOrder, setSelectedShipOrder] = useState<OrderItem | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  useEffect(() => {
    const cleanupOrderSockets = useOrderStore.getState().initSocketListeners();
    const cleanupNotifSockets = useNotificationStore.getState().initSocketListeners();
    useOrderStore.getState().fetchOrders();
    useNotificationStore.getState().fetchNotifications();

    return () => {
      cleanupOrderSockets();
      cleanupNotifSockets();
    };
  }, []);

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const handleConfirmReceived = async (orderCode: string) => {
    try {
      await orderService.confirmDelivery(orderCode);
      updateOrderStatus(orderCode, 'delivered', 'Giao thành công tại sảnh KTX');
      showToast(`Đã xác nhận nhận hàng an toàn đơn ${orderCode} và giải ngân Escrow! Chuyển sang đánh giá...`, 'success');
      setTimeout(() => {
        router.push(`/orders/review?code=${encodeURIComponent(orderCode)}`);
      }, 1000);
    } catch {
      // Fallback update nếu offline hoặc mock
      updateOrderStatus(orderCode, 'delivered', 'Giao thành công tại sảnh KTX');
      showToast(`Đã xác nhận nhận hàng an toàn đơn ${orderCode}! Chuyển sang đánh giá...`, 'success');
      setTimeout(() => {
        router.push(`/orders/review?code=${encodeURIComponent(orderCode)}`);
      }, 1000);
    }
  };

  const handleCancelOrder = async (orderId: string, orderCode: string) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderCode}? Tiền cọc hoặc Xu sẽ được hoàn về tài khoản.`);
    if (!confirmed) return;

    try {
      await orderService.cancelOrder(orderId, 'Người mua yêu cầu hủy đơn');
    } catch {
      // offline fallback
    }

    updateOrderStatus(orderCode, 'processing', 'Đã hủy đơn hàng');
    showToast(`Đã hủy đơn hàng ${orderCode} thành công.`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between font-sans py-4 sm:py-6">
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Compact in-container Header with Back button */}
        <CompactHeader
          showBackButton={true}
          backHref="/"
          breadcrumbs={[
            { label: 'Quản lý đơn hàng' },
          ]}
        />

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
              isSeller={isSeller}
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
                  onClick={() => {
                    const handoffOrder = orders.find((o) => o.type === 'safe-handoff') || orders[0];
                    setSelectedQrOrder(handoffOrder || null);
                    setIsQrModalOpen(true);
                  }}
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
                    onOpenQrModal={(ord) => {
                      setSelectedQrOrder(ord);
                      setIsQrModalOpen(true);
                    }}
                    onCancelOrder={handleCancelOrder}
                    onShipOrder={(ord) => setSelectedShipOrder(ord)}
                  />
                ))}
              </div>
            )}

            {/* TAB 2: SELLING ORDERS NEED SHIPPING (SELLER ONLY) */}
            {activeMainTab === 'selling' && (
              !isSeller ? (
                <Card className="rounded-2xl border border-amber-200/80 bg-white p-8 sm:p-10 shadow-xs text-center space-y-5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-xs">
                    <Store className="h-7 w-7 text-fpt-orange" />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Tính năng dành riêng cho Người bán (Verified Seller)</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Đơn bán cần gửi & Quản lý đóng gói
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Bạn đang ở vai trò Sinh viên (Người mua). Vui lòng đăng ký xác thực Thẻ SV / Seller để tiếp nhận đơn đặt mua đồ, quản lý quy trình đóng gói và gửi hàng an toàn.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-1">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="text-base">📦</div>
                      <div className="text-xs font-bold text-slate-800">Đóng gói chuẩn FPT</div>
                      <div className="text-[11px] text-slate-500">Mã vận đơn liên campus</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="text-base">🤝</div>
                      <div className="text-xs font-bold text-slate-800">Handoff trực tiếp</div>
                      <div className="text-[11px] text-slate-500">Quét QR tại sảnh giảng đường</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="text-base">🛡️</div>
                      <div className="text-xs font-bold text-slate-800">Bảo chứng Escrow 48h</div>
                      <div className="text-[11px] text-slate-500">Tiền về ví an toàn tuyệt đối</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    <Button
                      type="button"
                      onClick={() => setIsKycModalOpen(true)}
                      className="w-full sm:w-auto h-auto rounded-xl bg-fpt-orange px-6 py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <Store className="h-4 w-4 mr-1.5" />
                      <span>Đăng ký mở Seller ngay</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveMainTab('buying')}
                      className="w-full sm:w-auto h-auto rounded-xl border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <span>← Quay lại Đơn mua của tôi</span>
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                      Bạn chưa có đơn bán nào cần đóng gói hoặc gửi hàng.
                    </div>
                  ) : (
                    orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onConfirmReceived={handleConfirmReceived}
                        onOpenTracking={(ord) => setSelectedTrackingOrder(ord)}
                        onOpenAiBot={() => setIsAiBotOpen(true)}
                        onOpenQrModal={(ord) => {
                          setSelectedQrOrder(ord);
                          setIsQrModalOpen(true);
                        }}
                        onCancelOrder={handleCancelOrder}
                        onShipOrder={(ord) => setSelectedShipOrder(ord)}
                      />
                    ))
                  )}
                </div>
              )
            )}

            {/* TAB 3: LISTINGS / SELLING (SELLER ONLY) */}
            {activeMainTab === 'listings' && (
              !isSeller ? (
                <Card className="rounded-2xl border border-amber-200/80 bg-white p-8 sm:p-10 shadow-xs text-center space-y-5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-xs">
                    <Store className="h-7 w-7 text-fpt-orange" />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Tính năng dành riêng cho Người bán (Verified Seller)</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Quản lý Tin đăng rao bán đồ cũ
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Bạn đang ở vai trò Sinh viên (Người mua). Vui lòng đăng ký xác thực Thẻ SV / Seller để mở quyền đăng bài không giới hạn và tiếp cận 20.000+ sinh viên FPT 5Campus.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-1">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="text-base">📑</div>
                      <div className="text-xs font-bold text-slate-800">Đăng tin không giới hạn</div>
                      <div className="text-[11px] text-slate-500">Giáo trình, IT, phòng KTX</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="text-base">⚡</div>
                      <div className="text-xs font-bold text-slate-800">Đẩy tin ưu tiên</div>
                      <div className="text-[11px] text-slate-500">Tiếp cận nhanh chóng qua Coin</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="text-base">⭐</div>
                      <div className="text-xs font-bold text-slate-800">Huy hiệu Seller Uy Tín</div>
                      <div className="text-[11px] text-slate-500">Xây dựng uy tín cộng đồng SV</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    <Button
                      type="button"
                      onClick={() => setIsKycModalOpen(true)}
                      className="w-full sm:w-auto h-auto rounded-xl bg-fpt-orange px-6 py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <Store className="h-4 w-4 mr-1.5" />
                      <span>Đăng ký mở Seller ngay</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveMainTab('buying')}
                      className="w-full sm:w-auto h-auto rounded-xl border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <span>← Quay lại Đơn mua của tôi</span>
                    </Button>
                  </div>
                </Card>
              ) : (
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
                              <Image
                                src={typeof prod.imageUrl === 'string' && prod.imageUrl ? prod.imageUrl : ((prod.imageUrl as any)?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80')}
                                alt={prod.title}
                                fill
                                className="object-cover"
                              />
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
              )
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
          <OrderSidebar
            onOpenAiBot={() => setIsAiBotOpen(true)}
            isSeller={isSeller}
            onOpenKyc={() => setIsKycModalOpen(true)}
          />
        </div>
      </main>

      {/* MODALS */}
      <OrderQrModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setSelectedQrOrder(null);
        }}
        order={selectedQrOrder}
        onSuccess={() => {
          showToast('Xác thực bàn giao Safe Handoff thành công! +2 Điểm Uy Tín.', 'success');
        }}
      />
      <OrderAiBotModal
        isOpen={isAiBotOpen}
        onClose={() => setIsAiBotOpen(false)}
        onShowToast={(msg) => showToast(msg, 'info')}
      />
      <OrderTrackingModal
        order={selectedTrackingOrder}
        onClose={() => setSelectedTrackingOrder(null)}
      />
      <OrderShipModal
        order={selectedShipOrder}
        onClose={() => setSelectedShipOrder(null)}
        onSuccess={(orderId, trackingCode) => {
          showToast(`📦 Đã cập nhật mã vận đơn "${trackingCode}" thành công! Đơn hàng chuyển sang Đang vận chuyển.`, 'success');
          useOrderStore.getState().fetchOrders();
        }}
      />
      <KycRegistrationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        defaultRole="seller"
        onShowToast={(msg) => showToast(msg, 'success')}
      />

      <Footer />
    </div>
  );
}
