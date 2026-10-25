'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import { useOrderStore, OrderReviewData } from '@/stores/orderStore';
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
  Edit3,
} from 'lucide-react';
import { Card, Badge, Button, Avatar, AvatarFallback, AvatarImage, Progress } from '@/components/ui';

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';
  const rawParam = searchParams.get('code') || searchParams.get('orderId') || '';
  const orderCode = rawParam ? (rawParam.startsWith('#') ? rawParam : `#${rawParam}`) : '';

  const markOrderReviewed = useOrderStore((state) => state.markOrderReviewed);
  const updateOrderReview = useOrderStore((state) => state.updateOrderReview);
  const addCoins = useUserStore((state) => state.addCoins);
  const userData = useUserStore((state) => state.user);
  const getOrder = useOrderStore((state) => state.getOrder);
  const storeOrder = orderCode ? getOrder(orderCode) : undefined;

  const [backendOrder, setBackendOrder] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(!storeOrder && Boolean(orderCode));

  useEffect(() => {
    if (orderCode) {
      const clean = orderCode.replace('#', '');
      orderService
        .getOrderDetail(clean)
        .then((data) => {
          if (data) setBackendOrder(data);
        })
        .catch(() => {})
        .finally(() => setIsLoadingOrder(false));
    }
  }, [orderCode]);

  const currentOrder = storeOrder || backendOrder;

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [proofVideoUrl, setProofVideoUrl] = useState<string>('');
  const [giveBonusTrust, setGiveBonusTrust] = useState<boolean>(true);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [reviewMediaList, setReviewMediaList] = useState<Array<{ id: string; url: string; name: string; isVideo?: boolean }>>([
    {
      id: 'rev-1',
      url: '/products/keyboard-akko.jpg',
      name: 'Bóc hộp KTX',
    },
    {
      id: 'rev-2',
      url: '/products/keyboard-detail.jpg',
      name: 'Cắm test ThinkPad',
    },
  ]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: typeof reviewMediaList = [];
    let hasVideo = false;
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      if (isVideo) hasVideo = true;
      const objectUrl = URL.createObjectURL(file);
      newItems.push({
        id: Math.random().toString(36).substring(7),
        url: objectUrl,
        name: file.name,
        isVideo,
      });
    });

    setReviewMediaList((prev) => [...prev, ...newItems]);
    if (hasVideo) {
      setProofVideoUrl('uploaded-local-video');
    }
    showToast(`✅ Đã tải lên ${newItems.length} hình ảnh / video bóc hộp thực tế!`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMedia = (id: string) => {
    setReviewMediaList((prev) => {
      const remaining = prev.filter((item) => item.id !== id);
      if (!remaining.some((item) => item.isVideo)) {
        setProofVideoUrl('');
      }
      return remaining;
    });
    showToast('Đã gỡ tệp khỏi danh sách đánh giá.');
  };

  // Lấy thông tin người bán và sản phẩm thực tế từ order
  const productTitle = currentOrder?.product?.title || 'Sản phẩm giao dịch';
  const productPrice = currentOrder?.product?.price || currentOrder?.payment?.price || 0;
  const productImage = typeof currentOrder?.product?.imageUrl === 'string' && currentOrder?.product?.imageUrl
    ? currentOrder.product.imageUrl
    : currentOrder?.product?.images?.[0]?.imageUrl || '/products/keyboard-akko.jpg';
  
  const sellerName = currentOrder?.product?.seller?.name || currentOrder?.seller?.profile?.fullName || currentOrder?.seller?.email || 'Người bán FPT';
  const sellerCampus = currentOrder?.product?.seller?.cohortCampus || currentOrder?.seller?.profile?.campus || 'Campus FPT';
  const sellerStudentId = currentOrder?.seller?.profile?.studentId || currentOrder?.seller?.studentId || '';
  const sellerInitial = (sellerName || 'N').trim()[0].toUpperCase();
  const sellerAvatarUrl =
    currentOrder?.seller?.profile?.avatarUrl ||
    (currentOrder as any)?.seller?.avatarUrl ||
    (currentOrder as any)?.product?.seller?.avatarUrl ||
    '';

  // Lấy số liệu uy tín người bán từ data thực tế của backend
  const sellerTrustScore: number = (() => {
    const score =
      currentOrder?.seller?.trustScore ??
      currentOrder?.seller?.profile?.trustScore ??
      currentOrder?.seller?.sellerStats?.trustScore ??
      null;
    if (score !== null && score !== undefined) return Math.min(100, Math.max(0, Number(score)));
    return null as unknown as number;
  })();

  const sellerAvgRating: number = (() => {
    const r =
      currentOrder?.seller?.avgRating ??
      currentOrder?.seller?.profile?.avgRating ??
      currentOrder?.seller?.sellerStats?.avgRating ??
      currentOrder?.seller?.rating ??
      null;
    if (r !== null && r !== undefined) return Math.min(5, Math.max(0, Number(r)));
    return null as unknown as number;
  })();

  const sellerTotalReviews: number = (() => {
    return (
      currentOrder?.seller?.totalReviews ??
      currentOrder?.seller?.sellerStats?.totalReviews ??
      currentOrder?.seller?.reviewCount ??
      0
    );
  })();

  const sellerIsKyc: boolean =
    currentOrder?.seller?.kycStatus === 'approved_seller' ||
    currentOrder?.seller?.kycStatus === 'approved' ||
    Boolean(currentOrder?.seller?.isKyc) ||
    Boolean(currentOrder?.seller?.profile?.isKycVerified);

  const ratingLabel = (r: number) => {
    if (r >= 4.8) return 'Xuất sắc';
    if (r >= 4.5) return 'Rất uy tín';
    if (r >= 4.0) return 'Uy tín';
    if (r >= 3.0) return 'Bình thường';
    return 'Cần cải thiện';
  };

  // Mã số sinh viên của người mua đang review
  const buyerStudentId =
    userData?.studentId ||
    userData?.email?.match(/([a-zA-Z]{2}\d{6})/i)?.[1]?.toUpperCase() ||
    (userData?.email ? userData.email.split('@')[0].toUpperCase() : '') ||
    (userData?.id ? `SV${userData.id.slice(0, 6).toUpperCase()}` : 'SV_FPT');
  const anonymousCode = buyerStudentId.length > 4 ? `${buyerStudentId.slice(0, 4)}**** (${userData?.campus || 'HL'})` : `${buyerStudentId}****`;

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

  // Pre-fill if editing or reviewData exists
  useEffect(() => {
    const existing = storeOrder?.reviewData;
    if (existing) {
      if (typeof existing.rating === 'number') setRating(existing.rating);
      if (typeof existing.comment === 'string') setComment(existing.comment);
      if (Array.isArray(existing.tags) && existing.tags.length > 0) setSelectedTags(existing.tags);
      if (typeof existing.isAnonymous === 'boolean') setIsAnonymous(existing.isAnonymous);
      if (existing.proofVideoUrl) setProofVideoUrl(existing.proofVideoUrl);
      if (existing.images && existing.images.length > 0) {
        setReviewMediaList(
          existing.images.map((url, idx) => ({
            id: `exist-${idx}`,
            url,
            name: `Ảnh test ${idx + 1}`,
          }))
        );
      }
    }
  }, [storeOrder?.reviewData]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode) {
      showToast('❌ Không tìm thấy thông tin đơn hàng cần đánh giá!');
      return;
    }
    setIsSubmitting(true);
    try {
      const rawOrderId = currentOrder?.id || orderCode.replace('#', '');
      const earnedCoins = proofVideoUrl.trim() ? 200 : 100;

      if (isEditMode) {
        const partialData: Partial<OrderReviewData> = {
          rating,
          comment,
          tags: selectedTags,
          images: reviewMediaList.map((m) => m.url),
          proofVideoUrl: proofVideoUrl.trim() || undefined,
          isAnonymous,
        };
        await orderService.updateReview(rawOrderId, {
          rating,
          comment,
          images: reviewMediaList.map((m) => m.url),
          proofVideoUrl: proofVideoUrl.trim() || null,
        });
        updateOrderReview(orderCode, partialData);
        showToast('✅ Đã cập nhật thành công đánh giá đơn hàng!');
        setTimeout(() => {
          router.push('/orders');
        }, 1200);
        return;
      }

      // Gửi đánh giá mới
      const fullReviewData: OrderReviewData = {
        rating,
        comment,
        tags: selectedTags,
        images: reviewMediaList.map((m) => m.url),
        proofVideoUrl: proofVideoUrl.trim() || undefined,
        isAnonymous,
        reviewedAt: new Date().toISOString(),
        isPublic: true,
        canEdit: true,
        bonusCoins: earnedCoins,
      };

      try {
        await orderService.submitReview({
          orderId: rawOrderId,
          rating,
          comment,
          proofVideoUrl: proofVideoUrl.trim() || undefined,
        });
      } catch (err: any) {
        const errorCode = err?.response?.data?.errorCode;
        if (errorCode !== 'ALREADY_REVIEWED') {
          throw err;
        }
      }

      markOrderReviewed(orderCode, fullReviewData);
      addCoins(earnedCoins);
      showToast(`🎉 Cảm ơn bạn! Đã đăng đánh giá công khai và cộng +${earnedCoins} Xu vào tài khoản.`);
      setTimeout(() => {
        router.push('/orders');
      }, 1200);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi gửi đánh giá!';
      showToast(`❌ ${message}`);
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
            { label: isEditMode ? 'Chỉnh sửa đánh giá' : 'Đánh giá đơn hàng' },
          ]}
        />

        {/* 2. CELEBRATION TOP BANNER (Khớp 100% Image 3) */}
        <Card className="mb-6 rounded-2xl bg-gradient-to-r from-orange-700 via-fpt-orange to-amber-700 p-6 sm:p-7 text-white shadow-md border-none">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <Badge className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/30 hover:bg-white/20">
                {isEditMode ? (
                  <>
                    <Edit3 className="h-3.5 w-3.5" /> CHỈNH SỬA ĐÁNH GIÁ ĐÃ GỬI
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> GIAO DỊCH LIÊN CAMPUS HOÀN TẤT
                  </>
                )}
              </Badge>
              <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                {isEditMode
                  ? 'Chỉnh sửa nội dung đánh giá của bạn'
                  : currentOrder?.type === 'inter-campus'
                  ? `Bạn vừa hoàn tất đơn hàng liên campus (${sellerCampus} ➔ ${userData?.campus || 'Hòa Lạc'})`
                  : 'Bạn vừa hoàn tất giao dịch sản phẩm an toàn'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-orange-100 max-w-2xl leading-relaxed">
                {isEditMode
                  ? 'Bạn có thể cập nhật lại số sao, nhận xét hoặc tải thêm hình ảnh/video test thiết bị thực tế.'
                  : 'Mỗi đánh giá minh bạch từ bạn giúp xây dựng cộng đồng FPT 5Campus đáng tin cậy và an tâm giao dịch xa.'}
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
                    src={productImage}
                    alt={productTitle}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                    {productTitle}
                  </h3>
                  <div className="mt-1 text-sm font-black text-slate-900">
                    {productPrice.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Nhận tại KTX {userData?.campus || 'Hòa Lạc'}
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-slate-400" /> Tuyến: {sellerCampus} ➔ {userData?.campus || 'Hòa Lạc'}
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
                <Avatar className="h-10 w-10 shrink-0 border border-slate-200">
                  {sellerAvatarUrl && (
                    <AvatarImage src={sellerAvatarUrl} alt={sellerName} />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-sm">
                    {sellerInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{sellerName}</span>
                    {sellerStudentId && (
                      <Badge className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 border-none hover:bg-emerald-100">
                        {sellerStudentId}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">Campus FPT {sellerCampus}</div>
                  {sellerIsKyc ? (
                    <div className="text-[10px] text-emerald-700 font-medium">🪪 Thẻ SV & KYC FPT chính quy</div>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-medium">Sinh viên FPT</div>
                  )}
                </div>
              </div>

              {/* Trust Score Bar */}
              <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Chỉ số uy tín người bán</span>
                  {sellerTrustScore !== null ? (
                    <span className="font-black text-slate-900 text-sm">{sellerTrustScore}/100</span>
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">Chưa có dữ liệu</span>
                  )}
                </div>
                {sellerTrustScore !== null ? (
                  <Progress value={sellerTrustScore} className="mt-1.5 h-1.5 w-full bg-slate-200" />
                ) : (
                  <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full" />
                )}
                <div className="text-[10px] text-slate-400 mt-1">
                  {sellerTotalReviews > 0
                    ? `Dựa trên ${sellerTotalReviews} giao dịch đã hoàn tất`
                    : 'Đây là giao dịch đầu tiên của người bán này'}
                </div>
              </div>

              {/* Service Rating */}
              <div className="mt-3 text-xs">
                <div className="text-slate-600 mb-1">Đánh giá dịch vụ của người bán:</div>
                {sellerAvgRating !== null ? (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= Math.round(sellerAvgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">
                      {sellerAvgRating.toFixed(1)} ({ratingLabel(sellerAvgRating)})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 text-slate-200 fill-slate-200" />
                    ))}
                    <span className="text-[11px] text-slate-400 ml-1">Chưa có đánh giá</span>
                  </div>
                )}
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
                    Cộng điểm tín nhiệm chính thức giúp {sellerName} đạt danh hiệu "Người bán FPT Tin cậy".
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
                          className={`h-8 w-8 sm:h-9 sm:w-9 ${
                            star <= rating
                              ? 'text-fpt-orange fill-fpt-orange'
                              : 'text-slate-300'
                          }`}
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
                          className={`h-auto rounded-full px-3.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-fpt-orange text-white shadow-xs hover:bg-fpt-orange/90'
                              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 shadow-none'
                          }`}
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
                    Đã tải {reviewMediaList.length} tệp • Tải ảnh và video mở hộp trực tiếp từ máy để nhận thưởng tối đa +200 Xu
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {reviewMediaList.map((item) => (
                      <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs">
                        {item.isVideo ? (
                          <video src={item.url} controls className="w-full h-full object-cover" />
                        ) : (
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item.id)}
                          className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white w-6 h-6 flex items-center justify-center text-xs transition z-10"
                          title="Xóa tệp"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 rounded bg-slate-900/85 py-0.5 text-center text-[10px] font-bold text-white truncate px-1">
                          {item.isVideo ? '🎥 Video unbox' : item.name}
                        </span>
                      </div>
                    ))}

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />

                    {/* Slot: Add Media (Image or Video) */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-auto aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-3 text-center text-slate-500 hover:border-fpt-orange hover:bg-orange-50/30 transition cursor-pointer"
                    >
                      <Camera className="h-6 w-6 text-fpt-orange mb-1" />
                      <span className="text-xs font-bold text-slate-800">Thêm Ảnh / Video</span>
                      <span className="text-[10px] text-slate-400 font-normal">Tải từ thiết bị</span>
                    </Button>
                  </div>

                  {reviewMediaList.some((item) => item.isVideo) && (
                    <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Đã đính kèm video bóc hộp test máy thực tế!
                      </span>
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                        +200 Xu Độc Quyền
                      </Badge>
                    </div>
                  )}
                </div>

                {/* SECTION 5: ANONYMOUS TOGGLE */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-start gap-2.5">
                      <Lock className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900">Đánh giá ẩn danh danh tính</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tên của bạn sẽ hiển thị công khai dưới dạng <strong>{anonymousCode}</strong> để bảo vệ quyền riêng tư cá nhân tại campus.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isAnonymous ? 'bg-fpt-orange' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isAnonymous ? 'translate-x-5' : 'translate-x-0'
                        }`}
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
                    {isEditMode ? (
                      <>
                        <Edit3 className="h-4 w-4" />
                        <span>{isSubmitting ? 'Đang lưu thay đổi...' : 'Lưu cập nhật đánh giá'}</span>
                      </>
                    ) : (
                      <>
                        <Coins className="h-4 w-4" />
                        <span>{isSubmitting ? 'Đang gửi đánh giá...' : proofVideoUrl.trim() ? 'Gửi đánh giá & Nhận ngay +200 Xu (Kèm video test)' : 'Gửi đánh giá & Nhận ngay +100 Xu'}</span>
                      </>
                    )}
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

