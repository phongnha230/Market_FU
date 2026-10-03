'use client';

import React from 'react';
import { Button, Badge, Card } from '@/components/ui';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTabsProps {
  activeMainTab: 'buying' | 'selling' | 'listings' | 'handoff';
  onMainTabChange: (tab: 'buying' | 'selling' | 'listings' | 'handoff') => void;
  activeProgressFilter: string;
  onProgressFilterChange: (filter: string) => void;
  ordersCount?: number;
  sellingCount?: number;
  listingsCount?: number;
  handoffCount?: number;
  isSeller?: boolean;
  filterCounts?: Record<string, number>;
}

export default function OrderTabs({
  activeMainTab,
  onMainTabChange,
  activeProgressFilter,
  onProgressFilterChange,
  ordersCount = 0,
  sellingCount = 0,
  listingsCount = 0,
  handoffCount = 0,
  isSeller = false,
  filterCounts,
}: OrderTabsProps) {
  const progressFilters = [
    { id: 'all', label: `Tất cả (${ordersCount})` },
    { id: 'qr', label: `Chờ quét QR / Pay (${filterCounts?.qr ?? 0})` },
    { id: 'packing', label: `Đang đóng gói (${filterCounts?.packing ?? 0})` },
    { id: 'shipping', label: `Đang ship (${filterCounts?.shipping ?? 0})` },
    { id: 'inspecting', label: `Đồng kiểm (${filterCounts?.inspecting ?? 0})` },
    { id: 'delivered', label: `Đã giao & Đánh giá (${filterCounts?.delivered ?? 0})` },
  ];

  return (
    <div className="space-y-4">
      {/* 4 MAIN TABS ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm font-bold">
        <Button
          type="button"
          onClick={() => onMainTabChange('buying')}
          className={cn(
            'h-auto rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 shrink-0 cursor-pointer',
            activeMainTab === 'buying'
              ? 'bg-fpt-orange text-white shadow-sm hover:bg-fpt-orange/90'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-none'
          )}
        >
          <span>Đơn mua của tôi</span>
          <Badge
            className={cn(
              'rounded-full px-1.5 py-0.2 text-[11px] border-none font-normal',
              activeMainTab === 'buying'
                ? 'bg-white/20 text-white hover:bg-white/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
            )}
          >
            {ordersCount}
          </Badge>
        </Button>

        <Button
          type="button"
          onClick={() => onMainTabChange('selling')}
          className={cn(
            'h-auto rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 shrink-0 cursor-pointer',
            activeMainTab === 'selling'
              ? 'bg-fpt-orange text-white shadow-sm hover:bg-fpt-orange/90'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-none'
          )}
        >
          {!isSeller && <Lock className="h-3 w-3 text-amber-500" />}
          <span>Đơn bán cần gửi</span>
          <Badge
            className={cn(
              'rounded-full px-1.5 py-0.2 text-[11px] border-none font-normal',
              !isSeller
                ? 'bg-amber-100 text-amber-800'
                : activeMainTab === 'selling'
                ? 'bg-white/20 text-white hover:bg-white/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
            )}
          >
            {!isSeller ? 'Seller' : sellingCount}
          </Badge>
        </Button>

        <Button
          type="button"
          onClick={() => onMainTabChange('listings')}
          className={cn(
            'h-auto rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 shrink-0 cursor-pointer',
            activeMainTab === 'listings'
              ? 'bg-fpt-orange text-white shadow-sm hover:bg-fpt-orange/90'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-none'
          )}
        >
          {!isSeller && <Lock className="h-3 w-3 text-amber-500" />}
          <span>Tin đăng rao bán</span>
          <Badge
            className={cn(
              'rounded-full px-1.5 py-0.2 text-[11px] border-none font-normal',
              !isSeller
                ? 'bg-amber-100 text-amber-800'
                : activeMainTab === 'listings'
                ? 'bg-white/20 text-white hover:bg-white/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
            )}
          >
            {!isSeller ? 'Seller' : listingsCount}
          </Badge>
        </Button>

        <Button
          type="button"
          onClick={() => onMainTabChange('handoff')}
          className={cn(
            'h-auto rounded-xl px-4 py-2.5 transition flex items-center gap-1.5 shrink-0 cursor-pointer',
            activeMainTab === 'handoff'
              ? 'bg-fpt-orange text-white shadow-sm hover:bg-fpt-orange/90'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-none'
          )}
        >
          <span>Lịch hẹn Safe-Handoff</span>
          <Badge className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[11px] text-slate-700 border-none font-normal hover:bg-slate-100">
            {handoffCount}
          </Badge>
        </Button>
      </div>

      {/* PROGRESS SUB-FILTER ROW */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
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
              <Button
                key={tab.id}
                type="button"
                onClick={() => onProgressFilterChange(tab.id)}
                className={cn(
                  'h-auto rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer shrink-0',
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-none'
                )}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
