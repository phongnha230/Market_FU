'use client';

import React from 'react';
import Image from 'next/image';
import { FavoriteItem } from '@/stores/favoriteStore';
import {
  Heart,
  MapPin,
  MessageSquare,
  Eye,
  Lock,
  Clock,
} from 'lucide-react';

interface FavoriteCardProps {
  item: FavoriteItem;
  onToggleFavorite: (id: string, title: string) => void;
  onChat: (item: FavoriteItem) => void;
  onPreview: (item: FavoriteItem) => void;
  onFindSimilar?: (category: string) => void;
}

export default function FavoriteCard({
  item,
  onToggleFavorite,
  onChat,
  onPreview,
  onFindSimilar,
}: FavoriteCardProps) {
  const isReserved = item.status === 'reserved';

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden ${
        isReserved
          ? 'border-slate-200 bg-slate-50/50'
          : 'border-slate-200/80 hover:border-orange-200'
      }`}
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-300 group-hover:scale-103 ${
            isReserved ? 'brightness-75 blur-[1px]' : ''
          }`}
        />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start z-10">
          {item.badgeOrange && (
            <span className="rounded-md bg-fpt-orange px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              {item.badgeOrange}
            </span>
          )}
          {item.badgeGreen && (
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              {item.badgeGreen}
            </span>
          )}
          {item.badgeDark && (
            <span className="rounded-md bg-slate-900/90 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              {item.badgeDark}
            </span>
          )}
          {item.badgeBlue && (
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              {item.badgeBlue}
            </span>
          )}
        </div>

        {/* Top-right Heart Button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(item.id, item.title)}
          title="Bỏ lưu khỏi danh sách"
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur-xs hover:bg-white hover:scale-110 active:scale-95 transition cursor-pointer"
        >
          <Heart className="h-4 w-4 fill-rose-500" />
        </button>

        {/* Bottom image badge overlay */}
        {item.imageOverlayBadge && !isReserved && (
          <div className="absolute bottom-2 left-2 z-10 rounded-md bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white shadow-xs">
            {item.imageOverlayBadge}
          </div>
        )}

        {/* RESERVED OVERLAY CONTENT */}
        {isReserved && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center bg-slate-900/40 backdrop-blur-[1px]">
            <div className="rounded-2xl bg-white/95 p-3.5 shadow-lg max-w-[240px] text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-600">
                <Lock className="h-3 w-3" /> Đã có bạn hẹn cọc
              </span>
              <p className="mt-1.5 text-[11px] text-slate-600 leading-tight">
                {item.reservedText ||
                  'Người bán hẹn giao dịch tại sảnh Gamma lúc 17h chiều nay'}
              </p>
              {onFindSimilar && (
                <button
                  type="button"
                  onClick={() => onFindSimilar(item.category)}
                  className="mt-2.5 w-full rounded-lg border border-slate-200 bg-slate-50 py-1 text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Tìm món tương tự
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Price Row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {formatVND(item.price)}
          </span>
          {item.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatVND(item.originalPrice)}
            </span>
          )}
          {item.tag && (
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              {item.tag}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="mt-1 text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-fpt-orange transition-colors">
          {item.title}
        </h3>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        {/* Seller Pill */}
        <div className="mt-2.5 flex items-center gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
          <div
            className={`h-5 w-5 rounded-full ${item.seller.avatarColor} text-[10px] font-bold text-white flex items-center justify-center shrink-0`}
          >
            {item.seller.initials}
          </div>
          <span className="truncate">
            <strong className="font-semibold text-slate-800">
              {item.seller.name}
            </strong>{' '}
            · {item.seller.cohort}{' '}
            <span className="text-slate-400">({item.seller.studentIdMasked})</span>
          </span>
        </div>

        {/* Actions Row */}
        <div className="mt-4 flex items-center gap-2 pt-1">
          {isReserved ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Đang tạm giữ chỗ</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onChat(item)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-fpt-orange py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-fpt-orange-hover hover:shadow transition active:scale-95 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 stroke-[2.2]" />
                <span>Nhắn hỏi mua</span>
              </button>

              <button
                type="button"
                onClick={() => onPreview(item)}
                title="Xem chi tiết nhanh"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition active:scale-95 cursor-pointer shrink-0"
              >
                <Eye className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
