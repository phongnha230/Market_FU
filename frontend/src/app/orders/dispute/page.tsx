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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowLeft,
  FileText,
  Video,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useMarket } from '@/context/MarketContext';
import { useDisputeStore } from '@/stores/disputeStore';

function DisputeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCodeParam = searchParams.get('code') || 'ORD-88392-HCM-HL';
  const cleanCode = orderCodeParam.startsWith('#') ? orderCodeParam : `#${orderCodeParam}`;

  const { updateOrderStatus, getOrder, showToast } = useMarket();
  const matchedOrder = getOrder(cleanCode);

  const { disputes, fetchDisputes, cancelDispute } = useDisputeStore();

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const targetOrderId = matchedOrder?.id || cleanCode.replace('#', '');
  const existingDispute = disputes.find(
    (d) =>
      d.orderId === targetOrderId ||
      d.orderCode === cleanCode ||
      d.orderCode.replace('#', '') === cleanCode.replace('#', '')
  );

  const hasActiveDispute =
    existingDispute &&
    (existingDispute.status === 'PENDING' || existingDispute.status === 'INVESTIGATING');
  const isResolvedDispute =
    existingDispute &&
    (existingDispute.status === 'REFUNDED' || existingDispute.status === 'REJECTED');
  const isCancelledDispute = existingDispute && existingDispute.status === 'CANCELLED';

  const [forceShowNewForm, setForceShowNewForm] = useState(false);

  // Form states
  const [resolutionPlan, setResolutionPlan] = useState<'return' | 'partial'>('return');
  const [selectedReason, setSelectedReason] = useState<string>('defect');
  const [description, setDescription] = useState<string>(
    'Màn hình nhận tại Dom B lúc 13:40 chiều nay, khi bóc hộp ra cắm thử cáp Type-C đi kèm vào ThinkPad T14 thì hoàn toàn không lên nguồn. Em đã đem ra bàn test kỹ thuật sảnh Alpha cắm qua củ sạc 65W chuẩn PD nhưng đèn nguồn chỉ nhấp nháy đỏ 2 lần rồi tắt hẳn, đồng thời xuất hiện vệt nứt ngầm góc dưới. Tình trạng khác xa mô tả 95% dùng tốt của bạn An K16.'
  );
  const [dropoffPoint, setDropoffPoint] = useState<'library' | 'meet'>('library');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancellation states
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelPreset, setCancelPreset] = useState<string>('mutual_agreement');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');

  const CANCEL_REASONS = [
    { id: 'mutual_agreement', label: 'Hai bên đã liên hệ và thỏa thuận giải quyết riêng thành công' },
    { id: 'seller_replaced', label: 'Người bán đã chủ động đổi sản phẩm khác hoạt động tốt' },
    { id: 'resolved_defect', label: 'Sản phẩm đã hoạt động bình thường (do thao tác nhầm ban đầu)' },
    { id: 'other', label: 'Lý do khác' },
  ];

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderId = matchedOrder?.id || cleanCode.replace('#', '');
      const proofVideoUrl = 'https://storage.marketfu.com/disputes/video-unbox-test.mp4';
      const reasonLabel =
        selectedReason === 'defect'
          ? 'Hàng lỗi kỹ thuật/hỏng hóc khi test'
          : 'Hàng không đúng như mô tả trên sàn';

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
        setForceShowNewForm(false);
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

  const handleCancelDispute = async () => {
    if (!existingDispute) return;
    setIsCancelling(true);
    try {
      const selectedReasonText = CANCEL_REASONS.find((r) => r.id === cancelPreset)?.label || '';
      const finalReason =
        cancelPreset === 'other'
          ? customCancelReason || 'Người mua tự rút đơn khiếu nại'
          : selectedReasonText;

      const res = await cancelDispute(existingDispute.id, finalReason);
      if (res.success) {
        updateOrderStatus(
          cleanCode,
          'delivered',
          'Người mua đã rút khiếu nại • Trở lại 48h kiểm hàng'
        );
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi rút khiếu nại', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Determine current step
  const stepperStep = !existingDispute || isCancelledDispute
    ? 1
    : existingDispute.status === 'REFUNDED'
    ? 4
    : 2;

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
            {hasActiveDispute ? 'Hồ sơ khiếu nại & Quản lý tranh chấp' : 'Khiếu nại & Yêu cầu Trả hàng'}
          </span>
        </nav>

        {/* 2. EMERGENCY ESCROW HOLD BANNER */}
        <DisputeEscrowBanner />

        {/* 3. 4-STEP PROGRESS INDICATOR */}
        <DisputeStepper currentStep={stepperStep} />

        {/* 4. MAIN CONTENT GRID (8 COLS / 4 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ACTIVE DISPUTE DETAILS OR DISPUTE SUBMISSION FORM */}
          <div className="lg:col-span-8 space-y-5">
            {/* Parcel Details */}
            <DisputeParcelCard order={matchedOrder} orderCode={cleanCode} />

            {/* A. VIEW EXISTING DISPUTE IF ACTIVE OR RESOLVED */}
            {existingDispute && !forceShowNewForm && (
              <div className="space-y-5">
                {/* Dispute Overview Card */}
                <Card className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          Hồ sơ khiếu nại #{existingDispute.id.slice(-8).toUpperCase()}
                        </h2>
                        {existingDispute.status === 'PENDING' && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300 font-bold text-xs">
                            Đang chờ Admin thụ lý
                          </Badge>
                        )}
                        {existingDispute.status === 'INVESTIGATING' && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-300 font-bold text-xs">
                            Admin đang đối soát
                          </Badge>
                        )}
                        {existingDispute.status === 'REFUNDED' && (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs">
                            Đã phán quyết hoàn tiền
                          </Badge>
                        )}
                        {existingDispute.status === 'REJECTED' && (
                          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border border-rose-300 font-bold text-xs">
                            Khiếu nại bị bác bỏ
                          </Badge>
                        )}
                        {existingDispute.status === 'CANCELLED' && (
                          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-300 font-bold text-xs">
                            Đã rút khiếu nại
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Gửi lúc: {existingDispute.createdAt}
                      </p>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-50 shrink-0 self-start sm:self-auto"
                    >
                      <Link href="/orders">
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Quay lại Đơn hàng
                      </Link>
                    </Button>
                  </div>

                  {/* Dispute Details Content */}
                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 space-y-3">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Lý do khiếu nại:</span>
                        <p className="text-slate-900 font-semibold">{existingDispute.reason}</p>
                      </div>

                      {existingDispute.details && existingDispute.details !== existingDispute.reason && (
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Mô tả chi tiết:</span>
                          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {existingDispute.details}
                          </p>
                        </div>
                      )}

                      {existingDispute.proofVideoUrl && (
                        <div className="pt-1">
                          <span className="font-bold text-slate-700 block mb-1.5">Bằng chứng video / ảnh:</span>
                          <a
                            href={existingDispute.proofVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-fpt-orange hover:border-orange-200 transition"
                          >
                            <Video className="h-3.5 w-3.5 text-fpt-orange" />
                            <span>Mở video unbox kiểm tra</span>
                            <ExternalLink className="h-3 w-3 text-slate-400" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Admin Resolution Note if resolved */}
                    {existingDispute.adminNote && (
                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800">
                          <Info className="h-4 w-4" />
                          Ghi chú từ Quản trị viên / Kết luận:
                        </div>
                        <p className="leading-relaxed pl-5">{existingDispute.adminNote}</p>
                        {existingDispute.resolvedAt && (
                          <p className="pl-5 text-[11px] text-amber-700 font-medium">
                            Xử lý vào: {existingDispute.resolvedAt}
                          </p>
                        )}
                      </div>
                    )}

                    {/* CANCELLATION WORKFLOW (FOR ACTIVE DISPUTES) */}
                    {hasActiveDispute && (
                      <div className="mt-5 pt-5 border-t border-slate-200/80 space-y-4">
                        <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/80">
                          <div className="flex items-start gap-2.5">
                            <ShieldCheck className="h-5 w-5 text-fpt-orange shrink-0 mt-0.5" />
                            <div className="space-y-1 text-xs">
                              <h4 className="font-bold text-slate-900">
                                Rút đơn khiếu nại (Thỏa thuận riêng thành công)
                              </h4>
                              <p className="text-slate-600 leading-relaxed">
                                Nếu bạn và người bán đã chủ động liên lạc và tìm được tiếng nói chung
                                (như người bán đồng ý đổi sản phẩm khác, gửi bù tiền hoặc hướng dẫn khắc
                                phục), bạn có thể chủ động <strong>Rút khiếu nại</strong>. Đơn hàng sẽ
                                được chuyển về trạng thái giao nhận bình thường.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-orange-200/60 space-y-3">
                            <label className="block text-xs font-bold text-slate-800">
                              Chọn lý do rút đơn khiếu nại:
                            </label>
                            <div className="space-y-2">
                              {CANCEL_REASONS.map((reason) => (
                                <label
                                  key={reason.id}
                                  className={cn(
                                    'flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition',
                                    cancelPreset === reason.id
                                      ? 'border-orange-500 bg-white font-semibold text-slate-900 shadow-xs'
                                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name="cancelReason"
                                    checked={cancelPreset === reason.id}
                                    onChange={() => setCancelPreset(reason.id)}
                                    className="accent-fpt-orange"
                                  />
                                  <span>{reason.label}</span>
                                </label>
                              ))}
                            </div>

                            {cancelPreset === 'other' && (
                              <textarea
                                value={customCancelReason}
                                onChange={(e) => setCustomCancelReason(e.target.value)}
                                placeholder="Nhập lý do rút đơn của bạn..."
                                rows={2}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-fpt-orange focus:ring-1 focus:ring-fpt-orange"
                              />
                            )}

                            <div className="pt-2 flex items-center justify-end gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelDispute}
                                disabled={isCancelling}
                                className="rounded-xl border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs h-auto px-4 py-2 cursor-pointer shadow-xs transition"
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                {isCancelling ? 'Đang xử lý rút đơn...' : 'Xác nhận rút đơn khiếu nại'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IF CANCELLED: OPTION TO RE-OPEN OR VIEW */}
                    {isCancelledDispute && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-xs text-slate-600">
                          <span className="font-bold text-slate-800 block">Đơn khiếu nại đã được rút</span>
                          Giao dịch này đang ở trạng thái an toàn. Nếu tiếp tục phát sinh sự cố mới, bạn có thể gửi lại yêu cầu.
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setForceShowNewForm(true)}
                          className="rounded-xl border-fpt-orange text-fpt-orange hover:bg-orange-50 text-xs font-bold shrink-0"
                        >
                          Tạo khiếu nại mới
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* B. DISPUTE SUBMISSION FORM (WHEN NO ACTIVE DISPUTE) */}
            {(!existingDispute || isCancelledDispute) && (forceShowNewForm || !existingDispute) && (
              <form onSubmit={handleSubmitDispute} className="space-y-5">
                {/* Resolution Plan & Reason */}
                <DisputeResolution
                  resolutionPlan={resolutionPlan}
                  onPlanChange={setResolutionPlan}
                  selectedReason={selectedReason}
                  onReasonChange={setSelectedReason}
                />

                {/* Evidence, Description, Dropoff Location & Submit */}
                <DisputeEvidence
                  description={description}
                  onDescriptionChange={setDescription}
                  dropoffPoint={dropoffPoint}
                  onDropoffPointChange={setDropoffPoint}
                  isSubmitting={isSubmitting}
                  sellerName={matchedOrder?.product.seller.name || 'NguyenVanAn'}
                  onShowToast={(msg) => showToast(msg, 'info')}
                />
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: SIDEBAR ESCROW & AI REVIEW (4 COLS) */}
          <DisputeSidebar
            itemPrice={
              matchedOrder
                ? Math.max(0, matchedOrder.product.price - (matchedOrder.type === 'inter-campus' ? 25000 : 0))
                : 0
            }
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
