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
import OrderPaymentModal from '@/components/orders/OrderPaymentModal';
import ReviewDetailModal from '@/components/orders/ReviewDetailModal';
import OrderSidebar from '@/components/orders/OrderSidebar';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
import { useMarket } from '@/context/MarketContext';
import { useUserStore } from '@/stores/userStore';
import { OrderItem, useOrderStore } from '@/stores/orderStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { ShieldCheck, MapPin, QrCode, Phone, Lock, Store, Edit3, Loader2 } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { orderService } from '@/services/orderService';
import { ProductService } from '@/services/productService';
import { ProductItem } from '@/types/product';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, updateOrderStatus, products: allProducts, showToast } = useMarket();
  const userData = useUserStore((state) => state.user);

  // Phân tách chuẩn xác Đơn Mua vs Đơn Bán theo định danh user
  const buyingOrders = React.useMemo(() => {
    return orders.filter((o) => {
      if (userData?.id && o.buyerId && o.sellerId) {
        return o.buyerId === userData.id;
      }
      return o.sellerId !== userData?.id;
    });
  }, [orders, userData?.id]);

  const sellingOrders = React.useMemo(() => {
    return orders.filter((o) => {
      if (userData?.id && o.sellerId) {
        return o.sellerId === userData.id;
      }
      return false;
    });
  }, [orders, userData?.id]);

  const isSeller =
    userData.role === 'SELLER' ||
    userData.role === 'ADMIN' ||
    userData.kycStatus === 'approved_seller';

  // Lấy mã sinh viên chính xác từ hồ sơ tài khoản hiện tại
  const currentStudentId =
    userData?.studentId ||
    userData?.email?.match(/([a-zA-Z]{2}\d{6})/i)?.[1]?.toUpperCase() ||
    'Chưa cập nhật';

  // Lịch hẹn Safe-Handoff còn hiệu lực (chỉ lấy đơn đang tiến hành, loại bỏ đơn đã hủy hoặc khiếu nại)
  const urgentHandoffOrder = React.useMemo(() => {
    return orders.find(
      (o) =>
        o.type === 'safe-handoff' &&
        o.status !== 'completed' &&
        o.status !== 'cancelled' &&
        o.status !== 'disputed'
    );
  }, [orders]);

  const [activeMainTab, setActiveMainTab] = useState<'buying' | 'selling' | 'listings' | 'handoff'>('buying');
  const [activeProgressFilter, setActiveProgressFilter] = useState<string>('all');

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState<OrderItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<OrderItem | null>(null);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<OrderItem | null>(null);
  const [selectedShipOrder, setSelectedShipOrder] = useState<OrderItem | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<OrderItem | null>(null);

  // Lấy tập đơn hàng tương ứng với Tab chính đang chọn (Đơn mua hay Đơn bán)
  const currentTabOrders = React.useMemo(() => {
    return activeMainTab === 'selling' ? sellingOrders : buyingOrders;
  }, [activeMainTab, sellingOrders, buyingOrders]);

  // Thống kê số lượng đơn theo tiến trình đồng bộ theo Tab đang mở
  const filterCounts = React.useMemo(() => {
    return {
      qr: currentTabOrders.filter((o) => (o.payment && !o.payment.isPaid) || (o.type === 'safe-handoff' && o.status !== 'completed')).length,
      packing: currentTabOrders.filter((o) => o.status === 'processing').length,
      shipping: currentTabOrders.filter((o) => o.status === 'shipping').length,
      inspecting: currentTabOrders.filter((o) => o.status === 'delivered').length,
      delivered: currentTabOrders.filter((o) => o.status === 'delivered' || o.status === 'completed').length,
      disputed: currentTabOrders.filter((o) => o.status === 'disputed').length,
    };
  }, [currentTabOrders]);

  // Lọc đơn mua theo tiến trình
  const filteredBuyingOrders = React.useMemo(() => {
    if (activeProgressFilter === 'all') return buyingOrders;
    if (activeProgressFilter === 'qr') {
      return buyingOrders.filter(
        (o) => (o.payment && !o.payment.isPaid) || (o.type === 'safe-handoff' && o.status !== 'completed')
      );
    }
    if (activeProgressFilter === 'packing') {
      return buyingOrders.filter((o) => o.status === 'processing');
    }
    if (activeProgressFilter === 'shipping') {
      return buyingOrders.filter((o) => o.status === 'shipping');
    }
    if (activeProgressFilter === 'inspecting') {
      return buyingOrders.filter((o) => o.status === 'delivered');
    }
    if (activeProgressFilter === 'delivered') {
      return buyingOrders.filter((o) => o.status === 'delivered' || o.status === 'completed');
    }
    if (activeProgressFilter === 'disputed') {
      return buyingOrders.filter((o) => o.status === 'disputed');
    }
    return buyingOrders;
  }, [buyingOrders, activeProgressFilter]);

  // Lọc đơn bán theo tiến trình
  const filteredSellingOrders = React.useMemo(() => {
    if (activeProgressFilter === 'all') return sellingOrders;
    if (activeProgressFilter === 'qr') {
      return sellingOrders.filter(
        (o) => (o.payment && !o.payment.isPaid) || (o.type === 'safe-handoff' && o.status !== 'completed')
      );
    }
    if (activeProgressFilter === 'packing') {
      return sellingOrders.filter((o) => o.status === 'processing');
    }
    if (activeProgressFilter === 'shipping') {
      return sellingOrders.filter((o) => o.status === 'shipping');
    }
    if (activeProgressFilter === 'inspecting') {
      return sellingOrders.filter((o) => o.status === 'delivered');
    }
    if (activeProgressFilter === 'delivered') {
      return sellingOrders.filter((o) => o.status === 'delivered' || o.status === 'completed');
    }
    if (activeProgressFilter === 'disputed') {
      return sellingOrders.filter((o) => o.status === 'disputed');
    }
    return sellingOrders;
  }, [sellingOrders, activeProgressFilter]);

  // Danh sách tin đăng bán của Seller
  const [myProducts, setMyProducts] = useState<ProductItem[]>([]);
  const [isLoadingMyProducts, setIsLoadingMyProducts] = useState(false);

  useEffect(() => {
    if (isSeller) {
      setIsLoadingMyProducts(true);
      ProductService.getMyProducts()
        .then((items) => {
          setMyProducts(items);
        })
        .catch(() => {
          // Fallback nếu offline
          if (userData?.id) {
            setMyProducts(allProducts.filter((p) => p.seller.id === userData.id));
          }
        })
        .finally(() => {
          setIsLoadingMyProducts(false);
        });
    }
  }, [isSeller, userData?.id]);

  // Thống kê doanh thu & bán hàng của Seller
  const [sellerAnalytics, setSellerAnalytics] = useState<any>(null);

  useEffect(() => {
    if (isSeller) {
      orderService
        .getSellerAnalytics()
        .then((data) => {
          if (data) setSellerAnalytics(data);
        })
        .catch(() => {});
    }
  }, [isSeller]);

  const totalRevenue = sellerAnalytics?.totalRevenue ?? sellingOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.product?.price || 0), 0);

  const pendingEscrow = sellerAnalytics?.pendingEscrow ?? sellingOrders
    .filter((o) => o.status !== 'completed' && (o.status as string) !== 'cancelled')
    .reduce((sum, o) => sum + (o.product?.price || 0), 0);

  const completedCount = sellerAnalytics?.counts?.completed ?? sellingOrders.filter((o) => o.status === 'completed').length;
  const shippingCount = sellerAnalytics?.counts?.shipping ?? sellingOrders.filter((o) => o.status === 'shipping' || o.status === 'delivered').length;
  const processingCount = sellerAnalytics?.counts?.processing ?? sellingOrders.filter((o) => o.status === 'processing').length;

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
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xác nhận nhận hàng lúc này. Vui lòng thử lại!';
      showToast(`❌ ${msg}`, 'error');
    }
  };

  const handleCancelOrder = async (orderId: string, orderCode: string) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderCode}? Tiền cọc hoặc Xu sẽ được hoàn về tài khoản.`);
    if (!confirmed) return;

    try {
      await orderService.cancelOrder(orderId, 'Người mua yêu cầu hủy đơn');
      updateOrderStatus(orderCode, 'processing', 'Đã hủy đơn hàng');
      showToast(`Đã hủy đơn hàng ${orderCode} thành công.`, 'info');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể hủy đơn hàng lúc này. Vui lòng thử lại!';
      showToast(`❌ ${msg}`, 'error');
    }
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
              Mã SV: <strong className="text-slate-800 font-bold">{currentStudentId}</strong>
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
              onMainTabChange={(tab) => {
                setActiveMainTab(tab);
                setActiveProgressFilter('all');
              }}
              activeProgressFilter={activeProgressFilter}
              onProgressFilterChange={setActiveProgressFilter}
              ordersCount={activeMainTab === 'selling' ? sellingOrders.length : buyingOrders.length}
              sellingCount={sellingOrders.length}
              listingsCount={myProducts.length}
              handoffCount={orders.filter((o) => o.type === 'safe-handoff' && o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'disputed').length}
              isSeller={isSeller}
              filterCounts={filterCounts}
            />

            {/* URGENT SAFE-HANDOFF APPOINTMENT BANNER (Chỉ hiện khi có lịch hẹn thực tế chưa hoàn thành) */}
            {urgentHandoffOrder && (
              <Card className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="rounded bg-emerald-200/80 text-emerald-900 px-2 py-0.5 text-[10px] font-extrabold uppercase border-none hover:bg-emerald-200/80">
                        {urgentHandoffOrder.appointmentTime
                          ? `Hẹn: ${new Date(urgentHandoffOrder.appointmentTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`
                          : urgentHandoffOrder.timeLabel || 'LỊCH HẸN GIAO NHẬN'}
                      </Badge>
                      <span className="font-extrabold text-sm text-slate-900">
                        Lịch hẹn Safe-Handoff: {urgentHandoffOrder.product.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-tight">
                      Giao nhận với sinh viên{' '}
                      <strong>
                        {urgentHandoffOrder.product.seller?.name || 'Đối tác'}
                        {urgentHandoffOrder.product.seller?.cohortCampus
                          ? ` (${urgentHandoffOrder.product.seller.cohortCampus})`
                          : ''}
                      </strong>{' '}
                      cho món đồ{' '}
                      <strong>{urgentHandoffOrder.product.title}</strong>
                      {urgentHandoffOrder.meetupLocation || urgentHandoffOrder.tracking?.currentLocation
                        ? ` tại ${urgentHandoffOrder.meetupLocation || urgentHandoffOrder.tracking?.currentLocation}`
                        : ''}
                      . Khu vực có Camera giám sát an ninh và bàn test thiết bị trực tiếp.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedQrOrder(urgentHandoffOrder);
                      setIsQrModalOpen(true);
                    }}
                    className="h-auto inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-xs transition cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5 text-fpt-orange" />
                    <span>Mở mã QR Điểm Hẹn</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      showToast(
                        `Đang kết nối liên lạc bảo mật đến bạn ${urgentHandoffOrder.product.seller?.name || 'đối tác'}...`,
                        'info'
                      )
                    }
                    className="h-auto rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-700 transition cursor-pointer"
                    title="Gọi điện bảo mật"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* DYNAMIC ORDERS LIST FOR BUYING TAB */}
            {activeMainTab === 'buying' && (
              <div className="space-y-4">
                {buyingOrders.length === 0 ? (
                  <Card className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-xs text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700">Bạn chưa có đơn mua nào.</p>
                    <p>Hãy dạo quanh chợ sinh viên FPT để tìm giáo trình, đồ công nghệ hoặc đồ dùng KTX ưng ý!</p>
                  </Card>
                ) : filteredBuyingOrders.length === 0 ? (
                  <Card className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-xs text-slate-500 space-y-3">
                    <p className="font-semibold text-slate-700">Không tìm thấy đơn hàng nào ở trạng thái này.</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveProgressFilter('all')}
                      className="rounded-xl border-slate-200 text-slate-700 text-xs px-4 py-1.5"
                    >
                      Xem tất cả ({buyingOrders.length} đơn)
                    </Button>
                  </Card>
                ) : (
                  filteredBuyingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      currentUserId={userData?.id}
                      viewerRole="buyer"
                      onConfirmReceived={handleConfirmReceived}
                      onOpenTracking={(ord) => setSelectedTrackingOrder(ord)}
                      onOpenAiBot={() => setIsAiBotOpen(true)}
                      onOpenQrModal={(ord) => {
                        setSelectedQrOrder(ord);
                        setIsQrModalOpen(true);
                      }}
                      onOpenPaymentModal={(ord) => {
                        setSelectedPaymentOrder(ord);
                        setIsPaymentModalOpen(true);
                      }}
                      onCancelOrder={handleCancelOrder}
                      onShipOrder={(ord) => setSelectedShipOrder(ord)}
                      onOpenReviewDetail={(ord) => {
                        setSelectedReviewOrder(ord);
                        setIsReviewModalOpen(true);
                      }}
                    />
                  ))
                )}
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
                  {/* BẢNG THỐNG KÊ DOANH THU & QUẢN LÝ BÁN HÀNG CỦA SELLER */}
                  <Card className="rounded-2xl border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-orange-50/20 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                            Trung tâm Doanh thu & Bán hàng Sinh viên
                          </h3>
                          <p className="text-xs text-slate-500">
                            Theo dõi dòng tiền Escrow, doanh thu đã quyết toán và tình trạng xử lý đơn hàng
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold px-3 py-1 self-start sm:self-auto">
                        🛡️ Quỹ Escrow 100% An toàn
                      </Badge>
                    </div>

                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* 1. Tổng doanh thu */}
                      <div className="rounded-xl bg-white border border-slate-200 p-3.5 shadow-2xs space-y-1">
                        <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                          <span>Doanh thu đã nhận</span>
                          <span className="text-emerald-600 font-bold">✓ Thực nhận</span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-slate-900">
                          {formatVND(totalRevenue)}
                        </div>
                        <p className="text-[10px] text-slate-400">Đã tất toán về ví của bạn</p>
                      </div>

                      {/* 2. Tiền giữ Escrow */}
                      <div className="rounded-xl bg-white border border-orange-200 p-3.5 shadow-2xs space-y-1">
                        <div className="text-[11px] font-semibold text-fpt-orange flex items-center justify-between">
                          <span>Đang giữ trong Escrow</span>
                          <span className="text-[10px] bg-orange-100 text-fpt-orange font-bold px-1.5 py-0.2 rounded">Tạm giữ</span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-fpt-orange">
                          {formatVND(pendingEscrow)}
                        </div>
                        <p className="text-[10px] text-slate-400">Giải ngân sau khi hoàn tất / 48h</p>
                      </div>

                      {/* 3. Đơn hoàn tất */}
                      <div className="rounded-xl bg-white border border-slate-200 p-3.5 shadow-2xs space-y-1">
                        <div className="text-[11px] font-semibold text-slate-500">Đơn hoàn tất thành công</div>
                        <div className="text-lg sm:text-xl font-black text-emerald-600">
                          {completedCount} <span className="text-xs text-slate-400 font-normal">/ {sellingOrders.length} đơn</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Tỷ lệ: {sellingOrders.length > 0 ? Math.round((completedCount / sellingOrders.length) * 100) : 100}%</p>
                      </div>

                      {/* 4. Đơn đang xử lý & giao */}
                      <div className="rounded-xl bg-white border border-slate-200 p-3.5 shadow-2xs space-y-1">
                        <div className="text-[11px] font-semibold text-slate-500">Cần gửi / Đang giao</div>
                        <div className="text-lg sm:text-xl font-black text-blue-600">
                          {processingCount + shippingCount} <span className="text-xs text-slate-400 font-normal">đơn</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{processingCount} chờ gửi • {shippingCount} đang ship</p>
                      </div>
                    </div>
                  </Card>

                  {sellingOrders.length === 0 ? (
                    <Card className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-xs text-slate-500 space-y-2">
                      <p className="font-semibold text-slate-700">Bạn chưa có đơn bán nào cần đóng gói hoặc gửi hàng.</p>
                      <p>Khi có bạn sinh viên khác đặt mua món đồ của bạn, đơn sẽ hiển thị tại đây.</p>
                    </Card>
                  ) : filteredSellingOrders.length === 0 ? (
                    <Card className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-xs text-slate-500 space-y-3">
                      <p className="font-semibold text-slate-700">Không tìm thấy đơn bán nào ở trạng thái này.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveProgressFilter('all')}
                        className="rounded-xl border-slate-200 text-slate-700 text-xs px-4 py-1.5 cursor-pointer"
                      >
                        Xem tất cả ({sellingOrders.length} đơn)
                      </Button>
                    </Card>
                  ) : (
                    filteredSellingOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        currentUserId={userData?.id}
                        viewerRole="seller"
                        onConfirmReceived={handleConfirmReceived}
                        onOpenTracking={(ord) => setSelectedTrackingOrder(ord)}
                        onOpenAiBot={() => setIsAiBotOpen(true)}
                        onOpenQrModal={(ord) => {
                          setSelectedQrOrder(ord);
                          setIsQrModalOpen(true);
                        }}
                        onCancelOrder={handleCancelOrder}
                        onShipOrder={(ord) => setSelectedShipOrder(ord)}
                        onOpenReviewDetail={(ord) => {
                          setSelectedReviewOrder(ord);
                          setIsReviewModalOpen(true);
                        }}
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

                    {isLoadingMyProducts ? (
                      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-fpt-orange" />
                        <span className="text-xs">Đang tải danh sách tin đăng bán của bạn...</span>
                      </div>
                    ) : myProducts.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Bạn chưa có tin đăng bán nào. Bấm &quot;+ Đăng bán món mới&quot; ở trên để đăng tin pass đồ nhé!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myProducts.map((prod) => {
                          const status = (prod as any).status || 'AVAILABLE';
                          return (
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
                                <div className="flex items-center gap-1.5 mb-1">
                                  {status === 'PENDING_APPROVAL' && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                                      ⏳ Chờ BQT duyệt
                                    </span>
                                  )}
                                  {status === 'AVAILABLE' && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                      ✅ Đang mở bán
                                    </span>
                                  )}
                                  {status === 'REJECTED' && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                                      🚫 Bị từ chối
                                    </span>
                                  )}
                                  {status === 'SOLD' && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                                      ✓ Đã bán
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{prod.title}</h4>
                                <p className="text-xs font-extrabold text-fpt-orange mt-0.5">{formatVND(prod.price)}</p>
                                <span className="text-[10px] text-slate-500">{prod.location}</span>
                              </div>
                              <div className="flex flex-col gap-1.5 shrink-0">
                                <Button
                                  asChild
                                  variant="outline"
                                  className="h-auto rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 transition"
                                >
                                  <Link href={`/posts/${prod.id}`}>
                                    Xem
                                  </Link>
                                </Button>
                                <Button
                                  asChild
                                  variant="outline"
                                  className="h-auto rounded-lg border border-orange-200 px-2.5 py-1 text-[11px] font-bold text-fpt-orange bg-orange-50/50 hover:bg-orange-100 transition flex items-center gap-1"
                                >
                                  <Link href={`/posts/${prod.id}/edit`}>
                                    <Edit3 className="h-3 w-3" />
                                    <span>Sửa</span>
                                  </Link>
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </div>
              )
            )}

            {/* TAB 4: SAFE-HANDOFF APPOINTMENTS TAB */}
            {activeMainTab === 'handoff' && (
              <div className="space-y-4">
                {orders.filter((o) => o.type === 'safe-handoff').length === 0 ? (
                  <Card className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-xs text-slate-500 space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-slate-700 text-sm">Hiện bạn chưa có lịch hẹn Safe-Handoff nào.</p>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Khi giao dịch chọn hình thức gặp trực tiếp tại điểm hẹn an toàn (Safe-Point) trong trường, lịch hẹn và mã QR xác thực sẽ hiển thị tại đây.
                    </p>
                  </Card>
                ) : (
                  orders
                    .filter((o) => o.type === 'safe-handoff')
                    .map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        currentUserId={userData?.id}
                        viewerRole={order.buyerId === userData?.id ? 'buyer' : 'seller'}
                        onConfirmReceived={handleConfirmReceived}
                        onOpenTracking={(ord) => setSelectedTrackingOrder(ord)}
                        onOpenAiBot={() => setIsAiBotOpen(true)}
                        onOpenQrModal={(ord) => {
                          setSelectedQrOrder(ord);
                          setIsQrModalOpen(true);
                        }}
                        onCancelOrder={handleCancelOrder}
                        onShipOrder={(ord) => setSelectedShipOrder(ord)}
                        onOpenReviewDetail={(ord) => {
                          setSelectedReviewOrder(ord);
                          setIsReviewModalOpen(true);
                        }}
                      />
                    ))
                )}
              </div>
            )}
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
        viewerRole={activeMainTab === 'selling' ? 'seller' : 'buyer'}
        onClose={() => setSelectedTrackingOrder(null)}
        onStatusUpdated={(status) => {
          showToast(`🛵 Bưu tá GHN đã phát hàng tới sảnh KTX (Trạng thái: ${status})! Kích hoạt 48h bao test cho người mua.`, 'success');
          useOrderStore.getState().fetchOrders();
        }}
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
      <OrderPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPaymentOrder(null);
        }}
        order={selectedPaymentOrder}
        onPaymentSuccess={() => {
          showToast('🎉 Xác nhận thanh toán Escrow thành công qua VietQR / PayOS!', 'success');
          useOrderStore.getState().fetchOrders();
        }}
      />
      <ReviewDetailModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedReviewOrder(null);
        }}
        order={selectedReviewOrder}
      />

      <Footer />
    </div>
  );
}
