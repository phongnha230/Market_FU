'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { orderService } from '@/services/orderService';
import {
  ChevronRight,
  ShieldCheck,
  Star,
  Coins,
  Ticket,
  Truck,
  CheckCircle2,
  Camera,
  Video,
  Info,
  Lock,
  ArrowRight,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { Card, Badge, Button, Avatar, AvatarFallback, Progress } from '@/components/ui';
import { cn } from '@/lib/utils';

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawParam = searchParams.get('code') || searchParams.get('orderId') || '#ORD-88392-HCM-HL';
  const orderCode = rawParam.startsWith('#') ? rawParam : `#${rawParam}`;

  const markOrderReviewed = useOrderStore((state) => state.markOrderReviewed);
  const addCoins = useUserStore((state) => state.addCoins);
  const getOrder = useOrderStore((state) => state.getOrder);
  const currentOrder = getOrder(orderCode);

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'mota',
    'donggoi',
  ]);
  const [comment, setComment] = useState<string>(
    'Màn hình nhận tại sảnh Dom B KTX Hòa Lạc nguyên vẹn không vết xước. Bạn An đóng gói bằng 4 lớp màng xốp khí và thùng carton rất cẩn thận. Test kết nối Type-C với laptop ThinkPad lên ngay 1080p 60Hz sáng đẹp, kèm đủ 2 cáp zin. Rất uy tín!'
  );
  const [proofVideoUrl, setProofVideoUrl] = useState<string>('');
  const [giveBonusTrust, setGiveBonusTrust] = useState<boolean>(true);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const TAG_OPTIONS = [
    { id: 'mota', label: 'Đúng mô tả bài đăng (+1)' },
    { id: 'donggoi', label: 'Đóng gói chống sốc kỹ (+1)' },
    { id: 'huongdan', label: 'Hỗ trợ hướng dẫn test cổng chu đáo (+1)' },
    { id: 'giaonhanh', label: 'Giao liên campus thần tốc (+1)' },
    { id: 'phukien', label: 'Tặng kèm phụ kiện cáp HDMI mini' },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const rawOrderId = currentOrder?.id || orderCode.replace('#', '');
      const earnedCoins = proofVideoUrl.trim() ? 200 : 100;
      await orderService.submitReview({
        orderId: rawOrderId,
        rating,
        comment,
        proofVideoUrl: proofVideoUrl.trim() || undefined,
      });
      markOrderReviewed(orderCode);
      addCoins(earnedCoins);
      showToast(`🎉 Cảm ơn bạn! Đã ghi nhận đánh giá 2 chiều (Blind Review) và cộng +${earnedCoins} Xu vào tài khoản.`);
      setTimeout(() => {
        router.push('/orders');
      }, 1200);
    } catch (err: any) {
      const errorCode = err?.code || err?.response?.data?.errorCode;
      const message = err?.message || err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá!';
      if (errorCode === 'ALREADY_REVIEWED') {
        markOrderReviewed(orderCode);
        showToast('ℹ️ Bạn đã gửi đánh giá cho đơn hàng này rồi.');
        setTimeout(() => router.push('/orders'), 1200);
      } else if (orderCode.includes('77102') || !currentOrder?.id) {
        // Mock fallback for static demo orders
        const earnedCoins = proofVideoUrl.trim() ? 200 : 100;
        markOrderReviewed(orderCode);
        addCoins(earnedCoins);
        showToast(`🎉 Đã ghi nhận đánh giá thành công & cộng +${earnedCoins} Xu.`);
        setTimeout(() => router.push('/orders'), 1200);
      } else {
        showToast(`❌ ${message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between font-sans py-4 sm:py-6">
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Compact in-container Header with Back button */}
        <CompactHeader
          showBackButton={true}
          backHref="/orders"
          breadcrumbs={[
            { label: 'Quản lý đơn hàng', href: '/orders' },
            { label: `Đơn ${orderCode}` },
            { label: 'Đánh giá đơn hàng' },
          ]}
        />

        {/* 2. CELEBRATION TOP BANNER (Khớp 100% Image 3) */}
        <Card className="mb-6 rounded-2xl bg-gradient-to-r from-orange-700 via-fpt-orange to-amber-700 p-6 sm:p-7 text-white shadow-md border-none">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <Badge className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/30 hover:bg-white/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> GIAO DỊCH LIÊN CAMPUS HOÀN TẤT
              </Badge>
              <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                Bạn vừa hoàn tất đơn hàng liên campus (TP.HCM ➔ Hòa Lạc)
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-orange-100 max-w-2xl leading-relaxed">
                Mỗi đánh giá minh bạch từ bạn giúp xây dựng cộng đồng FPT 5Campus đáng tin cậy và an tâm giao dịch xa.
              </p>
            </div>

            {/* REWARD CHIPS */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Card className="flex flex-row items-center gap-2.5 rounded-xl bg-white/15 backdrop-blur-md p-3 px-4 border border-white/20 shadow-none">
                <div className="rounded-lg bg-emerald-400 p-2 text-slate-900 font-black">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-white">+100 Xu</div>
                  <div className="text-[10px] text-orange-200">+200 Xu nếu kèm video test</div>
                </div>
              </Card>

              <Card className="flex flex-row items-center gap-2.5 rounded-xl bg-white/15 backdrop-blur-md p-3 px-4 border border-white/20 shadow-none">
                <div className="rounded-lg bg-white/90 p-2 text-fpt-orange">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-white">-20.000đ</div>
                  <div className="text-[10px] text-orange-200">Voucher ship đơn kế</div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* 3. MAIN CONTENT: 2 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ORDER INFO & SELLER (4 COLS) */}
          <div className="lg:col-span-4 space-y-4">
            {/* PRODUCT CARD */}
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  THÔNG TIN BƯU PHẨM
                </span>
                <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200 hover:bg-emerald-50">
                  Giao thành công
                </Badge>
              </div>

              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src="/products/monitor-dell-24.jpg"
                    alt="Màn hình phụ di động 15.6 inch"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                    Màn hình phụ di động 15.6 inch Full HD Type-C
                  </h3>
                  <div className="mt-1 text-sm font-black text-slate-900">1.450.000đ</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Nhận 14:20 • Dom B KTX Hòa Lạc
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-slate-400" /> Lộ trình: FPT TP.HCM ➔ HL
                </span>
                <Badge variant="outline" className="rounded bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 border border-emerald-200 hover:bg-emerald-50">
                  An toàn 100%
                </Badge>
              </div>
            </Card>

            {/* SELLER CARD */}
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  NGƯỜI BÁN LIÊN CAMPUS
                </span>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-orange-700 text-white font-black text-sm">
                    A
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">Nguyễn Văn An</span>
                    <Badge className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 border-none hover:bg-emerald-100">
                      K16 SE
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500">Campus FPT TP.HCM (Quận 9)</div>
                  <div className="text-[10px] text-emerald-700 font-medium">🪪 Thẻ SV & KYC FPT chính quy</div>
                </div>
              </div>

              {/* Trust Score Bar */}
              <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Chỉ số uy tín người bán</span>
                  <span className="font-black text-slate-900 text-sm">0/100</span>
                </div>
                <Progress value={0} className="mt-1.5 h-1.5 w-full bg-slate-200" />
                <div className="text-[10px] text-slate-400 mt-1">Đã hoàn tất 0 giao dịch liên campus uy tín</div>
              </div>

              {/* Service Rating */}
              <div className="mt-3 text-xs">
                <div className="text-slate-600 mb-1">Đánh giá dịch vụ của người bán:</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 text-slate-200" />
                  ))}
                  <span className="text-xs font-bold text-slate-400 ml-1">0.0 (Chưa có đánh giá)</span>
                </div>
              </div>

              {/* Give Bonus Trust Checkbox */}
              <label className="mt-4 flex items-start gap-2.5 p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/70 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={giveBonusTrust}
                  onChange={(e) => setGiveBonusTrust(e.target.checked)}
                  className="h-4 w-4 mt-0.5 text-fpt-orange rounded border-slate-300 focus:ring-fpt-orange"
                />
                <div>
                  <span className="font-bold text-slate-900">Tặng điểm Campus Trust Score (+2 điểm)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cộng điểm tín nhiệm chính thức giúp An đạt danh hiệu "Người bán FPT Tin cậy 2025".
                  </p>
                </div>
              </label>
            </Card>

            {/* ESCROW PROTECTION BOX */}
            <Card className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs text-slate-600 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Bảo vệ giao dịch 48h</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sau khi bạn gửi đánh giá, tiền trong FPT CampusShip Escrow sẽ được chuyển cho người bán. Bạn hoàn toàn an tâm khi thiết bị đã được kiểm tra cẩn thận.
              </p>
            </Card>

            {/* DISPUTE EMERGENCY BOX */}
            <Card className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-900 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Hàng bị lỗi hoặc không đúng mô tả?</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Đừng xác nhận đánh giá! Bạn có quyền mở khiếu nại để tạm khóa tiền ví Escrow và yêu cầu hoàn trả 100%.
              </p>
              <Link
                href={`/orders/dispute?code=${encodeURIComponent(orderCode.replace('#', ''))}`}
                className="inline-flex items-center gap-1 font-bold text-xs text-rose-700 hover:text-rose-900 underline"
              >
                <span>Mở Khiếu nại & Khóa Escrow ngay</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Card>
          </div>

          {/* RIGHT COLUMN: REVIEW FORM (8 COLS) */}
          <div className="lg:col-span-8">
            <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* SECTION 1: STAR RATING */}
                <div>
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      Chất lượng sản phẩm & đóng gói
                    </h2>
                    <Badge variant="outline" className="rounded-full bg-orange-50 text-fpt-orange font-bold text-xs px-3 py-1 border border-orange-200 hover:bg-orange-50">
                      {rating}/5 sao - Rất hài lòng
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hãy cho biết mức độ hài lòng chung của bạn về món đồ nhận được
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={cn(
                            'h-8 w-8 sm:h-9 sm:w-9',
                            star <= rating
                              ? 'text-fpt-orange fill-fpt-orange'
                              : 'text-slate-300'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 2: HIGHLIGHT TAGS */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    Điểm nổi bật của đơn hàng (Chọn nhiều tag để người bán được cộng thưởng):
                  </h3>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((tag) => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <Button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag.id)}
                          className={cn(
                            'h-auto rounded-full px-3.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5',
                            isSelected
                              ? 'bg-fpt-orange text-white shadow-xs hover:bg-fpt-orange/90'
                              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 shadow-none'
                          )}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{tag.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: COMMENT TEXTAREA */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label className="font-bold text-slate-900">Nhận xét chi tiết sản phẩm:</label>
                    <span className="text-slate-400 font-mono">{comment.length}/500 ký tự</span>
                  </div>

                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm mở hộp, kiểm tra máy tại KTX..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-fpt-orange focus:ring-2 focus:ring-fpt-orange/15 transition leading-relaxed"
                  />

                  <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
                    <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Đánh giá trên 50 ký tự kèm ảnh thực tế sẽ đủ điều kiện nhận trọn bộ 50 Campus Coins.</span>
                  </div>
                </div>

                {/* SECTION 4: PHOTO & VIDEO UNBOXING UPLOAD */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Hình ảnh & Video bóc hộp tại KTX
                    </h3>
                    <Badge variant="outline" className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200 hover:bg-emerald-50">
                      BẢO CHỨNG THỰC TẾ
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Đã tải 2/5 hình ảnh • Tối đa 1 video test ngắn
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Photo 1: Unboxing */}
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                      <Image
                        src="/products/monitor-dell-24.jpg"
                        alt="Bóc hộp KTX"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/30"></div>
                      <span className="absolute bottom-1.5 left-1.5 right-1.5 rounded bg-slate-900/85 py-0.5 text-center text-[10px] font-bold text-white">
                        Bóc hộp KTX
                      </span>
                    </div>

                    {/* Photo 2: ThinkPad test */}
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                      <Image
                        src="/products/keyboard-detail.jpg"
                        alt="Cắm test ThinkPad"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/30"></div>
                      <span className="absolute bottom-1.5 left-1.5 right-1.5 rounded bg-slate-900/85 py-0.5 text-center text-[10px] font-bold text-white">
                        Cắm test ThinkPad
                      </span>
                    </div>

                    {/* Slot 3: Add Photo */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => showToast('📷 Tính năng tải ảnh: Bạn có thể chọn tối đa 5 hình ảnh từ thiết bị.')}
                      className="h-auto flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-3 text-center text-slate-500 hover:border-fpt-orange hover:bg-orange-50/30 transition cursor-pointer"
                    >
                      <Camera className="h-5 w-5 text-fpt-orange mb-1" />
                      <span className="text-xs font-bold text-slate-800">Thêm Ảnh</span>
                      <span className="text-[10px] text-slate-400 font-normal">Tối đa 5MB</span>
                    </Button>

                    {/* Slot 4: Add Video */}
                    <div className="col-span-2 sm:col-span-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Video className="h-4 w-4 text-fpt-orange" />
                          Link Video mở hộp & cắm test máy tại KTX (Nhận thưởng x2 = 200 Xu)
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          +200 Xu
                        </Badge>
                      </div>
                      <input
                        type="url"
                        value={proofVideoUrl}
                        onChange={(e) => setProofVideoUrl(e.target.value)}
                        placeholder="Dán link video Google Drive, YouTube hoặc cloud test máy..."
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-fpt-orange transition"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 5: ANONYMOUS TOGGLE */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-start gap-2.5">
                      <Lock className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900">Đánh giá ẩn danh danh tính</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tên của bạn sẽ hiển thị công khai dưới dạng <strong>HE17**** (HL)</strong> để bảo vệ quyền riêng tư cá nhân tại campus.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                        isAnonymous ? 'bg-fpt-orange' : 'bg-slate-300'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          isAnonymous ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* SECTION 6: SUBMIT BUTTONS */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-auto w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-fpt-orange py-3.5 text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:bg-fpt-orange-hover hover:shadow-lg transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Coins className="h-4 w-4" />
                    <span>{isSubmitting ? 'Đang gửi đánh giá...' : proofVideoUrl.trim() ? 'Gửi đánh giá & Nhận ngay +200 Xu (Kèm video test)' : 'Gửi đánh giá & Nhận ngay +100 Xu'}</span>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    className="h-auto w-full sm:w-auto text-center px-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                  >
                    <Link href="/orders">
                      Để sau
                    </Link>
                  </Button>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-tight">
                  🛡️ Bằng việc gửi đánh giá, bạn xác nhận đã kiểm tra thiết bị và đồng thuận tuân thủ Quy chuẩn Văn minh Thương mại FPT 5Campus.
                </p>
              </form>
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

export default function OrderReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500 font-medium">
          Đang tải trang đánh giá...
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}

