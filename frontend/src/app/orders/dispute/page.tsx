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
import { Card, Badge, Button } from '@/components/ui';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  XCircle,
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
  const sellerName = matchedOrder?.product?.seller?.name || matchedOrder?.seller?.profile?.fullName || matchedOrder?.seller?.email || 'Người bán';
  const productTitle = matchedOrder?.product?.title || 'Sản phẩm';

  // Form states
  const [resolutionPlan, setResolutionPlan] = useState<'return' | 'partial'>('return');
  const [selectedReason, setSelectedReason] = useState<string>('defect');
  const [description, setDescription] = useState<string>('');

  const isCodOrder =
    matchedOrder?.payment?.paymentMethod === 'CASH' ||
    Boolean(matchedOrder?.payment?.paymentMethod?.toLowerCase().includes('cod')) ||
    (!matchedOrder?.payment?.isPaid && matchedOrder?.type === 'inter-campus');

  useEffect(() => {
    if (!productTitle) return;

    const refundText = isCodOrder
      ? 'Kính mong Sàn giữ đối soát COD và hỗ trợ hoàn tiền về STK Ngân hàng / Ví của em.'
      : 'Kính mong Sàn tạm khóa Escrow và hỗ trợ hoàn tiền bảo hộ.';

    switch (selectedReason) {
      case 'defect':
        setDescription(`Món hàng ${productTitle} nhận từ bạn ${sellerName} khi bóc hộp cắm test thực tế tại KTX thì không hoạt động bình thường, bị lỗi chức năng so với cam kết. ${refundText}`);
        break;
      case 'wrong-item':
        setDescription(`Sản phẩm ${productTitle} nhận được khác hoàn toàn với hình ảnh, model và tình trạng mô tả trong bài đăng của bạn ${sellerName}. ${refundText}`);
        break;
      case 'damaged':
        setDescription(`Kiện hàng ${productTitle} bị va đập, nứt vỡ/trầy xước nặng trong khâu vận chuyển khi nhận tại sảnh KTX. ${refundText}`);
        break;
      case 'missing':
        setDescription(`Kiện hàng ${productTitle} bị thiếu các phụ kiện đi kèm/quà tặng theo thỏa thuận với người bán ${sellerName}. ${refundText}`);
        break;
      case 'fake':
        setDescription(`Sau khi kiểm tra linh kiện và serial, em phát hiện món đồ không đúng chuẩn cam kết của bạn ${sellerName}. ${refundText}`);
        break;
      default:
        setDescription(`Phát sinh vấn đề với sản phẩm ${productTitle} nhận từ bạn ${sellerName}. ${refundText}`);
    }
  }, [selectedReason, productTitle, sellerName, isCodOrder]);

  const [dropoffPoint, setDropoffPoint] = useState<string>('library');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedProofVideoUrl, setUploadedProofVideoUrl] = useState<string>('');

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderId = backendOrder?.id || matchedOrder?.id || cleanCode.replace('#', '');
      const proofVideoUrl = uploadedProofVideoUrl || 'https://storage.marketfu.com/disputes/video-unbox-test.mp4';
      const reasonLabel = selectedReason === 'defect' ? 'Hàng lỗi kỹ thuật/hỏng hóc khi test' : 'Hàng không đúng như mô tả trên sàn';

      const res = await useDisputeStore.getState().createDispute({
        orderId,
        orderCode: cleanCode,
        reason: reasonLabel,
        details: description,
        proofVideoUrl,
        refundAmount: matchedOrder?.product.price,
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

  const canWithdrawDispute =
    isAlreadyDisputed &&
    activeDispute?.status === 'PENDING' &&
    matchedOrder?.status !== 'cancelled' &&
    matchedOrder?.status !== 'completed';

  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdrawDispute = async () => {
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
    if (activeDispute?.status === 'REJECTED') return 3;
    return 2;
  })();

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
            {isInterCampus ? 'Yêu cầu Trả hàng & Hoàn tiền Liên Campus' : 'Khiếu nại & Yêu cầu Trả hàng'}
          </span>
        </nav>

        {/* 2. EMERGENCY ESCROW HOLD BANNER */}
        <DisputeEscrowBanner />

        {/* 3. 4-STEP PROGRESS INDICATOR */}
        <DisputeStepper currentStep={currentStepperStep} />

        {/* 4. MAIN DISPUTE FORM GRID (8 COLS / 4 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: DISPUTE FORM OR TRACKING (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            {isAlreadyDisputed ? (
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

                {/* Scenario Guide Card */}
                <Card className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3 text-xs">
                  <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-500">
                    CÁC KỊCH BẢN XỬ LÝ KHIẾU NẠI & QUYỀN LỢI CỦA BẠN
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
                  refundAmount={matchedOrder?.product?.price ?? 0}
                />

                {/* Evidence, Description, Dropoff Location & Submit */}
                <DisputeEvidence
                  description={description}
                  onDescriptionChange={setDescription}
                  dropoffPoint={dropoffPoint}
                  onDropoffPointChange={setDropoffPoint}
                  isSubmitting={isSubmitting}
                  sellerName={sellerName}
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

          {/* RIGHT COLUMN: SIDEBAR ESCROW & AI REVIEW (4 COLS) */}
          <DisputeSidebar
            itemPrice={matchedOrder ? Math.max(0, matchedOrder.product.price - (matchedOrder.type === 'inter-campus' ? 25000 : 0)) : 0}
            shippingFee={matchedOrder?.type === 'inter-campus' ? 25000 : 0}
            totalEscrow={matchedOrder ? matchedOrder.product.price : 0}
            aiConfidenceScore={matchedOrder ? 94 : 0}
            onShowToast={(msg) => showToast(msg, 'info')}
          />
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
