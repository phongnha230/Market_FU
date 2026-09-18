'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Flame } from 'lucide-react';
import { FEATURED_PRODUCTS } from '@/constants/mockProducts';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'best-price', label: 'Giá tốt hôm nay' },
  { id: 'like-new', label: 'Mới 99%' },
  { id: 'urgent', label: 'Cần pass gấp' },
];

export default function FeaturedSection() {
  const [activeTab, setActiveTab] = useState('all');

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
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
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

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
