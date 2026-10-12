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

  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
    if (route.params?.campus) {
      setSelectedCampus(route.params.campus);
    }
    if (route.params?.searchKeyword !== undefined) {
      setSearchText(route.params.searchKeyword);
    }
  }, [route.params]);

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
        const cLower = (product.campus || '').toLowerCase();
        const locLower = (product.safePoint || '').toLowerCase();
        const combined = `${cLower} ${locLower}`;

        if (selectedCampus === 'hol' && !combined.includes('hòa lạc') && !combined.includes('hol') && !combined.includes('alpha') && !combined.includes('beta')) return false;
        if (selectedCampus === 'hcm' && !combined.includes('hồ chí minh') && !combined.includes('hcm') && !combined.includes('sài gòn') && !combined.includes('quận 9')) return false;
        if (selectedCampus === 'dad' && !combined.includes('đà nẵng') && !combined.includes('dad')) return false;
        if (selectedCampus === 'ct' && !combined.includes('cần thơ') && !combined.includes('ct') && !combined.includes('gamma')) return false;
        if (selectedCampus === 'qn' && !combined.includes('quy nhơn') && !combined.includes('qn') && !combined.includes('ai hub')) return false;
      }

      // 3. Lọc theo danh mục
      if (selectedCategory && selectedCategory !== 'all') {
        const cat = selectedCategory.toLowerCase();
        const prodCat = (product.category || '').toLowerCase();
        const prodCatType = (product.categoryType || '').toLowerCase();
        const prodTitle = product.title.toLowerCase();

        if (cat === 'it') {
          const isIt = prodCat === 'it' || prodCat === 'electronics' || prodCatType === 'electronics' || prodTitle.includes('phím') || prodTitle.includes('chuột') || prodTitle.includes('màn hình');
          if (!isIt) return false;
        } else if (cat === 'books') {
          const isBook = prodCat === 'books' || prodCat === 'book' || prodCatType === 'books' || prodTitle.includes('giáo trình') || prodTitle.includes('sách');
          if (!isBook) return false;
        } else if (cat === 'dom') {
          const isDom = prodCat === 'dom' || prodCat === 'dorm_item' || prodCatType === 'dorm_item' || prodTitle.includes('ktx') || prodTitle.includes('nồi') || prodTitle.includes('tủ lạnh') || prodTitle.includes('bàn');
          if (!isDom) return false;
        } else if (cat === 'vovinam') {
          const isVovinam = prodCat === 'vovinam' || prodCat === 'clothing' || prodCatType === 'clothing' || prodTitle.includes('vovinam') || prodTitle.includes('võ phục');
          if (!isVovinam) return false;
        }
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
