'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Layers,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface HeroSearchProps {
  onSearch?: (query: string, campus: string, category: string) => void;
  initialCampus?: string;
}

import { CAMPUSES, CATEGORIES, HOT_TAGS } from '@/constants/marketplace';

const campusOptions = CAMPUSES;
const categoryOptions = [
  { id: 'all', label: 'Tất cả danh mục' },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.label || c.name })),
];
const trendingTags = HOT_TAGS.slice(0, 5);

import { useRouter } from 'next/navigation';

export default function HeroSearch({
  onSearch,
  initialCampus = 'hola',
}: HeroSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [campus, setCampus] = useState(initialCampus);
  const [category, setCategory] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(keyword, campus, category);
    } else {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('q', keyword.trim());
      if (campus && campus !== 'all') params.set('campus', campus);
      if (category && category !== 'all') params.set('category', category);
      router.push(`/posts?${params.toString()}`);
    }
  };

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace('#', '');
    setKeyword(cleanTag);
    if (onSearch) {
      onSearch(cleanTag, campus, category);
    } else {
      const params = new URLSearchParams();
      params.set('q', cleanTag);
      if (campus && campus !== 'all') params.set('campus', campus);
      router.push(`/posts?${params.toString()}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50/20 to-transparent py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Header Row with Trust Tag & Sell CTA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="space-y-2">
            {/* Campus Trust Badge */}
            <Badge variant="fpt" className="gap-1.5 px-3 py-1 text-xs font-semibold normal-case">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Sàn giao dịch sinh viên FPT University</span>
            </Badge>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-slate-900 leading-tight">
              Mua bán dễ dàng trong cộng đồng{' '}
              <span className="text-fpt-orange block sm:inline">
                FPT 5Campus
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-normal">
              Tìm đồ bạn cần, Bán đồ bạn không dùng. Kết nối cùng{' '}
              <strong className="text-slate-800 font-semibold">12.000+ sinh viên</strong> FPT
              toàn quốc.
            </p>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0">
            <Button
              asChild
              className="gap-2 rounded-xl bg-fpt-orange px-5 py-3 h-auto text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-fpt-orange-hover hover:shadow-lg transition-all active:scale-95"
            >
              <Link href="/create-post">
                <PlusCircle className="h-4 w-4" />
                <span>+ Đăng bán ngay</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* UNIFIED SEARCH BAR CONTAINER */}
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 transition-shadow focus-within:border-fpt-orange/40 focus-within:shadow-[0_8px_30px_rgb(242,112,36,0.1)]"
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100 gap-1">
            {/* 1. Keyword search input */}
            <div className="flex flex-1 items-center gap-3 px-3 py-2.5">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm giáo trình, laptop, chuột, tủ lạnh mini, đồ decor phòng KTX..."
                className="w-full bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 h-auto text-sm text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* 2. Campus filter dropdown */}
            <div className="flex items-center gap-2 px-3 py-2.5 shrink-0">
              <MapPin className="h-4 w-4 text-fpt-orange shrink-0" />
              <div className="relative">
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  aria-label="Chọn cơ sở Campus FPT"
                  className="appearance-none bg-transparent pr-7 text-xs sm:text-sm font-medium text-slate-700 outline-none cursor-pointer"
                >
                  {campusOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* 3. Category filter dropdown */}
            <div className="flex items-center gap-2 px-3 py-2.5 shrink-0">
              <Layers className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Chọn danh mục sản phẩm"
                  className="appearance-none bg-transparent pr-7 text-xs sm:text-sm font-medium text-slate-700 outline-none cursor-pointer"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* 4. Search submit button */}
            <div className="p-1 shrink-0">
              <Button
                type="submit"
                className="flex w-full lg:w-auto items-center justify-center gap-2 rounded-xl bg-fpt-orange px-6 py-3 h-auto text-sm font-semibold text-white shadow-xs hover:bg-fpt-orange-hover transition-colors active:scale-98 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>Tìm kiếm</span>
              </Button>
            </div>
          </div>
        </form>

        {/* TRENDING TAGS ROW */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
            <TrendingUp className="h-3 w-3 text-fpt-orange" />
            XU HƯỚNG HOT:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {trendingTags.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTagClick(tag)}
                className="rounded-full border-slate-200 bg-white/80 px-3 py-1 h-auto text-xs font-medium text-slate-600 hover:border-fpt-orange/40 hover:bg-orange-50 hover:text-fpt-orange"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
