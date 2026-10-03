'use client';

import React from 'react';
import { Filter, MapPin, ChevronDown } from 'lucide-react';

export type VoucherCategoryTab = 'all' | 'ship' | 'it' | 'dorm' | 'coins';

interface VoucherFilterBarProps {
  activeTab: VoucherCategoryTab;
  onTabChange: (tab: VoucherCategoryTab) => void;
  selectedCampus: string;
  onCampusChange: (campus: string) => void;
  counts: {
    all: number;
    ship: number;
    it: number;
    dorm: number;
    coins: number;
  };
}

export default function VoucherFilterBar({
  activeTab,
  onTabChange,
  selectedCampus,
  onCampusChange,
  counts,
}: VoucherFilterBarProps) {
  const tabs: { id: VoucherCategoryTab; label: string; count: number }[] = [
    { id: 'all', label: 'Tất cả mã', count: counts.all },
    { id: 'ship', label: 'Trợ giá CampusShip', count: counts.ship },
    { id: 'it', label: 'Giáo trình & IT', count: counts.it },
    { id: 'dorm', label: 'Đồ dùng KTX', count: counts.dorm },
    { id: 'coins', label: 'Đổi từ Coins', count: counts.coins },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 pb-3 pt-2">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                isActive
                  ? 'bg-fpt-orange text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Campus Selector Dropdown */}
      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          Áp dụng:
        </span>
        <div className="relative inline-block">
          <select
            value={selectedCampus}
            onChange={(e) => onCampusChange(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:border-fpt-orange focus:outline-hidden focus:ring-2 focus:ring-fpt-orange/20 cursor-pointer"
          >
            <option value="all">Tất cả 5 Cơ sở Toàn quốc</option>
            <option value="hola">Campus Hòa Lạc (HL)</option>
            <option value="hcm">Campus TP.HCM (Q.9)</option>
            <option value="danang">Campus Đà Nẵng</option>
            <option value="cantho">Campus Cần Thơ</option>
            <option value="quynhon">Campus Quy Nhơn</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
