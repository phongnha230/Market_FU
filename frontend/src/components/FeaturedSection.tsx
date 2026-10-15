'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Flame } from 'lucide-react';
import { ProductService } from '@/services/productService';
import { ProductItem } from '@/types/product';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'best-price', label: 'Giá tốt hôm nay' },
  { id: 'like-new', label: 'Mới 99%' },
  { id: 'urgent', label: 'Cần pass gấp' },
];

export default function FeaturedSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ProductService.getFeaturedProducts().then((res) => {
      if (res && res.length > 0) {
        setProducts(res);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const filteredProducts = React.useMemo(() => {
    if (activeTab === 'all') return products;
    if (activeTab === 'best-price') {
      const match = products.filter(
        (p) =>
          (p.originalPrice && p.originalPrice > p.price) ||
          p.badges.some((b) => b.includes('Giá') || b.includes('Hot') || b.includes('%'))
      );
      return match.length > 0 ? match : products;
    }
    if (activeTab === 'like-new') {
      const match = products.filter(
        (p) =>
          p.condition?.includes('99') ||
          p.condition?.includes('Mới') ||
          p.condition?.includes('NEW') ||
          p.badges.some((b) => b.includes('99%') || b.includes('Mới') || b.includes('Like New'))
      );
      return match.length > 0 ? match : products;
    }
    if (activeTab === 'urgent') {
      const match = products.filter(
        (p) =>
          p.badges.some((b) => b.toLowerCase().includes('gấp') || b.toLowerCase().includes('pass')) ||
          (p.title + ' ' + (p.description || '')).toLowerCase().includes('gấp')
      );
      return match.length > 0 ? match : products;
    }
    return products;
  }, [products, activeTab]);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Section Title with flame icon & orange accent bar */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-1.5 rounded-full bg-fpt-orange"></div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-fpt-orange fill-fpt-orange" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Sản phẩm nổi bật
              </h2>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
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
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            Chưa có sản phẩm nổi bật nào trong danh mục này.
          </div>
        )}
      </div>
    </section>
  );
}
