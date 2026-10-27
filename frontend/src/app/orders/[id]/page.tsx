'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import { useOrderStore, OrderItem } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { useMarket } from '@/context/MarketContext';
import { orderService } from '@/services/orderService';
import OrderAiBotModal from '@/components/orders/OrderAiBotModal';
import OrderQrModal from '@/components/orders/OrderQrModal';
import OrderPaymentModal from '@/components/orders/OrderPaymentModal';
import OrderShipModal from '@/components/orders/OrderShipModal';
import ReviewDetailModal from '@/components/orders/ReviewDetailModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  QrCode,
  Compass,
  ArrowRight,
  ArrowLeft,
  XCircle,
  RefreshCw,
  Bot,
  Copy,
  Star,
  ExternalLink,
  HelpCircle,
  Building2,
  Calendar,
  ScanLine,
  KeyRound,
  Check,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useMarket();
  const rawId = (params?.id as string) || '';
  const cleanCode = decodeURIComponent(rawId).replace(/^#/, '');

  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const getOrderFromStore = useOrderStore((state) => state.getOrder);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [backendOrderDetail, setBackendOrderDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [liveTracking, setLiveTracking] = useState<any>(null);
  const [syncingTracking, setSyncingTracking] = useState(false);

  // Modals state
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // 1. Tìm trong store trước
    const cached = getOrderFromStore(cleanCode);
    if (cached) {
      setOrder(cached);
      setLoading(false);
    }

    // 2. Tải dữ liệu chi tiết mới nhất từ API backend
    orderService
      .getOrderDetail(cleanCode)
      .then((detail) => {
        if (!isMounted || !detail) return;
        setBackendOrderDetail(detail);
        setOrder((prev) => {
          if (!prev) return prev;
          const statusMap: Record<string, any> = {
            PENDING: 'pending',
            PAID: 'processing',
            SHIPPING: 'shipping',
            DELIVERED: 'delivered',
            COMPLETED: 'completed',
            CANCELLED: 'cancelled',
            DISPUTED: 'disputed',
          };
          return {
            ...prev,
            status: statusMap[detail.status] || prev.status,
            appointmentTime: detail.appointmentTime || prev.appointmentTime,
            meetupLocation: detail.meetupLocation || prev.meetupLocation,
            handshake: detail.handshake || prev.handshake,
            buyer: detail.buyer ? {
              id: detail.buyer.id,
              fullName: detail.buyer.profile?.fullName || detail.buyer.email?.split('@')[0] || 'Sinh viên FPT',
              avatarUrl: detail.buyer.profile?.avatarUrl,
              campus: detail.buyer.profile?.campus || 'FPT Campus',
              email: detail.buyer.email,
            } : prev.buyer,
            seller: detail.seller ? {
              id: detail.seller.id,
              fullName: detail.seller.profile?.fullName || detail.seller.email?.split('@')[0] || 'Người bán FPT',
              avatarUrl: detail.seller.profile?.avatarUrl,
              campus: detail.seller.profile?.campus || 'FPT Campus',
              email: detail.seller.email,
            } : prev.seller,
          };
        });
      })
      .catch(() => {});

    orderService
      .getOrders()
      .then((res) => {
        if (!isMounted) return;
        if (res.orders && res.orders.length > 0) {
          useOrderStore.getState().fetchOrders().catch(() => {});
          const fresh = getOrderFromStore(cleanCode);
          if (fresh) setOrder(fresh);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // 3. Tải hành trình tracking chi tiết
    orderService
      .getOrderTracking(cleanCode)
      .then((tracking) => {
        if (isMounted && tracking) setLiveTracking(tracking);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [cleanCode]);

  const effectiveOtp =
    backendOrderDetail?.handshake?.handshakeOtp ||
    order?.handshake?.handshakeOtp ||
    (order?.id
      ? Math.abs(
          order.id.split('').reduce((acc: number, char: string) => acc * 31 + char.charCodeAt(0), 1234) % 9000 + 1000
        ).toString()
      : '4918');

  const effectiveToken =
    backendOrderDetail?.handshake?.handshakeToken ||
    order?.handshake?.handshakeToken ||
    'hs-token-fpt';

  const qrPayload = JSON.stringify({
    type: 'SAFE_HANDOFF',
    orderId: order?.id || cleanCode,
    orderCode: order?.code || `#${cleanCode}`,
    otp: effectiveOtp,
    token: effectiveToken,
    campus: 'FPT Hola Campus',
    verified: true,
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    qrPayload
  )}&margin=8&color=0f172a`;

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(effectiveOtp);
    setCopiedOtp(true);
    showToast('Đã sao chép mã OTP bàn giao!', 'success');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleCopyCode = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.code.replace('#', ''));
    setCopied(true);
    showToast('Đã sao chép mã đơn hàng vào bộ nhớ tạm!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const isSellerViewer =
    (Boolean(user?.id) && Boolean(order?.sellerId) && order?.sellerId === user?.id) ||
    (Boolean(user?.name) && Boolean(order?.product?.seller?.name) && order?.product?.seller?.name?.toLowerCase().includes(user?.name?.toLowerCase())) ||
    (Boolean(user?.email) && Boolean((order as any)?.seller?.email) && (order as any)?.seller?.email === user?.email);

  const handleConfirmReceived = async () => {
    if (!order) return;
    setIsConfirmingDelivery(true);
    try {
      await orderService.confirmDelivery(order.code.replace('#', ''));
      updateOrderStatus(order.code, 'completed', 'Đã nhận hàng thành công');
      setOrder((prev) => (prev ? { ...prev, status: 'completed', statusText: 'Đã nhận hàng thành công' } : null));
      showToast('🎉 Xác nhận nhận hàng an toàn thành công! Quỹ Escrow đã giải ngân tiền. Đang chuyển sang đánh giá...', 'success');
      setTimeout(() => {
        router.push(`/orders/review?code=${encodeURIComponent(cleanCode)}`);
      }, 1200);
    } catch {
      updateOrderStatus(order.code, 'completed', 'Đã nhận hàng thành công');
      setOrder((prev) => (prev ? { ...prev, status: 'completed', statusText: 'Đã nhận hàng thành công' } : null));
      showToast('✅ Đã xác nhận nhận hàng an toàn (Chế độ ngoại tuyến).', 'success');
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  const handleSellerConfirmOrder = async () => {
    if (!order) return;
    setIsConfirmingOrder(true);
    try {
      await orderService.confirmOrder(cleanCode);
      const isHandoff = order.type === 'safe-handoff' || (order as any).orderType === 'MEETUP';
      const newStatusText = isHandoff
        ? 'Đã chốt hẹn Safe-Point • Chờ bàn giao'
        : 'Đã nhận đơn • Chờ bàn giao bưu cục GHN';
      updateOrderStatus(order.code, 'shipping', newStatusText);
      setOrder((prev) => (prev ? { ...prev, status: 'shipping', statusText: newStatusText } : null));
      showToast(
        isHandoff
          ? '🎉 Đã chốt lịch hẹn Safe-Point thành công! Vui lòng có mặt đúng giờ để giao hàng.'
          : '🎉 Đã tiếp nhận đơn hàng thành công! Bạn hãy bấm [Bàn giao bưu cục GHN] để tạo vận đơn.',
        'success'
      );
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Không thể xác nhận đơn lúc này.', 'error');
    } finally {
      setIsConfirmingOrder(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    const isPaid = Boolean(order.payment?.isPaid);
    const confirmPrompt = isSellerViewer
      ? isPaid
        ? `Bạn có chắc chắn muốn TỪ CHỐI đơn hàng này không?\n\n💡 Người mua đã thanh toán cọc Escrow ${formatVND(order.product.price)}. Hệ thống sẽ tự động HOÀN TIỀN 100% về ví/tài khoản cho Người mua ngay lập tức.\n\nSản phẩm sẽ được tự động mở lại trạng thái Đang bán trên sàn.`
        : 'Bạn có chắc chắn muốn TỪ CHỐI lịch hẹn / đơn hàng này không? Sản phẩm sẽ được mở lại trạng thái Đang bán trên sàn.'
      : isPaid
      ? `Bạn có chắc chắn muốn HỦY đơn hàng này không?\n\n💡 Toàn bộ tiền cọc Escrow (${formatVND(order.product.price)}) và Xu của bạn sẽ được hoàn trả lại đầy đủ.`
      : 'Bạn có chắc chắn muốn hủy đơn hàng này không?';

    if (!confirm(confirmPrompt)) return;
    try {
      await orderService.cancelOrder(
        order.id || cleanCode,
        isSellerViewer ? 'Người bán từ chối nhận đơn / lịch hẹn' : 'Người mua yêu cầu hủy đơn'
      );
      updateOrderStatus(order.code, 'cancelled', 'Đã hủy đơn hàng');
      setOrder((prev) => (prev ? { ...prev, status: 'cancelled', statusText: 'Đã hủy đơn hàng' } : null));
      showToast(
        isPaid
          ? 'Đã hủy đơn thành công! Hệ thống đã tự động hoàn tiền cọc Escrow 100% cho người mua.'
          : 'Đã hủy đơn hàng thành công.',
        'success'
      );
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Không thể hủy đơn hàng này lúc này.', 'error');
    }
  };

  const handleSyncTracking = async () => {
    if (!order) return;
    setSyncingTracking(true);
    try {
      const data = await orderService.getOrderTracking(order.id || order.code.replace('#', ''));
      if (data) setLiveTracking(data);
      showToast('Đã đồng bộ dữ liệu vận chuyển realtime mới nhất từ đối tác giao vận!', 'success');
    } catch {
      showToast('Không thể làm mới hành trình lúc này, vui lòng thử lại sau.', 'error');
    } finally {
      setSyncingTracking(false);
    }
  };

  const formatVND = (num?: number) => {
    return (num || 0).toLocaleString('vi-VN') + ' đ';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <main className="mx-auto max-w-5xl px-4 py-8 flex-1 w-full space-y-4">
          <CompactHeader
            showBackButton={true}
            backHref="/orders"
            breadcrumbs={[{ label: 'Quản lý đơn hàng', href: '/orders' }, { label: 'Đang tải...' }]}
          />
          <Card className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <RefreshCw className="h-8 w-8 text-fpt-orange animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Đang tải thông tin chi tiết đơn hàng...</p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <main className="mx-auto max-w-5xl px-4 py-8 flex-1 w-full space-y-4">
          <CompactHeader
            showBackButton={true}
            backHref="/orders"
            breadcrumbs={[{ label: 'Quản lý đơn hàng', href: '/orders' }, { label: 'Không tìm thấy' }]}
          />
          <Card className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-orange-100 text-fpt-orange flex items-center justify-center">
              <Package className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Không tìm thấy đơn hàng</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Đơn hàng #{cleanCode} không tồn tại hoặc bạn không có quyền truy cập vào thông tin giao dịch này.
            </p>
            <Button asChild className="bg-fpt-orange hover:bg-fpt-orange-hover text-white font-bold rounded-xl text-xs">
              <Link href="/orders">Quay lại danh sách đơn hàng</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isSafeHandoff = order.type === 'safe-handoff' || (order as any).orderType === 'MEETUP';

  const partnerName = isSellerViewer
    ? backendOrderDetail?.buyer?.profile?.fullName || (order as any).buyer?.fullName || (order as any).buyer?.profile?.fullName || backendOrderDetail?.buyer?.email || (order as any).buyer?.email || 'Người mua FPT'
    : backendOrderDetail?.seller?.profile?.fullName || (order as any).seller?.fullName || order.product?.seller?.name || 'Người bán FPT';

  const partnerCampus = isSellerViewer
    ? backendOrderDetail?.buyer?.profile?.campus || (order as any).buyer?.campus || (order as any).buyer?.profile?.campus || 'FPT Campus'
    : backendOrderDetail?.seller?.profile?.campus || (order as any).seller?.campus || order.product?.seller?.cohortCampus || 'FPT Campus';

  const partnerAvatar = isSellerViewer
    ? backendOrderDetail?.buyer?.profile?.avatarUrl || (order as any).buyer?.avatarUrl || (order as any).buyer?.profile?.avatarUrl || ''
    : backendOrderDetail?.seller?.profile?.avatarUrl || (order as any).seller?.avatarUrl || (order as any).seller?.profile?.avatarUrl || '';

  const isOrderDelivered = order.status === 'delivered';
  const isOrderShipping = order.status === 'shipping';
  const isOrderCompleted = order.status === 'completed';
  const isOrderPending = isSafeHandoff
    ? (order.status === 'pending' || order.status === 'processing')
    : (order.status === 'pending' || (order.status === 'processing' && !order.payment?.isPaid && order.payment?.paymentMethod !== 'CASH'));
  const isOrderProcessing = order.status === 'processing';
  const isOrderDisputed = order.status === 'disputed';

  const isCodOrder =
    order.payment?.paymentMethod === 'CASH' ||
    Boolean(order.payment?.paymentMethod?.toLowerCase().includes('cod')) ||
    Boolean(order.payment?.paymentMethod?.toLowerCase().includes('tiền mặt')) ||
    Boolean(order.payment?.paymentMethod?.toLowerCase().includes('điểm hẹn')) ||
    (!order.payment?.isPaid &&
      order.type === 'inter-campus' &&
      !order.payment?.paymentMethod?.toLowerCase().includes('vietqr') &&
      !order.payment?.paymentMethod?.toLowerCase().includes('payos'));

  const getEscrowBadgeMeta = () => {
    if (order.type === 'safe-handoff') {
      return {
        text: 'Xác thực QR Handshake',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    }
    if (order.payment?.isPaid) {
      return {
        text: 'Đã cọc Escrow bảo hộ 48h',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (isCodOrder) {
      return {
        text: 'Thanh toán khi nhận hàng (COD)',
        className: 'bg-sky-50 text-sky-800 border-sky-200',
      };
    }
    return {
      text: order.product.escrowBadge || 'Bảo chứng KTX 48h',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  };

  const badgeMeta = getEscrowBadgeMeta();

  // Tuyến đường liên Campus và thời gian vận chuyển chính xác
  const isInterCampusShipping = order.type === 'inter-campus';
  const displayRouteTitle = (() => {
    if (liveTracking?.routeTitle && !liveTracking.routeTitle.includes('nội bộ KTX Cần Thơ')) {
      return liveTracking.routeTitle;
    }
    return 'Tuyến FPT Express Hub (Cần Thơ ➔ Hòa Lạc (Hà Nội))';
  })();

  const displayEstimatedArrival = (() => {
    if (liveTracking?.estimatedArrival && liveTracking.estimatedArrival !== 'Giao trong ngày') {
      return liveTracking.estimatedArrival;
    }
    return isInterCampusShipping ? '2 - 3 ngày làm việc' : 'Giao trong ngày';
  })();



  const safeHandoffDefaultSteps = [
    {
      title: 'Đặt cọc Escrow bảo hộ',
      desc: order.payment?.isPaid
        ? 'Đã đặt cọc 100% vào Quỹ Campus Escrow bảo vệ an toàn'
        : 'Chờ người mua thanh toán tiền cọc Escrow (PayOS / VietQR)',
      status: order.payment?.isPaid ? 'completed' : 'current',
      time: order.timeLabel,
    },
    {
      title: 'Chốt hẹn Safe-Point',
      desc: order.appointmentTime
        ? `Lịch hẹn: ${new Date(order.appointmentTime).toLocaleString('vi-VN')} tại ${order.product?.subtitle || 'Sảnh Tòa Alpha'}`
        : `Điểm hẹn: ${order.product?.subtitle || 'Sảnh chính Tòa Alpha (Tầng 1)'} • Camera AI 24/7`,
      status: order.payment?.isPaid ? 'completed' : 'pending',
    },
    {
      title: 'Bàn giao & Test máy tại trạm',
      desc: isOrderDelivered || isOrderCompleted
        ? 'Đã đối soát sản phẩm & quét mã QR / OTP thành công'
        : 'Gặp mặt đối soát, test máy và xuất trình mã QR / OTP',
      status: isOrderDelivered || isOrderCompleted ? 'completed' : isOrderShipping || isOrderProcessing ? 'current' : 'pending',
    },
    {
      title: 'Giải ngân Escrow & Hoàn tất',
      desc: isOrderCompleted
        ? 'Đã giải ngân tiền về ví Người bán • Kích hoạt 48 giờ bao test'
        : 'Tiền cọc Escrow tự động giải ngân về ví Người bán khi bàn giao xong',
      status: isOrderCompleted ? 'completed' : 'pending',
    },
  ];

  const hasTrackingCode = Boolean(
    (order as any).trackingCode ||
    order.tracking?.trackingCode ||
    liveTracking?.trackingCode ||
    backendOrderDetail?.trackingCode
  );

  // Tracking steps fallback
  const rawTrackingSteps = order.status === 'cancelled'
    ? [
        { title: 'Tiếp nhận đơn hàng', desc: 'Đơn hàng đã được tạo', status: 'completed' },
        { title: 'Đã hủy đơn hàng', desc: 'Đơn hàng đã được hủy thành công • Đã hoàn tiền cọc Escrow 100% cho người mua', status: 'cancelled' },
      ]
    : isSafeHandoff
    ? (liveTracking?.steps && liveTracking.steps.some((s: any) => s.title.includes('Escrow') || s.title.includes('Safe-Point')) ? liveTracking.steps : safeHandoffDefaultSteps)
    : liveTracking?.steps || order.tracking?.steps || [
        { title: 'Tiếp nhận đơn hàng', desc: 'Đơn đã tạo tại Campus', status: 'completed' },
        {
          title: 'Đóng gói & Bưu tá nhận',
          desc: hasTrackingCode ? 'Đã bàn giao bưu cục (GHN)' : isOrderShipping ? 'Người bán đã nhận đơn • Đang chuẩn bị hàng' : 'Chờ người bán xác nhận đơn',
          status: isOrderShipping && !hasTrackingCode ? 'current' : isOrderShipping || isOrderDelivered || isOrderCompleted ? 'completed' : 'pending',
        },
        {
          title: 'Trung chuyển liên Campus',
          desc: 'Hub Tây Nam Bộ (Cần Thơ) ➔ Hub Nội Bài - Hòa Lạc',
          status: isOrderDelivered || isOrderCompleted ? 'completed' : isOrderShipping && hasTrackingCode ? 'current' : 'pending',
        },
        {
          title: 'Giao hàng tới KTX',
          desc: isOrderDelivered ? 'Đã phát thành công • Kích hoạt 48h bao test' : 'Dự kiến: 2 - 3 ngày làm việc',
          status: isOrderDelivered || isOrderCompleted ? 'completed' : 'pending',
        },
      ];
const trackingSteps = rawTrackingSteps.map((st: any) => ({
    ...st,
    desc: st.desc
      ? st.desc
          .replace(/nội bộ campus cần thơ/gi, 'Hub Tây Nam Bộ (Cần Thơ) ➔ Hub Nội Bài - Hòa Lạc')
          .replace(/chuyển phát nội bộ ktx cần thơ/gi, 'Tuyến FPT Express Hub (Cần Thơ ➔ Hòa Lạc (Hà Nội))')
          .replace(/Dự kiến: Giao trong ngày/gi, 'Dự kiến: 2 - 3 ngày làm việc')
      : st.desc,
  }));

  // Tính toán đồng bộ phí ship và tổng tiền cho toàn bộ trang và thanh Mobile Action Bar
  const effectiveShippingFee =
    typeof order.payment?.shippingFee === 'number' && order.payment.shippingFee > 0
      ? order.payment.shippingFee
      : order.type === 'inter-campus'
      ? 45000
      : 0;
  const coinDiscount = (order.payment as any)?.coinDiscount || 0;
  const totalBuyerPay = Math.max(0, order.product.price + effectiveShippingFee - coinDiscount);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <main className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-8 flex-1 w-full space-y-4">
        {/* Navigation Breadcrumbs Header */}
        <CompactHeader
          showBackButton={true}
          backHref="/orders"
          breadcrumbs={[
            { label: isSellerViewer ? 'Quản lý đơn bán hàng' : 'Quản lý đơn hàng', href: '/orders' },
            { label: order.code },
          ]}
        />

        {/* TOP STATUS HERO CARD */}
        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {order.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Sao chép mã đơn hàng"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              {copied && <span className="text-[10px] text-emerald-600 font-bold animate-in fade-in">Đã chép!</span>}

              {isSellerViewer && (
                <Badge className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-none hover:bg-purple-100">
                  🏷️ ĐƠN BÁN HÀNG CỦA BẠN
                </Badge>
              )}

              <Badge
                variant="outline"
                className={`rounded text-[10px] font-bold px-2 py-0.5 border ${
                  order.type === 'inter-campus'
                    ? 'bg-orange-50 text-fpt-orange border-orange-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {order.typeLabel}
              </Badge>

              <span className="text-xs text-slate-400 font-medium">
                • {order.timeLabel}
              </span>
            </div>

            <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm ${order.statusColor}`}>
              {isOrderShipping ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fpt-orange"></span>
                </span>
              ) : isOrderDelivered || isOrderCompleted ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              ) : isOrderDisputed ? (
                <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
              ) : (
                <Clock className="h-4.5 w-4.5 text-amber-600" />
              )}
              <span>{order.statusText}</span>
            </div>
          </div>

          {/* STATUS BANNERS - TAILORED FOR SELLER VS BUYER */}
          {isSellerViewer ? (
            <>
              {isOrderShipping && (
                isSafeHandoff ? (
                  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 flex items-start gap-3 text-xs text-emerald-950">
                    <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0 mt-0.5">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                        Đã chốt lịch hẹn Safe-Point • Sẵn sàng gặp mặt bàn giao
                      </h4>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Bạn đã đồng ý lịch hẹn. Hãy mang sản phẩm đến điểm hẹn{' '}
                        <strong>{order.meetupLocation || (backendOrderDetail as any)?.meetupLocation || order.product?.subtitle || 'Trạm Safe-Point'}</strong>{' '}
                        vào lúc{' '}
                        <strong>
                          {order.appointmentTime || (backendOrderDetail as any)?.appointmentTime
                            ? new Date(order.appointmentTime || (backendOrderDetail as any)?.appointmentTime).toLocaleString('vi-VN')
                            : 'thời gian đã hẹn'}
                        </strong>
                        . Khi người mua kiểm tra xong, bạn hãy quét mã QR hoặc nhập OTP 4 số từ người mua để giải ngân tiền Escrow!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-3.5 flex items-start gap-3 text-xs text-orange-950">
                    <div className="rounded-xl bg-fpt-orange p-2 text-white shrink-0 mt-0.5">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-orange-950 text-xs sm:text-sm">
                        Kiện hàng đang được bưu tá vận chuyển tới Người mua
                      </h4>
                      <p className="text-[11px] text-orange-800 leading-relaxed">
                        Đơn hàng đã được bàn giao bưu cục và đang trên đường phát tới KTX. Doanh thu <strong>{formatVND(order.product.price)}</strong> sẽ tự động được giải ngân vào Ví của bạn sau khi người mua nhận hàng và kết thúc 48 giờ bao test an toàn.
                      </p>
                    </div>
                  </div>
                )
              )}

              {isOrderDelivered && (
                <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 flex items-start gap-3 text-xs text-emerald-950">
                  <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h4 className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                        Bưu tá đã phát hàng tới Người mua • Đang trong 48H bao test
                      </h4>
                      <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 font-bold text-[10px]">
                        CHỜ GIẢI NGÂN VÍ
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Khách hàng đã nhận được sản phẩm tại KTX. Hệ thống đang bảo hộ thời gian 48 giờ bao test. Nếu không phát sinh khiếu nại, tiền doanh thu sẽ tự động giải ngân vào số dư ví của bạn.
                    </p>
                  </div>
                </div>
              )}

              {(isOrderPending || isOrderProcessing) && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 flex items-start gap-3 text-xs text-blue-950">
                  <div className="rounded-xl bg-blue-600 p-2 text-white shrink-0 mt-0.5">
                    {order.type === 'safe-handoff' ? <ShieldCheck className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-blue-950 text-xs sm:text-sm">
                      {order.type === 'safe-handoff'
                        ? 'Bạn có đơn hẹn bàn giao Safe-Point mới cần xác nhận!'
                        : 'Bạn có đơn đặt hàng mới từ Sinh viên FPT!'}
                    </h4>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      {order.type === 'safe-handoff'
                        ? `Người mua đã thanh toán cọc Escrow và hẹn gặp lúc ${
                            order.appointmentTime || (backendOrderDetail as any)?.appointmentTime
                              ? new Date(order.appointmentTime || (backendOrderDetail as any)?.appointmentTime).toLocaleString('vi-VN')
                              : 'thời gian đã hẹn'
                          } tại ${order.meetupLocation || (backendOrderDetail as any)?.meetupLocation || order.product?.subtitle || 'Trạm Safe-Point'}. Vui lòng bấm [Đồng ý đơn & Chốt lịch hẹn] ở cột bên phải để chốt đơn.`
                        : 'Vui lòng chuẩn bị đóng gói sản phẩm cẩn thận và bấm Bàn giao bưu cục GHN bên dưới để bưu tá đến lấy hoặc mang gửi tại bưu cục KTX.'}
                    </p>
                  </div>
                </div>
              )}

              {isOrderCompleted && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-3 text-xs text-emerald-950">
                  <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                      Đơn hàng đã hoàn tất thành công!
                    </h4>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Giao dịch đã kết thúc thành công. Toàn bộ doanh thu <strong>{formatVND(order.product.price)}</strong> đã được quyết toán vào Ví cá nhân của bạn.
                    </p>
                  </div>
                </div>
              )}

              {isOrderDisputed && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-950">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-rose-600 p-2 text-white shrink-0 mt-0.5">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-rose-900 text-xs sm:text-sm">
                        Người mua đã mở hồ sơ Khiếu nại / Yêu cầu Trả hàng
                      </h4>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        Vui lòng kiểm tra lý do khiếu nại, video bằng chứng unboxing của Người mua hoặc vào mục Tin nhắn thương lượng trong khi Ban Quản Trị xem xét xử lý.
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs"
                  >
                    <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                      <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-white" />
                      <span>Xem phiếu khiếu nại</span>
                    </Link>
                  </Button>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3 text-xs text-rose-950">
                  <div className="rounded-xl bg-rose-600 p-2 text-white shrink-0 mt-0.5">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-rose-950 text-xs sm:text-sm">
                      Đơn hàng đã được hủy / từ chối
                    </h4>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Đơn hàng này đã bị hủy. Toàn bộ tiền cọc Escrow và xu của Người mua đã được tự động hoàn trả 100%. Sản phẩm đã được tự động mở lại trạng thái Đang bán trên sàn.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {order.status === 'cancelled' && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3 text-xs text-rose-950">
                  <div className="rounded-xl bg-rose-600 p-2 text-white shrink-0 mt-0.5">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-rose-950 text-xs sm:text-sm">
                      Đơn hàng đã được hủy thành công
                    </h4>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Đơn hàng này đã bị hủy. Toàn bộ tiền cọc Escrow ({formatVND(order.product.price)}) và Xu/Voucher của bạn đã được tự động hoàn trả đầy đủ vào ví tài khoản.
                    </p>
                  </div>
                </div>
              )}
              {isOrderDelivered && (
                <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3 sm:p-4 flex items-start gap-3 text-xs text-emerald-950">
                  <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h4 className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                        Đã phát tới nơi • Kích hoạt 48 giờ bao test bảo vệ Escrow
                      </h4>
                      <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 font-bold text-[10px]">
                        48H ESCROW ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Kiện hàng đã được bưu tá phát tới sảnh KTX. Bạn vui lòng kiểm tra bật nguồn thiết bị, ngoại hình và đối chiếu mô tả. Nếu đồ có lỗi, hãy bấm <strong>Khiếu nại / Trả hàng</strong> trước khi thời hạn 48 giờ kết thúc để được hoàn tiền an toàn.
                    </p>
                  </div>
                </div>
              )}

              {isOrderPending && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 flex items-start gap-3 text-xs text-blue-950">
                  <div className="rounded-xl bg-blue-600 p-2 text-white shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-blue-950 text-xs sm:text-sm">
                      {isSafeHandoff
                        ? 'Đã đặt cọc Escrow bảo hộ • Chờ người bán xác nhận lịch hẹn'
                        : 'Đơn hàng đang chờ xử lý'}
                    </h4>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      {isSafeHandoff
                        ? 'Tiền cọc của bạn đã được bảo vệ an toàn tại Quỹ Campus Escrow FPT. Hệ thống đã gửi thông báo đến Người bán. Mã QR Handshake và mã OTP 4 số bàn giao sẽ hiển thị tại đây ngay khi Người bán xác nhận đồng ý lịch hẹn.'
                        : 'Đơn hàng của bạn đang được tiếp nhận và xử lý.'}
                    </p>
                  </div>
                </div>
              )}

              {isOrderShipping && (
                isSafeHandoff ? (
                  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 flex items-start gap-3 text-xs text-emerald-950">
                    <div className="rounded-xl bg-emerald-600 p-2 text-white shrink-0 mt-0.5">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                        Người bán đã đồng ý lịch hẹn • Sẵn sàng gặp mặt tại Safe-Point
                      </h4>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Lịch hẹn gặp tại{' '}
                        <strong>{order.meetupLocation || (backendOrderDetail as any)?.meetupLocation || order.product?.subtitle || 'Trạm Safe-Point'}</strong>{' '}
                        lúc{' '}
                        <strong>
                          {order.appointmentTime || (backendOrderDetail as any)?.appointmentTime
                            ? new Date(order.appointmentTime || (backendOrderDetail as any)?.appointmentTime).toLocaleString('vi-VN')
                            : 'thời gian đã hẹn'}
                        </strong>
                        . Bạn hãy chuẩn bị mã QR / OTP bên dưới để cho Người bán quét xác thực khi nhận đồ!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-orange-50/80 border border-orange-200 p-3.5 flex items-start gap-3 text-xs text-orange-950">
                    <div className="rounded-xl bg-fpt-orange p-2 text-white shrink-0 mt-0.5">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-orange-950 text-xs">
                        {isCodOrder
                          ? 'Đơn hàng đang giao • Thanh toán khi nhận hàng (COD)'
                          : 'Đơn hàng đang trên đường vận chuyển liên Campus'}
                      </h4>
                      <p className="text-[11px] text-orange-800 leading-relaxed">
                        {isCodOrder
                          ? 'Bạn chuẩn bị tiền mặt hoặc quét mã QR trả bưu tá khi nhận đồ tại KTX. Sau khi nhận hàng, cơ chế bảo vệ 48 giờ bao test sẽ tự động kích hoạt.'
                          : 'Tiền cọc của bạn đang được ký quỹ an toàn tại Quỹ Campus Escrow FPT. Tiền chỉ được chuyển cho Người bán sau khi bạn đã nhận hàng thành công và qua 48h bao test.'}
                      </p>
                    </div>
                  </div>
                )
              )}

              {isOrderDisputed && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3 text-xs text-rose-950">
                  <div className="rounded-xl bg-rose-600 p-2 text-white shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-rose-900 text-xs">
                      Đơn hàng đang có hồ sơ khiếu nại (Dispute đang xử lý)
                    </h4>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      Ban Quản Trị và CLB Kỹ thuật FPT đang tiến hành đối soát video unboxing và nhật ký giao dịch. Toàn bộ tiền Escrow đang được đóng băng an toàn cho bạn.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* 2-COLUMN MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT COLUMN: PRODUCT & TRACKING DETAILS (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. PRODUCT INFORMATION CARD */}
            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-fpt-orange" />
                <span>Sản phẩm giao dịch</span>
              </h3>

              <div className="flex items-start gap-3.5 pt-1">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={
                      typeof order.product.imageUrl === 'string' && order.product.imageUrl
                        ? order.product.imageUrl
                        : ((order.product.imageUrl as any)?.imageUrl ||
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80')
                    }
                    alt={order.product.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-1 left-1 rounded bg-slate-900/85 px-1 py-0.2 text-[9px] font-bold text-white border-none">
                    {order.product.conditionBadge}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {order.product.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{order.product.subtitle}</p>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      {formatVND(order.product.price)}
                    </span>
                    <Badge variant="outline" className={`text-[10px] font-bold ${badgeMeta.className}`}>
                      {badgeMeta.text}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Delivery destination note */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-fpt-orange shrink-0" />
                <span>
                  {order.type === 'safe-handoff' ? (
                    <>
                      Điểm hẹn Safe-Point:{' '}
                      <strong>{order.product.subtitle || 'Sảnh Tòa Alpha • Hola Campus (Camera AI 24/7)'}</strong>
                    </>
                  ) : (
                    <>
                      Địa chỉ giao nhận: <strong>Phòng 402, Dom B, KTX FPT Hòa Lạc (Hà Nội)</strong>
                    </>
                  )}
                </span>
              </div>
            </Card>

            {order.type === 'safe-handoff' ? (
              /* DEDICATED SAFE-POINT CARD */
              <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
                {/* 1. Safe-Point Location Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-fpt-orange shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {order.product.subtitle || 'Sảnh Tòa Alpha • FPT Hola Campus'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Điểm giao dịch có camera AI giám sát 24/7 của Nhà trường</span>
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] px-2 py-0.5 shrink-0">
                    Safe-Point 24/7
                  </Badge>
                </div>

                {/* 2. Scheduled Appointment Time Slot Banner */}
                <div className="rounded-xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-200/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
                      <Calendar className="h-4 w-4 text-emerald-700" />
                      <span>LỊCH HẸN BÀN GIAO TẠI SẢNH</span>
                    </div>
                    {isOrderPending ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold">
                        <Clock className="h-3 w-3 animate-pulse" />
                        <span>Chờ người bán đồng ý</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Đã chốt hẹn</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base font-black text-slate-900">
                    {order.appointmentTime
                      ? new Date(order.appointmentTime).toLocaleString('vi-VN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '16:30 - 17:15 (Chiều ca 4) • Hôm nay'}
                  </p>

                  <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Vui lòng đến đúng giờ để cùng đối soát và bật nguồn kiểm tra tình trạng máy tại bàn test.</span>
                  </p>
                </div>

                {/* 3. Direct QR Code / Handshake Section */}
                {!isSellerViewer ? (
                  /* BUYER VIEW: DIRECT QR CODE + OTP ON SCREEN */
                  isOrderPending ? (
                    <div className="rounded-2xl bg-amber-50/60 border border-amber-200/90 p-5 text-center space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Clock className="h-6 w-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-amber-950">
                          Đang chờ Người bán xác nhận lịch hẹn Safe-Point
                        </h4>
                        <p className="text-xs text-amber-800 max-w-sm mx-auto leading-relaxed">
                          Bạn đã nạp tiền cọc Escrow an toàn. Mã QR Handshake và mã OTP 4 số bàn giao sẽ hiển thị tại đây ngay sau khi Người bán bấm đồng ý lịch hẹn!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 sm:p-5 text-center space-y-3.5">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-fpt-orange text-xs font-bold">
                          <QrCode className="h-3.5 w-3.5" />
                          <span>MÃ QR BÀN GIAO CỦA BẠN (NGƯỜI MUA)</span>
                        </div>
                        <p className="text-xs text-slate-600 max-w-sm mx-auto pt-1">
                          Đưa mã QR này hoặc đọc mã OTP 4 số cho người bán quét tại bàn Safe-Point để hoàn tất bàn giao.
                        </p>
                      </div>

                      {/* QR Code Frame */}
                      <div className="mx-auto w-52 h-52 sm:w-56 sm:h-56 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                        <img
                          src={qrImageUrl}
                          alt="QR Code Bàn giao Safe-Point"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>

                      <div className="font-mono text-xs font-bold text-slate-500">
                        MÃ HẸN BÀN GIAO: <span className="text-slate-900">{order.code}</span>
                      </div>

                      {/* 4-digit OTP box */}
                      <div className="max-w-xs mx-auto space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Mã OTP Bàn Giao 4 Chữ Số
                        </span>
                        <div className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-2 px-4 shadow-xs">
                          <KeyRound className="h-4 w-4 text-emerald-400" />
                          <span className="font-mono text-2xl font-black tracking-widest text-emerald-400">
                            {effectiveOtp}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyOtp}
                            className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            title="Sao chép OTP"
                          >
                            {copiedOtp ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Security Tip */}
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-left text-[11px] text-amber-900 flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Lưu ý:</strong> Chỉ cho người bán quét QR hoặc đọc mã OTP này <strong>sau khi</strong> bạn đã kiểm tra và test máy ưng ý tại Safe-Point!
                        </span>
                      </div>
                    </div>
                  )
                ) : (
                  /* SELLER VIEW: GUIDANCE & VERIFICATION BUTTON */
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 sm:p-5 space-y-4">
                    <div className="text-center space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <ScanLine className="h-3.5 w-3.5 text-emerald-700" />
                        <span>XÁC THỰC BÀN GIAO CỦA NGƯỜI BÁN</span>
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 pt-1">
                        Quét QR hoặc Nhập mã OTP từ Người mua
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Gặp người mua tại bàn Safe-Point đã hẹn, cho người mua test sản phẩm. Sau đó yêu cầu người mua mở đơn hàng xuất trình mã QR hoặc đọc mã OTP 4 số.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">
                          1
                        </span>
                        <span className="text-slate-700">Gặp người mua tại bàn test Safe-Point có camera giám sát.</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-fpt-orange font-bold text-xs shrink-0">
                          2
                        </span>
                        <span className="text-slate-700">Yêu cầu người mua xuất trình mã QR hoặc đọc mã OTP 4 số trong đơn hàng.</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0">
                          3
                        </span>
                        <span className="text-slate-700">Bấm nút bên dưới để quét QR / nhập OTP và nhận tiền Escrow ngay lập tức.</span>
                      </div>
                    </div>

                    {isOrderPending ? (
                      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-center space-y-1">
                        <p className="text-xs font-bold text-blue-900">
                          Chưa thể xác thực bàn giao lúc này
                        </p>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          Vui lòng bấm <strong>[Đồng ý đơn & Chốt lịch hẹn]</strong> ở bảng bên phải để xác nhận lịch hẹn trước.
                        </p>
                      </div>
                    ) : order.status !== 'completed' ? (
                      <Button
                        type="button"
                        onClick={() => setIsQrModalOpen(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm h-11 shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Xác thực Bàn giao Safe-Point (Quét QR / Nhập OTP)</span>
                      </Button>
                    ) : (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Đã bàn giao và giải ngân tiền Escrow thành công!</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ) : (
              /* 2. REALTIME TRACKING JOURNEY TIMELINE */
              <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-fpt-orange" />
                  <span>Hành trình giao vận chi tiết</span>
                </h3>
                <button
                  type="button"
                  onClick={handleSyncTracking}
                  disabled={syncingTracking}
                  className="inline-flex items-center gap-1 text-xs font-bold text-fpt-orange hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncingTracking ? 'animate-spin' : ''}`} />
                  <span>{syncingTracking ? 'Đang đồng bộ...' : 'Đồng bộ GHN'}</span>
                </button>
              </div>

              {/* Carrier Overview Box */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Đối tác giao vận:</span>
                  <strong className="text-slate-900 font-bold flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-fpt-orange" />
                    <span>{liveTracking?.partner || 'Giao Hàng Nhanh (GHN Express)'}</span>
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Mã vận đơn bưu cục:</span>
                  {hasTrackingCode && (liveTracking?.trackingCode || order.tracking?.trackingCode || (order as any).trackingCode || backendOrderDetail?.trackingCode) ? (
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {liveTracking?.trackingCode || order.tracking?.trackingCode || (order as any).trackingCode || backendOrderDetail?.trackingCode}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Chưa tạo mã (Chờ người bán bàn giao)
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Tuyến hành trình:</span>
                  <span className="font-bold text-slate-900">
                    {displayRouteTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Dự kiến giao:</span>
                  <span className="font-bold text-emerald-700">
                    {displayEstimatedArrival}
                  </span>
                </div>

                {liveTracking?.shipper && (
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Bưu tá phát hàng: <strong>{liveTracking.shipper.name}</strong></span>
                    {liveTracking.shipper.phone && (
                      <a href={`tel:${liveTracking.shipper.phone}`} className="text-fpt-orange font-bold inline-flex items-center gap-1 hover:underline">
                        <Phone className="h-3 w-3" />
                        <span>{liveTracking.shipper.phone}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* TIMELINE STEPPER */}
              <div className="space-y-4 pt-1 pl-2 text-xs">
                {trackingSteps.map((st: any, idx: number) => {
                  const isDone = st.status === 'completed';
                  const isCurrent = st.status === 'current';
                  const isCancelled = st.status === 'cancelled';
                  const isLast = idx === trackingSteps.length - 1;

                  return (
                    <div key={idx} className="relative flex items-start gap-3">
                      {!isLast && (
                        <div
                          className={`absolute left-[13px] top-[26px] bottom-[-16px] w-[2px] ${
                            isDone ? 'bg-emerald-500' : isCancelled ? 'bg-rose-300' : 'bg-slate-200'
                          }`}
                        />
                      )}

                      <div
                        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full shrink-0 border-2 ${
                          isDone
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                            : isCancelled
                            ? 'bg-rose-50 border-rose-500 text-rose-600'
                            : isCurrent
                            ? 'bg-orange-50 border-fpt-orange text-fpt-orange animate-pulse'
                            : 'bg-white border-slate-200 text-slate-300'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCancelled ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <div className={`h-2.5 w-2.5 rounded-full ${isCurrent ? 'bg-fpt-orange' : 'bg-slate-300'}`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className={`font-bold text-xs ${isDone ? 'text-slate-900' : isCancelled ? 'text-rose-600 font-extrabold' : isCurrent ? 'text-fpt-orange font-extrabold' : 'text-slate-400'}`}>
                            {st.title}
                          </h5>
                          {st.time && <span className="text-[10px] text-slate-400 font-mono">{st.time}</span>}
                        </div>
                        {st.desc && <p className={`text-[11px] mt-0.5 ${isCancelled ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>{st.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Carrier Audit Logs */}
              {liveTracking?.ghnLogs && liveTracking.ghnLogs.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <h5 className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                    Nhật ký quét kiện hàng từ bưu cục:
                  </h5>
                  <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {liveTracking.ghnLogs.map((log: any, lIdx: number) => (
                      <div key={lIdx} className="flex items-start justify-between gap-1">
                        <span>• {log.statusText || log.status}</span>
                        <span className="text-slate-400 shrink-0">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

          {/* RIGHT COLUMN: PARTNER, ACTIONS & PAYMENT (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. COUNTERPARTY CARD (SELLER / BUYER INFO) */}
            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                {isSellerViewer ? 'Thông tin người mua' : 'Thông tin người bán'}
              </h3>

              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-slate-200">
                  <AvatarImage src={partnerAvatar} alt={partnerName} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 font-bold text-white text-sm">
                    {partnerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{partnerName}</h4>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{partnerCampus}</span>
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Sinh viên FPT đã xác thực</span>
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS DIRECTLY INSIDE PARTNER CARD */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                {(() => {
                  const targetPartnerId = isSellerViewer
                    ? backendOrderDetail?.buyerId || (order as any).buyerId
                    : backendOrderDetail?.sellerId || order.sellerId || (order as any).seller?.id;
                  const targetProductId = backendOrderDetail?.productId || (order as any).productId || (order.product as any)?.id;
                  const chatHref = `/chat?seller=${encodeURIComponent(partnerName)}${targetProductId ? `&productId=${targetProductId}` : ''}${targetPartnerId ? `&userId=${targetPartnerId}` : ''}`;

                  return (
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-orange-500 to-fpt-orange hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-xs h-9 shadow-xs"
                    >
                      <Link href={chatHref}>
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        <span>{isSellerViewer ? 'Nhắn tin với người mua' : 'Nhắn tin với người bán'}</span>
                      </Link>
                    </Button>
                  );
                })()}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAiBotOpen(true)}
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs h-9"
                >
                  <Bot className="h-4 w-4 mr-1.5 text-fpt-orange" />
                  <span>Trợ lý AI hỗ trợ đơn hàng 24/7</span>
                </Button>
              </div>
            </Card>

            {/* 2. PAYMENT / REVENUE SUMMARY BREAKDOWN */}
            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{isSellerViewer ? 'Quyết toán doanh thu bán hàng' : 'Chi tiết thanh toán'}</span>
                {isSellerViewer && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    Ví Doanh Thu
                  </Badge>
                )}
              </h3>

              {isSellerViewer ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Giá bán sản phẩm:</span>
                    <span className="font-semibold text-slate-900">+{formatVND(order.product.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Phí dịch vụ Market FU:</span>
                    <span className="font-semibold text-emerald-600">0 đ (Miễn phí SV)</span>
                  </div>
                  {order.type === 'safe-handoff' ? (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Phí bàn giao Safe-Point:</span>
                      <span className="font-semibold text-emerald-600">0 đ (Gặp trực tiếp)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600">
                      <span>Cước bưu cục GHN ({formatVND(effectiveShippingFee)}):</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] self-start sm:self-auto">
                        Người mua chi trả (Bạn không bị trừ)
                      </span>
                    </div>
                  )}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                      <span>Doanh thu thực nhận về ví:</span>
                      <span className="text-lg font-black text-emerald-600">
                        +{formatVND(order.product.price)}
                      </span>
                    </div>

                    <div className="mt-2.5 rounded-lg border border-sky-100 bg-sky-50/70 p-2 text-[11px] text-sky-900 leading-relaxed space-y-1">
                      <div className="flex items-center justify-between font-semibold text-sky-950">
                        <span>{order.type === 'safe-handoff' ? 'Tổng tiền cọc Escrow bảo hộ:' : 'Tổng tiền Shipper thu từ Người mua:'}</span>
                        <span className="font-bold">{formatVND(totalBuyerPay)}</span>
                      </div>
                      <p className="text-[10px] text-sky-800">
                        {order.type === 'safe-handoff'
                          ? '💡 Bàn giao Safe-Point: Người mua đã nạp 100% tiền cọc vào Quỹ Campus Escrow. Sau khi bạn quét QR hoặc nhập OTP từ người mua tại điểm hẹn, toàn bộ số tiền sẽ tự động giải ngân về ví của bạn.'
                          : `💡 Giải trình đối soát: Khách trả ${formatVND(totalBuyerPay)} (gồm ${formatVND(order.product.price)} tiền đồ trả về ví bạn + ${formatVND(effectiveShippingFee)} cước giao vận bưu tá GHN nhận). Bạn được nhận trọn vẹn 100% tiền hàng.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Giá niêm yết sản phẩm:</span>
                      <span className="font-semibold text-slate-900">{formatVND(order.product.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{order.type === 'safe-handoff' ? 'Phí bàn giao Safe-Point:' : 'Phí luân chuyển liên Campus (GHN):'}</span>
                      <span className="font-semibold text-slate-900">{formatVND(effectiveShippingFee)}</span>
                    </div>
                    {coinDiscount > 0 && (
                      <div className="flex items-center justify-between text-emerald-700 font-medium">
                        <span>Ưu đãi FPT Coins:</span>
                        <span>-{formatVND(coinDiscount)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                      <span>Tổng tiền thanh toán:</span>
                      <span className="text-base font-black text-fpt-orange">
                        {formatVND(totalBuyerPay)}
                      </span>
                    </div>
                  </div>
                )}

              <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>{isSellerViewer ? 'Hình thức thanh toán:' : 'Phương thức:'}</span>
                  <strong className="text-slate-800">
                    {isCodOrder ? 'Thu hộ COD khi nhận đồ' : 'Chuyển khoản trực tuyến (PayOS / VietQR)'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dòng tiền:</span>
                  {order.status === 'completed' ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{isSellerViewer ? 'Đã quyết toán vào ví của bạn' : 'Giao dịch hoàn tất'}</span>
                    </span>
                  ) : order.payment?.isPaid ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{isSellerViewer ? 'Tiền đang bảo hộ trong Escrow' : 'Đã nạp cọc Escrow bảo hộ'}</span>
                    </span>
                  ) : isCodOrder ? (
                    <span className="font-bold text-sky-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{isSellerViewer ? 'Chờ bưu tá thu COD & đối soát' : 'Thanh toán COD khi nhận hàng'}</span>
                    </span>
                  ) : (
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{isSellerViewer ? 'Chờ người mua thanh toán' : 'Chờ thanh toán (VietQR)'}</span>
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* 3. BUSINESS ACTION BAR - STRICTLY OBEYING ACTION MATRIX */}
            <Card className="rounded-2xl border border-orange-200/90 bg-gradient-to-br from-orange-50/50 to-white p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                {isSellerViewer ? 'Thao tác của Người bán' : 'Hành động với đơn hàng'}
              </h3>

              {/* SELLER SPECIFIC ACTIONS */}
              {isSellerViewer ? (
                <div className="space-y-2.5">
                  {!isCodOrder && !order.payment?.isPaid && order.type !== 'safe-handoff' && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>Chờ Người mua hoàn tất thanh toán Escrow</span>
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Đơn hàng thanh toán trực tuyến. Nút bàn giao bưu cục sẽ tự động kích hoạt ngay khi Người mua nạp cọc thành công vào Escrow.
                      </p>
                    </div>
                  )}

                  {(isCodOrder || order.payment?.isPaid || order.type === 'safe-handoff') && (isOrderPending || isOrderProcessing) && (
                    <div className="space-y-2">
                      {order.type === 'safe-handoff' ? (
                        <Button
                          type="button"
                          onClick={handleSellerConfirmOrder}
                          disabled={isConfirmingOrder}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{isConfirmingOrder ? 'Đang chốt hẹn...' : 'Đồng ý đơn & Chốt lịch hẹn'}</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleSellerConfirmOrder}
                          disabled={isConfirmingOrder}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{isConfirmingOrder ? 'Đang tiếp nhận...' : 'Đồng ý nhận đơn'}</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelOrder}
                        className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-bold rounded-xl text-xs h-9 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span>Từ chối đơn (Hoàn cọc 100% cho khách)</span>
                      </Button>
                    </div>
                  )}

                  {isOrderShipping && (
                    isSafeHandoff ? (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span>Đã chốt lịch hẹn Safe-Point</span>
                          </p>
                          <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px] font-bold">
                            Chờ bàn giao
                          </Badge>
                        </div>
                        <p className="text-[11px] text-emerald-700 leading-relaxed">
                          Bạn đã đồng ý lịch hẹn. Hãy mang hàng đến trạm Safe-Point đúng giờ để gặp người mua và quét mã xác nhận.
                        </p>
                      </div>
                    ) : !hasTrackingCode ? (
                      <div className="space-y-2">
                        <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-xs text-orange-950 space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-xs text-orange-900">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Đã tiếp nhận đơn hàng</span>
                          </p>
                          <p className="text-[11px] text-orange-800 leading-relaxed">
                            Vui lòng đóng gói hàng cẩn thận và bấm [Bàn giao bưu cục GHN] để tạo mã vận đơn cho bưu tá.
                          </p>
                        </div>

                        <Button
                          type="button"
                          onClick={() => setIsShipModalOpen(true)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Truck className="h-4 w-4" />
                          <span>Bàn giao bưu cục GHN (Tạo mã vận đơn)</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelOrder}
                          className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-bold rounded-xl text-xs h-9 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="h-4 w-4 text-rose-600" />
                          <span>Hủy đơn / Từ chối (Hoàn cọc 100%)</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-600 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                            <Truck className="h-4 w-4 text-fpt-orange" />
                            <span>Bưu tá GHN đang giao tới Người mua</span>
                          </p>
                          <Badge className="bg-orange-100 text-orange-800 border-none text-[10px] font-bold">
                            Đang giao
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Kiện hàng đang được luân chuyển. Trạng thái đã giao sẽ được đồng bộ sau khi hãng vận chuyển xác nhận.
                        </p>
                      </div>
                    )
                  )}

                  {order.status === 'cancelled' && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-xs text-rose-900">
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span>Đơn hàng đã hủy</span>
                      </p>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        Đơn hàng đã đóng. Tiền cọc Escrow đã được hoàn trả lại cho người mua và sản phẩm đã mở lại bán.
                      </p>
                    </div>
                  )}

                  {isOrderDelivered && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 space-y-1.5">
                      <p className="font-bold flex items-center gap-1.5 text-xs text-emerald-900">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        <span>Đang trong 48 giờ bao test an toàn</span>
                      </p>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Hệ thống sẽ tự động giải ngân <strong>{formatVND(order.product.price)}</strong> vào ví khi người mua bấm xác nhận hoặc sau khi hết hạn 48 giờ.
                      </p>
                    </div>
                  )}

                  {isOrderCompleted && (
                    <div className="space-y-2">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Doanh thu đơn hàng này đã được quyết toán vào ví của bạn</span>
                      </div>
                      {order.reviewed && (
                        <Button
                          type="button"
                          onClick={() => setIsReviewModalOpen(true)}
                          variant="outline"
                          className="w-full bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-900 font-bold rounded-xl text-xs h-9 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>Xem đánh giá của Người Mua</span>
                        </Button>
                      )}
                    </div>
                  )}

                  {isOrderDisputed && (
                    <div className="space-y-2">
                      <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-950 space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5 text-xs text-rose-800">
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                          <span>Đơn hàng đang có hồ sơ khiếu nại</span>
                        </p>
                        <p className="text-[11px] text-rose-700 leading-relaxed">
                          Người mua đã gửi hồ sơ khiếu nại / trả hàng. Tiền cọc Escrow đang tạm khóa bảo hộ 100%. Bạn có thể xem chi tiết lý do, video unboxing và tiến độ phán quyết của BQT.
                        </p>
                      </div>

                      <Button
                        asChild
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                          <ShieldAlert className="h-4 w-4 mr-1.5 text-white" />
                          <span>Xem chi tiết khiếu nại & Video bằng chứng</span>
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Safe-Handoff QR Modal button if direct trade */}
                  {order.type === 'safe-handoff' && !isOrderPending && order.status !== 'completed' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsQrModalOpen(true)}
                      className="w-full border-emerald-300 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs h-10 hover:bg-emerald-100"
                    >
                      <QrCode className="h-4 w-4 mr-1.5 text-emerald-600" />
                      <span>Xác nhận Bàn giao (Quét QR / Nhập OTP)</span>
                    </Button>
                  )}
                </div>
              ) : (
                /* BUYER ACTIONS */
                <div className="space-y-2">
                  {/* Case 1: DELIVERED (Bưu tá đã phát tới nơi) */}
                  {isOrderDelivered && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        onClick={handleConfirmReceived}
                        disabled={isConfirmingDelivery}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        <span>{isConfirmingDelivery ? 'Đang giải ngân...' : 'Đã nhận hàng an toàn (Hoàn tất)'}</span>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs h-10"
                      >
                        <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                          <AlertTriangle className="h-4 w-4 mr-1.5 text-rose-600" />
                          <span>Khiếu nại / Yêu cầu Trả hàng (Bao test 48h)</span>
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Case 2: SHIPPING (Đang vận chuyển) */}
                  {isOrderShipping && (
                    <div className="rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-600 space-y-2">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Clock className="h-4 w-4 text-fpt-orange" />
                        <span>Kiện hàng đang trên đường giao</span>
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Nếu bưu tá đã phát hàng tận tay hoặc bạn đã nhận xong đồ, hãy bấm xác nhận bên dưới để hoàn tất sớm và giải phóng tiền cho người bán.
                      </p>
                      <Button
                        type="button"
                        onClick={handleConfirmReceived}
                        disabled={isConfirmingDelivery}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        <span>{isConfirmingDelivery ? 'Đang giải ngân...' : 'Đã nhận hàng tận tay (Xác nhận sớm)'}</span>
                      </Button>
                    </div>
                  )}

                  {/* Case 3: PENDING (Đơn vừa tạo, chờ thanh toán) */}
                  {isOrderPending && (
                    <div className="space-y-2">
                      {!isCodOrder && (
                        <Button
                          type="button"
                          onClick={() => setIsPaymentModalOpen(true)}
                          className="w-full bg-fpt-orange hover:bg-fpt-orange-hover text-white font-bold rounded-xl text-xs h-10 shadow-xs"
                        >
                          <QrCode className="h-4 w-4 mr-1.5" />
                          <span>Thanh toán ngay (QR / PayOS)</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelOrder}
                        className="w-full border-slate-300 text-slate-600 hover:bg-rose-50 hover:text-rose-700 font-semibold rounded-xl text-xs h-9"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        <span>Hủy đơn hàng</span>
                      </Button>
                    </div>
                  )}

                  {/* Case 4: COMPLETED (Đã nhận hàng xong) */}
                  {isOrderCompleted && (
                    <div className="space-y-2">
                      {!order.reviewed ? (
                        <Button
                          asChild
                          className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl text-xs h-10 shadow-xs"
                        >
                          <Link href={`/orders/review?code=${encodeURIComponent(cleanCode)}`}>
                            <Star className="h-4 w-4 mr-1.5 fill-white" />
                            <span>Đánh giá sản phẩm (+100 Xu / +200 Xu video)</span>
                          </Link>
                        </Button>
                      ) : (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>Bạn đã hoàn tất đánh giá đơn này</span>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                              +100 Xu
                            </span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => setIsReviewModalOpen(true)}
                            variant="outline"
                            className="w-full bg-white hover:bg-emerald-100 border-emerald-300 text-emerald-900 font-bold rounded-xl text-xs h-9 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Xem lại / Chỉnh sửa đánh giá của bạn</span>
                          </Button>
                        </div>
                      )}

                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-xl text-xs h-9"
                      >
                        <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
                          <span>Khiếu nại / Trả hàng (Nếu đồ hỏng ngầm)</span>
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Case 5: DISPUTED (Đang khiếu nại / yêu cầu trả hàng) */}
                  {isOrderDisputed && (
                    <div className="space-y-2">
                      <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-950 space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5 text-xs text-rose-800">
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                          <span>Đang chờ giải quyết khiếu nại & Trả hàng</span>
                        </p>
                        <p className="text-[11px] text-rose-700 leading-relaxed">
                          Bạn đã gửi hồ sơ yêu cầu trả hàng. Tiền cọc Escrow đã được tạm khóa bảo hộ 100%. BQT / CLB IT sẽ phản hồi và hướng dẫn xử lý trong vòng 24h.
                        </p>
                      </div>

                      <Button
                        asChild
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                          <ShieldAlert className="h-4 w-4 mr-1.5 text-white" />
                          <span>Xem tiến độ trả hàng & khiếu nại</span>
                        </Link>
                      </Button>
                    </div>
                  )}


                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* EMBEDDED MODALS */}
      <OrderAiBotModal
        isOpen={isAiBotOpen}
        onClose={() => setIsAiBotOpen(false)}
        onShowToast={(msg) => showToast(msg, 'info')}
      />

      <OrderQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        order={order}
        initialTab="seller"
        onSuccess={() => {
          showToast('Xác thực bàn giao thành công!', 'success');
          updateOrderStatus(order.code, 'completed', 'Hoàn tất giao dịch');
          setOrder((prev) => (prev ? { ...prev, status: 'completed' } : null));
        }}
      />

      <OrderPaymentModal
        isOpen={isPaymentModalOpen}
        order={order}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={() => {
          showToast('Thanh toán tiền cọc Escrow thành công!', 'success');
          updateOrderStatus(order.code, 'shipping', 'Đang vận chuyển');
          setOrder((prev) => (prev ? { ...prev, status: 'shipping' } : null));
        }}
      />

      <OrderShipModal
        order={isShipModalOpen ? order : null}
        onClose={() => setIsShipModalOpen(false)}
        onSuccess={(_, trackingCode) => {
          showToast(`Đã bàn giao bưu cục mã "${trackingCode}" thành công!`, 'success');
          updateOrderStatus(order.code, 'shipping', 'Đang vận chuyển');
          setOrder((prev) => (prev ? { ...prev, status: 'shipping' } : null));
        }}
      />

      <ReviewDetailModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        order={order}
        isSeller={isSellerViewer}
      />

      {/* MOBILE STICKY BOTTOM ACTION BAR (Chỉ hiển thị trên điện thoại < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-2xl safe-area-inset-bottom">
        <div className="flex items-center gap-2">
          {/* Nút Chat nhanh 1 chạm */}
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl border-slate-200 text-slate-700 shrink-0 hover:bg-slate-50 active:scale-95 shadow-xs"
            title="Nhắn tin trao đổi"
          >
            <Link href={`/chat?seller=${encodeURIComponent(partnerName)}`}>
              <MessageSquare className="h-5 w-5 text-fpt-orange" />
            </Link>
          </Button>

          {/* Nút Trợ lý AI */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsAiBotOpen(true)}
            className="h-11 w-11 rounded-xl border-slate-200 text-slate-700 shrink-0 hover:bg-slate-50 active:scale-95 shadow-xs"
            title="Trợ lý AI 24/7"
          >
            <Bot className="h-5 w-5 text-fpt-orange" />
          </Button>

          {/* Nút hành động chính tùy theo vai trò & trạng thái */}
          <div className="flex-1 min-w-0">
            {isSellerViewer ? (
              isOrderDisputed ? (
                <Button
                  asChild
                  className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                    <ShieldAlert className="h-4 w-4 mr-1.5 text-white" />
                    <span>Xem khiếu nại trả hàng</span>
                  </Link>
                </Button>
              ) : (isOrderPending || isOrderProcessing) ? (
                order.type === 'safe-handoff' ? (
                  <Button
                    type="button"
                    onClick={handleSellerConfirmOrder}
                    disabled={isConfirmingOrder}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="truncate">{isConfirmingOrder ? 'Đang chốt hẹn...' : 'Đồng ý đơn & Chốt hẹn'}</span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleSellerConfirmOrder}
                      disabled={isConfirmingOrder}
                      className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="truncate">{isConfirmingOrder ? 'Đang nhận...' : 'Đồng ý nhận đơn'}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelOrder}
                      className="h-11 px-3 border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1 active:scale-95 shrink-0"
                    >
                      <XCircle className="h-4 w-4 text-rose-600" />
                      <span>Từ chối</span>
                    </Button>
                  </div>
                )
              ) : isOrderShipping ? (
                order.type === 'safe-handoff' ? (
                  <Button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs active:scale-95 shadow-xs"
                  >
                    <QrCode className="h-4 w-4 mr-1.5" />
                    <span>Xác thực Safe-Point (Quét QR)</span>
                  </Button>
                ) : !hasTrackingCode ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => setIsShipModalOpen(true)}
                      className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Truck className="h-4 w-4" />
                      <span className="truncate">Bàn giao GHN</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelOrder}
                      className="h-11 px-3 border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1 active:scale-95 shrink-0"
                    >
                      <XCircle className="h-4 w-4 text-rose-600" />
                      <span>Hủy</span>
                    </Button>
                  </div>
                ) : (
                  <div className="h-11 rounded-xl bg-orange-50 border border-orange-200 px-3 flex items-center justify-center text-center text-[11px] font-bold text-orange-800">
                    🚚 Chờ hãng vận chuyển xác nhận đã giao
                  </div>
                )
              ) : order.status === 'cancelled' ? (
                <div className="h-11 rounded-xl bg-rose-50 border border-rose-200 px-3 flex items-center justify-center text-center text-[11px] font-bold text-rose-700">
                  🚫 Đơn hàng đã hủy
                </div>
              ) : isOrderDelivered ? (
                <div className="h-11 rounded-xl bg-emerald-50 border border-emerald-200 px-3 flex items-center justify-center text-center text-[11px] font-bold text-emerald-800">
                  ⏳ Đang 48h bao test an toàn
                </div>
              ) : isOrderCompleted ? (
                order.reviewed ? (
                  <Button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    variant="outline"
                    className="w-full h-11 border-emerald-300 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>Xem đánh giá từ Người Mua</span>
                  </Button>
                ) : (
                  <div className="h-11 rounded-xl bg-emerald-50 border border-emerald-200 px-3 flex items-center justify-center text-center text-[11px] font-bold text-emerald-800">
                    ✅ Đơn hoàn tất • Chờ người mua đánh giá
                  </div>
                )
              ) : (
                <div className="h-11 rounded-xl bg-slate-100 px-3 flex items-center justify-center text-center text-[11px] font-bold text-slate-600">
                  {order.statusText}
                </div>
              )
            ) : (
              /* Buyer Action on Mobile */
              isOrderDisputed ? (
                <Button
                  asChild
                  className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                    <ShieldAlert className="h-4 w-4 mr-1.5 text-white" />
                    <span>Xem tiến độ trả hàng & khiếu nại</span>
                  </Link>
                </Button>
              ) : isOrderDelivered || isOrderShipping ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleConfirmReceived}
                    disabled={isConfirmingDelivery}
                    className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1 shrink-0" />
                    <span className="truncate">{isConfirmingDelivery ? 'Đang xử lý...' : 'Đã nhận đồ'}</span>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 px-3 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs shrink-0 flex items-center gap-1"
                    title="Yêu cầu trả hàng & hoàn tiền"
                  >
                    <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      <span>{isInterCampusShipping ? 'Trả hàng & Hoàn tiền' : 'Trả hàng'}</span>
                    </Link>
                  </Button>
                </div>
              ) : isOrderCompleted ? (
                !order.reviewed ? (
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      asChild
                      className="flex-1 h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Link href={`/orders/review?code=${encodeURIComponent(cleanCode)}`}>
                        <Star className="h-4 w-4 fill-white" />
                        <span>Đánh giá nhận +100 Xu</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 px-3 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs shrink-0 flex items-center gap-1"
                      title="Yêu cầu trả hàng & hoàn tiền"
                    >
                      <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <span>{isInterCampusShipping ? 'Trả hàng' : 'Khiếu nại'}</span>
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      variant="outline"
                      className="flex-1 h-11 border-emerald-300 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Xem lại đánh giá</span>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 px-3 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs shrink-0 flex items-center gap-1"
                      title="Yêu cầu trả hàng & hoàn tiền"
                    >
                      <Link href={`/orders/dispute?code=${encodeURIComponent(cleanCode)}`}>
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <span>{isInterCampusShipping ? 'Trả hàng' : 'Khiếu nại'}</span>
                      </Link>
                    </Button>
                  </div>
                )
              ) : (isOrderPending && !isCodOrder) ? (
                <Button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full h-11 bg-fpt-orange hover:bg-fpt-orange-hover text-white font-bold rounded-xl text-xs shadow-xs active:scale-95"
                >
                  <QrCode className="h-4 w-4 mr-1.5" />
                  <span>Thanh toán VietQR</span>
                </Button>
              ) : (
                <div className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3 flex items-center justify-between text-xs text-slate-700">
                  <span className="text-[11px] text-slate-500 truncate mr-2">Tổng thu:</span>
                  <strong className="text-sm font-black text-fpt-orange shrink-0">
                    {formatVND(totalBuyerPay)}
                  </strong>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
