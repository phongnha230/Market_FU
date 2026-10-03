import { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, FEED_FILTERS, GRID_PRODUCTS } from '../constants/home.constants';
import { UseHomeFeedReturn } from '../types/home.types';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useProductStore } from '../../../stores/productStore';
import { ProductCardProps } from '../../../components/common/ProductCard';

export const useHomeFeed = (initialSearch?: string): UseHomeFeedReturn => {
  const { currentCampus, campuses, setCampusByIndex } = useCampusStore();
  const { user } = useAuthStore();
  const { products: storeProducts, fetchProducts } = useProductStore();
  const [selectedFilter, setSelectedFilter] = useState(0);

  // Lưu trữ previous initialSearch để cập nhật state trong render theo chuẩn React
  const [prevInitialSearch, setPrevInitialSearch] = useState(initialSearch);
  const [searchText, setSearchText] = useState(initialSearch || '');

  if (initialSearch !== prevInitialSearch) {
    setPrevInitialSearch(initialSearch);
    setSearchText(initialSearch || '');
  }

  // Tự động tải sản phẩm từ Backend khi đổi Campus hoặc khi mount
  useEffect(() => {
    fetchProducts(currentCampus).catch(() => {});
  }, [currentCampus, fetchProducts]);

  // Tìm kiếm thông minh Meilisearch Engine có Debounce (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchText.trim();
      if (!trimmed) {
        fetchProducts(currentCampus).catch(() => {});
        return;
      }

      const isHashtag = trimmed.startsWith('#');
      const cleanKeyword = isHashtag ? trimmed.replace(/^#+/, '').trim() : trimmed;

      fetchProducts({
        campus: currentCampus,
        search: isHashtag ? undefined : cleanKeyword,
        hashtag: isHashtag ? cleanKeyword : undefined,
      }).catch(() => {});
    }, 350);

    return () => clearTimeout(timer);
  }, [searchText, currentCampus, fetchProducts]);

  const selectedCampusIndex = useMemo(() => {
    const idx = campuses.indexOf(currentCampus);
    return idx >= 0 ? idx : 0;
  }, [currentCampus, campuses]);

  // Kết hợp sản phẩm từ store (bao gồm backend & tin mới đăng)
  const combinedProducts: (ProductCardProps & { hashtags?: string[] })[] = useMemo(() => {
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price.toLocaleString('vi-VN'),
        location: `📍 ${p.campus || currentCampus} • ${p.safePoint || 'Safe-Point'}`,
        seller: p.sellerName || 'Sinh viên FPT',
        sellerYear: p.sellerCohort || 'K17',
        isVerified: p.sellerIsVerified ?? true,
        image: p.images?.[0] || require('../../../../assets/products/monitor-dell-24.jpg'),
        badge: p.condition || 'Like New',
        badgeVariant: 'white' as const,
        hashtags: p.hashtags,
      }));
    }
    return GRID_PRODUCTS;
  }, [storeProducts, currentCampus]);

  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return combinedProducts;
    const term = searchText.toLowerCase().trim();
    const cleanTerm = term.replace(/^#+/, '');

    return combinedProducts.filter((p: any) => {
      const matchTitle = p.title.toLowerCase().includes(cleanTerm);
      const matchSeller = p.seller.toLowerCase().includes(cleanTerm);
      const matchLocation = p.location.toLowerCase().includes(cleanTerm);
      const matchHashtags =
        Array.isArray(p.hashtags) &&
        p.hashtags.some((t: string) => t.toLowerCase().includes(cleanTerm));

      return matchTitle || matchSeller || matchLocation || matchHashtags;
    });
  }, [searchText, combinedProducts]);

  return {
    selectedCampus: selectedCampusIndex,
    setSelectedCampus: setCampusByIndex,
    selectedFilter,
    setSelectedFilter,
    searchText,
    setSearchText,
    campuses: [...campuses],
    categories: CATEGORIES,
    feedFilters: FEED_FILTERS,
    products: filteredProducts,
  };
};

export default useHomeFeed;
