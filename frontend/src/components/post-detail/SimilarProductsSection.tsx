'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { SIMILAR_PRODUCTS } from '@/constants/mockProducts';

interface SimilarProductsSectionProps {
  products?: typeof SIMILAR_PRODUCTS;
}

export default function SimilarProductsSection({
  products = SIMILAR_PRODUCTS,
}: SimilarProductsSectionProps) {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <section className="pt-8 border-t border-slate-200/80 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-fpt-orange" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Sản phẩm tương tự cùng Campus Hòa Lạc
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tiện hẹn gặp nhận ngay trong ngày giữa các KTX Dom A, B, C, D
          </p>
        </div>

        <Link
          href="/posts?category=electronics"
          className="inline-flex items-center gap-1 text-xs font-bold text-fpt-orange hover:underline"
        >
          <span>Xem tất cả thiết bị tại HL</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 4 Similar Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
              <Link href={`/posts/${prod.id}`} className="block h-full w-full">
                <Image
                  src={typeof prod.imageUrl === 'string' && prod.imageUrl ? prod.imageUrl : ((prod.imageUrl as any)?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80')}
                  alt={prod.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Campus Tag Top Left */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="rounded-md bg-slate-900/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  {prod.campusTag}
                </span>
              </div>

              {/* Heart button */}
              <button
                type="button"
                title="Yêu thích"
                className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 hover:text-rose-500 shadow-xs transition cursor-pointer"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            {/* Card Content */}
            <div className="p-3.5 flex flex-col justify-between flex-1">
              <div>
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-base font-black text-rose-600">
                    {formatVND(prod.price)}
                  </span>
                  {prod.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatVND(prod.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <Link href={`/posts/${prod.id}`}>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-fpt-orange transition-colors">
                    {prod.title}
                  </h4>
                </Link>
              </div>

              {/* Location & Time */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-[10px] text-slate-400">{prod.timeAgo}</span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                  {prod.badges[0]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
