'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Package,
  ArrowRight,
  MessageSquare,
  BadgeDollarSign,
  Heart,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { ProductDetail } from '@/types/product';
import ReportModal from '@/components/modals/ReportModal';

interface ProductActionBoxProps {
  product: ProductDetail;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenOfferModal: () => void;
  onShowToast?: (msg: string) => void;
}

export default function ProductActionBox({
  product,
  isFavorite,
  onToggleFavorite,
  onOpenOfferModal,
  onShowToast,
}: ProductActionBoxProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isInterCampus =
    product.location.toLowerCase().includes('hcm') ||
    product.location.toLowerCase().includes('đà nẵng') ||
    product.location.toLowerCase().includes('quy nhơn') ||
    product.location.toLowerCase().includes('cần thơ') ||
    product.id.includes('feat-2') ||
    product.id.includes('feat-3') ||
    product.id === 'akko-3087-v2' ||
    product.id.includes('portable');

  return (
    <div className="space-y-2.5">
      {/* INTER-CAMPUS DELIVERY NOTICE & BUTTON */}
      {isInterCampus && (
        <>
          <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3 text-xs text-slate-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                <Truck className="h-4 w-4 text-fpt-orange" />
                Giao hàng Liên Campus (FPT CampusShip)
              </span>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                Escrow 48h
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Món đồ ở <strong>{product.location}</strong> khác cơ sở Hòa Lạc của bạn. Hỗ trợ đóng thùng chống sốc KTX và ký quỹ Escrow an toàn.
            </p>
          </div>

          <Link
            href={`/checkout?productId=${encodeURIComponent(product.id)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-fpt-orange to-amber-600 py-3 text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition-all active:scale-98"
          >
            <Package className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Đặt hàng Liên Campus (FPT CampusShip)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}

      {/* Primary: Chat with Seller */}
      <Link
        href={`/chat?seller=${encodeURIComponent(product.seller.name)}&postId=${encodeURIComponent(product.id)}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-fpt-orange py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-fpt-orange-hover hover:shadow-lg transition-all active:scale-98"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Nhắn tin ngay với người bán</span>
      </Link>

      {/* 2 Secondary Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onOpenOfferModal}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-98 cursor-pointer"
        >
          <BadgeDollarSign className="h-4 w-4 text-fpt-orange" />
          <span>Đề nghị giá khác</span>
        </button>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition active:scale-98 cursor-pointer ${
            isFavorite
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
          <span>{isFavorite ? 'Đã lưu tin' : 'Lưu tin yêu thích'}</span>
        </button>
      </div>

      {/* TRANSACTION WARNING */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Lưu ý giao dịch:</strong> Chỉ nên hẹn gặp trực tiếp tại Cổng trường hoặc Sảnh KTX để kiểm tra đồ cẩn thận trước khi chuyển khoản. Tuyệt đối không cọc trước.
        </p>
      </div>

      {/* REPORT BUTTON */}
      <div className="flex items-center justify-center pt-0.5">
        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-rose-600 transition cursor-pointer"
        >
          <Flag className="h-3 w-3" />
          <span>Báo cáo bài viết vi phạm / nghi vấn lừa đảo</span>
        </button>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="PRODUCT"
        targetId={product.id}
        targetTitle={product.title}
        onToast={(msg) => {
          if (onShowToast) onShowToast(msg);
        }}
      />
    </div>
  );
}
