'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
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
} from 'lucide-react';
import { ProductItem } from '@/types/product';
import {
  SEARCH_PAGE_POSTS,
  FEATURED_PRODUCTS,
  LATEST_PRODUCTS,
  SIMILAR_PRODUCTS,
} from '@/constants/mockProducts';
import { stripVietnamese } from '@/services/productService';
import {
  HOT_TAGS as hotSuggestions,
  CAMPUSES,
  CATEGORIES,
  PRICE_PRESETS,
} from '@/constants/marketplace';

const ALL_PRODUCTS: ProductItem[] = [
  ...SEARCH_PAGE_POSTS,
  ...FEATURED_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
  ...LATEST_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
  ...SIMILAR_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
];

function PostsPageContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCampus = searchParams.get('campus') || 'hola';
  const initialCategory = searchParams.get('category') || '';

  const [searchKeyword, setSearchKeyword] = useState(initialQ);
  const [selectedCampus, setSelectedCampus] = useState(initialCampus);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedPricePreset, setSelectedPricePreset] = useState<string>('');
  const [sortOption, setSortOption] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (initialQ) setSearchKeyword(initialQ);
    if (initialCampus) setSelectedCampus(initialCampus);
    if (initialCategory) setSelectedCategories([initialCategory]);
  }, [initialQ, initialCampus, initialCategory]);

  // Bộ lọc thời gian thực
  const filteredPosts = useMemo(() => {
    let list = [...ALL_PRODUCTS];

    if (searchKeyword.trim()) {
      const rawQ = searchKeyword.toLowerCase().trim();
      const strippedQ = stripVietnamese(rawQ);
      const compactQ = strippedQ.replace(/[^a-z0-9]/g, '');

      list = list.filter((item) => {
        const rawTarget = `${item.title} ${item.location} ${item.seller.name} ${item.badges.join(' ')} ${item.campusTag || ''}`.toLowerCase();
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
        hola: ['hòa lạc', 'hola', 'dom', 'tân xã', 'thư viện'],
        dn: ['đà nẵng', 'fpt đn', 'tòa f'],
        hcm: ['hồ chí minh', 'hcm', 'quận 9', 'tòa alpha'],
        ct: ['cần thơ', 'fpt ct'],
        qn: ['quy nhơn', 'fpt qn'],
      };
      const allowed = campMap[selectedCampus] || [selectedCampus];
      list = list.filter((item) => {
        const combined = `${item.location} ${item.campusTag || ''}`.toLowerCase();
        return allowed.some((kw) => combined.includes(kw));
      });
    }

    if (selectedCategories.length > 0) {
      const catMap: Record<string, string[]> = {
        books: ['giáo trình', 'sách', 'prf192', 'mas291', 'csd201', 'note', 'bài tập'],
        electronics: ['chuột', 'phím', 'bàn phím', 'màn hình', 'dell', 'tai nghe', 'sony', 'logitech', 'switch', 'hub'],
        fashion: ['vovinam', 'võ phục', 'áo', 'polo', 'hoodie'],
        dorm: ['tủ lạnh', 'bàn học', 'bàn gấp', 'quạt', 'đèn', 'decor'],
        hobbies: ['nintendo', 'switch', 'game', 'đàn'],
        services: ['thẻ gym', 'gym', 'vé bus', 'bus'],
      };
      list = list.filter((item) => {
        const text = `${item.title} ${item.badges.join(' ')}`.toLowerCase();
        return selectedCategories.some((catId) => {
          const kws = catMap[catId] || [catId];
          return kws.some((kw) => text.includes(kw));
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

    if (sortOption === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [searchKeyword, selectedCampus, selectedCategories, selectedPricePreset, sortOption]);

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

    return tags;
  }, [searchKeyword, selectedCampus, selectedCategories, selectedPricePreset]);

  const clearAllFilters = () => {
    setSearchKeyword('');
    setSelectedCampus('all');
    setSelectedCategories([]);
    setSelectedPricePreset('');
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const campusLabel =
    CAMPUSES.find((c) => c.id === selectedCampus)?.label || 'Hòa Lạc';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. MAIN NAVBAR */}
      <Navbar
        selectedCampus={selectedCampus}
        onSelectCampus={(camp) => setSelectedCampus(camp)}
      />

      {/* 2. BREADCRUMBS ROW */}
      <div className="border-b border-slate-200/70 bg-white py-2.5 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-500">
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <Link href="/" className="flex items-center gap-1 hover:text-slate-800 transition">
              <Home className="h-3.5 w-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">Khám phá sản phẩm</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-fpt-orange">Campus Hòa Lạc (Hola)</span>
          </nav>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Sàn giao dịch sinh viên xác thực qua @fpt.edu.vn</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & SUGGESTIONS BAR */}
      <div className="bg-white border-b border-slate-200/80 py-4 px-4 sm:px-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
            {/* Input with search icon & clear button */}
            <div className="relative flex-1 flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 focus-within:border-fpt-orange focus-within:bg-white transition">
              <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, giáo trình, phụ kiện..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Campus dropdown */}
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 shrink-0">
              <MapPin className="h-3.5 w-3.5 text-fpt-orange mr-1.5" />
              <span>CƠ SỞ HIỆN TẠI:</span>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="bg-transparent pl-1 pr-6 font-bold text-slate-900 outline-none cursor-pointer appearance-none"
              >
                <option value="hola">Hola Campus (Hà Nội)</option>
                <option value="hcm">FPT TP. Hồ Chí Minh</option>
                <option value="dn">FPT Đà Nẵng</option>
                <option value="ct">FPT Cần Thơ</option>
                <option value="qn">FPT Quy Nhơn</option>
                <option value="all">Tất cả 5 Campuses</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Search Submit CTA */}
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-fpt-orange px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-fpt-orange-hover transition active:scale-98 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Tìm kiếm</span>
            </button>
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
      </div>

      {/* 4. MAIN CONTENT CONTAINER (2-COLUMNS: SIDEBAR + RESULTS) */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-start gap-6 lg:gap-8">
          {/* Left Filter Sidebar */}
          <FilterSidebar
            resultCount={filteredPosts.length}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            selectedCampus={selectedCampus}
            onSelectCampus={(camp) => setSelectedCampus(camp)}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            selectedPricePreset={selectedPricePreset}
            onSelectPricePreset={(preset) => setSelectedPricePreset(preset)}
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

            {/* Product Cards Grid / Empty State */}
            {filteredPosts.length > 0 ? (
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
                    Không có tin đăng nào khớp với từ khóa &quot;{searchKeyword}&quot; hoặc bộ lọc cơ sở/danh mục hiện tại.
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
