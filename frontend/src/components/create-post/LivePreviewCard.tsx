'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, Heart, MapPin, Lightbulb, CheckCircle2 } from 'lucide-react';

interface LivePreviewCardProps {
  images: string[];
  title: string;
  campus: string;
  category: string;
  price: string | number;
  negotiable: boolean;
  condition: string;
  pickupLocation: string;
  sellerName?: string;
  formatVND: (val: number) => string;
  getCampusShortName: (campus: string) => string;
  getCategoryLabel: (cat: string) => string;
}

const LivePreviewCard = React.memo(function LivePreviewCard({
  images,
  title,
  campus,
  category,
  price,
  negotiable,
  condition,
  pickupLocation,
  sellerName = 'Người bán',
  formatVND,
  getCampusShortName,
  getCategoryLabel,
}: LivePreviewCardProps) {
  return (
    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
      {/* LIVE PREVIEW CARD */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Eye className="h-4 w-4 text-fpt-orange" />
            <span>Xem trước thẻ tin</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>TRỰC TIẾP</span>
          </span>
        </div>

        {/* THE CARD */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition-all hover:shadow-lg">
          {/* Image container */}
          <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
            <Image
              src={images[0] || '/products/book-prf192.jpg'}
              alt={title || 'Xem trước'}
              fill
              className="object-cover"
            />

            {/* Campus tag */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-slate-900/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>{getCampusShortName(campus)}</span>
            </div>

            {/* Heart button */}
            <button
              type="button"
              className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-slate-600 backdrop-blur-xs shadow-xs hover:text-rose-500 transition"
            >
              <Heart className="h-4 w-4" />
            </button>

            {/* Category overlay */}
            <div className="absolute bottom-2 left-2.5 rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white">
              {getCategoryLabel(category)}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-2.5">
            {/* Price & negotiate */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-rose-600">
                  {formatVND(Number(price) || 0)}
                </span>
              </div>
              {negotiable && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Fix nhẹ SV
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
              {title || 'Tiêu đề tin đăng của bạn sẽ hiển thị tại đây...'}
            </h3>

            {/* Condition badge */}
            <div>
              <span className="inline-block rounded-md bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                {condition}
              </span>
            </div>

            {/* Location */}
            <p className="flex items-center gap-1 text-xs text-slate-500 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
              <span>{pickupLocation || 'Điểm giao nhận'}</span>
            </p>

            {/* Seller footer */}
            <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-[10px] font-bold text-white shadow-2xs">
                  {(sellerName || 'FU')[0].toUpperCase()}
                </div>
                <span className="font-semibold text-slate-800">
                  {sellerName || 'Người bán'}
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">Vừa xong</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: MẸO BÁN NHANH CHO FPTERS */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 space-y-3.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span>Mẹo bán nhanh cho FPTers</span>
        </div>

        <ul className="space-y-2.5 text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Chụp rõ gáy sách, mã vạch hoặc tem bảo hành laptop nếu có.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Hẹn nhận đồ vào giờ nghỉ giải lao 10h15 hoặc 15h15 tại thư viện để tiện cả hai.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Không yêu cầu chuyển cọc trước ngoài kênh trường.</span>
          </li>
        </ul>
      </div>
    </div>
  );
});

export default LivePreviewCard;
