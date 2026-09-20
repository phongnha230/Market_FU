'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { ProductItem } from '@/types/product';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export type { ProductItem };

interface ProductCardProps {
  product: ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isLiked = useFavoriteStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

  // Format currency: 180000 -> 180.000 đ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'pass gấp':
        return 'bg-emerald-600 text-white border-transparent';
      case 'like new':
      case 'mới 99%':
      case 'mới 98%':
        return 'bg-amber-600 text-white border-transparent';
      case 'đã kiểm tra':
      case 'full box':
        return 'bg-blue-600 text-white border-transparent';
      case 'tặng kèm':
        return 'bg-teal-600 text-white border-transparent';
      case 'đã dùng 1 kỳ':
        return 'bg-slate-700 text-white border-transparent';
      default:
        return 'bg-fpt-orange text-white border-transparent';
    }
  };

  return (
    <Card className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      {/* 1. TOP IMAGE CONTAINER */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <Link href={`/posts/${product.id}`} className="relative block h-full w-full">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Campus Tag Overlay */}
        {product.campusTag && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge className="rounded-md bg-slate-900/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs border-transparent normal-case">
              {product.campusTag}
            </Badge>
          </div>
        )}

        {/* Status Badges Overlay at bottom of image */}
        <div className={`absolute ${product.campusTag ? 'bottom-2 left-2.5' : 'top-2.5 left-2.5'} right-10 flex flex-wrap gap-1 z-10`}>
          {product.badges.map((badge, idx) => (
            <Badge
              key={idx}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase shadow-xs ${getBadgeStyle(
                badge
              )}`}
            >
              {badge}
            </Badge>
          ))}
        </div>

        {/* Wishlist / Heart Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product);
          }}
          title={isLiked ? 'Bỏ lưu tin yêu thích' : 'Lưu tin yêu thích'}
          className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-slate-500 shadow-sm hover:text-rose-500 hover:bg-white transition-all active:scale-90 p-0"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </Button>
      </div>

      {/* 2. CARD CONTENT */}
      <CardContent className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-base sm:text-lg font-black text-rose-600 tracking-tight">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/posts/${product.id}`} className="block">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-fpt-orange transition-colors">
              {product.title}
            </h4>
          </Link>
        </div>

        {/* Location & Time */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
            {product.timeAgo && (
              <span className="shrink-0 text-[10px] text-slate-400 font-medium ml-1">
                {product.timeAgo}
              </span>
            )}
          </div>

          {/* Seller Info Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar size="sm" className="h-5 w-5 text-[10px]">
                <AvatarFallback className="bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  {product.seller.initial}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-slate-700 truncate">
                {product.seller.name}
              </span>
              <span className="text-slate-400 shrink-0">•</span>
              <span className="text-slate-500 shrink-0">{product.seller.cohort}</span>
            </div>

            {/* Verified Student Badge */}
            {product.seller.verified && (
              <div title="Sinh viên FPT đã xác minh thẻ">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
