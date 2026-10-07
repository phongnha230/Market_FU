import { useState, useMemo, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  CAMPUS_FILTERS,
  CATEGORY_TABS,
  PRICE_RANGES,
} from '../constants/explore.constants';
import { ExploreProduct } from '../types/explore.types';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useProductStore, ProductItem } from '../../../stores/productStore';
import { resolveProductImage } from '../../../lib/imageResolver';

const mapProductToExplore = (p: ProductItem): ExploreProduct => {
  const imgSource = resolveProductImage(p.images?.[0]);

  return {
    id: p.id,
    title: p.title,
    price: (p.price || 0).toLocaleString('vi-VN') + ' đ',
    badge: p.condition || 'Đã sử dụng',
    badgeColor: p.condition?.includes('Mới') ? '#059669' : '#2563EB',
    seller: p.sellerName || 'Sinh viên FPT',
    sellerBadge: p.sellerIsVerified ? 'SV FPT' : undefined,
    rating: String(p.sellerRating || '5.0'),
    location: `📍 ${p.campus} • ${p.safePoint || 'Safe-Point'}`,
    locationDetail: p.safePoint,
    image: imgSource,
    greenTag: p.campusShipEnabled ? 'Giao dịch an toàn' : undefined,
  };
};

export const useExplore = () => {
  const route = useRoute<any>();
  const { currentCampus } = useCampusStore();
  const { products: storeProducts, fetchProducts } = useProductStore();

  const [searchText, setSearchText] = useState<string>(route.params?.searchKeyword || '');
  const [selectedCampus, setSelectedCampus] = useState<string>(route.params?.campus || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(route.params?.category || 'all');
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [filterSafeHandoff, setFilterSafeHandoff] = useState<boolean>(false);
  const [filterTestable, setFilterTestable] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts().catch(() => {});
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const list = storeProducts.filter((product) => {
      // 1. Tìm kiếm văn bản (Tiêu đề, người bán, điểm hẹn, hashtag)
      if (searchText.trim()) {
        const term = searchText.toLowerCase().trim();
        const matches =
          product.title.toLowerCase().includes(term) ||
          product.sellerName.toLowerCase().includes(term) ||
          (product.safePoint && product.safePoint.toLowerCase().includes(term)) ||
          (product.hashtags && product.hashtags.some((h) => h.toLowerCase().includes(term)));
        if (!matches) return false;
      }

      // 2. Lọc theo Campus
      if (selectedCampus && selectedCampus !== 'all') {
        const cLower = product.campus.toLowerCase();
        if (selectedCampus === 'hol' && !cLower.includes('hòa lạc') && !cLower.includes('hol')) return false;
        if (selectedCampus === 'hcm' && !cLower.includes('hồ chí minh') && !cLower.includes('hcm')) return false;
        if (selectedCampus === 'dad' && !cLower.includes('đà nẵng') && !cLower.includes('dad')) return false;
        if (selectedCampus === 'ct' && !cLower.includes('cần thơ') && !cLower.includes('ct')) return false;
        if (selectedCampus === 'qn' && !cLower.includes('quy nhơn') && !cLower.includes('qn')) return false;
      }

      // 3. Lọc theo danh mục
      if (selectedCategory && selectedCategory !== 'all') {
        if (selectedCategory === 'it' && product.category !== 'it' && product.category !== 'electronics') return false;
        if (selectedCategory === 'books' && product.category !== 'books' && product.category !== 'book') return false;
        if (selectedCategory === 'dom' && product.category !== 'dom') return false;
        if (selectedCategory === 'vovinam' && product.category !== 'vovinam') return false;
      }

      // 4. Lọc theo tầm giá
      if (selectedPrice) {
        const p = product.price;
        if (selectedPrice === 'under100' && p >= 100000) return false;
        if (selectedPrice === '100to500' && (p < 100000 || p > 500000)) return false;
        if (selectedPrice === '500to2m' && (p < 500000 || p > 2000000)) return false;
        if (selectedPrice === 'free' && p !== 0) return false;
      }

      // 5. Lọc người bán đã xác thực & giao dịch an toàn
      if (filterVerified && !product.sellerIsVerified) return false;
      if (filterSafeHandoff && !product.campusShipEnabled) return false;

      return true;
    });

    return list.map(mapProductToExplore);
  }, [
    storeProducts,
    searchText,
    selectedCampus,
    selectedCategory,
    selectedPrice,
    filterVerified,
    filterSafeHandoff,
  ]);

  return {
    searchText,
    setSearchText,
    selectedCampus,
    setSelectedCampus,
    selectedCategory,
    setSelectedCategory,
    selectedPrice,
    setSelectedPrice,
    filterVerified,
    setFilterVerified,
    filterSafeHandoff,
    setFilterSafeHandoff,
    filterTestable,
    setFilterTestable,
    campusFilters: CAMPUS_FILTERS,
    categoryTabs: CATEGORY_TABS,
    priceRanges: PRICE_RANGES,
    products: filteredProducts,
    currentCampus,
  };
};

export default useExplore;
