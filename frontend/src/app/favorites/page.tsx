'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import FavoriteFilterBar from '@/components/favorites/FavoriteFilterBar';
import FavoriteCard from '@/components/favorites/FavoriteCard';
import FavoriteSidebar from '@/components/favorites/FavoriteSidebar';
import FavoriteModals from '@/components/favorites/FavoriteModals';
import { useFavoriteStore, FavoriteItem } from '@/stores/favoriteStore';
import { useUserStore } from '@/stores/userStore';
import { useMarket } from '@/context/MarketContext';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Bell,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function FavoritesPage() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const items = useFavoriteStore((state) => state.favorites);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  const clearSoldFavorites = useFavoriteStore((state) => state.clearSoldFavorites);
  const addPriceAlert = useFavoriteStore((state) => state.addPriceAlert);
  const { showToast } = useMarket();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'discount'>('recent');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [chattingItem, setChattingItem] = useState<FavoriteItem | null>(null);
  const [previewItem, setPreviewItem] = useState<FavoriteItem | null>(null);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);

  // Toggle favorite / Remove
  const handleToggleFavorite = (itemId: string, title: string) => {
    removeFavorite(itemId);
    showToast(`💔 Đã bỏ lưu "${title.slice(0, 30)}..." khỏi Yêu thích`, 'info');
  };

  // Clear sold/reserved
  const handleCleanSold = () => {
    const count = clearSoldFavorites();
    if (count === 0) {
      showToast('✨ Tất cả sản phẩm trong danh sách hiện đều còn hàng!', 'info');
    } else {
      showToast(`🧹 Đã dọn ${count} món đã hẹn cọc/đã bán khỏi danh sách!`, 'success');
    }
  };

  // Send quick chat message
  const handleSendChat = (msg: string) => {
    if (!chattingItem) return;
    showToast(`📨 Đã gửi tin nhắn đến bạn ${chattingItem.seller.name}: "${msg}"`, 'success');
    setChattingItem(null);
  };

  // Deal Alert submit
  const handleSubscribeAlert = (keyword: string, price: string) => {
    const cleanPrice = Number(price.replace(/[^0-9]/g, '')) || 500000;
    addPriceAlert(keyword, cleanPrice);
    showToast(
      `🔔 Đã kích hoạt Deal Alert cho "${keyword}" với ngân sách ≤ ${price} đ. Đã lưu vào bộ nhớ tài khoản!`,
      'success'
    );
    setIsPriceAlertOpen(false);
  };

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesTag = item.tag ? item.tag.toLowerCase().includes(q) : false;
          const matchesLoc = item.location.toLowerCase().includes(q);
          const matchesSeller = item.seller.name.toLowerCase().includes(q);
          if (!matchesTitle && !matchesTag && !matchesLoc && !matchesSeller) {
            return false;
          }
        }

        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        if (statusFilter === 'available' && item.status !== 'available') {
          return false;
        }
        if (statusFilter === 'reserved' && item.status !== 'reserved') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'discount') {
          const discA = a.originalPrice ? a.originalPrice - a.price : 0;
          const discB = b.originalPrice ? b.originalPrice - b.price : 0;
          return discB - discA;
        }
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      });
  }, [items, searchQuery, selectedCategory, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between py-4 sm:py-6">
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Compact in-container Header with Back button */}
        <CompactHeader
          showBackButton={true}
          backHref="/"
          breadcrumbs={[
            { label: 'Mục yêu thích & Đã lưu' },
          ]}
          activeTab="favorites"
        />

        {/* 2. PAGE HEADER ROW */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tin đã lưu & Yêu thích
              </h1>
              <Badge variant="outline" className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-fpt-orange border border-orange-200/80 hover:bg-orange-50">
                {items.length} món đang theo dõi
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
              Cập nhật biến động giá, trạng thái còn hàng và giữ liên lạc nhanh với các bạn FPTUers đang nhượng lại.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCleanSold}
              className="h-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-slate-500" />
              <span>Dọn tin đã bán</span>
            </Button>

            <Button
              type="button"
              onClick={() => setIsPriceAlertOpen(true)}
              className="h-auto inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-fpt-orange-hover hover:shadow transition active:scale-95 cursor-pointer"
            >
              <Bell className="h-4 w-4 stroke-[2.5]" />
              <span>Đặt thông báo giá (Price Alert)</span>
            </Button>
          </div>
        </div>

        {/* 3. ALERT TICKER BANNER */}
        <Card className="mb-6 rounded-2xl border border-orange-100 bg-orange-50/40 p-3 px-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Flame className="h-4 w-4 text-fpt-orange shrink-0 fill-fpt-orange/20" />
              <span>
                <strong className="font-semibold text-slate-900">Tin sốt Hola:</strong> Combo CSL201 + MAS291 vừa được giảm{' '}
                <strong className="font-extrabold text-rose-600">20.000 đ</strong> cách đây 15 phút.
              </span>
            </div>
            <Badge variant="outline" className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 rounded-full px-3 py-1 self-start md:self-auto text-xs hover:bg-emerald-50/90">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>100% người bán đã xác thực mã số sinh viên FPT</span>
            </Badge>
          </div>
        </Card>

        {/* 4. SEARCH & FILTER TOOLBAR */}
        <FavoriteFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* 5. META INFO ROW */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Hiển thị {filteredItems.length} trong {items.length} mặt hàng được ghim ưu tiên
          </span>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Cập nhật trực tiếp từ Hola Campus</span>
          </div>
        </div>

        {/* 6. MAIN CONTENT LAYOUT (2 COLUMNS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: PRODUCT CARDS (8 COLS) */}
          <div className="lg:col-span-8">
            {!isLoggedIn ? (
              <Card className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/20 p-12 text-center shadow-none">
                <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-fpt-orange mb-3">
                  <Heart className="h-7 w-7 fill-fpt-orange" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Bạn chưa đăng nhập tài khoản
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
                  Đăng nhập để xem danh sách sản phẩm yêu thích được lưu riêng biệt theo tài khoản của bạn.
                </p>
                <Button
                  asChild
                  className="h-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-fpt-orange px-5 py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover transition shadow-sm cursor-pointer"
                >
                  <Link href="/login">Đăng nhập ngay</Link>
                </Button>
              </Card>
            ) : filteredItems.length === 0 ? (
              <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-none">
                <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-fpt-orange mb-3">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Không tìm thấy sản phẩm yêu thích nào
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm để xem các món đồ bạn đã lưu trước đó.
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setStatusFilter('all');
                  }}
                  className="h-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Đặt lại bộ lọc
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {filteredItems.map((item) => (
                  <FavoriteCard
                    key={item.id}
                    item={item}
                    onToggleFavorite={handleToggleFavorite}
                    onChat={(it) => setChattingItem(it)}
                    onPreview={(it) => setPreviewItem(it)}
                    onFindSimilar={(cat) => {
                      setSelectedCategory(cat);
                      showToast('🔍 Đang lọc các món tương tự tại Hola Campus...', 'info');
                    }}
                  />
                ))}
              </div>
            )}

            {/* Pagination Footer */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-4 text-xs text-slate-500 font-medium">
              <div>
                Trang {currentPage} / 2 (Tổng cộng {items.length} sản phẩm trong Wishlist)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer',
                    currentPage === 1
                      ? 'bg-fpt-orange text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer',
                    currentPage === 2
                      ? 'bg-fpt-orange text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Đang tải thêm danh sách sản phẩm...', 'info')}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  3
                </button>
                <button
                  type="button"
                  disabled={currentPage === 2}
                  onClick={() => setCurrentPage(2)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 4 SIDEBAR WIDGETS (4 COLS) */}
          <FavoriteSidebar
            onSubscribeAlert={handleSubscribeAlert}
            onShowToast={(msg) => showToast(msg, 'info')}
          />
        </div>
      </main>

      {/* MODALS */}
      <FavoriteModals
        chattingItem={chattingItem}
        onCloseChat={() => setChattingItem(null)}
        onSendChat={handleSendChat}
        previewItem={previewItem}
        onClosePreview={() => setPreviewItem(null)}
        onChatFromPreview={(it) => {
          setPreviewItem(null);
          setChattingItem(it);
        }}
        isPriceAlertOpen={isPriceAlertOpen}
        onClosePriceAlert={() => setIsPriceAlertOpen(false)}
        onSubmitPriceAlert={handleSubscribeAlert}
      />

      <Footer />
    </div>
  );
}
