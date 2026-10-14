'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  Star,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Coins,
  ShieldCheck,
  Edit3,
  ExternalLink,
  AlertCircle,
  Truck,
  Package,
  User,
  Sparkles,
} from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';
import { OrderItem, useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { orderService } from '@/services/orderService';

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderItem | null;
  onEdit?: (order: OrderItem) => void;
}

const TAG_LABELS: Record<string, string> = {
  mota: 'Đúng mô tả bài đăng (+1)',
  donggoi: 'Đóng gói chống sốc kỹ (+1)',
  huongdan: 'Hỗ trợ hướng dẫn test cổng chu đáo (+1)',
  giaonhanh: 'Giao liên campus thần tốc (+1)',
  phukien: 'Tặng kèm phụ kiện cáp HDMI mini',
};

const RATING_TEXTS: Record<number, string> = {
  5: 'Cực kỳ hài lòng • Chuẩn FPT 5 sao',
  4: 'Hài lòng • Giao dịch tốt',
  3: 'Bình thường • Đúng kỳ vọng',
  2: 'Chưa hài lòng • Cần cải thiện',
  1: 'Rất thất vọng • Cần FPT Care can thiệp',
};

export default function ReviewDetailModal({
  isOpen,
  onClose,
  order,
  onEdit,
}: ReviewDetailModalProps) {
  const router = useRouter();
  const toggleReviewPublic = useOrderStore((s) => s.toggleReviewPublic);
  const currentUser = useUserStore((s) => s.user);

  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const review = order.reviewData || {
    rating: 5,
    comment: 'Giao dịch nhanh gọn, đồ rất tốt và đúng như mô tả!',
    tags: ['mota', 'donggoi'],
    images: order.product?.imageUrl ? [order.product.imageUrl] : [],
    reviewedAt: new Date().toISOString(),
    isPublic: false,
    canEdit: true,
    bonusCoins: 100,
  };

  const isPublic = Boolean(review.isPublic);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTogglePublic = async () => {
    setIsToggling(true);
    try {
      toggleReviewPublic(order.code);
      try {
        await orderService.toggleReviewPublic(order.code);
      } catch {
        // Backend offline / mock fallback
      }
      showToast(
        !isPublic
          ? '🎉 Đã mở khóa đánh giá sang chế độ CÔNG KHAI trên hồ sơ người bán!'
          : '🔒 Đã chuyển đánh giá về chế độ KÍN (Blind Review)!'
      );
    } catch {
      showToast('Không thể thay đổi trạng thái lúc này.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleEditReview = () => {
    onClose();
    if (onEdit) {
      onEdit(order);
    } else {
      const cleanCode = order.code.replace(/^#/, '');
      router.push(`/orders/review?code=${encodeURIComponent(cleanCode)}&mode=edit`);
    }
  };

  // Student anonymous ID
  const buyerId =
    currentUser?.studentId ||
    currentUser?.email?.match(/([a-zA-Z]{2}\d{6})/i)?.[1]?.toUpperCase() ||
    'SV_FPT';
  const anonymousBadge =
    buyerId.length > 4 ? `${buyerId.slice(0, 4)}**** (${currentUser?.campus || 'HL'})` : `${buyerId}****`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast inside modal */}
        {toastMsg && (
          <div className="sticky top-2 z-30 mx-4 mt-2 p-3 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-black uppercase">
                CHI TIẾT ĐÁNH GIÁ
              </Badge>
              <span className="text-xs font-mono font-bold text-slate-400">
                {order.code}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
              Đánh giá của bạn về đơn hàng
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* 1. BLIND REVIEW STATUS BANNER */}
          {!isPublic ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-4.5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0 mt-0.5">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-amber-950">
                      Đang bảo mật kín (Blind Review)
                    </h4>
                    <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                      Chưa hiển thị trên hồ sơ Người Bán
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed mt-1">
                    Nhằm đảm bảo tính khách quan và tránh trả đũa sao, đánh giá này hiện chỉ có <strong>bạn và hệ thống</strong> xem được. Đánh giá sẽ tự động mở khóa công khai sau <strong>7 ngày</strong> hoặc ngay khi Người Bán gửi đánh giá phản hồi lại.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-amber-700 font-medium">
                  Muốn xem trước hiển thị công khai trên hồ sơ người bán?
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTogglePublic}
                  disabled={isToggling}
                  className="h-auto py-1.5 px-3 text-xs font-bold rounded-xl bg-white border-amber-300 text-amber-900 hover:bg-amber-100 shadow-2xs transition"
                >
                  <Unlock className="h-3.5 w-3.5 mr-1 text-amber-700" />
                  <span>⚡ Thử mở khóa công khai ngay</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-4.5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-200/80 text-emerald-900 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-emerald-950">
                      Đã mở khóa công khai trên Hồ sơ Người Bán
                    </h4>
                    <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                      Public Profile
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed mt-1">
                    Đánh giá này đã hoàn tất quá trình Blind Review và đang được hiển thị trực tiếp trên trang cá nhân của Người Bán cho toàn bộ sinh viên 5 Campus cùng theo dõi.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-emerald-700 font-medium">
                  Cơ chế bảo mật 2 chiều hoạt động hoàn hảo.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTogglePublic}
                  disabled={isToggling}
                  className="h-auto py-1 px-2.5 text-[11px] font-bold rounded-xl bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100 shadow-2xs transition"
                >
                  <Lock className="h-3 w-3 mr-1 text-emerald-700" />
                  <span>Ẩn lại vào chế độ kín (Demo)</span>
                </Button>
              </div>
            </div>
          )}

          {/* 2. PRODUCT & SELLER SNIPPET CARD */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                <Image
                  src={order.product?.imageUrl || '/products/keyboard-akko.jpg'}
                  alt={order.product?.title || 'Sản phẩm'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                  {order.product?.title}
                </h4>
                <div className="text-xs font-bold text-fpt-orange mt-0.5">
                  {(order.payment?.price || order.product?.price || 0).toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-400" />
                  <span>Người bán: <strong>{order.product?.seller?.name || 'Seller FPT'}</strong></span>
                </div>
              </div>
            </div>

            <Badge variant="outline" className="self-start sm:self-auto rounded-lg bg-white border-slate-200 text-slate-600 text-[11px] font-semibold py-1 px-2.5">
              KTX {order.product?.seller?.cohortCampus || 'FPT University'}
            </Badge>
          </div>

          {/* 3. STAR RATING & LABELS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${
                        s <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-base font-black text-slate-900 ml-1">
                  {review.rating}.0 / 5.0
                </span>
              </div>

              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                {RATING_TEXTS[review.rating] || 'Hài lòng'}
              </span>
            </div>

            {/* Tags Badges */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {review.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200/80 px-2.5 py-1 text-xs font-bold text-fpt-orange"
                  >
                    ✓ {TAG_LABELS[t] || t}
                  </span>
                ))}
              </div>
            )}

            {/* Comment Body */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed italic">
              &ldquo;{review.comment || 'Người mua không để lại nhận xét bằng lời.'}&rdquo;
            </div>

            {/* Attached Proof Media Gallery */}
            {review.images && review.images.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  HÌNH ẢNH / VIDEO BÓC HỘP & TEST MÁY ({review.images.length})
                </span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {review.images.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedZoomImage(imgUrl)}
                      className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 hover:border-fpt-orange hover:shadow-md transition group/img cursor-pointer focus:outline-none"
                    >
                      <img
                        src={imgUrl}
                        alt={`Ảnh đánh giá ${i + 1}`}
                        className="h-full w-full object-cover group-hover/img:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video test link note */}
            {review.proofVideoUrl && (
              <div className="rounded-xl bg-purple-50 border border-purple-200 p-2.5 flex items-center gap-2 text-xs font-semibold text-purple-900">
                <span>📹 Đã đính kèm video mở hộp thực tế (Đã nhận thưởng tối đa +200 Xu)</span>
              </div>
            )}
          </div>

          {/* 4. REWARD & IDENTITY INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900">
                  +{review.bonusCoins || 100} Xu Thưởng FPT
                </div>
                <div className="text-[11px] text-slate-500">Đã cộng vào ví xu sinh viên</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900">
                  {review.isAnonymous !== false ? `Ẩn danh (${anonymousBadge})` : (currentUser?.name || 'Sinh viên FPT')}
                </div>
                <div className="text-[11px] text-slate-500">
                  Thời gian: {new Date(review.reviewedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          {/* 5. POLICY NOTE */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
            <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Chính sách minh bạch FPT Care:</strong> Người dùng <strong>không thể tự ý xóa đánh giá</strong> nhằm tránh xóa dấu vết gian lận hoặc ép xóa đánh giá tiêu cực. Bạn có thể bấm <strong>Chỉnh sửa đánh giá</strong> bên dưới để cập nhật lại nhận xét và số sao.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/60 rounded-b-3xl flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 cursor-pointer"
          >
            Đóng
          </Button>

          <Button
            type="button"
            onClick={handleEditReview}
            className="rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold px-5 py-2.5 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
          >
            <Edit3 className="h-4 w-4" />
            <span>Chỉnh sửa đánh giá</span>
          </Button>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedZoomImage && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedZoomImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300 transition cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedZoomImage}
              alt="Phóng to ảnh test"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
