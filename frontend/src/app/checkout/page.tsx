'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { ProductService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
import {
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Truck,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MessageSquare,
  Clock,
  ExternalLink,
  Wallet,
} from 'lucide-react';

// Campus mapping helper for rate calculation
function parseCampusCode(str: string): 'HOL' | 'DAD' | 'QN' | 'HCM' | 'CT' {
  const upper = (str || '').toUpperCase();
  if (upper.includes('HCM') || upper.includes('HỒ CHÍ MINH') || upper.includes('SÀI GÒN') || upper.includes('QUẬN 9')) {
    return 'HCM';
  }
  if (upper.includes('DAD') || upper.includes('ĐÀ NẴNG')) {
    return 'DAD';
  }
  if (upper.includes('QN') || upper.includes('QUY NHƠN') || upper.includes('BÌNH ĐỊNH')) {
    return 'QN';
  }
  if (upper.includes('CT') || upper.includes('CẦN THƠ')) {
    return 'CT';
  }
  return 'HOL';
}

const CAMPUS_NAMES: Record<string, string> = {
  HOL: 'FPT Hòa Lạc (Hà Nội)',
  DAD: 'FPT Đà Nẵng',
  QN: 'FPT Quy Nhơn',
  HCM: 'FPT TP.HCM (Quận 9)',
  CT: 'FPT Cần Thơ',
};

// Fallback rates if backend shipping estimation is unavailable
const LOCAL_SHIPPING_FEES: Record<string, Record<string, number>> = {
  HOL: { HOL: 10000, DAD: 30000, QN: 35000, HCM: 40000, CT: 45000 },
  DAD: { HOL: 30000, DAD: 10000, QN: 20000, HCM: 30000, CT: 35000 },
  QN:  { HOL: 35000, DAD: 20000, QN: 10000, HCM: 25000, CT: 30000 },
  HCM: { HOL: 40000, DAD: 30000, QN: 25000, HCM: 10000, CT: 20000 },
  CT:  { HOL: 45000, DAD: 35000, QN: 30000, HCM: 20000, CT: 10000 },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || searchParams.get('id');

  // Product state
  const [productData, setProductData] = useState<{
    id: string;
    sellerId?: string;
    sellerEmail?: string;
    title: string;
    price: number;
    imageUrl: string;
    campus: string;
    conditionBadge: string;
    description: string;
    sellerName: string;
    sellerCohort: string;
    sellerTrust: number;
  }>({
    id: productId || 'product-default',
    title: 'Màn hình phụ di động 15.6 inch Type-C FHD IPS (Fullbox cáp zin)',
    price: 1200000,
    imageUrl: '/products/monitor-dell-24.jpg',
    campus: 'HCM',
    conditionBadge: 'Like New 95%',
    description: 'Đầy đủ phụ kiện cáp C-to-C, HDMI mini, bao da kiêm giá đỡ. Màn Full HD IPS 60Hz hiển thị code/tài liệu mượt mà, pass lại để về quê thực tập.',
    sellerName: 'Nguyễn Văn An',
    sellerCohort: 'K16 Kỹ thuật phần mềm (SE)',
    sellerTrust: 96,
  });

  // Shipping calculation state
  const [shippingFee, setShippingFee] = useState<number>(40000);
  const [estimatedDays, setEstimatedDays] = useState<string>('2 - 3 ngày làm việc');
  const [transitHub, setTransitHub] = useState<string>('Hub Nam - Bắc (FPT TP.HCM ➔ FPT Hòa Lạc)');

  // Payment method state: vietqr | payos | cod
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'payos' | 'cod'>('vietqr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delivery notes state
  const [deliveryNote, setDeliveryNote] = useState('Giao tại sảnh Dom B vào buổi chiều sau giờ học Capstone.');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // User and KYC state
  const currentUser = useUserStore((state) => state.user);
  const addCoins = useUserStore((state) => state.addCoins);
  const isEduEmail = Boolean(
    currentUser.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    currentUser.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isKycVerified = isEduEmail || currentUser.kycStatus === 'approved_student' || currentUser.kycStatus === 'approved_seller';
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [useCoinDiscount, setUseCoinDiscount] = useState(false);

  const createOrder = useOrderStore((state) => state.createOrder);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch real product details if productId is supplied
  useEffect(() => {
    let isMounted = true;
    if (productId) {
      ProductService.getPostById(productId).then((post) => {
        if (!isMounted || !post) return;
        setProductData({
          id: post.id,
          sellerId: post.sellerId || post.seller?.id,
          sellerEmail: post.seller?.email,
          title: post.title,
          price: post.price,
          imageUrl: post.imageUrl || '/products/monitor-dell-24.jpg',
          campus: post.location || 'HCM',
          conditionBadge: post.badges?.[0] || 'Like New',
          description: post.description || post.title,
          sellerName: post.seller?.name || 'Sinh viên FPT',
          sellerCohort: post.seller?.cohort || 'FPT Student',
          sellerTrust: post.seller?.dealCount ? Math.min(99, 85 + post.seller.dealCount * 2) : 95,
        });
      });
    }
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // 2. Compute dynamic shipping fee via backend API / shipping matrix
  const originCode = parseCampusCode(productData.campus);
  const destinationCode = parseCampusCode(currentUser.campus || 'HOL');
  const typeParam = searchParams.get('type');
  const isSameCampus = originCode === destinationCode;
  const isMeetup = typeParam === 'meetup' || isSameCampus;

  useEffect(() => {
    let isMounted = true;
    if (isMeetup) {
      setShippingFee(0);
      setEstimatedDays('Hẹn gặp trực tiếp trong ngày');
      setTransitHub(`Safe-Point ${CAMPUS_NAMES[originCode] || originCode}`);
      return;
    }

    orderService
      .estimateShipping({
        fromCampus: originCode,
        toCampus: destinationCode,
        orderType: 'SHIP_COD',
      })
      .then((res) => {
        if (!isMounted || !res) return;
        setShippingFee(res.shippingFee);
        if (res.estimatedDays) setEstimatedDays(res.estimatedDays);
        if (res.transitHub) setTransitHub(res.transitHub);
      })
      .catch(() => {
        // Fallback locally
        const fallbackFee = LOCAL_SHIPPING_FEES[originCode]?.[destinationCode] ?? 30000;
        setShippingFee(fallbackFee);
      });

    return () => {
      isMounted = false;
    };
  }, [originCode, destinationCode, isMeetup]);

  // Voucher discount (only applies to inter-campus shipping)
  const voucherDiscount = isMeetup ? 0 : 15000;
  const effectiveShippingFee = isMeetup ? 0 : Math.max(0, shippingFee - voucherDiscount);

  // Coins discount: 1 Xu = 1.000 VNĐ. Task 3.3 / B3-10: Capped at 10% of product price
  const maxCoinsAllowed = Math.min(50, currentUser.coins, Math.floor((productData.price * 0.1) / 1000));
  const coinDiscountAmount = useCoinDiscount && maxCoinsAllowed > 0 ? maxCoinsAllowed * 1000 : 0;

  const totalAmount = Math.max(0, productData.price + effectiveShippingFee - coinDiscountAmount);

  const isOwner = Boolean(
    currentUser && (
      (currentUser.id && productData.sellerId && currentUser.id === productData.sellerId) ||
      (currentUser.email && productData.sellerEmail && currentUser.email.toLowerCase() === productData.sellerEmail.toLowerCase()) ||
      (currentUser.name && productData.sellerName && currentUser.name.trim().toLowerCase() === productData.sellerName.trim().toLowerCase())
    )
  );

  const handleConfirmOrder = async () => {
    if (isOwner) {
      showToast('🚫 Bạn không thể tự mua sản phẩm do chính bạn đăng bán!');
      return;
    }

    if (!isKycVerified) {
      showToast('⚠️ Vui lòng xác thực Thẻ Sinh Viên để đặt đơn Safe-Handoff và kích hoạt bảo hiểm FPT Care!');
      setIsKycModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let createdBackendOrder: any = null;
      try {
        createdBackendOrder = await orderService.createOrder({
          productId: productData.id,
          orderType: isMeetup ? 'MEETUP' : 'SHIP_COD',
          coinsUsed: useCoinDiscount ? maxCoinsAllowed : 0,
          deliveryNote,
          paymentMethod: paymentMethod === 'vietqr' ? 'VIETQR' : paymentMethod === 'payos' ? 'PAYOS_WEB' : 'CASH',
          shipping: isMeetup
            ? undefined
            : {
                receiverName: currentUser.name || 'Sinh viên FPT',
                receiverPhone: currentUser.phone || '0987654321',
                shippingAddress: `Phòng 402, Dom B, KTX FPT ${CAMPUS_NAMES[destinationCode] || destinationCode}`,
                destinationCampus: destinationCode,
                shippingPartner: 'FPT CampusShip',
              },
        });
      } catch (err: any) {
        if (err?.code === 'SELF_BUY_NOT_ALLOWED' || err?.message?.includes('tự mua')) {
          showToast('🚫 Bạn không thể tự mua sản phẩm do chính bạn đăng bán!');
          setIsSubmitting(false);
          return;
        }
        console.warn('Backend createOrder failed or offline, using resilient fallback:', err);
      }

      if (useCoinDiscount && maxCoinsAllowed > 0) {
        addCoins(-maxCoinsAllowed);
      }

      // Also persist to local Zustand store for instant, reliable UI sync
      const localOrder = createOrder({
        product: {
          title: productData.title,
          subtitle: isMeetup ? 'Bàn giao trực tiếp tại Safe-Point Campus' : (productData.description || 'Bàn giao chuẩn KTX'),
          price: productData.price,
          escrowBadge: isMeetup ? 'Xác thực QR Handshake' : 'Đã cọc Escrow bảo hộ',
          conditionBadge: productData.conditionBadge,
          imageUrl: productData.imageUrl,
          seller: {
            name: productData.sellerName,
            cohortCampus: `${productData.sellerCohort} - ${CAMPUS_NAMES[originCode] || originCode}`,
            verifiedText: isMeetup ? 'Bàn giao tại điểm hẹn an toàn' : 'Miễn phí ký gửi liên cơ sở',
          },
        },
        type: isMeetup ? 'safe-handoff' : 'inter-campus',
        deliveryNote,
        paymentMethod: paymentMethod === 'payos' ? 'PayOS Web' : paymentMethod === 'vietqr' ? 'VietQR Napas247' : (isMeetup ? 'Tiền mặt điểm hẹn' : 'COD KTX'),
      });

      const finalCode = createdBackendOrder?.orderCode || localOrder.code;

      // Handle PayOS Gateway redirection if returned by backend
      if (paymentMethod === 'payos' && createdBackendOrder?.payment?.payosCheckoutUrl) {
        showToast('🔗 Đang chuyển hướng tới Cổng thanh toán trực tuyến PayOS...');
        window.location.href = createdBackendOrder.payment.payosCheckoutUrl;
        return;
      }

      showToast(`🎉 Đặt hàng thành công! Đơn hàng ${finalCode} đã được khởi tạo.`);
      setTimeout(() => {
        router.push(
          `/checkout/success?orderCode=${finalCode}&paymentMethod=${paymentMethod}&amount=${totalAmount}&productId=${productData.id}`
        );
      }, 600);
    } catch {
      showToast('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* 1. BREADCRUMBS & ESCROW BADGE */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-fpt-orange transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-400">›</span>
            <Link href="/posts" className="hover:text-fpt-orange transition-colors">
              Sản phẩm sinh viên
            </Link>
            <span className="text-slate-400">›</span>
            <span className="text-slate-800 font-semibold">
              {isMeetup ? 'Đặt hẹn & Bàn giao Safe-Handoff' : 'Đặt hàng & Thanh toán Liên Campus'}
            </span>
            <span className="rounded bg-orange-100/80 px-2 py-0.5 text-[11px] font-bold text-fpt-orange border border-orange-200">
              {isMeetup ? 'Xác thực QR Handshake' : 'Bảo chứng Escrow 48h'}
            </span>
          </nav>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full self-start sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{isMeetup ? 'Bảo chứng Safe-Point ĐH FPT' : 'Giao dịch bảo hộ Escrow KTX ĐH FPT'}</span>
          </div>
        </div>

        {/* Unverified KYC Warning Banner */}
        {!isKycVerified && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-amber-950 text-sm">Yêu cầu Xác thực Thẻ Sinh Viên trước khi Đặt hàng:</h4>
                <p className="text-amber-800 mt-0.5">
                  Để bảo vệ an toàn giao dịch Safe-Handoff và kích hoạt bảo hiểm hoàn tiền 48h FPT Care, người mua cần xác thực thẻ sinh viên chính chủ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsKycModalOpen(true)}
              className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer shrink-0 text-center shadow-xs"
            >
              Xác thực Thẻ SV ngay
            </button>
          </div>
        )}

        {/* 2. MAIN 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: SECTIONS (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* SECTION 1: VẬN CHUYỂN / SAFE-HANDOFF */}
            <div className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-xs ${isMeetup ? 'border-emerald-200' : 'border-orange-100'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2 text-white shrink-0 shadow-xs ${isMeetup ? 'bg-emerald-600' : 'bg-fpt-orange'}`}>
                    {isMeetup ? <ShieldCheck className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {isMeetup ? 'Giao dịch Safe-Handoff Nội bộ Campus' : 'Vận chuyển Liên Campus FPT CampusShip'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isMeetup
                        ? 'Gặp mặt và kiểm tra hàng trực tiếp tại các điểm hẹn an toàn (Safe-Points) trong khuôn viên trường'
                        : 'Tuyến giao vận chuyên trách giữa 5 cơ sở FPT Edu (Hà Nội • Đà Nẵng • Quy Nhơn • TP.HCM • Cần Thơ)'}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border self-start sm:self-auto ${isMeetup ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  <span className={`h-2 w-2 rounded-full ${isMeetup ? 'bg-emerald-600' : 'bg-emerald-500'}`}></span>
                  {transitHub}
                </span>
              </div>

              {/* Transit Route Visualization */}
              <div className="mt-5 rounded-xl bg-slate-50/80 border border-slate-200/80 p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Origin */}
                  <div className="text-left">
                    <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {isMeetup ? 'ĐIỂM HẸN SAFE-POINT' : 'NƠI GỬI'}
                    </span>
                    <div className="mt-1 font-extrabold text-slate-900 text-sm">
                      {CAMPUS_NAMES[originCode] || originCode}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isMeetup ? 'Sảnh Tòa Alpha / Thư viện' : 'Bưu cục Safe-Handoff Point'}
                    </div>
                  </div>

                  {/* Route line & info */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <div className="flex items-center justify-between w-full text-[11px] text-slate-500 font-medium mb-1">
                      <span>{isMeetup ? 'Bàn giao trực tiếp tại Campus' : (originCode === destinationCode ? 'Nội bộ Campus' : 'Tuyến xe liên tỉnh FPT')}</span>
                      <span className="text-fpt-orange font-bold">{estimatedDays}</span>
                    </div>
                    <div className="relative w-full h-2 bg-slate-200 rounded-full flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-fpt-orange to-emerald-500 rounded-full"></div>
                      <div className="absolute -top-1 bg-white border border-fpt-orange rounded-full p-0.5 shadow-xs">
                        {isMeetup ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Truck className="h-3.5 w-3.5 text-fpt-orange" />}
                      </div>
                    </div>
                    <span className="mt-1.5 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      {isMeetup ? 'MIỄN PHÍ VẬN CHUYỂN • TEST TRỰC TIẾP' : 'ĐƯỢC ĐÓNG THÙNG CHỐNG SỐC KTX'}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="text-left md:text-right">
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-fpt-orange uppercase">
                      {isMeetup ? 'HÌNH THỨC NHẬN' : 'NƠI NHẬN'}
                    </span>
                    <div className="mt-1 font-extrabold text-slate-900 text-sm">
                      {isMeetup ? 'Quét QR Handshake' : (CAMPUS_NAMES[destinationCode] || destinationCode)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isMeetup ? 'Mã OTP 4 số bảo mật' : 'Sảnh KTX / Lễ tân KTX Dom B'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {isMeetup ? (
                      <>
                        <strong>Xác thực Handshake 2 chiều.</strong> Bạn kiểm tra kỹ món đồ tại Safe Point rồi mới đọc mã OTP hoặc đưa mã QR cho người bán quét để hoàn tất giao dịch và kích hoạt bảo hành 24h.
                      </>
                    ) : (
                      <>
                        <strong>Bảo hộ Escrow 48 giờ.</strong> Tiền được giữ trên tài khoản bảo chứng của ĐH FPT, chỉ giải ngân cho người bán sau 48h từ lúc bạn nhận và kiểm tra thiết bị hoạt động tốt.
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: ĐỊA CHỈ & ĐIỂM BÀN GIAO */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-fpt-orange" />
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {isMeetup ? 'Địa điểm Hẹn gặp & Bàn giao Safe-Handoff' : 'Địa chỉ & Điểm Bàn giao KTX'}
                  </h2>
                </div>
                <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  XÁC THỰC FAP SSO
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SENDER CARD */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      BÊN GỬI (NGƯỜI BÁN)
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5">
                      Trust {productData.sellerTrust}/100
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{productData.sellerName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{productData.sellerCohort}</div>
                  <div className="mt-2 text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{isMeetup ? 'Bàn giao trực tiếp tại Safe-Point Campus' : `Safe-Handoff Point Thư viện ${CAMPUS_NAMES[originCode] || originCode}`}</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{isMeetup ? 'Sẵn sàng hẹn gặp tại sảnh / thư viện' : 'Đã nộp đồ tại Safe-Handoff Point'}</span>
                  </div>
                </div>

                {/* RECEIVER CARD */}
                <div className="rounded-xl bg-orange-50/50 p-4 border border-orange-200/70">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[10px] font-bold text-fpt-orange uppercase tracking-wider">
                      BÊN NHẬN (BẠN)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingNote(!isEditingNote)}
                      className="text-[11px] font-bold text-fpt-orange hover:underline cursor-pointer"
                    >
                      {isEditingNote ? 'Xong' : 'Thay đổi'}
                    </button>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">MSSV: {currentUser.studentId} • {currentUser.phone}</div>
                  <div className="mt-2 text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-fpt-orange shrink-0 mt-0.5" />
                    <span>{isMeetup ? `Safe-Point KTX / Khuôn viên ${CAMPUS_NAMES[destinationCode] || destinationCode}` : `Phòng 402, Dom B, KTX ${CAMPUS_NAMES[destinationCode] || destinationCode}`}</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-orange-200/60 text-[11px] text-slate-700">
                    {isEditingNote ? (
                      <input
                        type="text"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        className="w-full rounded border border-orange-300 bg-white px-2 py-1 text-xs outline-none"
                      />
                    ) : (
                      <span>
                        💬 <strong>Ghi chú:</strong> {deliveryNote}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: KIỆN HÀNG ĐẶT MUA */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Kiện hàng đặt mua
                </h2>
                <span className="text-xs text-slate-500 font-medium">1 sản phẩm được bảo đảm</span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-start gap-4">
                <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={productData.imageUrl}
                    alt={productData.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 rounded bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {originCode} ➔ {destinationCode}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                      {productData.conditionBadge}
                    </span>
                    <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                      Sinh viên FPT Pass
                    </span>
                    <span className="text-[11px] text-slate-400">Escrow bảo hộ 48h</span>
                  </div>

                  <h3 className="mt-1.5 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {productData.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {productData.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                      🛡️ Bao test 48h nhận
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                      📦 Được đồng kiểm hộp
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                      🔄 Hoàn tiền nếu lỗi
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Đơn giá niêm yết:</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {productData.price.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: PHƯƠNG THỨC THANH TOÁN */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {isMeetup ? 'Phương thức Thanh toán Safe-Handoff' : 'Phương thức Thanh toán Liên Campus'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isMeetup
                      ? 'Chọn cách thức thanh toán khi gặp mặt và bàn giao trực tiếp tại khuôn viên trường'
                      : 'Áp dụng chế độ ký quỹ đảm bảo quyền lợi khi vận chuyển khác thành phố'}
                  </p>
                </div>
                <span className="rounded bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-fpt-orange border border-orange-200">
                  {isMeetup ? 'QR HANDSHAKE 24H' : 'BẢO VỆ 2 CHIỀU'}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {/* OPTION 1: VIETQR NAPAS247 */}
                <div
                  onClick={() => setPaymentMethod('vietqr')}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'vietqr'
                      ? 'border-fpt-orange bg-orange-50/20 ring-2 ring-fpt-orange/15'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'vietqr'}
                        onChange={() => setPaymentMethod('vietqr')}
                        className="h-4 w-4 text-fpt-orange focus:ring-fpt-orange"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Quét mã QR Sàn FPT (VietQR Napas247 / Escrow An Toàn)
                          </span>
                          <span className="rounded bg-fpt-orange px-2 py-0.5 text-[10px] font-bold text-white">
                            KHUYÊN DÙNG
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                          ⚡ Xác thực tức thì 0đ phí • Tự động khớp lệnh sau 5 giây.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 pl-7 leading-relaxed">
                    {isMeetup
                      ? 'Tiền chuyển vào tài khoản Escrow trung gian của Sàn FPT. Người bán chỉ được giải ngân sau khi xác thực mã QR Handshake hoặc OTP tại điểm hẹn.'
                      : 'Tiền chuyển đến tài khoản Escrow trung gian của Sàn FPT 5Campus Marketplace. Chỉ giải ngân cho bạn bán sau 48h kể từ khi sinh viên nhận hàng thành công và bấm "Đã kiểm tra OK".'}
                  </p>

                  {/* VIETQR INFO CARD */}
                  {paymentMethod === 'vietqr' && (
                    <div className="mt-3 ml-7 rounded-xl border border-orange-200/80 bg-orange-50/60 p-3.5 sm:p-4 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            Thanh toán VietQR Napas247 chính xác tuyệt đối:
                          </h4>
                          <p className="text-slate-600 text-xs leading-relaxed">
                            Khi bạn bấm <span className="font-bold text-fpt-orange">&quot;Xác nhận đặt đơn&quot;</span>, hệ thống sẽ lưu đơn hàng vào Database và xuất mã QR Napas247 chính thức khớp 100% với mã đơn hàng của bạn.
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Tài khoản MB Bank Sàn FPT • Đối soát tự động thời gian thực (Webhook HMAC-SHA256)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* OPTION 2: PAYOS WEB GATEWAY */}
                <div
                  onClick={() => setPaymentMethod('payos')}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'payos'
                      ? 'border-fpt-orange bg-orange-50/20 ring-2 ring-fpt-orange/15'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'payos'}
                        onChange={() => setPaymentMethod('payos')}
                        className="h-4 w-4 text-fpt-orange focus:ring-fpt-orange"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Cổng thanh toán trực tuyến PayOS (Web Checkout)
                          </span>
                          <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            PAYOS WEB
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-700 mt-0.5 font-medium">
                          Hỗ trợ quét mã QR, thẻ ATM nội địa Napas, thẻ quốc tế Visa / MasterCard.
                        </p>
                      </div>
                    </div>
                    <CreditCard className="h-5 w-5 text-blue-600 shrink-0" />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 pl-7 leading-relaxed">
                    Sau khi nhấn &quot;Xác nhận đặt đơn&quot;, hệ thống sẽ tự động tạo link thanh toán PayOS bảo mật và tự động ghi nhận tiền vào Escrow ngay khi giao dịch thành công.
                  </p>
                </div>

                {/* OPTION 3: COD / CASH */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-fpt-orange bg-orange-50/20 ring-2 ring-fpt-orange/15'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-4 w-4 text-fpt-orange focus:ring-fpt-orange"
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {isMeetup ? 'Thanh toán tiền mặt khi gặp mặt (Cash Handshake)' : 'Thanh toán khi nhận hàng (COD Liên Campus)'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {isMeetup ? 'Tại Safe-Point' : 'Trả tại sảnh KTX'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 pl-7 leading-relaxed">
                    {isMeetup
                      ? 'Thanh toán tiền mặt hoặc chuyển khoản trực tiếp cho người bán tại điểm hẹn sau khi trực tiếp kiểm tra ưng ý món đồ.'
                      : 'Thanh toán tiền mặt hoặc chuyển khoản trực tiếp cho nhân viên giao vận FPT Express / Ban quản lý KTX sau khi bóc hộp, cắm thử thiết bị.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SUMMARY SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 space-y-5">
            {/* PAYMENT SUMMARY CARD */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900">Tóm tắt thanh toán</h3>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  FPT SAFE-ESCROW
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tiền hàng tạm tính</span>
                  <span className="font-bold text-slate-800">
                    {productData.price.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    {isMeetup ? 'Phí bàn giao Safe-Handoff' : `Phí ship liên campus (${originCode} ➔ ${destinationCode})`}
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                  </span>
                  <span className={`font-bold ${isMeetup ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {isMeetup ? '0 đ' : `${shippingFee.toLocaleString('vi-VN')} đ`}
                  </span>
                </div>

                {!isMeetup && (
                  <>
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> Voucher Freeship 5Campus
                      </span>
                      <span>-{voucherDiscount.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[11px] pl-3">
                      <span>• Phí vận chuyển thực tế:</span>
                      <span>{effectiveShippingFee.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Bảo hiểm đồ điện tử sinh viên
                  </span>
                  <span className="font-bold text-emerald-700">Miễn phí (FPT Care)</span>
                </div>

                {/* FPT Coin Redemption Option */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs mt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCoinDiscount}
                      onChange={(e) => setUseCoinDiscount(e.target.checked)}
                      disabled={currentUser.coins < 10 || maxCoinsAllowed <= 0}
                      className="mt-0.5 h-4 w-4 rounded border-amber-300 text-fpt-orange focus:ring-fpt-orange cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <span>🪙</span>
                          <span>Dùng {maxCoinsAllowed} FPT Coin</span>
                        </span>
                        <span className="font-bold text-emerald-600">
                          -{(maxCoinsAllowed * 1000).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Số dư: <strong className="text-amber-900">{currentUser.coins} Xu</strong>
                        {currentUser.coins < 10 ? ' (Cần tối thiểu 10 Xu)' : ' (Giảm tối đa 10% giá trị món đồ)'}
                      </div>
                    </div>
                  </label>
                </div>

                {/* TOTAL AMOUNT */}
                <div className="pt-4 border-t border-slate-200/80">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        TỔNG THANH TOÁN
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {useCoinDiscount && maxCoinsAllowed > 0
                          ? `Đã áp dụng -${(maxCoinsAllowed * 1000).toLocaleString('vi-VN')} đ từ Xu`
                          : 'Đã bao gồm VAT & Phí Escrow'}
                      </div>
                    </div>
                    <div className="text-2xl font-black text-fpt-orange">
                      {totalAmount.toLocaleString('vi-VN')} <span className="text-sm font-bold">đ</span>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-semibold mb-3 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Bạn không thể tự mua sản phẩm do chính bạn đăng bán. Vui lòng quay lại hoặc đăng nhập tài khoản khác.</span>
                  </div>
                )}

                {/* CTA BUTTON */}
                <button
                  type="button"
                  disabled={isSubmitting || isOwner}
                  onClick={handleConfirmOrder}
                  className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition-all active:scale-98 ${
                    isOwner
                      ? 'bg-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-fpt-orange hover:bg-fpt-orange-hover hover:shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span>
                    {isOwner
                      ? 'Không thể tự mua sản phẩm của mình'
                      : isSubmitting
                      ? 'Đang xác nhận...'
                      : `Xác nhận đặt đơn • ${totalAmount.toLocaleString('vi-VN')} đ`}
                  </span>
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-tight pt-1">
                  Nhấn xác nhận đồng nghĩa với việc đồng thuận{' '}
                  <span className="underline decoration-slate-300">Quy chế thương mại nội bộ ĐH FPT</span>.
                </p>
              </div>

              {/* TRUST BADGES */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>100% Sinh viên chính quy:</strong> Cả người bán và người mua đều được xác thực danh tính qua cổng FAP / Office365 sinh viên.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Chống lừa đảo 100%:</strong> Giao nhận có camera an ninh tại Safe-Handoff Point Thư viện và Lễ tân Dom KTX.
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Cần hỗ trợ đơn hàng?</span>
                <span className="font-bold text-fpt-orange hover:underline cursor-pointer">
                  Trợ lý CTSV trực 24/7
                </span>
              </div>
            </div>

            {/* CAMPUS CULTURE CARD */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
              <div className="rounded-lg bg-orange-100 p-2 text-fpt-orange shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Giao lưu Văn hóa 5 Campus:</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                  Mỗi món đồ chuyển đi là một câu chuyện kết nối sinh viên Hòa Lạc - Sài Gòn - Đà Nẵng - Cần Thơ - Quy Nhơn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal KYC Registration */}
      <KycRegistrationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        defaultRole="student"
        onShowToast={showToast}
      />

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 font-medium">
          Đang tải trang thanh toán 5Campus...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
