'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { Zap, Clock, ArrowRight, MapPin } from 'lucide-react';
import { LATEST_PRODUCTS } from '@/constants/mockProducts';
import { ProductService } from '@/services/productService';
import { useProductStore } from '@/stores/productStore';
import { ProductItem } from '@/types/product';

export default function LatestPostsSection() {
  const [products, setProducts] = useState<ProductItem[]>(LATEST_PRODUCTS);
  const totalPostsCount = useProductStore((state) => state.products.length);

  useEffect(() => {
    ProductService.getLatestProducts().then((res) => {
      if (res && res.length > 0) {
        setProducts(res);
      }
    });
  }, []);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header with Title & Live timestamp */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Zap className="h-5 w-5 fill-amber-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tin đăng mới nhất
            </h2>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600">
              <MapPin className="h-3 w-3 text-fpt-orange" />
              <span>Hòa Lạc & Toàn quốc</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Cập nhật 2 phút trước</span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA Button */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-xs hover:border-fpt-orange hover:text-fpt-orange hover:shadow-sm transition-all"
          >
            <span>Xem tất cả tin đăng ({totalPostsCount})</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
