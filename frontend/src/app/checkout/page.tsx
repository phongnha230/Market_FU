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
  Clock,
  ExternalLink,
  Wallet,
  Calendar,
} from 'lucide-react';
import { safehandoffService, SafeHandoffHubItem } from '@/services/safehandoffService';
import { useVoucherStore, UserVoucher } from '@/stores/voucherStore';
import { Ticket, Tag, X } from 'lucide-react';

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

  // Payment method state: payos (VietQR Napas247 tự động) | cod (Thanh toán khi nhận)
  const [paymentMethod, setPaymentMethod] = useState<'payos' | 'cod'>('payos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safe-Handoff Appointment & Meetup location state
  const [availableHubs, setAvailableHubs] = useState<SafeHandoffHubItem[]>([]);
  const [selectedHub, setSelectedHub] = useState<string>('Sảnh Tòa Alpha (Trạm camera 24/7 & bàn test)');
  const [appointmentDate, setAppointmentDate] = useState<'today' | 'tomorrow'>('today');
  const [appointmentSlot, setAppointmentSlot] = useState<string>('16:30 - 17:15 (Sau ca 4)');

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

  // Voucher State
  const myVouchers = useVoucherStore((state) => state.myVouchers);
  const fetchMyVouchers = useVoucherStore((state) => state.fetchMyVouchers);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [customVoucherInput, setCustomVoucherInput] = useState('');
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  useEffect(() => {
    fetchMyVouchers().catch(() => {});
  }, [fetchMyVouchers]);



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
          campus: post.campus || post.campusTag || post.seller?.cohort || post.location || 'QN',
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

  // Tự động gợi ý voucher Freeship cho đơn liên campus nếu có trong ví
  useEffect(() => {
    if (!isMeetup && !selectedVoucher && myVouchers && myVouchers.length > 0) {
      const shipVoucher = myVouchers.find(
        (v) =>
          v.status === 'UNUSED' &&
          (v.voucher.partner === 'CAMPUS_SHIP' ||
            v.voucher.partner === 'OTHER' ||
            v.voucher.title.toLowerCase().includes('ship') ||
            v.voucher.title.toLowerCase().includes('vận chuyển'))
      );
      if (shipVoucher) {
        setSelectedVoucher(shipVoucher);
      }
    }
  }, [isMeetup, myVouchers, selectedVoucher]);

  // 2b. Fetch safe-handoff hubs for current campus when isMeetup
  useEffect(() => {
    if (isMeetup) {
      safehandoffService
        .getHubs({ campus: originCode })
        .then((res) => {
          if (res.hubs && res.hubs.length > 0) {
            setAvailableHubs(res.hubs);
            const operatingHub = res.hubs.find((h) => h.isOperating) || res.hubs[0];
            setSelectedHub(`${operatingHub.name} (${operatingHub.locationDetails || 'Trạm Safe-Point'})`);
          }
        })
        .catch(() => {});
    }
  }, [isMeetup, originCode]);

  useEffect(() => {
    let isMounted = true;
    if (isMeetup) {
      setShippingFee(0);
      setEstimatedDays(`${appointmentSlot} • ${appointmentDate === 'today' ? 'Hôm nay' : 'Ngày mai'}`);
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

  // Voucher discount (Freeship CampusShip hoặc voucher đối tác)
  const isShippingVoucher = Boolean(
    selectedVoucher &&
      (selectedVoucher.voucher.partner === 'CAMPUS_SHIP' ||
        selectedVoucher.voucher.partner === 'OTHER' ||
        selectedVoucher.voucher.title.toLowerCase().includes('vận chuyển') ||
        selectedVoucher.voucher.title.toLowerCase().includes('ship'))
  );
  const rawVoucherDiscount = selectedVoucher ? selectedVoucher.voucher.discountValue : 0;
  const voucherDiscount = isShippingVoucher
    ? Math.min(shippingFee, rawVoucherDiscount)
    : rawVoucherDiscount;
  const effectiveShippingFee = isMeetup ? 0 : Math.max(0, shippingFee - (isShippingVoucher ? voucherDiscount : 0));
  const productVoucherDiscount = !isShippingVoucher ? voucherDiscount : 0;

  // Negotiated price agreed in Chat P2P
  const rawAgreedPrice = searchParams.get('agreedPrice') || searchParams.get('offerPrice');
  const agreedPrice = rawAgreedPrice ? parseInt(rawAgreedPrice.replace(/\D/g, ''), 10) : null;
  const isAgreedPriceApplied = Boolean(agreedPrice && agreedPrice > 0 && agreedPrice < productData.price);
  const effectiveProductPrice = isAgreedPriceApplied ? (agreedPrice as number) : productData.price;

  // Coins discount: 1 Xu = 1.000 VNĐ. Task 3.3 / B3-10: Capped at 10% of product price
  const maxCoinsAllowed = Math.min(50, currentUser.coins, Math.floor((effectiveProductPrice * 0.1) / 1000));
  const coinDiscountAmount = useCoinDiscount && maxCoinsAllowed > 0 ? maxCoinsAllowed * 1000 : 0;

  const totalAmount = Math.max(0, effectiveProductPrice + effectiveShippingFee - productVoucherDiscount - coinDiscountAmount);

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
      let appointmentIso: string | undefined = undefined;
      if (isMeetup) {
        const targetDate = new Date();
        if (appointmentDate === 'tomorrow') {
          targetDate.setDate(targetDate.getDate() + 1);
        }
        const hourMatch = appointmentSlot.match(/(\d{1,2}):(\d{2})/);
        if (hourMatch) {
          targetDate.setHours(parseInt(hourMatch[1], 10), parseInt(hourMatch[2], 10), 0, 0);
        } else {
          targetDate.setHours(16, 30, 0, 0);
        }
        appointmentIso = targetDate.toISOString();
      }

      let createdBackendOrder: any = null;
      try {
        createdBackendOrder = await orderService.createOrder({
          productId: productData.id,
          orderType: isMeetup ? 'MEETUP' : 'SHIP_COD',
          coinsUsed: useCoinDiscount ? maxCoinsAllowed : 0,
          agreedPrice: isAgreedPriceApplied ? effectiveProductPrice : undefined,
          deliveryNote,
          meetupLocation: isMeetup ? selectedHub : undefined,
          safePoint: isMeetup ? selectedHub : undefined,
          appointmentTime: appointmentIso,
          voucherCode: selectedVoucher ? selectedVoucher.voucherCode : undefined,
          paymentMethod: paymentMethod === 'payos' ? 'PAYOS_WEB' : 'CASH',
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
        if (paymentMethod === 'payos' || isAgreedPriceApplied ||
            (err?.response?.status >= 400 && err?.response?.status < 500)) {
          throw err;
        }
        console.warn('Backend createOrder failed or offline, using resilient fallback:', err);
      }

      if (useCoinDiscount && maxCoinsAllowed > 0) {
        addCoins(-maxCoinsAllowed);
      }

      // Only fallback to local Zustand store if backend failed or offline
      let finalCode = createdBackendOrder?.orderCode;
      if (!finalCode) {
        const localOrder = createOrder({
          product: {
            title: productData.title,
            subtitle: isMeetup ? selectedHub : (productData.description || 'Bàn giao chuẩn KTX'),
            price: effectiveProductPrice,
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
          appointmentTime: appointmentIso,
          meetupLocation: isMeetup ? selectedHub : undefined,
          paymentMethod: paymentMethod === 'payos' ? 'VietQR Napas247 (Tự động)' : (isMeetup ? 'Tiền mặt điểm hẹn' : 'COD KTX'),
        });
        finalCode = localOrder.code;
      }

      // Handle PayOS Gateway redirection if returned by backend
      if (paymentMethod === 'payos') {
        const payosCheckoutUrl = createdBackendOrder?.payment?.payosCheckoutUrl;
        if (!payosCheckoutUrl) {
          throw new Error('Backend không trả về liên kết thanh toán PayOS.');
        }
        showToast('🔗 Đang chuyển hướng tới Cổng thanh toán trực tuyến PayOS...');
        window.location.href = payosCheckoutUrl;
        return;
      }

      showToast(`🎉 Đặt hàng thành công! Đơn hàng ${finalCode} đã được khởi tạo.`);
      setTimeout(() => {
        router.push(
          `/checkout/success?orderCode=${finalCode}&paymentMethod=${paymentMethod}&amount=${totalAmount}&productId=${productData.id}&meetupLocation=${encodeURIComponent(selectedHub)}&appointmentTime=${encodeURIComponent(appointmentIso || '')}`
        );
      }, 600);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.error?.message || err?.response?.data?.message;
      showToast(apiMessage || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
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
                      {isMeetup ? selectedHub : 'Bưu cục Safe-Handoff Point'}
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

              {/* SAFE-HANDOFF APPOINTMENT & HUB SELECTION */}
              {isMeetup && (
                <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-fpt-orange" />
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        Chọn Trạm Safe-Point & Thời gian hẹn giao dịch
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      🛡️ Camera 24/7 & Bàn test thiết bị
                    </span>
                  </div>

                  {/* 1. Chọn Trạm Safe-Point Hub */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                      1. Điểm hẹn giao dịch tại trường ({CAMPUS_NAMES[originCode] || originCode}):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(availableHubs.length > 0
                        ? availableHubs.map((h) => ({
                            id: h.id,
                            name: `${h.name} (${h.locationDetails || 'Trạm Safe-Point'})`,
                            desc: h.notes || 'Có camera giám sát an ninh và bàn test thiết bị trực tiếp',
                            badge: h.status || 'Hoạt động',
                          }))
                        : [
                            {
                              id: 'hub-1',
                              name: 'Sảnh Tòa Alpha (Khu vực có bàn test & Camera 24/7)',
                              desc: 'Điểm hẹn an toàn chính tại sảnh ĐH FPT, có bảo vệ và camera giám sát',
                              badge: 'Bàn test điện',
                            },
                            {
                              id: 'hub-2',
                              name: 'Thư viện Gamma (Tầng 1 - Khu tự học test máy)',
                              desc: 'Ánh sáng tốt, không gian yên tĩnh, thích hợp test laptop & tablet',
                              badge: 'Yên tĩnh',
                            },
                            {
                              id: 'hub-3',
                              name: 'Sảnh KTX Dom A-B (Gần quầy lễ tân)',
                              desc: 'Thuận tiện giao nhận buổi trưa và tối cho sinh viên nội trú',
                              badge: 'Bảo vệ KTX',
                            },
                            {
                              id: 'hub-4',
                              name: 'Căn tin Dom E-F (Khu ăn uống & cà phê)',
                              desc: 'Gần trạm VinBus, thoáng mát, thích hợp hẹn gặp giờ giải lao',
                              badge: 'Căn tin',
                            },
                          ]
                      ).map((hub) => (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => setSelectedHub(hub.name)}
                          className={`text-left p-3 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                            selectedHub === hub.name
                              ? 'border-fpt-orange bg-orange-50/60 ring-2 ring-fpt-orange/40 shadow-xs'
                              : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70 text-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 leading-snug">{hub.name}</span>
                            {selectedHub === hub.name ? (
                              <CheckCircle2 className="h-4 w-4 text-fpt-orange shrink-0 mt-0.5" />
                            ) : (
                              <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 shrink-0">
                                {hub.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{hub.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Chọn Ngày & Khung Giờ Hẹn */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Chọn Ngày */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                        2. Chọn ngày gặp mặt:
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAppointmentDate('today')}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                            appointmentDate === 'today'
                              ? 'border-fpt-orange bg-orange-50 text-fpt-orange shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Hôm nay ({new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppointmentDate('tomorrow')}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                            appointmentDate === 'tomorrow'
                              ? 'border-fpt-orange bg-orange-50 text-fpt-orange shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Ngày mai ({(() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
                          })()})
                        </button>
                      </div>
                    </div>

                    {/* Chọn Giờ / Ca Hẹn */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                        3. Chọn ca / giờ hẹn gặp:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: '11:30 - 12:30 (Trưa ca 2)', icon: '🌅' },
                          { label: '16:30 - 17:15 (Chiều ca 4)', icon: '☀️' },
                          { label: '17:30 - 18:30 (Tan học chiều)', icon: '🌇' },
                          { label: '19:30 - 20:30 (Tối tại KTX)', icon: '🌙' },
                        ].map((slot) => (
                          <button
                            key={slot.label}
                            type="button"
                            onClick={() => setAppointmentSlot(slot.label)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer text-center ${
                              appointmentSlot === slot.label
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{slot.icon} {slot.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tóm tắt Cuộc hẹn */}
                  <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3.5 flex items-start gap-3 text-xs text-amber-900">
                    <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-amber-950">
                        Lịch hẹn dự kiến: {appointmentSlot} • {appointmentDate === 'today' ? 'Hôm nay' : 'Ngày mai'}
                      </div>
                      <div className="mt-0.5 text-amber-800">
                        📍 <strong>Địa điểm:</strong> {selectedHub}
                      </div>
                      <p className="text-[11px] text-amber-700 mt-1">
                        Sau khi bấm <strong>Xác nhận đặt đơn</strong>, hệ thống tự động lưu lịch hẹn này vào đơn hàng và phát hành <strong>Mã QR Handshake + OTP 4 số</strong> để bạn mang đến trạm gặp người bán.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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

            {/* SECTION: VOUCHER & FREESHIP ƯU ĐÃI - CHỈ HIỂN THỊ VỚI ĐƠN HÀNG LIÊN CAMPUS */}
            {!isMeetup && (
              <div className="rounded-2xl border border-purple-200/80 bg-linear-to-r from-purple-50/40 via-white to-orange-50/30 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-purple-100/80">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-black text-slate-900">
                          Ưu Đãi Freeship Đơn Liên Campus
                        </h2>
                        <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          {originCode} ➔ {destinationCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Cước vận chuyển liên Campus: <strong className="text-slate-800">{shippingFee.toLocaleString('vi-VN')} đ</strong>. Mở Ví Voucher của bạn để áp mã miễn/giảm cước.
                      </p>
                    </div>
                  </div>
                  {selectedVoucher && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800 border border-emerald-300">
                      ✓ ĐÃ ÁP DỤNG
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {selectedVoucher ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                          <Check className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm">
                              {selectedVoucher.voucher.title}
                            </span>
                            <span className="rounded bg-white border border-emerald-300 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800">
                              {selectedVoucher.voucherCode}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-900 font-semibold mt-1">
                            ⚡ Đã trừ <strong className="text-emerald-700">-{voucherDiscount.toLocaleString('vi-VN')}đ</strong> vào cước vận chuyển. Cước ship thực tế còn: <strong className="text-emerald-800">{effectiveShippingFee.toLocaleString('vi-VN')}đ</strong>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setIsVoucherModalOpen(true)}
                          className="rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                        >
                          Chọn mã khác
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedVoucher(null)}
                          className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                          title="Bỏ áp dụng voucher"
                        >
                          Bỏ chọn ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-purple-300 bg-white/90 p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                            <Ticket className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                              <span>Ví Voucher của tôi</span>
                              <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-bold">
                                {myVouchers.filter((v) => v.status === 'UNUSED').length} mã trong ví
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Bạn có voucher Freeship trong ví? Bấm nút bên cạnh để mở Ví và áp mã giảm cước ship ngay.
                            </p>
                          </div>
                        </div>

                        {/* Nút hành động mở Ví của tôi để áp mã */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setIsVoucherModalOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs cursor-pointer transition active:scale-98"
                          >
                            <Ticket className="h-4 w-4" />
                            <span>Mở Ví của tôi áp mã ›</span>
                          </button>
                          <Link
                            href="/vouchers"
                            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer text-center"
                            title="Chưa có voucher? Đổi thêm bằng Xu"
                          >
                            Đổi Xu lấy mã +
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                {/* OPTION 1: VIETQR NAPAS247 (PAYOS GATEWAY) - KHUYÊN DÙNG */}
                <div
                  onClick={() => setPaymentMethod('payos')}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
                    paymentMethod === 'payos'
                      ? 'border-fpt-orange bg-orange-50/20 ring-2 ring-fpt-orange/15 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'payos'}
                        onChange={() => setPaymentMethod('payos')}
                        className="h-4 w-4 text-fpt-orange focus:ring-fpt-orange mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Quét mã QR Ngân hàng (VietQR Napas 24/7 • Tự động khớp lệnh)
                          </span>
                          <span className="rounded bg-fpt-orange px-2 py-0.5 text-[10px] font-bold text-white">
                            KHUYÊN DÙNG
                          </span>
                          <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                            ESCROW BẢO HỘ 100%
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                          ⚡ Mở App Ngân hàng bất kỳ (VCB, MB, Techcom, BIDV,...) để quét • Khớp lệnh tự động trong 1-2 giây.
                        </p>
                      </div>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
                      <QrCode className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 pl-7 leading-relaxed">
                    {isMeetup
                      ? 'Tiền chuyển vào tài khoản Escrow trung gian của Sàn FPT. Người bán chỉ được giải ngân sau khi xác thực mã QR Handshake hoặc OTP tại điểm hẹn.'
                      : 'Tiền chuyển đến tài khoản Escrow trung gian của Sàn FPT 5Campus Marketplace. Chỉ giải ngân cho người bán sau 48h kể từ khi sinh viên nhận hàng thành công và bấm "Đã kiểm tra OK".'}
                  </p>

                  {/* PAYOS VIETQR INFO BOX */}
                  {paymentMethod === 'payos' && (
                    <div className="mt-3.5 ml-7 rounded-xl border border-orange-200/80 bg-orange-50/60 p-3.5 sm:p-4 text-xs space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-fpt-orange">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            Đối soát tự động qua Cổng thanh toán bảo mật PayOS (Napas 24/7):
                          </h4>
                          <p className="text-slate-600 text-xs leading-relaxed">
                            Khi bạn bấm <strong className="text-fpt-orange">&quot;Xác nhận đặt đơn&quot;</strong>, hệ thống sẽ kết nối với PayOS để hiển thị mã VietQR động chính thức. Khi bạn chuyển khoản xong, máy chủ sẽ tự động nhận Webhook và chuyển trạng thái thành công ngay lập tức mà không cần chụp lại ảnh biên lai.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-600">
                        <span className="font-medium flex items-center gap-1.5 text-emerald-800">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Tự động kích hoạt bảo chứng Escrow ngay khi tiền tới
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">MB Bank</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Vietcombank</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Techcombank</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Napas247</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* OPTION 2: COD / CASH */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-fpt-orange bg-orange-50/20 ring-2 ring-fpt-orange/15 shadow-xs'
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
                        className="h-4 w-4 text-fpt-orange focus:ring-fpt-orange cursor-pointer"
                      />
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {isMeetup ? 'Thanh toán tiền mặt khi gặp mặt (Cash Handshake)' : 'Thanh toán khi nhận hàng (COD KTX FPT)'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isMeetup ? 'Thanh toán tiền mặt hoặc chuyển khoản tại Safe-Point sau khi test hàng' : 'Đồng kiểm tra bưu kiện tại sảnh KTX trước khi thanh toán cho bưu tá'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {isMeetup ? 'Tại Safe-Point' : 'Trả tại sảnh KTX'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 pl-7 leading-relaxed">
                    {isMeetup
                      ? 'Thanh toán trực tiếp cho người bán tại điểm hẹn sau khi trực tiếp kiểm tra ưng ý món đồ.'
                      : 'Thanh toán tiền mặt hoặc chuyển khoản cho nhân viên giao vận FPT Express / Ban quản lý KTX sau khi bóc hộp, cắm thử thiết bị.'}
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
                  <span>Tiền hàng</span>
                  <div className="text-right">
                    {isAgreedPriceApplied && (
                      <span className="text-slate-400 line-through text-[11px] mr-1.5">
                        {productData.price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                    <span className={`font-bold ${isAgreedPriceApplied ? 'text-fpt-orange text-sm' : 'text-slate-800'}`}>
                      {effectiveProductPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {isAgreedPriceApplied && (
                  <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 text-[11px] font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Giá chốt thương lượng trong Chat
                    </span>
                    <span className="font-bold text-emerald-700">
                      -{(productData.price - effectiveProductPrice).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                )}

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

            {/* Modal Voucher Selector */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-fpt-orange" />
                <h3 className="text-base font-black text-slate-900">Ví Voucher của tôi (Chọn mã Freeship Liên Campus)</h3>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nhập mã thủ công */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = customVoucherInput.trim().toUpperCase();
                if (!code) return;
                const matched = myVouchers.find((v) => v.voucherCode.toUpperCase() === code && v.status === 'UNUSED');
                if (matched) {
                  setSelectedVoucher(matched);
                  setIsVoucherModalOpen(false);
                  setCustomVoucherInput('');
                  showToast(`🎟️ Đã áp dụng ${matched.voucher.title}!`);
                } else {
                  showToast('Mã voucher không tồn tại trong ví của bạn hoặc đã hết hạn!');
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nhập mã voucher (VD: FUV-SHIP-8A3F2C)"
                value={customVoucherInput}
                onChange={(e) => setCustomVoucherInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm sm:text-xs font-medium focus:border-orange-500 focus:outline-hidden uppercase"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition cursor-pointer shrink-0"
              >
                Áp dụng
              </button>
            </form>

            {/* Danh sách voucher có sẵn */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {myVouchers.filter((v) => v.status === 'UNUSED').length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 space-y-3">
                  <p>Bạn chưa có mã voucher nào khả dụng trong ví.</p>
                  <Link
                    href="/vouchers"
                    className="inline-block rounded-xl bg-orange-50 border border-orange-200 px-4 py-2 text-xs font-bold text-fpt-orange hover:bg-orange-100"
                  >
                    Đến Kho Voucher đổi Xu ngay ›
                  </Link>
                </div>
              ) : (
                myVouchers
                  .filter((v) => v.status === 'UNUSED')
                  .map((item) => {
                    const isSelected = selectedVoucher?.voucherCode === item.voucherCode;
                    const isShip =
                      item.voucher.partner === 'CAMPUS_SHIP' ||
                      item.voucher.partner === 'OTHER' ||
                      item.voucher.title.toLowerCase().includes('ship') ||
                      item.voucher.title.toLowerCase().includes('vận chuyển');

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-400'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-900">
                              {item.voucher.title}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isShip
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {isShip ? 'FREESHIP' : 'GIẢM GIÁ'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {item.voucher.description || 'Ưu đãi đổi từ Campus Coins'}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Mã: <strong className="text-slate-700">{item.voucherCode}</strong> • HSD: {item.expiredAt}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-xs font-black text-emerald-600">
                            -{item.voucher.discountValue.toLocaleString('vi-VN')} đ
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVoucher(item);
                              setIsVoucherModalOpen(false);
                              showToast(`🎟️ Đã áp dụng ${item.voucher.title}!`);
                            }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-fpt-orange text-white hover:bg-fpt-orange-hover'
                            }`}
                          >
                            {isSelected ? 'Đang dùng' : 'Dùng mã'}
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                href="/vouchers"
                className="font-bold text-fpt-orange hover:underline flex items-center gap-1"
              >
                <span>🪙 Đổi thêm voucher bằng Campus Coins</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
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
