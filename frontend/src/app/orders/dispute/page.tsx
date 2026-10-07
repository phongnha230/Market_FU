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

  const matchedOrder = storeOrder || backendOrder;
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

  const [dropoffPoint, setDropoffPoint] = useState<'library' | 'meet'>('library');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderId = matchedOrder?.id || cleanCode.replace('#', '');
      const proofVideoUrl = 'https://storage.marketfu.com/disputes/video-unbox-test.mp4';
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
          <span className="font-bold text-fpt-orange">Khiếu nại & Yêu cầu Trả hàng</span>
        </nav>

        {/* 2. EMERGENCY ESCROW HOLD BANNER */}
        <DisputeEscrowBanner />

        {/* 3. 4-STEP PROGRESS INDICATOR */}
        <DisputeStepper currentStep={1} />

        {/* 4. MAIN DISPUTE FORM GRID (8 COLS / 4 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: DISPUTE FORM (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            <form onSubmit={handleSubmitDispute} className="space-y-5">
              {/* Parcel Details */}
              <DisputeParcelCard order={matchedOrder} orderCode={cleanCode} />

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
