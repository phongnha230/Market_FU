'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DisputeEscrowBanner from '@/components/dispute/DisputeEscrowBanner';
import DisputeStepper from '@/components/dispute/DisputeStepper';
import DisputeParcelCard from '@/components/dispute/DisputeParcelCard';
import DisputeResolution from '@/components/dispute/DisputeResolution';
import DisputeEvidence from '@/components/dispute/DisputeEvidence';
import DisputeSidebar from '@/components/dispute/DisputeSidebar';
import DisputeSellerInspectionView from '@/components/dispute/DisputeSellerInspectionView';
import { Card, Badge, Button } from '@/components/ui';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { useMarket } from '@/context/MarketContext';
import { useDisputeStore } from '@/stores/disputeStore';
import { useUserStore } from '@/stores/userStore';
import { orderService } from '@/services/orderService';

function DisputeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCodeParam = searchParams.get('code') || '';
  const cleanCode = orderCodeParam.startsWith('#') ? orderCodeParam : `#${orderCodeParam}`;

  const { updateOrderStatus, getOrder, showToast } = useMarket();
  const storeOrder = getOrder(cleanCode);
  const userData = useUserStore((state) => state.user);

  const [backendOrder, setBackendOrder] = useState<any>(null);

  useEffect(() => {
    useDisputeStore.getState().fetchDisputes().catch(() => {});
    if (orderCodeParam) {
      const clean = orderCodeParam.replace('#', '');
      orderService
        .getOrderDetail(clean)
        .then((data) => {
          if (data) setBackendOrder(data);
        })
        .catch(() => {});
    }
  }, [orderCodeParam]);

  const matchedOrder = backendOrder || storeOrder;
  const isInterCampus =
    matchedOrder?.type === 'inter-campus' ||
    (matchedOrder as any)?.orderType === 'SHIP_COD' ||
    Boolean(matchedOrder?.shipping?.shippingPartner);
  const buyerAddress = matchedOrder?.shipping?.shippingAddress || (matchedOrder as any)?.shippingAddress || '';
  const sellerCampus = (matchedOrder as any)?.product?.campus || (matchedOrder as any)?.seller?.profile?.campus || 'Cần Thơ';
  const buyerCampus = (matchedOrder as any)?.buyer?.campus || (matchedOrder as any)?.buyer?.profile?.campus || 'Hòa Lạc';
  const rawSellerName = matchedOrder?.product?.seller?.name || matchedOrder?.seller?.profile?.fullName || matchedOrder?.seller?.email || 'Người bán';
  const rawBuyerName = (matchedOrder as any)?.buyer?.fullName || (matchedOrder as any)?.buyer?.profile?.fullName || (matchedOrder as any)?.buyer?.name || (matchedOrder as any)?.buyerName || 'Người mua';
  const productTitle = matchedOrder?.product?.title || 'Sản phẩm';

  // Role detection (Seller vs Buyer vs Admin)
  const currentUserId = userData?.id?.trim();
  const currentUserEmail = userData?.email?.toLowerCase().trim();
  const currentUserName = userData?.name?.toLowerCase().trim();

  const orderSellerId = (matchedOrder?.sellerId || (matchedOrder as any)?.seller?.id || (matchedOrder as any)?.product?.seller?.id)?.trim();
  const orderSellerEmail = ((matchedOrder as any)?.seller?.email || (matchedOrder as any)?.product?.seller?.email || '')?.toLowerCase().trim();
  const sellerNameLower = rawSellerName.toLowerCase().trim();

  const orderBuyerId = (matchedOrder?.buyerId || (matchedOrder as any)?.buyer?.id)?.trim();
  const orderBuyerEmail = ((matchedOrder as any)?.buyer?.email || '')?.toLowerCase().trim();
  const buyerNameLower = rawBuyerName.toLowerCase().trim();

  const roleParam = searchParams.get('as') || searchParams.get('role');

  const isSeller = Boolean(
    roleParam === 'seller' ||
    (currentUserId && orderSellerId && currentUserId === orderSellerId) ||
    (currentUserEmail && orderSellerEmail && (currentUserEmail === orderSellerEmail || currentUserEmail.split('@')[0] === orderSellerEmail.split('@')[0])) ||
    (currentUserName && sellerNameLower && (
      currentUserName === sellerNameLower ||
      sellerNameLower.includes(currentUserName) ||
      currentUserName.includes(sellerNameLower)
    ))
  );

  const isBuyer = Boolean(
    !isSeller && (
      roleParam === 'buyer' ||
      (currentUserId && orderBuyerId && currentUserId === orderBuyerId) ||
      (currentUserEmail && orderBuyerEmail && (currentUserEmail === orderBuyerEmail || currentUserEmail.split('@')[0] === orderBuyerEmail.split('@')[0])) ||
      (currentUserName && buyerNameLower && (
        currentUserName === buyerNameLower ||
        buyerNameLower.includes(currentUserName) ||
        currentUserName.includes(buyerNameLower)
      ))
    )
  );

  // Form states (for buyer creation)
  const [resolutionPlan, setResolutionPlan] = useState<'return' | 'partial'>('return');
  const [selectedReason, setSelectedReason] = useState<string>('defect');
  const [description, setDescription] = useState<string>('');
  const [partialRefundAmount, setPartialRefundAmount] = useState<number>(0);

  const productPrice = matchedOrder?.product?.price ?? 0;
  const shippingFeeVal = isInterCampus ? (matchedOrder?.shipping?.shippingFee ?? 25000) : 0;

  useEffect(() => {
    if (productPrice > 0 && partialRefundAmount === 0) {
      setPartialRefundAmount(Math.round(productPrice * 0.3));
    }
  }, [productPrice, partialRefundAmount]);

  const [dropoffPoint, setDropoffPoint] = useState<string>(isInterCampus ? 'courier_pickup' : 'safe_point');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedProofVideoUrl, setUploadedProofVideoUrl] = useState<string>('');

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSeller) {
      showToast('Người bán không thể tạo khiếu nại với đơn hàng của chính mình.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Vui lòng nhập mô tả chi tiết lý do bạn muốn trả hàng.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = backendOrder?.id || matchedOrder?.id || cleanCode.replace('#', '');
      const proofVideoUrl = uploadedProofVideoUrl || '';
      
      const reasonMap: Record<string, string> = {
        defect: 'Thiết bị lỗi chức năng / Không hoạt động khi cắm test',
        damaged_shipping: 'Hàng bị cấn móp / Bể vỡ do khâu vận chuyển GHN',
        'wrong-item': 'Giao sai sản phẩm / Khác xa hình ảnh và mô tả',
        missing: 'Thiếu phụ kiện / Thiếu linh kiện kèm theo',
        fake: 'Nghi vấn thông số không đúng cam kết',
        other: 'Lý do khác',
      };
      const reasonLabel = reasonMap[selectedReason] || 'Yêu cầu trả hàng & hoàn tiền';
      const calculatedRefund =
        resolutionPlan === 'partial'
          ? partialRefundAmount
          : productPrice + shippingFeeVal;

      const res = await useDisputeStore.getState().createDispute({
        orderId,
        orderCode: cleanCode,
        reason: reasonLabel,
        details: description,
        proofVideoUrl,
        refundAmount: calculatedRefund,
      });

      if (res.success) {
        updateOrderStatus(cleanCode, 'disputed', 'Đã khóa Escrow • Chờ xử lý khiếu nại');
        showToast(res.message, 'success');
        setTimeout(() => {
          router.push('/orders');
        }, 1200);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi gửi hồ sơ khiếu nại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const backendDispute = backendOrder?.dispute || (storeOrder as any)?.dispute;
  const disputeStoreItem = useDisputeStore((state) =>
    state.disputes.find(
      (d) =>
        (matchedOrder?.id && d.orderId === matchedOrder.id) ||
        d.orderCode === cleanCode ||
        d.orderId === cleanCode.replace('#', '')
    )
  );

  const activeDispute = backendDispute
    ? {
        id: backendDispute.id,
        orderId: backendDispute.orderId,
        orderCode: cleanCode,
        reason: backendDispute.reason,
        details: backendDispute.details || backendDispute.reason,
        proofVideoUrl: backendDispute.proofVideoUrl,
        status: (backendDispute.status === 'RESOLVED' ? 'REFUNDED' : backendDispute.status) as any,
        adminNote: backendDispute.adminNote,
        createdAt: backendDispute.createdAt ? new Date(backendDispute.createdAt).toLocaleString('vi-VN') : 'Gần đây',
        resolvedAt: backendDispute.resolvedAt ? new Date(backendDispute.resolvedAt).toLocaleString('vi-VN') : undefined,
      }
    : disputeStoreItem;

  const isAlreadyDisputed =
    matchedOrder?.status === 'disputed' ||
    matchedOrder?.status === 'cancelled' ||
    Boolean(activeDispute);

  // STRICT RULE: Only BUYER can withdraw their own dispute when PENDING. SELLER NEVER CAN.
  const canWithdrawDispute =
    !isSeller &&
    isBuyer &&
    isAlreadyDisputed &&
    activeDispute?.status === 'PENDING' &&
    matchedOrder?.status !== 'cancelled' &&
    matchedOrder?.status !== 'completed';

  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdrawDispute = async () => {
    if (isSeller) {
      showToast('Người bán không có quyền rút khiếu nại của người mua.', 'error');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn rút đơn khiếu nại này?\n\nSau khi rút đơn, giao dịch sẽ được chuyển sang hoàn tất và tiền cọc Escrow sẽ được giải ngân cho Người bán.'
    );
    if (!confirmed) return;

    setIsWithdrawing(true);
    try {
      const disputeId = activeDispute?.id || `dsp-${matchedOrder?.id || cleanCode.replace('#', '')}`;
      const res = await useDisputeStore.getState().cancelDispute(
        disputeId,
        'Người mua đã tự nguyện rút khiếu nại và đồng ý nhận hàng.'
      );
      if (res.success) {
        showToast('Đã rút đơn khiếu nại thành công! Đơn hàng được xác nhận hoàn tất.', 'success');
        updateOrderStatus(cleanCode, 'completed', 'Người mua đã rút khiếu nại');
        setTimeout(() => {
          router.push('/orders');
        }, 1200);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi rút khiếu nại', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const currentStepperStep = (() => {
    if (!isAlreadyDisputed) return 1;
    if (activeDispute?.status === 'REFUNDED' || matchedOrder?.status === 'cancelled') return 4;
    if (activeDispute?.status === 'REJECTED') return 4;
    if (activeDispute?.status === 'CANCELLED') return 4;
    if (activeDispute?.status === 'INVESTIGATING') return 3;
    return 2;
  })();

  // Case: Seller visits an order that has NO active dispute
  if (isSeller && !isAlreadyDisputed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
        <Navbar />

        <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-5 sm:py-8 space-y-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-fpt-orange transition">
              Trang chủ
            </Link>
            <span>&gt;</span>
            <Link href="/orders" className="hover:text-fpt-orange transition">
              Quản lý đơn hàng
            </Link>
            <span>&gt;</span>
            <span className="font-semibold text-slate-700">
              Đơn #{orderCodeParam.replace('#', '')}
            </span>
            <span>&gt;</span>
            <span className="font-bold text-fpt-orange">
              Hồ sơ Khiếu nại (Chế độ Người bán)
            </span>
          </nav>

          <Card className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center space-y-4 max-w-xl mx-auto shadow-xs mt-8">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Đơn hàng hiện không có khiếu nại
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Bạn là <strong>Người bán ({rawSellerName})</strong> của đơn hàng này. 
                Hiện tại Người mua chưa gửi yêu cầu khiếu nại nào đối với sản phẩm. Chỉ Người mua mới có quyền tạo hồ sơ khiếu nại & trả hàng trong thời gian bao test 24h.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                className="w-full sm:w-auto rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold px-4 py-2 cursor-pointer shadow-xs"
              >
                <Link href={`/orders/${encodeURIComponent(cleanCode.replace('#', ''))}`}>
                  <span>Xem chi tiết đơn hàng</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-4 py-2 cursor-pointer"
              >
                <Link href="/orders">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  <span>Quay lại Quản lý đơn hàng</span>
                </Link>
              </Button>
            </div>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-5 sm:py-8 space-y-6">
        {/* 1. BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-fpt-orange transition">
            Trang chủ
          </Link>
          <span>&gt;</span>
          <Link href="/orders" className="hover:text-fpt-orange transition">
            Quản lý đơn hàng
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-700">
            Đơn #{orderCodeParam.replace('#', '')}
          </span>
          <span>&gt;</span>
          <span className="font-bold text-fpt-orange">
            {isSeller
              ? 'Hồ sơ Thẩm tra Khiếu nại (Chế độ Người bán)'
              : isInterCampus
              ? 'Yêu cầu Trả hàng & Hoàn tiền Liên Campus'
              : 'Khiếu nại & Yêu cầu Trả hàng'}
          </span>
        </nav>

        {/* 2. ESCROW HOLD BANNER */}
        <DisputeEscrowBanner
          isSeller={isSeller}
          isInterCampus={isInterCampus}
          sellerCampus={sellerCampus}
          buyerCampus={buyerCampus}
        />

        {/* 3. PROGRESS INDICATOR */}
        <DisputeStepper
          currentStep={currentStepperStep}
          isSeller={isSeller}
          isInterCampus={isInterCampus}
        />

        {/* 4. MAIN DISPUTE FORM GRID (8 COLS / 4 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: 8 COLS */}
          <div className="lg:col-span-8 space-y-5">
            {isSeller ? (
              /* SELLER VIEW: Strictly Read-Only Admin-Like Inspection View */
              <DisputeSellerInspectionView
                order={matchedOrder}
                orderCode={cleanCode}
                dispute={activeDispute}
                onShowToast={(msg) => showToast(msg, 'info')}
              />
            ) : isAlreadyDisputed ? (
              /* BUYER VIEW: Already Disputed */
              <div className="space-y-5">
                {/* Parcel Details */}
                <DisputeParcelCard order={matchedOrder} orderCode={cleanCode} />

                {/* Dispute Record Status Card */}
                <Card className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-orange-100 text-fpt-orange flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          Hồ sơ Khiếu nại & Yêu cầu Trả hàng
                        </h3>
                        <p className="text-xs text-slate-500">
                          Mã hồ sơ: <span className="font-mono font-bold text-slate-700">{activeDispute?.id || `DSP-${cleanCode.replace('#', '')}`}</span> • Gửi lúc: {activeDispute?.createdAt || 'Gần đây'}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        activeDispute?.status === 'REFUNDED' || matchedOrder?.status === 'cancelled'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : activeDispute?.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {activeDispute?.status === 'REFUNDED' || matchedOrder?.status === 'cancelled'
                        ? '✓ Đã chấp thuận hoàn tiền'
                        : activeDispute?.status === 'REJECTED'
                        ? '✕ Khiếu nại bị từ chối'
                        : '⏳ Chờ BQT & Người bán phản hồi'}
                    </Badge>
                  </div>

                  {/* Dispute Details */}
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1.5">
                      <div className="text-slate-500 font-bold">Lý do yêu cầu trả hàng:</div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {activeDispute?.reason || 'Hàng lỗi kỹ thuật/hỏng hóc khi test thực tế'}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1.5">
                      <div className="text-slate-500 font-bold">Mô tả tình trạng chi tiết:</div>
                      <div className="text-slate-700 leading-relaxed">
                        {activeDispute?.details || description || 'Người mua đã phản ánh món hàng không hoạt động đúng cam kết và yêu cầu hoàn trả tiền bảo hộ Escrow.'}
                      </div>
                    </div>

                    <div className="rounded-xl bg-indigo-50/60 p-3.5 border border-indigo-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-700 font-bold">📹 Video bằng chứng unbox/test:</span>
                        <span className="text-indigo-900 font-medium truncate max-w-xs sm:max-w-md">video-unbox-test.mp4</span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                        Đã tải lên
                      </span>
                    </div>

                    {activeDispute?.adminNote && (
                      <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 space-y-1">
                        <div className="text-amber-900 font-bold">Ghi chú từ Ban Quản Trị:</div>
                        <div className="text-amber-800">{activeDispute.adminNote}</div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Scenario Guide Card (For Buyer) */}
                <Card className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3 text-xs">
                  <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-500">
                    CÁC KỊCH BẢN XỬ LÝ KHIẾU NẠI & QUYỀN LỢI CỦA BẠN (NGƯỜI MUA)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3.5 space-y-1.5">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Khi BQT duyệt thành công</span>
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        Bạn sẽ nhận mã gửi trả hàng miễn phí tại Safe-Point CLB IT hoặc GHN Campus. Sau khi bưu cục nhận đồ, <strong>100% tiền Escrow và Xu giảm giá</strong> sẽ được hoàn trả tự động vào ví của bạn.
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span>Khi BQT từ chối khiếu nại</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Nếu bằng chứng không hợp lệ hoặc món đồ lỗi do người dùng tự làm hỏng, BQT sẽ gửi văn bản giải thích chi tiết và tiến hành giải ngân tiền cho Người bán.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      asChild
                      className="w-full sm:w-auto rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold px-4 py-2 cursor-pointer shadow-xs"
                    >
                      <Link href={`/orders/${encodeURIComponent(cleanCode.replace('#', ''))}`}>
                        <span>Xem chi tiết đơn hàng gốc</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-4 py-2 cursor-pointer"
                    >
                      <Link href="/orders">
                        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                        <span>Quay lại Quản lý đơn hàng</span>
                      </Link>
                    </Button>

                    {canWithdrawDispute ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleWithdrawDispute}
                        disabled={isWithdrawing}
                        className="w-full sm:w-auto rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-bold px-4 py-2 cursor-pointer transition sm:ml-auto"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
                        <span>{isWithdrawing ? 'Đang rút đơn...' : 'Rút yêu cầu khiếu nại'}</span>
                      </Button>
                    ) : (activeDispute?.status === 'REFUNDED' || matchedOrder?.status === 'cancelled') ? (
                      <span className="text-[11px] font-semibold text-emerald-700 sm:ml-auto flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Đã duyệt hoàn tiền (Không thể rút đơn)
                      </span>
                    ) : activeDispute?.status === 'REJECTED' ? (
                      <span className="text-[11px] font-semibold text-rose-700 sm:ml-auto flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                        Khiếu nại bị từ chối (Không thể rút đơn)
                      </span>
                    ) : activeDispute?.status === 'CANCELLED' ? (
                      <span className="text-[11px] font-semibold text-slate-500 sm:ml-auto flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                        Đã tự nguyện rút khiếu nại
                      </span>
                    ) : null}
                  </div>
                </Card>
              </div>
            ) : (
              /* BUYER VIEW: Create Dispute Form */
              <form onSubmit={handleSubmitDispute} className="space-y-5">
                {/* Parcel Details */}
                <DisputeParcelCard order={matchedOrder} orderCode={cleanCode} />

                {/* Resolution Plan & Reason */}
                <DisputeResolution
                  resolutionPlan={resolutionPlan}
                  onPlanChange={setResolutionPlan}
                  selectedReason={selectedReason}
                  onReasonChange={setSelectedReason}
                  productTitle={matchedOrder?.product?.title || 'sản phẩm'}
                  refundAmount={productPrice}
                  shippingFee={shippingFeeVal}
                  isInterCampus={isInterCampus}
                  partialRefundAmount={partialRefundAmount}
                  onPartialRefundAmountChange={setPartialRefundAmount}
                />

                {/* Evidence, Description, Dropoff Location & Submit */}
                <DisputeEvidence
                  description={description}
                  onDescriptionChange={setDescription}
                  dropoffPoint={dropoffPoint}
                  onDropoffPointChange={setDropoffPoint}
                  isSubmitting={isSubmitting}
                  sellerName={rawSellerName}
                  onShowToast={(msg) => showToast(msg, 'info')}
                  uploadedProofVideoUrl={uploadedProofVideoUrl}
                  onUploadedProofVideoUrlChange={setUploadedProofVideoUrl}
                  isInterCampus={isInterCampus}
                  buyerAddress={buyerAddress}
                  sellerCampus={sellerCampus}
                  orderCode={cleanCode}
                />
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: SIDEBAR ESCROW SUMMARY (4 COLS) */}
          <div className="lg:col-span-4">
            <DisputeSidebar
              itemPrice={productPrice}
              shippingFee={shippingFeeVal}
              totalEscrow={productPrice + shippingFeeVal}
              onShowToast={(msg) => showToast(msg, 'info')}
              isSeller={isSeller}
              isInterCampus={isInterCampus}
              resolutionPlan={resolutionPlan}
              partialRefundAmount={partialRefundAmount}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DisputePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500 font-medium">
          Đang tải hồ sơ khiếu nại...
        </div>
      }
    >
      <DisputeContent />
    </Suspense>
  );
}
