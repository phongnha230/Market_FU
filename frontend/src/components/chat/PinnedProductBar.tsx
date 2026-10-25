'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Conversation } from '@/types/chat';
import { MapPin, Tag, ExternalLink, ShieldCheck, PackageCheck } from 'lucide-react';

interface PinnedProductBarProps {
  product: Conversation['pinnedProduct'];
  partnerName: string;
  agreedPrice?: number;
  isSeller?: boolean;
  hasActiveOrder?: boolean;
  activeOrderCode?: string;
  onOfferPrice: (offer: string) => void;
  onScheduleMeeting: () => void;
}

export default function PinnedProductBar({
  product,
  partnerName,
  agreedPrice,
  isSeller,
  hasActiveOrder,
  activeOrderCode,
  onOfferPrice,
  onScheduleMeeting,
}: PinnedProductBarProps) {
  const isAgreed = Boolean(agreedPrice && agreedPrice > 0 && agreedPrice < product.price);

  return (
    <div className="shrink-0 bg-white border-b border-orange-100 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
          />
          <span className="absolute top-0.5 left-0.5 rounded bg-slate-900/80 px-1 text-[8px] font-bold text-white">
            Like New
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
            {product.title}
          </h4>
          <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
            {hasActiveOrder ? (
              <>
                <span className="text-sm font-extrabold text-blue-700">
                  {(agreedPrice || product.price).toLocaleString('vi-VN')} đ
                </span>
                <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <PackageCheck className="h-3 w-3 text-blue-600" />
                  {activeOrderCode ? `Đơn hàng #${activeOrderCode}` : 'Đã tạo đơn hàng'}
                </span>
              </>
            ) : isAgreed ? (
              <>
                <span className="text-sm font-extrabold text-emerald-600">
                  {agreedPrice!.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {product.price.toLocaleString('vi-VN')} đ
                </span>
                <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5">
                  Đã chốt giá Chat
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-extrabold text-fpt-orange">
                  {product.price.toLocaleString('vi-VN')} đ
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {product.originalPrice.toLocaleString('vi-VN')} đ
                  </span>
                )}
                <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  {product.conditionBadge}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
            <MapPin className="h-3 w-3 text-fpt-orange shrink-0" />
            <span className="truncate">
              Handoff ưu tiên: {product.locationNote}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-start sm:self-auto flex-nowrap">
        {!isSeller && !isAgreed && !hasActiveOrder && product.status !== 'SOLD' && product.status !== 'RESERVED' && (
          <button
            type="button"
            onClick={() => onOfferPrice(product.suggestedOffer)}
            className="rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-fpt-orange hover:bg-orange-100 transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Đề nghị: {product.suggestedOffer}</span>
          </button>
        )}

        {!hasActiveOrder && (
          <button
            type="button"
            onClick={onScheduleMeeting}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isSeller ? 'Hẹn điểm giao' : 'Hẹn điểm nhận'}</span>
          </button>
        )}

        {hasActiveOrder ? (
          <Link
            href={activeOrderCode ? `/orders/${encodeURIComponent(activeOrderCode)}` : '/orders'}
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
            title="Xem tiến trình giao dịch Escrow và xác nhận mã QR bàn giao"
          >
            <PackageCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Xem đơn hàng</span>
          </Link>
        ) : !isSeller ? (
          product.status === 'RESERVED' || product.status === 'SOLD' ? (
            <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 whitespace-nowrap shrink-0">
              {product.status === 'SOLD' ? 'Đã bán' : 'Đang giao dịch'}
            </span>
          ) : (
            <Link
              href={`/checkout?productId=${encodeURIComponent(product.id || 'feat-3')}&type=meetup${isAgreed ? `&agreedPrice=${agreedPrice}` : ''}`}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
              title="Đặt hẹn giao dịch Safe Handoff có Escrow bảo vệ"
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>{isAgreed ? 'Đặt mua ngay' : 'Đặt Safe-Handoff'}</span>
            </Link>
          )
        ) : null}

        <Link
          href={product.id ? `/posts/${encodeURIComponent(product.id)}` : '/posts'}
          title="Mở trang chi tiết sản phẩm"
          className="rounded-xl p-1.5 border border-slate-200 bg-white text-slate-400 hover:text-slate-700 transition shrink-0"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
