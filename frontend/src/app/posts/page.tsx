'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronRight,
  Home,
  ShieldCheck,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ProductItem } from '@/types/product';
import { stripVietnamese, ProductService } from '@/services/productService';
import {
  HOT_TAGS as hotSuggestions,
  CAMPUSES,
  CATEGORIES,
  PRICE_PRESETS,
} from '@/constants/marketplace';

function PostsPageContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCampus = searchParams.get('campus') || 'all';
  const initialCategory = searchParams.get('category') || '';

  const [searchKeyword, setSearchKeyword] = useState(initialQ);
  const [selectedCampus, setSelectedCampus] = useState(initialCampus);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedPricePreset, setSelectedPricePreset] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const campusDropdownRef = useRef<HTMLDivElement>(null);

  // ── Autocomplete suggest ──────────────────────────────────────────────────
  type Suggestion = { id: string; title: string; price: number; imageUrl: string; categoryName: string; campus: string; hashtags: string[] };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [activeSuggestIdx, setActiveSuggestIdx] = useState(-1);
  const suggestWrapRef = useRef<HTMLDivElement>(null);
  const postsInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setSuggestLoading(true);
    try {
      const campusParam = selectedCampus && selectedCampus !== 'all' ? `&campus=${selectedCampus}` : '';
      const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(q)}${campusParam}&limit=6`);
      if (res.ok) { const data = await res.json(); setSuggestions(data.data || data || []); }
    } catch { setSuggestions([]); } finally { setSuggestLoading(false); }
  }, [selectedCampus]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchKeyword.trim().length >= 1) {
      debounceRef.current = setTimeout(() => fetchSuggestions(searchKeyword), 250);
    } else { setSuggestions([]); }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchKeyword, fetchSuggestions]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (campusDropdownRef.current && !campusDropdownRef.current.contains(event.target as Node)) {
        setIsCampusOpen(false);
      }
      if (suggestWrapRef.current && !suggestWrapRef.current.contains(event.target as Node)) {
        setIsSuggestOpen(false);
        setActiveSuggestIdx(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  useEffect(() => {
    if (initialQ) setSearchKeyword(initialQ);
    if (initialCampus) setSelectedCampus(initialCampus);
    if (initialCategory) setSelectedCategories([initialCategory]);
  }, [initialQ, initialCampus, initialCategory]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    ProductService.searchPosts({
      keyword: searchKeyword,
      campus: selectedCampus,
      categories: selectedCategories,
      sort: sortOption,
    })
      .then((res) => {
        if (isMounted) {
          setLiveProducts(res.items || []);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải sản phẩm:', err);
        if (isMounted) {
          setLiveProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [searchKeyword, selectedCampus, selectedCategories, sortOption]);

  // Bộ lọc thời gian thực
  const filteredPosts = useMemo(() => {
    let list = [...liveProducts];

    if (searchKeyword.trim()) {
      const rawQ = searchKeyword.toLowerCase().trim();
      const strippedQ = stripVietnamese(rawQ);
      const compactQ = strippedQ.replace(/[^a-z0-9]/g, '');

      list = list.filter((item) => {
        const rawTarget = `${item.title} ${item.location} ${item.seller.name} ${item.badges.join(' ')} ${item.campusTag || ''} ${item.campus || ''} ${(item.hashtags || []).join(' ')}`.toLowerCase();
        const strippedTarget = stripVietnamese(rawTarget);
        const compactTarget = strippedTarget.replace(/[^a-z0-9]/g, '');

        const directMatch = rawTarget.includes(rawQ);
        const strippedMatch = strippedTarget.includes(strippedQ);
        const compactMatch = compactQ.length >= 3 && compactTarget.includes(compactQ);

        return directMatch || strippedMatch || compactMatch;
      });
    }

    if (selectedCampus && selectedCampus !== 'all') {
      const campMap: Record<string, string[]> = {
        hola: ['hòa lạc', 'hola', 'dom', 'tân xã', 'thư viện', 'hol'],
        dn: ['đà nẵng', 'fpt đn', 'tòa f', 'dad'],
        hcm: ['hồ chí minh', 'hcm', 'quận 9', 'tòa alpha'],
        ct: ['cần thơ', 'fpt ct', 'ct'],
        qn: ['quy nhơn', 'fpt qn', 'qn'],
      };
      const allowed = campMap[selectedCampus] || [selectedCampus];
      list = list.filter((item) => {
        const combined = `${item.location} ${item.campusTag || ''} ${item.campus || ''}`.toLowerCase();
        return allowed.some((kw) => combined.includes(kw));
      });
    }

    if (selectedCategories.length > 0) {
      const catNormMap: Record<string, { types: string[]; keywords: string[] }> = {
        books: {
          types: ['BOOKS'],
          keywords: ['giáo trình', 'sách', 'book', 'prf', 'mas', 'csd', 'pe', 'fe', 'note', 'tài liệu', 'học tập', 'vở'],
        },
        electronics: {
          types: ['ELECTRONICS'],
          keywords: ['điện tử', 'chuột', 'phím', 'bàn phím', 'màn hình', 'dell', 'tai nghe', 'sony', 'logitech', 'switch', 'hub', 'it', 'linh kiện', 'laptop', 'macbook', 'cáp', 'sạc', 'dock'],
        },
        fashion: {
          types: ['CLOTHING'],
          keywords: ['thời trang', 'vovinam', 'võ phục', 'áo', 'polo', 'hoodie', 'giày', 'đồng phục', 'quần'],
        },
        dorm: {
          types: ['DORM_ITEM'],
          keywords: ['đồ dùng', 'gia dụng', 'tủ lạnh', 'bàn học', 'bàn gấp', 'quạt', 'đèn', 'decor', 'ktx', 'giường', 'chiếu', 'nồi', 'ấm', 'phòng', 'gương', 'kệ', 'móc'],
        },
        hobbies: {
          types: ['ELECTRONICS', 'OTHER'],
          keywords: ['nintendo', 'switch', 'game', 'đàn', 'guitar', 'boardgame', 'truyện', 'mô hình', 'gaming', 'console'],
        },
        services: {
          types: ['OTHER'],
          keywords: ['dịch vụ', 'tiện ích', 'thẻ gym', 'gym', 'vé bus', 'bus', 'pass', 'voucher', 'căng tin', 'xe'],
        },
      };

      list = list.filter((item) => {
        const rawCat = (item.category || '').toLowerCase();
        const catType = (item.categoryType || '').toUpperCase();
        const text = `${rawCat} ${catType} ${item.title} ${item.badges.join(' ')}`.toLowerCase();

        return selectedCategories.some((catId) => {
          const config = catNormMap[catId];
          if (!config) return text.includes(catId);
          const matchType = catType && config.types.includes(catType);
          const matchKeyword = config.keywords.some((kw) => text.includes(kw) || rawCat.includes(kw));
          return matchType || matchKeyword || rawCat === catId;
        });
      });
    }

    if (selectedPricePreset === 'under-100k') {
      list = list.filter((item) => item.price < 100000);
    } else if (selectedPricePreset === '100k-500k') {
      list = list.filter((item) => item.price >= 100000 && item.price <= 500000);
    } else if (selectedPricePreset === '500k-2m') {
      list = list.filter((item) => item.price >= 500000 && item.price <= 2000000);
    } else if (selectedPricePreset === 'over-2m') {
      list = list.filter((item) => item.price > 2000000);
    }

    // Custom Min - Max Price filter
    const parsedMin = Number(minPrice.replace(/\D/g, ''));
    if (parsedMin > 0) {
      list = list.filter((item) => item.price >= parsedMin);
    }
    const parsedMax = Number(maxPrice.replace(/\D/g, ''));
    if (parsedMax > 0) {
      list = list.filter((item) => item.price <= parsedMax);
    }

    // Conditions filter
    if (selectedConditions.length > 0) {
      list = list.filter((item) => {
        const badgeStr = item.badges.join(' ').toLowerCase();
        const condStr = (item.condition || '').toLowerCase();
        return selectedConditions.some((c) => {
          if (c === 'seal') return badgeStr.includes('100%') || condStr.includes('100') || condStr.includes('seal');
          if (c === 'likenew') return badgeStr.includes('99%') || badgeStr.includes('like new') || condStr.includes('99');
          if (c === 'good') return badgeStr.includes('tốt') || condStr.includes('good') || condStr.includes('tốt');
          if (c === 'used') return badgeStr.includes('cũ') || badgeStr.includes('thanh lý') || condStr.includes('fair') || condStr.includes('used');
          return true;
        });
      });
    }

    if (sortOption === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [liveProducts, searchKeyword, selectedCampus, selectedCategories, selectedPricePreset, minPrice, maxPrice, selectedConditions, sortOption]);

  const activeFilters = useMemo(() => {
    const tags: { id: string; label: string; onRemove: () => void }[] = [];

    if (searchKeyword.trim()) {
      tags.push({
        id: 'keyword',
        label: `Từ khóa: "${searchKeyword}"`,
        onRemove: () => setSearchKeyword(''),
      });
    }

    if (selectedCampus && selectedCampus !== 'all') {
      const camp = CAMPUSES.find((c) => c.id === selectedCampus);
      tags.push({
        id: 'campus',
        label: `Cơ sở: ${camp ? camp.label : selectedCampus}`,
        onRemove: () => setSelectedCampus('all'),
      });
    }

    selectedCategories.forEach((catId) => {
      const cat = CATEGORIES.find((c) => c.id === catId);
      tags.push({
        id: `cat-${catId}`,
        label: `Danh mục: ${cat ? (cat.label || cat.name) : catId}`,
        onRemove: () =>
          setSelectedCategories((prev) => prev.filter((id) => id !== catId)),
      });
    });

    if (selectedPricePreset) {
      const preset = PRICE_PRESETS.find((p) => p.id === selectedPricePreset);
      tags.push({
        id: 'price',
        label: `Giá: ${preset ? preset.label : selectedPricePreset}`,
        onRemove: () => setSelectedPricePreset(''),
      });
    }

    if (minPrice || maxPrice) {
      tags.push({
        id: 'custom-price',
        label: `Giá: ${minPrice || '0'} - ${maxPrice || '∞'} đ`,
        onRemove: () => {
          setMinPrice('');
          setMaxPrice('');
        },
      });
    }

    selectedConditions.forEach((condId) => {
      const condLabels: Record<string, string> = {
        seal: 'Mới 100%',
        likenew: 'Mới 99%',
        good: 'Còn tốt',
        used: 'Thanh lý',
      };
      tags.push({
        id: `cond-${condId}`,
        label: `Tình trạng: ${condLabels[condId] || condId}`,
        onRemove: () =>
          setSelectedConditions((prev) => prev.filter((id) => id !== condId)),
      });
    });

    return tags;
  }, [searchKeyword, selectedCampus, selectedCategories, selectedPricePreset, minPrice, maxPrice, selectedConditions]);

  const clearAllFilters = () => {
    setSearchKeyword('');
    setSelectedCampus('all');
    setSelectedCategories([]);
    setSelectedPricePreset('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedConditions([]);
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleToggleCondition = (condId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condId) ? prev.filter((id) => id !== condId) : [...prev, condId]
    );
  };

  const campusLabel =
    CAMPUSES.find((c) => c.id === selectedCampus)?.label || (selectedCampus === 'all' ? 'Tất cả cơ sở' : 'Hòa Lạc');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans py-4 sm:py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Compact In-Container Header like Image 2 */}
        <CompactHeader
          breadcrumbs={[
            { label: 'Khám phá sản phẩm' },
            { label: selectedCampus === 'all' ? 'Toàn quốc' : `Campus ${campusLabel}` },
          ]}
          activeTab="explore"
        />

        {/* Clean In-Container Search & Suggestions Box */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
          <div ref={suggestWrapRef} className="relative">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {/* Input with search icon & clear button */}
              <div className="relative flex-1 flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 focus-within:border-fpt-orange focus-within:bg-white transition">
                <Search className={`h-4 w-4 shrink-0 mr-2 transition-colors ${suggestLoading ? 'text-fpt-orange animate-pulse' : 'text-slate-400'}`} />
                <input
                  ref={postsInputRef}
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => { setSearchKeyword(e.target.value); setIsSuggestOpen(true); setActiveSuggestIdx(-1); }}
                  onFocus={() => setIsSuggestOpen(true)}
                  onKeyDown={(e) => {
                    if (!isSuggestOpen) return;
                    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
                    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestIdx((i) => Math.max(i - 1, -1)); }
                    else if (e.key === 'Enter' && activeSuggestIdx >= 0) {
                      e.preventDefault();
                      const s = suggestions[activeSuggestIdx];
                      if (s) { setSearchKeyword(s.title); setIsSuggestOpen(false); }
                    } else if (e.key === 'Escape') { setIsSuggestOpen(false); }
                  }}
                  placeholder="Tìm kiếm sản phẩm, giáo trình, phụ kiện..."
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                />
                {searchKeyword && (
                  <button
                    onClick={() => { setSearchKeyword(''); setSuggestions([]); postsInputRef.current?.focus(); }}
                    className="rounded-full p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

            {/* Campus custom dropdown */}
            <div className="relative shrink-0" ref={campusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCampusOpen((prev) => !prev)}
                className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 px-3 py-2 text-xs font-semibold text-slate-700 transition cursor-pointer"
                aria-haspopup="listbox"
                aria-expanded={isCampusOpen}
              >
                <MapPin className="h-3.5 w-3.5 text-fpt-orange mr-1.5 shrink-0" />
                <span className="text-slate-400 mr-1 text-[11px]">CƠ SỞ:</span>
                <span className="font-bold text-slate-900 mr-1.5">
                  {CAMPUSES.find((c) => c.id === selectedCampus)?.label || 'Tất cả cơ sở'}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    isCampusOpen ? 'rotate-180 text-fpt-orange' : ''
                  }`}
                />
              </button>

              {isCampusOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-md p-2 shadow-2xl shadow-slate-900/12 animate-in fade-in-0 zoom-in-95 duration-150 ring-1 ring-black/5">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cơ sở Campus FPT</span>
                    <span className="text-[10px] font-bold text-fpt-orange bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                      5 Cơ sở
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                    {CAMPUSES.map((c) => {
                      const isSelected = selectedCampus === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCampus(c.id);
                            setIsCampusOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50 text-fpt-orange font-semibold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
                                isSelected ? 'bg-orange-500 text-white font-bold' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {c.id === 'all' ? '🌐' : '📍'}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold">{c.label}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-fpt-orange shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Search Submit CTA */}
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-fpt-orange px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-fpt-orange-hover transition active:scale-98 cursor-pointer shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>Tìm kiếm</span>
            </button>
          </div>

          {/* ── Autocomplete Dropdown ─────────────────────────────────── */}
          {isSuggestOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gợi ý sản phẩm</span>
                <span className="text-[10px] text-slate-400">{suggestions.length} kết quả</span>
              </div>
              {suggestions.map((item, idx) => (
                <Link
                  key={item.id}
                  href={`/posts/${item.id}`}
                  onClick={() => { setSearchKeyword(item.title); setIsSuggestOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50/60 transition cursor-pointer ${activeSuggestIdx === idx ? 'bg-orange-50' : ''}`}
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-slate-300">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-fpt-orange">{item.price.toLocaleString('vi-VN')}đ</span>
                      {item.categoryName && <span className="text-[11px] text-slate-400">· {item.categoryName}</span>}
                    </div>
                  </div>
                  <Search className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                </Link>
              ))}
              <div className="px-4 py-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSuggestOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition py-2 text-sm font-semibold text-fpt-orange"
                >
                  <Search className="h-4 w-4" />
                  Xem tất cả kết quả cho &quot;{searchKeyword}&quot;
                </button>
              </div>
            </div>
          )}
          {/* ──────────────────────────────────────────────────────────── */}
          </div>

          {/* Quick suggestions pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span className="flex items-center gap-1 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              GỢI Ý HOT:
            </span>
            {hotSuggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchKeyword(tag.replace('#', ''))}
                className="rounded-full border border-slate-200/80 bg-white px-2.5 py-0.5 text-xs text-slate-600 hover:border-fpt-orange/40 hover:text-fpt-orange hover:bg-orange-50 transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 4. MAIN CONTENT CONTAINER (2-COLUMNS: SIDEBAR + RESULTS) */}
        <main className="flex-1 w-full pt-2">
          <div className="flex items-start gap-6 lg:gap-8">
          {/* Left Filter Sidebar */}
          <FilterSidebar
            products={liveProducts}
            resultCount={filteredPosts.length}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            selectedCampus={selectedCampus}
            onSelectCampus={(camp) => setSelectedCampus(camp)}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            selectedPricePreset={selectedPricePreset}
            onSelectPricePreset={(preset) => setSelectedPricePreset(preset)}
            minPrice={minPrice}
            onMinPriceChange={setMinPrice}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            selectedConditions={selectedConditions}
            onToggleCondition={handleToggleCondition}
            onReset={clearAllFilters}
          />

          {/* Right Product Feed */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Results Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900">
                    {filteredPosts.length} sản phẩm tìm thấy
                  </h1>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200">
                    {campusLabel} Active
                  </span>
                </div>
                {searchKeyword && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Khớp từ khóa: <strong className="text-slate-700">&quot;{searchKeyword}&quot;</strong>
                  </p>
                )}
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* Mobile Filter Trigger */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-fpt-orange" />
                  <span>Bộ lọc ({activeFilters.length})</span>
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 hidden sm:inline">
                    SẮP XẾP:
                  </span>
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-7 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                    >
                      <option value="newest">Tin đăng mới nhất</option>
                      <option value="price-asc">Giá: Thấp đến cao</option>
                      <option value="price-desc">Giá: Cao đến thấp</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Grid / List Mode */}
                <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-lg p-1.5 transition ${
                      viewMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`rounded-lg p-1.5 transition ${
                      viewMode === 'list'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags Row */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs py-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                  ĐANG LỌC THEO:
                </span>
                {activeFilters.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 shadow-xs"
                  >
                    <span>{f.label}</span>
                    <button
                      type="button"
                      onClick={f.onRemove}
                      className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-fpt-orange hover:underline ml-1 cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Product Cards Grid / Loading Skeleton / Empty State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-4.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-3 animate-pulse">
                    <div className="aspect-square w-full rounded-xl bg-slate-200/70" />
                    <div className="space-y-2 pt-1">
                      <div className="h-4 w-3/4 rounded-md bg-slate-200/70" />
                      <div className="h-4 w-1/2 rounded-md bg-slate-200/70" />
                      <div className="h-3 w-1/3 rounded-md bg-slate-200/70" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-4.5">
                {filteredPosts.map((post) => (
                  <ProductCard key={post.id} product={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-fpt-orange">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Không tìm thấy sản phẩm phù hợp
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {searchKeyword
                      ? `Không có tin đăng nào khớp với từ khóa "${searchKeyword}" hoặc bộ lọc hiện tại.`
                      : 'Hiện tại chưa có tin đăng nào phù hợp với bộ lọc bạn đã chọn.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Đặt lại toàn bộ bộ lọc</span>
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredPosts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2">
                <span className="text-xs text-slate-500 order-2 sm:order-1">
                  Hiển thị <strong className="text-slate-800">1 - {filteredPosts.length}</strong> trong tổng số <strong className="text-slate-800">{filteredPosts.length}</strong> sản phẩm
                </span>

                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                  <button
                    disabled
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed"
                  >
                    ‹ Trước
                  </button>
                  <button className="h-8 w-8 rounded-xl bg-fpt-orange text-xs font-bold text-white shadow-xs">
                    1
                  </button>
                  <button
                    disabled
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                  >
                    Tiếp theo ›
                  </button>
                </div>
              </div>
            )}

            {/* Campus Direct Handoff Safety Tips Banner */}
            <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">
                  Mẹo giao dịch trực tiếp an toàn tại Campus
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Ưu tiên hẹn gặp tại sảnh Dom KTX, Thư viện hoặc Căng-tin trong giờ hành chính. Luôn kiểm tra kỹ tình trạng giáo trình, sạc cáp thiết bị điện tử trước khi thanh toán. Báo cáo ngay nếu có dấu hiệu bán giá chênh lệch không lành mạnh.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-fpt-orange font-bold text-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-fpt-orange border-t-transparent" />
            <span>Đang tải danh sách bài đăng...</span>
          </div>
        </div>
      }
    >
      <PostsPageContent />
    </Suspense>
  );
}
