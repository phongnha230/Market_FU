'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Layers,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Check,
  X,
  Clock,
  Hash,
  GraduationCap,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface HeroSearchProps {
  onSearch?: (query: string, campus: string, category: string) => void;
  initialCampus?: string;
}

import { CAMPUSES, CATEGORIES, HOT_TAGS } from '@/constants/marketplace';
import { useProductStore } from '@/stores/productStore';

const campusOptions = CAMPUSES;
const categoryOptions = [
  { id: 'all', label: 'Tất cả danh mục' },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.label || c.name })),
];
const trendingTags = HOT_TAGS.slice(0, 5);

const ROTATING_KEYWORDS = [
  'giáo trình & slide',
  'đồ dùng ký túc xá',
  'laptop & linh kiện',
  'xe máy & xe bus pass',
  'đồ decor phòng trọ',
];

import { useRouter } from 'next/navigation';

export default function HeroSearch({
  onSearch,
  initialCampus = 'all',
}: HeroSearchProps) {
  const router = useRouter();
  const products = useProductStore((state) => state.products);
  const totalSellers = React.useMemo(() => {
    const sellers = new Set(products.map((p) => p.seller?.name).filter(Boolean));
    return sellers.size;
  }, [products]);
  const [keyword, setKeyword] = useState('');
  const [campus, setCampus] = useState(initialCampus);
  const [category, setCategory] = useState('all');

  // Dynamic Rotating Keywords (Đề xuất 3)
  const [keywordIndex, setKeywordIndex] = useState(0);
  const [isKeywordFading, setIsKeywordFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsKeywordFading(true);
      setTimeout(() => {
        setKeywordIndex((prev) => (prev + 1) % ROTATING_KEYWORDS.length);
        setIsKeywordFading(false);
      }, 220);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Custom Dropdown states & refs
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const campusDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // ── Autocomplete suggest state ───────────────────────────────────────────
  type Suggestion = {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    categoryName: string;
    campus: string;
    hashtags: string[];
  };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [activeSuggestIdx, setActiveSuggestIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const suggestRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fu_market_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5));
    } catch {}
  }, []);

  const saveRecentSearch = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    try { localStorage.setItem('fu_market_recent_searches', JSON.stringify(updated)); } catch {}
  };

  // Debounced fetch suggestions
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    setSuggestLoading(true);
    try {
      const campusParam = campus && campus !== 'all' ? `&campus=${campus}` : '';
      const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(q)}${campusParam}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.data || data || []);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }, [campus]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (keyword.trim().length >= 1) {
      debounceRef.current = setTimeout(() => fetchSuggestions(keyword), 250);
    } else {
      setSuggestions([]);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [keyword, fetchSuggestions]);
  // ─────────────────────────────────────────────────────────────────────────

  // Close dropdowns on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        campusDropdownRef.current &&
        !campusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCampusOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
      if (suggestRef.current && !suggestRef.current.contains(event.target as Node)) {
        setIsSuggestOpen(false);
        setActiveSuggestIdx(-1);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCampusOpen(false);
        setIsCategoryOpen(false);
        setIsSuggestOpen(false);
        setActiveSuggestIdx(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedCampusLabel =
    campusOptions.find((c) => c.id === campus)?.label || 'Tất cả cơ sở';
  const selectedCategoryObj = CATEGORIES.find((c) => c.id === category);
  const selectedCategoryLabel =
    category === 'all'
      ? 'Tất cả danh mục'
      : selectedCategoryObj?.label || selectedCategoryObj?.name || 'Tất cả danh mục';

  const doSearch = (q: string) => {
    saveRecentSearch(q);
    setIsSuggestOpen(false);
    if (onSearch) {
      onSearch(q, campus, category);
    } else {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (campus && campus !== 'all') params.set('campus', campus);
      if (category && category !== 'all') params.set('category', category);
      router.push(`/posts?${params.toString()}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(keyword);
  };

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace('#', '');
    setKeyword(cleanTag);
    doSearch(cleanTag);
  };

  const handleSuggestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeSuggestIdx >= 0) {
      e.preventDefault();
      const s = suggestions[activeSuggestIdx];
      if (s) {
        setKeyword(s.title);
        router.push(`/posts/${s.id}`);
        setIsSuggestOpen(false);
      }
    }
  };

  return (
    <section className="relative overflow-visible bg-gradient-to-b from-white via-orange-50/20 to-transparent py-8 sm:py-12 z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Header Row with Proposal 3: Dynamic Rotating Headline (Anti-Slop Centered Layout) */}
        <div className="space-y-4 max-w-4xl mx-auto text-center mb-8 sm:mb-10">
          {/* Campus Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-orange-50/90 px-3.5 py-1 text-xs font-semibold text-orange-700 shadow-2xs backdrop-blur-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
            <span>Sàn giao dịch sinh viên FPT University</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-slate-500 font-medium">Toàn quốc</span>
          </div>

          {/* Main Headline with Dynamic Rotating Keywords */}
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-slate-900 leading-[1.25]">
            Mua bán{' '}
            <span
              className={`inline-block text-fpt-orange transition-all duration-200 transform ${
                isKeywordFading
                  ? 'opacity-0 -translate-y-2 scale-95'
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              {ROTATING_KEYWORDS[keywordIndex]}
            </span>
            <br />
            dễ dàng trong cộng đồng <span className="text-slate-900">FPT 5 Campus</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Nền tảng kết nối trao đổi đồ dùng sinh hoạt, giáo trình và thiết bị công nghệ trực tiếp giữa sinh viên FPT. Tiết kiệm, minh bạch và an toàn ngay trong khuôn viên trường.
          </p>

          {/* Trust Highlights - Centered Pills (Đề xuất 3) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs">
              <GraduationCap className="h-3.5 w-3.5 text-fpt-orange" />
              Email @fpt.edu.vn chính chủ
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              Giao dịch tại 5 Campus
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs">
              <BadgePercent className="h-3.5 w-3.5 text-blue-600" />
              0đ phí trung gian
            </span>
          </div>
        </div>

        {/* UNIFIED SEARCH BAR CONTAINER */}
        <div ref={suggestRef} className="relative z-30 max-w-5xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 transition-shadow focus-within:border-fpt-orange/40 focus-within:shadow-[0_8px_30px_rgb(242,112,36,0.1)]"
          >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100 gap-1">
            {/* 1. Keyword search input */}
            <div className="flex flex-1 items-center gap-3 px-3 py-2.5">
              <Search className={`h-5 w-5 shrink-0 transition-colors ${suggestLoading ? 'text-fpt-orange animate-pulse' : 'text-slate-400'}`} />
              <Input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setIsSuggestOpen(true);
                  setActiveSuggestIdx(-1);
                }}
                onFocus={() => setIsSuggestOpen(true)}
                onKeyDown={handleSuggestKeyDown}
                placeholder="Tìm kiếm giáo trình, laptop, chuột, tủ lạnh mini, đồ decor phòng KTX..."
                className="w-full bg-transparent border-0 shadow-none focus-visible:ring-0 outline-none px-0 h-auto text-sm text-slate-800 placeholder-slate-400"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => { setKeyword(''); setSuggestions([]); inputRef.current?.focus(); }}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* 2. Campus custom filter dropdown */}
            <div className="relative shrink-0" ref={campusDropdownRef}>
              <button
                type="button"
                data-testid="hero-campus-trigger"
                onClick={() => {
                  setIsCampusOpen((prev) => !prev);
                  setIsCategoryOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                aria-haspopup="listbox"
                aria-expanded={isCampusOpen}
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-fpt-orange shrink-0 group-hover:bg-orange-100/70 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Cơ sở</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1 max-w-[130px]">
                    {selectedCampusLabel}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ml-1 ${
                    isCampusOpen ? 'rotate-180 text-fpt-orange' : ''
                  }`}
                />
              </button>

              {/* Campus Dropdown Menu */}
              {isCampusOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 sm:w-80 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl shadow-slate-900/15 animate-in fade-in-0 zoom-in-95 duration-150 ring-1 ring-black/5">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chọn cơ sở Campus FPT</span>
                    <span className="text-[10px] font-bold text-fpt-orange bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                      5 Cơ sở
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1.5 space-y-1">
                    {campusOptions.map((opt) => {
                      const isSelected = campus === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setCampus(opt.id);
                            setIsCampusOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50/90 text-fpt-orange font-semibold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-orange-500 text-white font-bold'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {opt.id === 'all' ? '🌐' : '📍'}
                            </span>
                            <div className="truncate">
                              <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                                {opt.label}
                              </div>
                              <div className="text-[11px] text-slate-400 font-normal truncate">
                                {opt.id === 'all'
                                  ? 'Toàn bộ 5 campus trên toàn quốc'
                                  : opt.id === 'hola'
                                  ? 'Khu CNC Hòa Lạc, Hà Nội'
                                  : opt.id === 'dn'
                                  ? 'FPT City, Ngũ Hành Sơn, Đà Nẵng'
                                  : opt.id === 'hcm'
                                  ? 'Khu CNC, TP. Thủ Đức, TP.HCM'
                                  : opt.id === 'ct'
                                  ? '600 Nguyễn Văn Cừ, Cần Thơ'
                                  : 'Khu Đô thị An Phú Thịnh, Quy Nhơn'}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-fpt-orange shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Category custom filter dropdown */}
            <div className="relative shrink-0" ref={categoryDropdownRef}>
              <button
                type="button"
                data-testid="hero-category-trigger"
                onClick={() => {
                  setIsCategoryOpen((prev) => !prev);
                  setIsCampusOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                aria-haspopup="listbox"
                aria-expanded={isCategoryOpen}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-slate-200/60 transition-colors">
                  {selectedCategoryObj?.icon ? (
                    <selectedCategoryObj.icon className="h-4 w-4" />
                  ) : (
                    <Layers className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Danh mục</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1 max-w-[140px]">
                    {selectedCategoryLabel}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ml-1 ${
                    isCategoryOpen ? 'rotate-180 text-fpt-orange' : ''
                  }`}
                />
              </button>

              {/* Category Dropdown Menu */}
              {isCategoryOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 sm:w-84 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl shadow-slate-900/15 animate-in fade-in-0 zoom-in-95 duration-150 ring-1 ring-black/5">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục sản phẩm</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      FPT Market
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1.5 space-y-1">
                    {/* All Categories Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('all');
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        category === 'all'
                          ? 'bg-orange-50/90 text-fpt-orange font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                            category === 'all'
                              ? 'bg-orange-500 text-white font-bold'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Layers className="h-4 w-4" />
                        </span>
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-semibold truncate leading-tight">Tất cả danh mục</div>
                          <div className="text-[11px] text-slate-400 font-normal truncate">Khám phá mọi món đồ trên sàn</div>
                        </div>
                      </div>
                      {category === 'all' && <Check className="h-4 w-4 text-fpt-orange shrink-0 ml-2" />}
                    </button>

                    {/* Specific Categories */}
                    {CATEGORIES.map((cat) => {
                      const isSelected = category === cat.id;
                      const IconComp = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategory(cat.id);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50/90 text-fpt-orange font-semibold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-orange-500 text-white font-bold'
                                  : `${cat.bgColor} ${cat.color}`
                              }`}
                            >
                              <IconComp className="h-4 w-4" />
                            </span>
                            <div className="truncate">
                              <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                                {cat.label || cat.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-normal truncate">
                                {cat.description}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-fpt-orange shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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

        {/* ── AUTOCOMPLETE DROPDOWN ─────────────────────────────────────── */}
        {isSuggestOpen && (keyword.trim().length >= 1 ? suggestions.length > 0 : recentSearches.length > 0) && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">

            {/* Recent searches — hiện khi input rỗng */}
            {!keyword.trim() && recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tìm kiếm gần đây</span>
                  <button
                    type="button"
                    onClick={() => { setRecentSearches([]); localStorage.removeItem('fu_market_recent_searches'); }}
                    className="text-[11px] text-slate-400 hover:text-red-500 transition"
                  >Xóa tất cả</button>
                </div>
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setKeyword(s); doSearch(s); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition text-left"
                  >
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700">{s}</span>
                  </button>
                ))}
              </>
            )}

            {/* Product suggestions — hiện khi đang gõ */}
            {keyword.trim().length >= 1 && suggestions.length > 0 && (
              <>
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gợi ý sản phẩm</span>
                  <span className="text-[10px] text-slate-400">{suggestions.length} kết quả</span>
                </div>
                {suggestions.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/posts/${item.id}`}
                    onClick={() => { saveRecentSearch(keyword); setIsSuggestOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50/60 transition cursor-pointer ${activeSuggestIdx === idx ? 'bg-orange-50' : ''}`}
                  >
                    {/* Thumbnail */}
                    <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300 text-lg">📦</div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-fpt-orange">
                          {item.price.toLocaleString('vi-VN')}đ
                        </span>
                        {item.categoryName && (
                          <span className="text-[11px] text-slate-400">· {item.categoryName}</span>
                        )}
                        {item.hashtags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] text-orange-500">
                            <Hash className="h-2.5 w-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Search className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  </Link>
                ))}

                {/* Xem tất cả */}
                <div className="px-4 py-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => doSearch(keyword)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition py-2 text-sm font-semibold text-fpt-orange"
                  >
                    <Search className="h-4 w-4" />
                    Xem tất cả kết quả cho &quot;{keyword}&quot;
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {/* ─────────────────────────────────────────────────────────────── */}
        </div>

        {/* TRENDING TAGS ROW */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs max-w-5xl mx-auto">
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
