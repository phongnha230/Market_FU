'use client';

import React from 'react';
import { Search, ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | 'available' | 'reserved';
  onStatusFilterChange: (s: 'all' | 'available' | 'reserved') => void;
  sortBy: 'recent' | 'price-asc' | 'price-desc' | 'discount';
  onSortByChange: (s: 'recent' | 'price-asc' | 'price-desc' | 'discount') => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

export default function FavoriteFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  selectedCategory,
  onCategoryChange,
}: FavoriteFilterBarProps) {
  const categories = [
    { id: 'all', label: 'Tất cả (12)' },
    { id: 'books', label: 'Giáo trình & Sách PE (4)' },
    { id: 'electronics', label: 'Thiết bị điện tử (5)' },
    { id: 'dorm', label: 'Đồ dùng KTX & Sinh hoạt (2)' },
    { id: 'sports', label: 'Đồng phục & Thể thao (1)' },
  ];

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên đồ, mã môn (#PRF192, #MAS291, KTX Dom...)"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-24 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-fpt-orange/20 transition shadow-xs"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
            Ctrl K để tìm
          </span>
        </div>

        {/* Dropdown 1: Status */}
        <div className="relative min-w-[150px]">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-medium text-slate-700 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-fpt-orange/20 cursor-pointer shadow-xs"
          >
            <option value="all">Còn hàng (10)</option>
            <option value="available">Chỉ còn hàng</option>
            <option value="reserved">Đã có bạn hẹn cọc (2)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>

        {/* Dropdown 2: Sort */}
        <div className="relative min-w-[160px]">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-medium text-slate-700 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-fpt-orange/20 cursor-pointer shadow-xs"
          >
            <option value="recent">Mới lưu gần đây</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="discount">Giảm giá sâu nhất</option>
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 transition cursor-pointer shrink-0',
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
