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
import { reportService } from '@/services/reportService';
import {
  Star,
  Coins,
  Truck,
  MapPin,
  CheckCircle2,
  Camera,
  Lock,
  Edit3,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Card, Badge, Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';

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

  useEffect(() => {
    if (orderCode) {
      const clean = orderCode.replace('#', '');
      orderService
        .getOrderDetail(clean)
        .then((data) => {
          if (data) setBackendOrder(data);
        })
        .catch(() => {});
    }
  }, [orderCode]);

  const currentOrder = storeOrder || backendOrder;

  const isInterCampus =
    currentOrder?.type === 'inter-campus' ||
    (currentOrder as any)?.orderType === 'SHIP_COD' ||
    Boolean(currentOrder?.shipping?.shippingPartner);

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [proofVideoUrl, setProofVideoUrl] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [reviewMediaList, setReviewMediaList] = useState<Array<{ id: string; url: string; name: string; isVideo?: boolean }>>([]);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    const newItems: typeof reviewMediaList = [];
    let hasVideo = false;

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/');
      if (isVideo) hasVideo = true;

      let finalUrl = await readFileAsDataUrl(file);

      try {
        const uploadRes = await reportService.uploadDisputeEvidence(file);
        if (uploadRes && uploadRes.url) {
          finalUrl = uploadRes.url;
        }
      } catch {
        // Fallback Base64 offline
      }

      if (finalUrl) {
        newItems.push({
          id: Math.random().toString(36).substring(7),
          url: finalUrl,
          name: file.name,
          isVideo,
        });
      }
    }

    setReviewMediaList((prev) => [...prev, ...newItems]);
    if (hasVideo) {
      setProofVideoUrl('uploaded-local-video');
    }
    showToast(`Đã tải lên ${newItems.length} tệp hình ảnh / video thực tế!`);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUploadingMedia(false);
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

  // Product & Seller Info
  const productTitle = currentOrder?.product?.title || 'Sản phẩm giao dịch';
  const productPrice = currentOrder?.product?.price || currentOrder?.payment?.price || 0;
  const productImage = typeof currentOrder?.product?.imageUrl === 'string' && currentOrder?.product?.imageUrl
    ? currentOrder.product.imageUrl
    : currentOrder?.product?.images?.[0]?.imageUrl || '/products/monitor-dell-24.jpg';

  const sellerName = currentOrder?.product?.seller?.name || currentOrder?.seller?.profile?.fullName || currentOrder?.seller?.email || 'Người bán FPT';
  const sellerCampus = currentOrder?.product?.seller?.cohortCampus || currentOrder?.seller?.profile?.campus || 'Campus FPT';
  const buyerCampus = userData?.campus || (currentOrder as any)?.buyer?.campus || (currentOrder as any)?.buyer?.profile?.campus || 'Campus FPT';
  const sellerInitial = (sellerName || 'N').trim()[0].toUpperCase();
  const sellerAvatarUrl =
    currentOrder?.seller?.profile?.avatarUrl ||
    (currentOrder as any)?.seller?.avatarUrl ||
    (currentOrder as any)?.product?.seller?.avatarUrl ||
    '';

  const sellerIsKyc: boolean =
    currentOrder?.seller?.kycStatus === 'approved_seller' ||
    currentOrder?.seller?.kycStatus === 'approved' ||
    Boolean(currentOrder?.seller?.isKyc) ||
    Boolean(currentOrder?.seller?.profile?.isKycVerified);

  const buyerStudentId =
    userData?.studentId ||
    userData?.email?.match(/([a-zA-Z]{2}\d{6})/i)?.[1]?.toUpperCase() ||
    (userData?.email ? userData.email.split('@')[0].toUpperCase() : '') ||
    'SV_FPT';
  const anonymousCode = buyerStudentId.length > 4 ? `${buyerStudentId.slice(0, 4)}**** (${buyerCampus})` : `${buyerStudentId}****`;

  // Dynamic tags according to order type
  const TAG_OPTIONS = isInterCampus
    ? [
        { id: 'mota', label: 'Đúng mô tả bài đăng' },
        { id: 'donggoi', label: 'Đóng gói chống sốc kỹ' },
        { id: 'giaonhanh', label: 'Giao hàng nhanh' },
        { id: 'phukien', label: 'Đầy đủ phụ kiện' },
        { id: 'thanthien', label: 'Người bán nhiệt tình' },
      ]
    : [
        { id: 'mota', label: 'Đúng mô tả bài đăng' },
        { id: 'hangmoi', label: 'Hàng còn rất mới' },
        { id: 'dunggio', label: 'Đúng giờ hẹn Safe-Point' },
        { id: 'huongdan', label: 'Hỗ trợ test đồ chu đáo' },
        { id: 'thanthien', label: 'Người bán thân thiện' },
      ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  const hasMedia = reviewMediaList.length > 0;
  const earnedCoins = hasMedia ? 200 : 100;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode) {
      showToast('❌ Không tìm thấy thông tin đơn hàng cần đánh giá!');
      return;
    }
    setIsSubmitting(true);
    try {
      const rawOrderId = currentOrder?.id || orderCode.replace('#', '');

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
        try {
          updateOrderReview(orderCode, partialData);
        } catch (storeErr) {
          console.warn('⚠️ [ReviewPage] Lỗi cập nhật local store:', storeErr);
        }
        showToast('✅ Đã cập nhật đánh giá thành công!');
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
          images: reviewMediaList.map((m) => m.url),
          proofVideoUrl: proofVideoUrl.trim() || undefined,
        });
      } catch (err: any) {
        const errorCode = err?.response?.data?.errorCode;
        if (errorCode !== 'ALREADY_REVIEWED') {
          throw err;
        }
      }

      try {
        markOrderReviewed(orderCode, fullReviewData);
        addCoins(earnedCoins);
      } catch (storeErr) {
        console.warn('⚠️ [ReviewPage] Lỗi cập nhật local store:', storeErr);
      }
      showToast(`🎉 Cảm ơn bạn! Đã gửi đánh giá và nhận +${earnedCoins} Xu.`);
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

  const ratingDesc = (r: number) => {
    switch (r) {
      case 5:
        return 'Rất hài lòng (5 sao)';
      case 4:
        return 'Hài lòng (4 sao)';
      case 3:
        return 'Bình thường (3 sao)';
      case 2:
        return 'Chưa hài lòng (2 sao)';
      default:
        return 'Thất vọng (1 sao)';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between font-sans py-4 sm:py-6">
      <main className="mx-auto max-w-6xl w-full px-4 sm:px-6 space-y-4">
        {/* Navigation Breadcrumb */}
        <CompactHeader
          showBackButton={true}
          backHref="/orders"
          breadcrumbs={[
            { label: 'Quản lý đơn hàng', href: '/orders' },
            { label: `Đơn ${orderCode}` },
            { label: isEditMode ? 'Chỉnh sửa đánh giá' : 'Đánh giá đơn hàng' },
          ]}
        />

        {/* 1. COMPACT HERO HEADER */}
        <Card className="rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50 via-white to-amber-50/50 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold px-2.5 py-0.5 hover:bg-orange-100">
                  {isEditMode ? (
                    <span className="flex items-center gap-1">
                      <Edit3 className="h-3 w-3" /> Chỉnh sửa đánh giá
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-fpt-orange" /> Giao dịch hoàn tất
                    </span>
                  )}
                </Badge>

                <Badge variant="outline" className={`rounded-full text-[11px] font-bold px-2.5 py-0.5 border ${
                  isInterCampus ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {isInterCampus ? (
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Vận chuyển Liên Campus
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Giao dịch Safe-Point
                    </span>
                  )}
                </Badge>
              </div>

              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                {isEditMode
                  ? 'Cập nhật nhận xét cho đơn hàng'
                  : isInterCampus
                  ? `Đánh giá trải nghiệm nhận hàng từ Campus ${sellerCampus}`
                  : 'Đánh giá trải nghiệm nhận hàng trực tiếp tại Safe-Point'}
              </h1>
              <p className="text-xs text-slate-500 leading-normal">
                Nhận xét thực tế của bạn giúp cộng đồng sinh viên FPT yên tâm hơn khi trao đổi đồ cũ.
              </p>
            </div>

            {/* Coin Reward Chip */}
            <div className="rounded-xl border border-orange-200/90 bg-white p-3 px-3.5 shadow-xs shrink-0 flex items-center gap-2.5 self-start sm:self-auto">
              <div className="rounded-lg bg-orange-100 text-fpt-orange p-2">
                <Coins className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-slate-900">
                  +{hasMedia ? '200 Xu' : '100 Xu'} thưởng
                </div>
                <div className="text-[10px] text-slate-500">
                  {hasMedia ? '✓ Đã có ảnh/video thực tế' : 'Đính kèm ảnh/video để nhận +200 Xu'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. MAIN GRID (ORDER INFO 4 COLS / REVIEW FORM 8 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: ORDER SUMMARY (4 COLS) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Product Card */}
            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Món hàng đã giao
                </span>
                <span className="font-mono text-slate-500 text-[11px] font-semibold">{orderCode}</span>
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
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                    {productTitle}
                  </h3>
                  <div className="text-sm font-black text-fpt-orange">
                    {productPrice.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              {/* Seller details */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2.5">
                <Avatar className="h-8 w-8 shrink-0 border border-slate-200">
                  {sellerAvatarUrl && <AvatarImage src={sellerAvatarUrl} alt={sellerName} />}
                  <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">
                    {sellerInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <span>{sellerName}</span>
                    {sellerIsKyc && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-medium shrink-0">
                        SV FPT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">Campus {sellerCampus}</div>
                </div>
              </div>
            </Card>

            {/* Community Contribution Box */}
            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Sparkles className="h-3.5 w-3.5 text-fpt-orange" />
                <span>Đóng góp cho cộng đồng</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Đánh giá khách quan giúp ghi nhận uy tín thực tế của bạn bè trong trường và hạn chế tối đa các trường hợp gian lận thương mại.
              </p>
              <div className="pt-1 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Bạn luôn có thể bật chế độ Ẩn danh</span>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: REVIEW FORM (8 COLS) */}
          <div className="lg:col-span-8">
            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* 1. STAR RATING */}
                <div>
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      1. Mức độ hài lòng chung
                    </h2>
                    <span className="text-xs font-bold text-fpt-orange bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                      {ratingDesc(rating)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chạm vào số sao để xếp hạng trải nghiệm đơn hàng
                  </p>

                  <div className="mt-2.5 flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                        title={`${star} sao`}
                      >
                        <Star
                          className={`h-7 w-7 sm:h-8 sm:w-8 transition ${
                            star <= rating
                              ? 'text-fpt-orange fill-fpt-orange'
                              : 'text-slate-200 fill-slate-100 hover:text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. HIGHLIGHT TAGS */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    2. Điểm nổi bật bạn muốn khen ngợi
                  </h3>
                  <p className="text-xs text-slate-500 mb-2.5">
                    Chọn một hoặc nhiều tiêu chí bạn cảm thấy ưng ý nhất
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((tag) => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <Button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag.id)}
                          className={`h-auto rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-none'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{tag.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. COMMENT TEXTAREA */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-bold text-slate-900">
                      3. Nhận xét chi tiết về sản phẩm
                    </label>
                    <span className="text-slate-400 font-mono text-[11px]">{comment.length} / 500 ký tự</span>
                  </div>

                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      isInterCampus
                        ? 'Chia sẻ tình trạng khi bóc hộp, độ nguyên vẹn của linh kiện, cách người bán đóng gói...'
                        : 'Chia sẻ độ đúng hẹn, tình trạng kiểm tra máy khi gặp mặt tại trường...'
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-fpt-orange focus:ring-1 focus:ring-fpt-orange transition leading-relaxed placeholder:text-slate-400"
                  />
                </div>

                {/* 4. PHOTO & VIDEO UPLOAD */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        4. Hình ảnh / Video thực tế
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Đính kèm ảnh hoặc video mở hộp để nhận trọn bộ +200 Xu vào ví
                      </p>
                    </div>

                    <Badge variant="outline" className="rounded-full bg-orange-50 text-orange-900 border border-orange-200 text-[10px] font-bold px-2 py-0.5">
                      +100 Xu thêm khi có ảnh/video
                    </Badge>
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {reviewMediaList.map((item) => (
                      <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs">
                        {item.isVideo ? (
                          <video src={item.url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item.id)}
                          className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white w-6 h-6 flex items-center justify-center text-xs transition z-10 cursor-pointer"
                          title="Xóa tệp"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1 right-1 rounded bg-slate-900/80 py-0.5 text-center text-[10px] font-bold text-white truncate px-1">
                          {item.isVideo ? '🎥 Video test' : item.name}
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

                    {/* Add Media Button */}
                    <button
                      type="button"
                      disabled={isUploadingMedia}
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 text-center text-slate-500 hover:border-fpt-orange hover:bg-orange-50/30 transition cursor-pointer disabled:opacity-60"
                    >
                      {isUploadingMedia ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-fpt-orange mb-1" />
                          <span className="text-[11px] font-bold text-slate-700">Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-5 w-5 text-fpt-orange mb-1" />
                          <span className="text-xs font-bold text-slate-800">Thêm ảnh / video</span>
                          <span className="text-[10px] text-slate-400">Từ thiết bị</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 5. ANONYMOUS TOGGLE */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-start gap-2.5 pr-2">
                      <Lock className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900">Đánh giá ẩn danh</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tên của bạn sẽ hiển thị công khai dưới dạng <strong>{anonymousCode}</strong> để bảo vệ quyền riêng tư cá nhân.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isAnonymous ? 'bg-fpt-orange' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isAnonymous ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 6. SUBMIT BUTTONS */}
                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-auto w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </span>
                    ) : isEditMode ? (
                      <span className="flex items-center gap-1.5">
                        <Edit3 className="h-4 w-4" />
                        <span>Lưu cập nhật đánh giá</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Coins className="h-4 w-4" />
                        <span>Gửi đánh giá & Nhận ngay +{earnedCoins} Xu</span>
                      </span>
                    )}
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    className="h-auto w-full sm:w-auto text-center px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                  >
                    <Link href="/orders">
                      Để sau
                    </Link>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 text-white px-4 py-2.5 shadow-xl backdrop-blur-md text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
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
