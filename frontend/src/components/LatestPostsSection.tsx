'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { Zap, Clock, ArrowRight, MapPin } from 'lucide-react';
import { ProductService } from '@/services/productService';
import { useProductStore } from '@/stores/productStore';
import { ProductItem } from '@/types/product';
import { socketClient } from '@/services/socketClient';
import { adaptBackendProduct } from '@/lib/adapters';

export default function LatestPostsSection() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const totalPostsCount = useProductStore((state) => state.products.length);

  useEffect(() => {
    ProductService.getLatestProducts().then((res) => {
      if (res && res.length > 0) {
        setProducts(res);
      }
    }).finally(() => {
      setIsLoading(false);
    });

    const socket = socketClient.getSocket();
    if (socket) {
      const handleProductCreated = (rawProduct: any) => {
        try {
          const adapted = adaptBackendProduct(rawProduct);
          setProducts((prev) => [adapted, ...prev.filter((p) => p.id !== adapted.id)]);
        } catch {}
      };

      const handleProductUpdated = (rawProduct: any) => {
        try {
          const adapted = adaptBackendProduct(rawProduct);
          setProducts((prev) => prev.map((p) => (p.id === adapted.id ? adapted : p)));
        } catch {}
      };

      socket.on('product:created', handleProductCreated);
      socket.on('product:updated', handleProductUpdated);

      return () => {
        socket.off('product:created', handleProductCreated);
        socket.off('product:updated', handleProductUpdated);
      };
    }
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

        {/* 4 Cards Grid / Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs animate-pulse"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-200 mb-3" />
                <div className="h-4 w-3/4 rounded-md bg-slate-200 mb-2" />
                <div className="h-5 w-1/2 rounded-md bg-slate-200 mb-3" />
                <div className="h-3 w-1/3 rounded-md bg-slate-100" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            Hiện chưa có tin đăng mới nào tại campus được chọn.
          </div>
        )}

        {/* View All CTA Button */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-xs hover:border-fpt-orange hover:text-fpt-orange hover:shadow-sm transition-all"
          >
            <span>Xem tất cả tin đăng ({totalPostsCount > 0 ? totalPostsCount : products.length})</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
