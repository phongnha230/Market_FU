'use client';

import React, { useState, Suspense } from 'react';
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

function DisputeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCodeParam = searchParams.get('code') || 'ORD-88392-HCM-HL';
  const cleanCode = orderCodeParam.startsWith('#') ? orderCodeParam : `#${orderCodeParam}`;

  const { updateOrderStatus, getOrder, showToast } = useMarket();
  const matchedOrder = getOrder(cleanCode);

  // Form states
  const [resolutionPlan, setResolutionPlan] = useState<'return' | 'partial'>('return');
  const [selectedReason, setSelectedReason] = useState<string>('defect');
  const [description, setDescription] = useState<string>(
    'Màn hình nhận tại Dom B lúc 13:40 chiều nay, khi bóc hộp ra cắm thử cáp Type-C đi kèm vào ThinkPad T14 thì hoàn toàn không lên nguồn. Em đã đem ra bàn test kỹ thuật sảnh Alpha cắm qua củ sạc 65W chuẩn PD nhưng đèn nguồn chỉ nhấp nháy đỏ 2 lần rồi tắt hẳn, đồng thời xuất hiện vệt nứt ngầm góc dưới. Tình trạng khác xa mô tả 95% dùng tốt của bạn An K16.'
  );
  const [dropoffPoint, setDropoffPoint] = useState<'library' | 'meet'>('library');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      updateOrderStatus(
        cleanCode,
        'disputed',
        'Đã khóa Escrow • Chờ người bán phản hồi khiếu nại'
      );
      showToast('Đã gửi hồ sơ khiếu nại thành công! Tiền được khóa trong ví Escrow.', 'success');
      setTimeout(() => {
        router.push('/orders');
      }, 1500);
    }, 1200);
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
            itemPrice={matchedOrder ? matchedOrder.product.price - 25000 : 1200000}
            shippingFee={25000}
            totalEscrow={matchedOrder ? matchedOrder.product.price : 1225000}
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
