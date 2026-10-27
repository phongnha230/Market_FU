'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Card,
  Button,
  Badge,
  Separator,
  Avatar,
  AvatarFallback,
} from '@/components/ui';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { ProductService } from '@/services/productService';
import { orderService, BackendOrder } from '@/services/orderService';
import { socketClient } from '@/services/socketClient';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  ShoppingBag,
  MessageSquare,
  MapPin,
  Calendar,
  Sparkles,
  Coins,
  Building2,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Receipt,
  FileCheck,
  CreditCard,
  XCircle,
  RotateCcw,
} from 'lucide-react';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('appOrderCode') || searchParams.get('orderCode') || 'ORD-88392-HCM-HL';
  const paymentMethodParam = searchParams.get('paymentMethod') || 'payos';
  const amountParam = searchParams.get('amount');
  const productId = searchParams.get('productId');
  const isMobileSource = searchParams.get('source') === 'mobile';

  const paymentMethod = paymentMethodParam.toLowerCase();
  const isOnlinePayment = paymentMethod === 'vietqr' || paymentMethod === 'payos';
  const payosWasCancelled = searchParams.get('cancelled') === 'true' || searchParams.get('cancel') === 'true';
  const [isCancelledByPayos, setIsCancelledByPayos] = useState<boolean>(payosWasCancelled);

  const [backendOrder, setBackendOrder] = useState<BackendOrder | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    // The return URL is user-controlled navigation data. Only the backend can confirm online payments.
    return paymentMethodParam.toLowerCase() === 'cod';
  });
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = useUserStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);

  // Find local order or fallback
  const existingOrder = orders.find((o) => o.code === orderCode) || orders[0];

  const [productData, setProductData] = useState({
    id: productId || 'prod-default',
    title: existingOrder?.product?.title || 'Màn hình phụ di động 15.6 inch Type-C FHD IPS (Fullbox cáp zin)',
    price: amountParam ? parseInt(amountParam, 10) : existingOrder?.product?.price || 1225000,
    imageUrl: existingOrder?.product?.imageUrl || '/products/monitor-dell-24.jpg',
    conditionBadge: existingOrder?.product?.conditionBadge || 'Like New 95%',
    sellerName: existingOrder?.product?.seller?.name || 'Nguyễn Văn An',
    sellerCohort: existingOrder?.product?.seller?.cohortCampus || 'K16 SE - FPT TP.HCM',
    originCampus: 'FPT TP.HCM (Quận 9)',
    destinationCampus: 'FPT Hòa Lạc (Dom B, KTX)',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelPendingOrder = async () => {
    if (!backendOrder?.id || isCancellingOrder) return;
    try {
      setIsCancellingOrder(true);
      await orderService.cancelOrder(backendOrder.id, 'Người mua hủy thanh toán PayOS');
      router.push('/orders');
    } catch (error: any) {
      showToast(error?.response?.data?.error?.message || error?.message || 'Chưa thể hủy đơn. Vui lòng thử lại.');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const handleCopyOrderCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopiedCode(true);
    showToast(`Đã sao chép mã đơn hàng #${orderCode}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('FPT5CAMPUS-FREESHIP20K');
    setCopiedVoucher(true);
    showToast('Đã sao chép mã voucher giảm 20.000đ!');
    setTimeout(() => setCopiedVoucher(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(productData.price.toString());
    setCopiedAmount(true);
    showToast(`Đã sao chép số tiền ${productData.price.toLocaleString('vi-VN')} đ`);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyBankAcc = () => {
    navigator.clipboard.writeText('0348888999');
    setCopiedBankAcc(true);
    showToast('Đã sao chép số tài khoản MB Bank: 0348888999');
    setTimeout(() => setCopiedBankAcc(false), 2000);
  };

  // 1. Fetch real backend order details
  useEffect(() => {
    let isMounted = true;
    if (orderCode) {
      orderService.getOrderDetail(orderCode).then((ord) => {
        if (!isMounted || !ord) return;
        setBackendOrder(ord);
        if (ord.payment?.isPaid || ord.status === 'PAID' || ord.status === 'COMPLETED') {
          setIsPaid(true);
        } else if (ord.status === 'CANCELLED' || (ord.status as string) === 'cancelled') {
          setIsCancelledByPayos(true);
        }

        if (ord.product) {
          const prodAny = ord.product as any;
          const sellerName = (ord as any).seller?.profile?.fullName || (ord as any).seller?.fullName || prodAny.seller?.name || 'Người bán FPT';
          const sellerCohort = (ord as any).seller?.profile?.cohort || (ord as any).seller?.cohort || prodAny.seller?.cohort || 'Sinh viên FPT';
          const sellerCampus = (ord as any).seller?.profile?.campus || ord.product.campus || 'HOL';
          const firstImg = Array.isArray(ord.product.images) && ord.product.images.length > 0
            ? (typeof ord.product.images[0] === 'string' ? ord.product.images[0] : (ord.product.images[0] as any)?.imageUrl)
            : (prodAny.imageUrl || undefined);

          setProductData((prev) => ({
            ...prev,
            id: ord.product?.id || ord.productId || prev.id,
            title: ord.product?.title || prev.title,
            price: ord.product?.price || ord.payment?.price || prev.price,
            imageUrl: firstImg || prev.imageUrl,
            conditionBadge: prodAny.condition || prev.conditionBadge,
            sellerName,
            sellerCohort,
            originCampus: `FPT ${sellerCampus}`,
            destinationCampus: ord.shipping?.shippingAddress || prev.destinationCampus,
          }));
        }
      }).catch((err) => {
        console.warn('Could not fetch backend order detail:', err);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [orderCode]);

  // 1b. Tự động hủy đơn hàng và giải phóng sản phẩm khi PayOS redirect về cancelled=true
  useEffect(() => {
    let isCancelled = false;
    if (
      payosWasCancelled &&
      backendOrder?.id &&
      (backendOrder.status === 'PENDING' || (backendOrder.status as string) === 'pending') &&
      !backendOrder.payment?.isPaid
    ) {
      orderService
        .cancelOrder(backendOrder.id, 'Người mua hủy giao dịch trên PayOS')
        .then(() => {
          if (!isCancelled) {
            setIsCancelledByPayos(true);
            showToast('Đã tự động hủy đơn và hoàn lại quyền mua.');
          }
        })
        .catch((err) => {
          console.warn('Auto cancel order error:', err);
          if (!isCancelled) {
            setIsCancelledByPayos(true);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [payosWasCancelled, backendOrder?.id, backendOrder?.status, backendOrder?.payment?.isPaid]);

  // 2. Poll payment status if online payment and unpaid
  useEffect(() => {
    if (isPaid || !isOnlinePayment) return;

    const interval = setInterval(async () => {
      try {
        const res = await orderService.checkPaymentStatus(orderCode);
        if (res?.isPaid || res?.status === 'PAID' || res?.status === 'COMPLETED') {
          setIsPaid(true);
          showToast('🎉 Nhận được thanh toán chuyển khoản! Tiền đã vào ví Escrow.');
          clearInterval(interval);
        }
      } catch {
        // ignore polling failures
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderCode, isPaid, isOnlinePayment]);

  // 3. Socket.io real-time listener for order_paid
  useEffect(() => {
    const socket = socketClient.getSocket();
    if (!socket) return;

    const handleOrderPaid = (data: any) => {
      if (data?.orderCode === orderCode || data?.orderId === backendOrder?.id) {
        setIsPaid(true);
        showToast('🎉 Xác nhận thanh toán Escrow thành công qua VietQR!');
      }
    };

    socket.on('order_paid', handleOrderPaid);
    return () => {
      socket.off('order_paid', handleOrderPaid);
    };
  }, [orderCode, backendOrder?.id]);

  const realVietqrUrl =
    backendOrder?.payment?.vietqrUrl ||
    `https://img.vietqr.io/image/MB-0348888999-compact2.png?amount=${productData.price}&addInfo=${orderCode}&accountName=SAN%20FPT%205CAMPUS`;

  // Fetch product data if provided
  useEffect(() => {
    let isMounted = true;
    if (productId) {
      ProductService.getPostById(productId).then((post) => {
        if (!isMounted || !post) return;
        setProductData((prev) => ({
          ...prev,
          title: post.title,
          price: amountParam ? parseInt(amountParam, 10) : post.price,
          imageUrl: post.imageUrl || prev.imageUrl,
          conditionBadge: post.badges?.[0] || prev.conditionBadge,
          sellerName: post.seller?.name || prev.sellerName,
          sellerCohort: post.seller?.cohort || prev.sellerCohort,
        }));
      });
    }
    return () => {
      isMounted = false;
    };
  }, [productId, amountParam]);

  // Current formatted timestamp
  const orderTimeFormatted = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (isMobileSource) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-5 text-center select-none">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {isCancelledByPayos || (payosWasCancelled && !isPaid) ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-9 h-9" />
              </div>
              <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300 font-bold text-xs uppercase px-3 py-1 mb-3">
                Phiên thanh toán chưa hoàn tất
              </Badge>
              <h1 className="text-xl font-black text-white mb-2">Đã đóng cổng PayOS</h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Bạn vừa đóng hoặc hủy giao dịch PayOS cho đơn hàng{' '}
                <span className="font-mono font-bold text-orange-400">#{orderCode}</span>.
                <br />
                Đơn hàng vẫn được lưu và bảo lưu trong 15 phút. Bạn có thể mở lại ứng dụng để thanh toán lại hoặc xem lại đơn hàng bất kỳ lúc nào.
              </p>
            </>
          ) : isPaid ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold text-xs uppercase px-3 py-1 mb-3">
                Thanh toán Escrow thành công
              </Badge>
              <h1 className="text-xl font-black text-white mb-2">Đã nhận thanh toán!</h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Đơn hàng <span className="font-mono font-bold text-orange-400">#{orderCode}</span> đã được ghi nhận vào hệ thống. Số tiền được bảo lãnh an toàn trong Quỹ Escrow FPT.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-9 h-9" />
              </div>
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold text-xs uppercase px-3 py-1 mb-3">
                Đang chờ thanh toán
              </Badge>
              <h1 className="text-xl font-black text-white mb-2">Đang chờ xử lý</h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Đơn hàng <span className="font-mono font-bold text-orange-400">#{orderCode}</span> đang chờ hoàn tất giao dịch.
              </p>
            </>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = `fu-market://order/${orderCode}`;
                setTimeout(() => {
                  try { window.close(); } catch {}
                }, 500);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition cursor-pointer"
            >
              Quay lại ứng dụng Chợ FPT
            </button>
            <button
              type="button"
              onClick={() => {
                try { window.close(); } catch {}
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition cursor-pointer"
            >
              Đóng cửa sổ này
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* BREADCRUMBS */}
        <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-fpt-orange transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">›</span>
          <Link href="/checkout" className="hover:text-fpt-orange transition-colors">
            Thanh toán
          </Link>
          <span className="text-slate-400">›</span>
          <span className="text-slate-800 font-semibold">Đặt hàng thành công</span>
          <span className="rounded bg-orange-100/80 px-2 py-0.5 text-[11px] font-bold text-fpt-orange border border-orange-200">
            #{orderCode}
          </span>
        </div>

        {/* 1. TOP CELEBRATION / PAYMENT STATUS BANNER */}
        <Card
          className={`mb-6 overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-xs ${
            isCancelledByPayos || (payosWasCancelled && !isPaid)
              ? 'border-rose-200/80 bg-gradient-to-br from-rose-500 via-rose-600 to-slate-900 text-white'
              : isPaid
              ? 'border-emerald-200/80 bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900 text-white'
              : paymentMethod === 'vietqr'
              ? 'border-amber-200/80 bg-gradient-to-br from-amber-500 via-orange-600 to-slate-900 text-white'
              : 'border-orange-200/80 bg-gradient-to-br from-fpt-orange via-amber-600 to-slate-900 text-white'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md ${
                  isCancelledByPayos || (payosWasCancelled && !isPaid)
                    ? 'bg-white text-rose-600'
                    : isPaid
                    ? 'bg-white text-emerald-600'
                    : paymentMethod === 'vietqr'
                    ? 'bg-white text-amber-600'
                    : 'bg-white text-fpt-orange'
                }`}
              >
                {isCancelledByPayos || (payosWasCancelled && !isPaid) ? (
                  <XCircle className="h-8 w-8 stroke-[2.5]" />
                ) : isPaid ? (
                  <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                ) : (
                  <Clock className="h-8 w-8 stroke-[2.5]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="border-white/30 bg-white/15 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5"
                  >
                    {isCancelledByPayos || (payosWasCancelled && !isPaid)
                      ? 'GIAO DỊCH ĐÃ HỦY • HOÀN TRẢ QUYỀN MUA'
                      : isPaid
                      ? isOnlinePayment
                        ? 'VIETQR NAPAS247 (PAYOS) • ĐÃ NHẬN TIỀN ESCROW'
                        : 'THANH TOÁN KHI NHẬN HÀNG (COD)'
                      : isOnlinePayment
                      ? 'VIETQR NAPAS247 • CHỜ THANH TOÁN'
                      : 'THANH TOÁN KHI NHẬN HÀNG (COD)'}
                  </Badge>
                  <span className="text-xs text-white/80 font-medium">
                    Đặt lúc: {orderTimeFormatted}
                  </span>
                </div>

                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isCancelledByPayos || (payosWasCancelled && !isPaid)
                    ? 'Giao dịch thanh toán PayOS đã bị hủy'
                    : isPaid
                    ? 'Thanh toán & Đặt hàng thành công!'
                    : isOnlinePayment
                    ? 'Đơn hàng đã tạo • Vui lòng quét mã VietQR để thanh toán'
                    : 'Đặt đơn hàng COD thành công!'}
                </h1>

                <p className="mt-1 text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
                  {isCancelledByPayos || (payosWasCancelled && !isPaid)
                    ? `Bạn đã dừng hoặc hủy thanh toán qua cổng PayOS. Đơn hàng #${orderCode} đã được tự động hủy, Xu và Voucher đã hoàn về tài khoản của bạn. Sản phẩm đã được mở lại cho các bạn sinh viên khác mua.`
                    : isPaid
                    ? 'Khoản thanh toán của bạn đã được đóng băng an toàn trong Ví Escrow của Sàn ĐH FPT. Người bán sẽ chỉ nhận được tiền sau 48h kiểm tra hàng.'
                    : isOnlinePayment
                    ? `Đơn hàng #${orderCode} đang chờ bạn chuyển khoản ${productData.price.toLocaleString('vi-VN')} đ. Tiền sẽ được sàn bảo hộ an toàn trong ví Escrow ngay khi nhận được giao dịch.`
                    : 'Đơn hàng đã được ghi nhận vào hệ thống điều phối bưu tá KTX. Bạn sẽ kiểm tra hàng thực tế trước khi thanh toán tiền mặt/chuyển khoản.'}
                </p>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
              <div className="rounded-xl bg-black/25 backdrop-blur-xs px-3.5 py-2 border border-white/15 text-left md:text-right">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">
                  MÃ ĐƠN HÀNG
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-sm sm:text-base font-extrabold text-white">
                    {orderCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOrderCode}
                    className="rounded p-1 text-white/80 hover:bg-white/20 transition cursor-pointer"
                    title="Sao chép mã đơn"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white border border-white/25">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>Bảo hiểm FPT Care 48 Giờ Active</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: 8 COLS */}
          <div className="lg:col-span-8 space-y-6">
            {/* CARD 1: KIỆN HÀNG & LỘ TRÌNH SHIP */}
            <Card className="rounded-2xl border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-fpt-orange" />
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Chi tiết kiện hàng bưu phẩm
                  </h2>
                </div>
                <Badge variant="fpt" className="text-[10px]">
                  FPT CAMPUSSHIP
                </Badge>
              </div>

              {/* Product Info Row */}
              <div className="mt-4 flex flex-col sm:flex-row items-start gap-4">
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={productData.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                    alt={productData.title}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 rounded bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {productData.conditionBadge}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] text-slate-600">
                      Sinh viên FPT Pass
                    </Badge>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Đã kiểm định bưu cục
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {productData.title}
                  </h3>

                  {/* Seller info */}
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-fpt-orange text-[10px] font-bold text-white">
                          {productData.sellerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-slate-700 font-medium">
                        Người bán: <strong>{productData.sellerName}</strong> ({productData.sellerCohort})
                      </span>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1 border-slate-200 text-slate-700 hover:text-fpt-orange"
                    >
                      <Link href="/chat">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Nhắn tin người bán</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Transit Route Visualization */}
              <div className="mt-5 rounded-xl bg-slate-50/80 border border-slate-200/80 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-fpt-orange" />
                    Lộ trình điều phối FPT CampusShip
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    Dự kiến: 2 - 3 ngày làm việc
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ĐIỂM GỬI HÀNG
                    </span>
                    <div className="font-extrabold text-slate-900 mt-0.5">
                      {productData.originCampus}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bưu cục Safe-Handoff Thư viện
                    </div>
                  </div>

                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-fpt-orange uppercase tracking-wider">
                      ĐIỂM NHẬN HÀNG (BẠN)
                    </span>
                    <div className="font-extrabold text-slate-900 mt-0.5">
                      {productData.destinationCampus}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sảnh Lễ tân KTX Dom B (Phòng 402)
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* CARD 2A: MÃ VIETQR CHUYỂN KHOẢN ESCROW (KHI CHƯA THANH TOÁN) */}
            {isOnlinePayment && !isPaid ? (
              <Card className="rounded-2xl border-2 border-orange-300 bg-white p-5 sm:p-6 shadow-md">
                {paymentMethod === 'payos' && payosWasCancelled && (
                  <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900">
                    Bạn đã đóng thanh toán trên PayOS. Đơn vẫn đang chờ thanh toán; hãy hủy đơn để sản phẩm và ưu đãi được trả lại.
                  </p>
                )}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-fpt-orange" />
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {paymentMethod === 'payos' ? 'Thanh toán PayOS / VietQR Napas 24/7' : 'Chuyển tiền vào Ví Escrow (VietQR Napas 24/7)'}
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span>CHỜ THANH TOÁN</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Real VietQR Canvas Box */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-orange-50/40 border border-orange-200 text-center">
                    <div className="text-[10px] font-extrabold text-slate-600 mb-1 tracking-wider uppercase">
                      VIETQR • NAPAS 24/7
                    </div>
                    <div className="relative h-48 w-48 bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                      <Image
                        src={realVietqrUrl}
                        alt="VietQR Napas 24/7 Sàn FPT"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-2 text-[11px] font-bold text-slate-700">
                      Mở App Ngân hàng bất kỳ để quét
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Tự động xác nhận sau 3-5 giây
                    </span>
                  </div>

                  {/* Bank Transfer Details with Copy Buttons */}
                  <div className="md:col-span-7 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                      <span className="font-extrabold text-slate-900">MB Bank (Quân Đội)</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Chủ tài khoản:</span>
                      <span className="font-extrabold text-slate-900">SAN FPT 5CAMPUS MARKETPLACE</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          0348888999
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyBankAcc}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                          title="Sao chép số tài khoản"
                        >
                          {copiedBankAcc ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Số tiền chính xác:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-fpt-orange text-sm sm:text-base">
                          {productData.price.toLocaleString('vi-VN')} đ
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAmount}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                          title="Sao chép số tiền"
                        >
                          {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                      <span className="text-amber-900 font-bold">Nội dung chuyển khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-fpt-orange bg-white px-2 py-0.5 rounded border border-orange-200">
                          {orderCode}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyOrderCode}
                          className="inline-flex items-center gap-1 rounded bg-fpt-orange text-white px-2 py-0.5 text-[10px] font-bold hover:bg-fpt-orange-hover transition cursor-pointer"
                        >
                          {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>Sao chép</span>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800">
                        ⚡ Lưu ý quan trọng:
                      </p>
                      <p>
                        Vui lòng giữ nguyên nội dung chuyển khoản là <strong className="font-mono text-fpt-orange">{orderCode}</strong> để hệ thống đối soát tự động kích hoạt bảo chứng Escrow ngay tức thì.
                      </p>
                    </div>

                    {backendOrder?.payment?.payosCheckoutUrl && !payosWasCancelled && (
                      <div className="pt-2">
                        <a
                          href={backendOrder.payment.payosCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs transition shadow-sm"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Mở cổng thanh toán trực tuyến PayOS</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                    {paymentMethod === 'payos' && backendOrder?.id && (
                      <button
                        type="button"
                        onClick={handleCancelPendingOrder}
                        disabled={isCancellingOrder}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {isCancellingOrder ? 'Đang hủy đơn...' : 'Hủy đơn và trả sản phẩm về chợ'}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              /* CARD 2B: MÃ QR NHẬN HÀNG SAFE-HANDOFF PASS */
              <Card className="rounded-2xl border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-fpt-orange" />
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Phiếu nhận hàng điện tử (Safe-Handoff QR Pass)
                    </h2>
                  </div>
                  <Badge variant="outline" className="text-slate-500 text-[10px]">
                    XÁC THỰC DANH TÍNH
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* QR Canvas */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="relative h-32 w-32 bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
                      <Image
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderCode}&color=0f172a`}
                        alt="Safe-Handoff QR Pass"
                        width={120}
                        height={120}
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-2 font-mono text-xs font-extrabold text-slate-800">
                      PIN: {backendOrder?.handshake?.handshakeOtp || '8829'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Mã xác thực 1 lần
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="md:col-span-8 space-y-2.5 text-xs text-slate-600">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Cách thức nhận hàng an toàn tại Campus:
                    </h4>
                    <ul className="space-y-2 pl-4 list-disc text-slate-600 leading-relaxed">
                      <li>
                        Khi bưu phẩm tới KTX, bạn sẽ nhận được thông báo đẩy trên App / Telegram bot 5Campus.
                      </li>
                      <li>
                        Xuất trình mã QR này hoặc cung cấp mã PIN <strong>{backendOrder?.handshake?.handshakeOtp || '8829'}</strong> cho bưu tá / lễ tân Dom B.
                      </li>
                      {isPaid ? (
                        <li>
                          <strong>Đã thanh toán Escrow:</strong> Bạn không cần trả thêm bất kỳ khoản tiền nào. Nhận đồ về phòng, cắm thử 48h rồi bấm xác nhận giải ngân.
                        </li>
                      ) : (
                        <li>
                          <strong>Đơn COD:</strong> Bạn có quyền mở hộp kiểm tra thiết bị hoạt động tốt trước khi thanh toán số tiền <strong>{productData.price.toLocaleString('vi-VN')} đ</strong> cho người giao.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* CARD 3: TIẾN TRÌNH ĐƠN HÀNG TIẾP THEO */}
            <Card className="rounded-2xl border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                Quy trình xử lý đơn hàng tiếp theo
              </h3>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3 relative">
                  <div className="flex items-center gap-1.5 text-fpt-orange font-bold text-[11px] mb-1">
                    <span className="flex h-5 w-5 rounded-full bg-fpt-orange text-white items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Đã nhận đơn</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Thông báo đã gửi tới người bán để chuẩn bị đóng thùng bưu phẩm.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] mb-1">
                    <span className="flex h-5 w-5 rounded-full bg-slate-200 text-slate-700 items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Gửi Safe-Hub</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Người bán nộp hàng tại Bưu cục Thư viện trong 24h.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] mb-1">
                    <span className="flex h-5 w-5 rounded-full bg-slate-200 text-slate-700 items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Vận chuyển</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Xe chuyên trách FPT CampusShip trung chuyển tới KTX của bạn.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] mb-1">
                    <span className="flex h-5 w-5 rounded-full bg-slate-200 text-slate-700 items-center justify-center text-[10px]">
                      4
                    </span>
                    <span>Nhận & Test 48h</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Đồng kiểm bóc hộp, bao test 48h trước khi giải ngân Escrow.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: 4 COLS */}
          <div className="lg:col-span-4 space-y-5">
            {/* TÓM TẮT THANH TOÁN & BIÊN LAI */}
            <Card className="rounded-2xl border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4.5 w-4.5 text-slate-700" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Biên lai thanh toán
                  </h3>
                </div>
                <Badge
                  variant={isOnlinePayment ? 'success' : 'warning'}
                  className="text-[10px]"
                >
                  {isOnlinePayment ? 'ĐÃ NẠP ESCROW' : 'COD CHỜ THU'}
                </Badge>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tiền sản phẩm:</span>
                  <span className="font-bold text-slate-800">
                    {productData.price.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Phí ship CampusShip:</span>
                  <span className="text-slate-800">25.000 đ</span>
                </div>

                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Voucher Freeship FPT
                  </span>
                  <span>-25.000 đ</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span>Phí bảo chứng Escrow:</span>
                  <span className="font-bold text-emerald-700">Miễn phí 0đ</span>
                </div>

                {/* TOTAL */}
                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      {isOnlinePayment ? 'TỔNG ĐÃ THANH TOÁN' : 'SỐ TIỀN CẦN TRẢ (COD)'}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {isOnlinePayment ? 'Bảo lưu qua MB Bank Escrow' : 'Thu tiền mặt / QR khi nhận'}
                    </div>
                  </div>
                  <div className="text-xl font-black text-fpt-orange">
                    {productData.price.toLocaleString('vi-VN')}{' '}
                    <span className="text-xs font-bold">đ</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-5 space-y-2.5">
                <Button
                  asChild
                  className="w-full h-11 text-xs sm:text-sm font-bold bg-fpt-orange hover:bg-fpt-orange-hover shadow-sm shadow-orange-500/25"
                >
                  <Link href="/orders">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Xem & Quản lý đơn hàng</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-10 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Link href="/posts">
                    <span>Tiếp tục tìm đồ pass</span>
                  </Link>
                </Button>
              </div>
            </Card>

            {/* CARD QUÀ TẶNG SINH VIÊN */}
            <Card className="rounded-2xl border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm pb-2 border-b border-amber-200/70">
                <Coins className="h-4.5 w-4.5 text-amber-600" />
                <span>Quà tặng giao dịch thành công!</span>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-white/90 p-2.5 border border-amber-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪙</span>
                    <div>
                      <div className="font-extrabold text-amber-950">+50 FPT Coin</div>
                      <div className="text-[10px] text-amber-700">Đã cộng vào ví tài khoản</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 text-[10px]">
                    NHẬN THÀNH CÔNG
                  </Badge>
                </div>

                <div className="rounded-xl bg-white/90 p-2.5 border border-amber-200/80">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-700">Voucher 20.000đ đơn tiếp theo</span>
                    <button
                      type="button"
                      onClick={handleCopyVoucher}
                      className="text-fpt-orange font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copiedVoucher ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedVoucher ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs font-extrabold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    FPT5CAMPUS-FREESHIP20K
                  </div>
                </div>
              </div>
            </Card>

            {/* TRỢ GIÚP ĐƠN HÀNG */}
            <Card className="rounded-2xl border-slate-200/80 bg-white p-4 text-xs text-slate-600 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <HelpCircle className="h-4 w-4 text-fpt-orange" />
                <span>Cần trợ giúp về bưu kiện này?</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Đường dây nóng CTSV & Ban Quản Lý KTX luôn trực sẵn để giải quyết sự cố giao dịch hoặc chuyển nhầm phòng.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Hotline: 024.7300.1866</span>
                <Link
                  href="/orders/dispute"
                  className="text-[11px] font-bold text-fpt-orange hover:underline"
                >
                  Quy chế khiếu nại →
                </Link>
              </div>
            </Card>
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

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 font-medium">
          Đang tải thông tin đơn hàng thành công...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
