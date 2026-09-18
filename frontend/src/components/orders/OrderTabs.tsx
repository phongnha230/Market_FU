'use client';

import React from 'react';

interface OrderTabsProps {
  activeMainTab: 'buying' | 'selling' | 'listings' | 'handoff';
  onMainTabChange: (tab: 'buying' | 'selling' | 'listings' | 'handoff') => void;
  activeProgressFilter: string;
  onProgressFilterChange: (filter: string) => void;
  ordersCount?: number;
  sellingCount?: number;
  listingsCount?: number;
  handoffCount?: number;
}

export default function OrderTabs({
  activeMainTab,
  onMainTabChange,
  activeProgressFilter,
  onProgressFilterChange,
  ordersCount = 2,
  sellingCount = 1,
  listingsCount = 3,
  handoffCount = 1,
}: OrderTabsProps) {
  const progressFilters = [
    { id: 'all', label: 'Tất cả (2)' },
    { id: 'qr', label: 'Chờ quét QR (0)' },
    { id: 'packing', label: 'Đang đóng gói (1)' },
    { id: 'shipping', label: 'Đang ship liên campus (1)' },
    { id: 'inspecting', label: 'Đồng kiểm hàng (0)' },
    { id: 'delivered', label: 'Đã giao & Chờ đánh giá' },
  ];

  return (
    <div className="space-y-4">
      {/* 4 MAIN TABS ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm font-bold">
        <button
          type="button"
          onClick={() => onMainTabChange('buying')}
          className={`rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'buying'
              ? 'bg-fpt-orange text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Đơn mua của tôi</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[11px] ${
              activeMainTab === 'buying'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {ordersCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onMainTabChange('selling')}
          className={`rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'selling'
              ? 'bg-fpt-orange text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Đơn bán cần gửi</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[11px] text-slate-700">
            {sellingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onMainTabChange('listings')}
          className={`rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'listings'
              ? 'bg-fpt-orange text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Tin đăng rao bán</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[11px] text-slate-700">
            {listingsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onMainTabChange('handoff')}
          className={`rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'handoff'
              ? 'bg-fpt-orange text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Lịch hẹn Safe-Handoff</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[11px] text-slate-700">
            {handoffCount}
          </span>
        </button>
      </div>

      {/* PROGRESS SUB-FILTER ROW */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-extrabold uppercase tracking-wider text-slate-500 text-[11px]">
            TIẾN TRÌNH THEO DÕI
          </span>
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            🔄 Tự động cập nhật qua Campus Hub
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          {progressFilters.map((tab) => {
            const isActive = activeProgressFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onProgressFilterChange(tab.id)}
                className={`rounded-full px-3 py-1.5 transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
