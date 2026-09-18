'use client';

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Layers,
  Tag,
  CheckCircle2,
  Building2,
  X,
} from 'lucide-react';

interface FilterSidebarProps {
  onApply?: (filters: any) => void;
  onReset?: () => void;
  resultCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  selectedCampus?: string;
  onSelectCampus?: (campus: string) => void;
  selectedCategories?: string[];
  onToggleCategory?: (catId: string) => void;
  selectedPricePreset?: string;
  onSelectPricePreset?: (preset: string) => void;
}

import {
  CAMPUSES as campuses,
  CATEGORIES as categories,
  PRICE_PRESETS as pricePresets,
  PRODUCT_CONDITIONS as conditions,
  PICKUP_LOCATIONS as locations,
} from '@/constants/marketplace';

export default function FilterSidebar({
  onApply,
  onReset,
  resultCount = 156,
  isMobileOpen = false,
  onCloseMobile,
  selectedCampus: externalCampus,
  onSelectCampus,
  selectedCategories: externalCategories,
  onToggleCategory,
  selectedPricePreset: externalPricePreset,
  onSelectPricePreset,
}: FilterSidebarProps) {
  const [internalCampus, setInternalCampus] = useState('hola');
  const [internalCategories, setInternalCategories] = useState<string[]>([
    'books',
    'electronics',
  ]);
  const [internalPricePreset, setInternalPricePreset] = useState('100k-500k');
  const [minPrice, setMinPrice] = useState('50.000');
  const [maxPrice, setMaxPrice] = useState('1.500.000');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    'likenew',
    'good',
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'canteen',
    'dom',
  ]);

  const currentCampus = externalCampus !== undefined ? externalCampus : internalCampus;
  const currentCategories = externalCategories !== undefined ? externalCategories : internalCategories;
  const currentPricePreset = externalPricePreset !== undefined ? externalPricePreset : internalPricePreset;

  const handleCampusChange = (campId: string) => {
    setInternalCampus(campId);
    if (onSelectCampus) onSelectCampus(campId);
  };

  const toggleCategory = (catId: string) => {
    if (onToggleCategory) {
      onToggleCategory(catId);
    } else {
      setInternalCategories((prev) =>
        prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
      );
    }
  };

  const handlePricePresetClick = (presetId: string) => {
    const nextVal = currentPricePreset === presetId ? '' : presetId;
    if (onSelectPricePreset) {
      onSelectPricePreset(nextVal);
    } else {
      setInternalPricePreset(nextVal);
    }
  };

  const toggleCondition = (condId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condId) ? prev.filter((id) => id !== condId) : [...prev, condId]
    );
  };

  const toggleLocation = (locId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId]
    );
  };

  const handleReset = () => {
    setInternalCampus('all');
    setInternalCategories([]);
    setInternalPricePreset('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedConditions([]);
    setSelectedLocations([]);
    if (onReset) onReset();
  };

  const handleApply = () => {
    if (onApply) {
      onApply({
        campus: currentCampus,
        categories: currentCategories,
        pricePreset: currentPricePreset,
        minPrice,
        maxPrice,
        conditions: selectedConditions,
        locations: selectedLocations,
      });
    }
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-fpt-orange" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Bộ lọc tìm kiếm
          </h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-fpt-orange transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* SECTION 1: CƠ SỞ / CAMPUS */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Building2 className="h-3.5 w-3.5 text-slate-500" />
          <span>Cơ sở / Campus</span>
        </div>
        <div className="space-y-1.5">
          {campuses.map((camp) => {
            const isChecked = currentCampus === camp.id;
            return (
              <label
                key={camp.id}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition ${
                  isChecked
                    ? 'bg-orange-50/80 text-fpt-orange font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{camp.label}</span>
                <input
                  type="radio"
                  name="campus-filter"
                  checked={isChecked}
                  onChange={() => handleCampusChange(camp.id)}
                  className="h-3.5 w-3.5 text-fpt-orange focus:ring-fpt-orange accent-fpt-orange"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* SECTION 2: DANH MỤC ĐỒ DÙNG */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Layers className="h-3.5 w-3.5 text-slate-500" />
          <span>Danh mục đồ dùng</span>
        </div>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const isChecked = currentCategories.includes(cat.id);
            return (
              <label
                key={cat.id}
                className="flex items-center justify-between rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.id)}
                    className="h-3.5 w-3.5 rounded text-fpt-orange focus:ring-fpt-orange accent-fpt-orange"
                  />
                  <span className={isChecked ? 'font-semibold text-slate-900' : ''}>
                    {cat.label}
                  </span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {cat.count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* SECTION 3: KHOẢNG GIÁ (VND) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Tag className="h-3.5 w-3.5 text-slate-500" />
          <span>Khoảng giá (VND)</span>
        </div>

        {/* 2x2 Preset Chips */}
        <div className="grid grid-cols-2 gap-1.5">
          {pricePresets.map((preset) => {
            const isSelected = currentPricePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePricePresetClick(preset.id)}
                className={`rounded-lg py-1.5 px-2 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-orange-100 text-fpt-orange font-bold border border-orange-300'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Min - Max Input Boxes */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="50.000"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-fpt-orange"
            />
          </div>
          <span className="text-slate-400 text-xs">-</span>
          <div className="relative flex-1">
            <input
              type="text"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="1.500.000"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-fpt-orange"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* SECTION 4: TÌNH TRẠNG SẢN PHẨM */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
          <span>Tình trạng sản phẩm</span>
        </div>
        <div className="space-y-1.5">
          {conditions.map((cond) => {
            const isChecked = selectedConditions.includes(cond.id);
            return (
              <label
                key={cond.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs cursor-pointer hover:bg-slate-50 transition"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCondition(cond.id)}
                  className="h-3.5 w-3.5 rounded text-fpt-orange focus:ring-fpt-orange accent-fpt-orange"
                />
                <span
                  className={`${
                    cond.highlight
                      ? 'text-rose-600 font-semibold'
                      : isChecked
                      ? 'font-semibold text-slate-900'
                      : 'text-slate-700'
                  }`}
                >
                  {cond.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* SECTION 5: NƠI NHẬN HÀNG */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
          <MapPin className="h-3.5 w-3.5 text-slate-500" />
          <span>Nơi nhận hàng</span>
        </div>
        <div className="space-y-1.5">
          {locations.map((loc) => {
            const isChecked = selectedLocations.includes(loc.id);
            return (
              <label
                key={loc.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleLocation(loc.id)}
                  className="h-3.5 w-3.5 rounded text-fpt-orange focus:ring-fpt-orange accent-fpt-orange"
                />
                <span className={isChecked ? 'font-semibold text-slate-900' : ''}>
                  {loc.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="w-full rounded-xl bg-fpt-orange py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover hover:shadow transition-all active:scale-98 cursor-pointer"
        >
          Áp dụng bộ lọc ({resultCount})
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          Xóa tất cả tùy chọn
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Always visible) */}
      <aside className="hidden lg:block w-72 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs h-fit sticky top-24">
        {content}
      </aside>

      {/* Mobile Drawer (When toggled) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Bộ lọc</span>
              <button
                onClick={onCloseMobile}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
