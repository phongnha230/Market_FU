'use client';

import React from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  Share2,
  Maximize2,
  Check,
  MapPin,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface ProductGalleryProps {
  galleryImages: Array<{ src: string; alt: string }>;
  activeImageIndex: number;
  onSelectImage: (idx: number) => void;
  onShare: () => void;
  copiedLink: boolean;
}

export default function ProductGallery({
  galleryImages,
  activeImageIndex,
  onSelectImage,
  onShare,
  copiedLink,
}: ProductGalleryProps) {
  const safeActiveIndex = Math.min(
    Math.max(0, activeImageIndex),
    Math.max(0, galleryImages.length - 1)
  );
  const activeImg = galleryImages[safeActiveIndex];
  const safeMainSrc =
    typeof activeImg?.src === 'string' && activeImg.src.trim().length > 0
      ? activeImg.src.trim()
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="lg:col-span-7 space-y-6">
      {/* Main Image Container */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
        <Image
          src={safeMainSrc}
          alt={activeImg?.alt || 'Hình ảnh sản phẩm'}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover transition-all duration-300"
        />

        {/* Top Left Quality Badges */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            Đã kiểm tra chất lượng
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            ⭐ Mới 99% Like New
          </span>
        </div>

        {/* Top Right Action Buttons */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            title="Chia sẻ bài đăng"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-slate-700 shadow-sm hover:bg-white hover:text-fpt-orange transition active:scale-95 cursor-pointer"
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            title="Xem toàn màn hình"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-slate-700 shadow-sm hover:bg-white hover:text-fpt-orange transition active:scale-95 cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Right Counter */}
        <div className="absolute bottom-3 right-3 z-10 rounded-md bg-slate-900/75 backdrop-blur-xs px-2.5 py-0.5 text-xs font-semibold text-white">
          {galleryImages.length > 0 ? safeActiveIndex + 1 : 0} / {galleryImages.length} Ảnh
        </div>
      </div>

      {/* Thumbnails Row */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {galleryImages.map((img, idx) => {
            const isActive = safeActiveIndex === idx;
            const thumbSrc =
              typeof img?.src === 'string' && img.src.trim().length > 0
                ? img.src.trim()
                : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectImage(idx)}
                className={`group relative h-20 w-24 sm:h-24 sm:w-28 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-fpt-orange shadow-md scale-[1.02] ring-2 ring-orange-200'
                    : 'border-slate-200/80 hover:border-slate-300 opacity-75 hover:opacity-100'
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={img.alt || 'Ảnh sản phẩm'}
                  fill
                  sizes="15vw"
                  className="object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    Ảnh bìa
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* SAFETY HANDOFF GUARANTEE BOX */}
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-white p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>Cam kết an toàn FPT Campus Handoff</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="rounded-xl bg-white/90 border border-emerald-100 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Trực tiếp tại Campus</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Hẹn gặp sảnh KTX Dom A hoặc Căng-tin Hòa Lạc.
            </p>
          </div>

          <div className="rounded-xl bg-white/90 border border-emerald-100 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Test đồ tại chỗ</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Cắm test phím gõ thử thoải mái trước khi chuyển khoản.
            </p>
          </div>

          <div className="rounded-xl bg-white/90 border border-emerald-100 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Tài khoản FPT Edu</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Xác thực chính chủ bằng email @fpt.edu.vn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
