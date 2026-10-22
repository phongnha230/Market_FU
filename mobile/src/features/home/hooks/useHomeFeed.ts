import { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, FEED_FILTERS, GRID_PRODUCTS } from '../constants/home.constants';
import { UseHomeFeedReturn } from '../types/home.types';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useProductStore } from '../../../stores/productStore';
import { ProductCardProps } from '../../../components/common/ProductCard';
import { resolveProductImage } from '../../../lib/imageResolver';
import { socketMobileService } from '../../../services/socketMobileService';
import { adaptBackendProductToMobile } from '../../../services/productMobileService';
import { toBackendCampus } from '../../../lib/backendMappers';

export const useHomeFeed = (initialSearch?: string): UseHomeFeedReturn => {
  const { currentCampus, campuses, setCampusByIndex } = useCampusStore();
  const { user } = useAuthStore();
  const { products: storeProducts, fetchProducts, addProductFromRemote, updateProduct } = useProductStore();
  const [selectedFilter, setSelectedFilter] = useState(0);

  // Lưu trữ previous initialSearch để cập nhật state trong render theo chuẩn React
  const [prevInitialSearch, setPrevInitialSearch] = useState(initialSearch);
  const [searchText, setSearchText] = useState(initialSearch || '');

  if (initialSearch !== prevInitialSearch) {
    setPrevInitialSearch(initialSearch);
    setSearchText(initialSearch || '');
  }

  // Tự động tải sản phẩm từ Backend để đồng bộ, tự động cập nhật khi đổi cơ sở
  useEffect(() => {
    fetchProducts().catch(() => {});
  }, [fetchProducts, currentCampus]);

  // Lắng nghe Realtime Socket: Khi Web (hoặc thiết bị khác) đăng/cập nhật sản phẩm
  useEffect(() => {
    const unsubCreated = socketMobileService.onProductCreated((rawProduct) => {
      try {
        console.log('⚡ [Mobile Realtime]: Nhận bài đăng mới từ Web/Hệ thống:', rawProduct?.title);
        const adapted = adaptBackendProductToMobile(rawProduct);
        addProductFromRemote(adapted);
      } catch (e: any) {
        console.log('⚠️ [Mobile Socket parse created error]:', e?.message);
      }
    });

    const unsubUpdated = socketMobileService.onProductUpdated((rawProduct) => {
      try {
        const adapted = adaptBackendProductToMobile(rawProduct);
        updateProduct(adapted.id, adapted);
      } catch (e: any) {
        console.log('⚠️ [Mobile Socket parse updated error]:', e?.message);
      }
    });

    return () => {
      unsubCreated();
      unsubUpdated();
    };
  }, [addProductFromRemote, updateProduct]);

  // Tìm kiếm thông minh Meilisearch Engine có Debounce (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchText.trim();
      if (!trimmed) {
        fetchProducts().catch(() => {});
        return;
      }

      const isHashtag = trimmed.startsWith('#');
      const cleanKeyword = isHashtag ? trimmed.replace(/^#+/, '').trim() : trimmed;

      fetchProducts({
        search: isHashtag ? undefined : cleanKeyword,
        hashtag: isHashtag ? cleanKeyword : undefined,
      }).catch(() => {});
    }, 350);

    return () => clearTimeout(timer);
  }, [searchText, fetchProducts]);

  const selectedCampusIndex = useMemo(() => {
    const idx = campuses.indexOf(currentCampus);
    return idx >= 0 ? idx : 0;
  }, [currentCampus, campuses]);

  // Kết hợp sản phẩm từ store (bao gồm backend & tin mới đăng)
  const combinedProducts: (ProductCardProps & { hashtags?: string[] })[] = useMemo(() => {
    if (storeProducts && Array.isArray(storeProducts) && storeProducts.length > 0) {
      return storeProducts.filter(Boolean).map((p, idx) => {
        const numPrice = Number(p?.price) || 0;
        const numOrigPrice = Number(p?.originalPrice) || 0;
        const hasDiscount = Boolean(numOrigPrice && numOrigPrice > numPrice);
        const discountPercent = hasDiscount
          ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
          : undefined;

        return {
          id: String(p?.id || `item_${idx}`),
          title: String(p?.title || 'Sản phẩm FPT'),
          price: numPrice.toLocaleString('vi-VN'),
          originalPrice: hasDiscount ? numOrigPrice.toLocaleString('vi-VN') : undefined,
          discountBadge: hasDiscount ? `-${discountPercent}%` : undefined,
          location: `📍 ${p?.campus || 'FPT'} • ${p?.safePoint || 'Safe-Point'}`,
          seller: String(p?.sellerName || 'Sinh viên FPT'),
          sellerYear: p?.sellerCohort || 'K17',
          isVerified: p?.sellerIsVerified ?? true,
          image: resolveProductImage(p?.images?.[0]),
          badge: p?.condition || 'Like New',
          badgeVariant: 'white' as const,
          viewsCount: Number(p?.viewsCount) || 0,
          likesCount: Number(p?.likesCount) || 0,
          hashtags: Array.isArray(p?.hashtags) ? p.hashtags : [],
          category: p?.category,
          categoryType: p?.categoryType,
          description: p?.description,
          campus: p?.campus,
        };
      });
    }
    return [];
  }, [storeProducts]);

  const filteredProducts = useMemo(() => {
    let list = [...combinedProducts];

    // Helper kiểm tra sản phẩm có thuộc Campus hiện tại hay không
    const isMatchCampus = (p: typeof list[0]) => {
      if (!currentCampus || currentCampus === 'TẤT CẢ') {
        return true;
      }
      const targetCode = toBackendCampus(currentCampus);
      const prodCode = toBackendCampus(p.campus);
      if (targetCode && prodCode) {
        return targetCode === prodCode;
      }

      const campLower = currentCampus.toLowerCase();
      const combined = `${p.campus || ''} ${p.location || ''} ${p.title || ''}`.toLowerCase();

      if (targetCode === 'HOL' || campLower.includes('hòa lạc') || campLower.includes('hol')) {
        return (
          combined.includes('hòa lạc') ||
          combined.includes('hoa lac') ||
          combined.includes('hol') ||
          combined.includes('dom') ||
          combined.includes('alpha') ||
          combined.includes('beta')
        );
      }
      if (targetCode === 'QN' || campLower.includes('quy nhơn') || campLower.includes('qn')) {
        return combined.includes('quy nhơn') || combined.includes('quy nhon') || combined.includes('qn') || combined.includes('ai hub');
      }
      if (targetCode === 'CT' || campLower.includes('cần thơ') || campLower.includes('ct')) {
        return combined.includes('cần thơ') || combined.includes('can tho') || combined.includes('ct') || combined.includes('gamma');
      }
      if (targetCode === 'HCM' || campLower.includes('hồ chí minh') || campLower.includes('hcm') || campLower.includes('tp.hcm')) {
        return (
          combined.includes('hồ chí minh') ||
          combined.includes('hcm') ||
          combined.includes('sài gòn') ||
          combined.includes('quận 9')
        );
      }
      if (targetCode === 'DAD' || campLower.includes('đà nẵng') || campLower.includes('dad')) {
        return combined.includes('đà nẵng') || combined.includes('da nang') || combined.includes('dad');
      }
      return combined.includes(campLower);
    };

    // Khi người dùng chọn Campus cụ thể (HÒA LẠC, ĐÀ NẴNG, TP.HCM,...), lọc chính xác sản phẩm thuộc campus đó
    if (currentCampus && currentCampus !== 'TẤT CẢ') {
      list = list.filter(isMatchCampus);
    }

    // Lọc theo Feed Filter phụ (TẤT CẢ / GẦN BẠN / ĐỒ KTX / PASS RẺ)
    if (selectedFilter === 1) {
      // Gần bạn / Safe-point: trạm Safe-point sảnh
      list = list.filter((p) => p.location.includes('Safe-Point') || p.location.includes('Sảnh') || p.location.includes('Dom') || p.location.includes('Hub'));
    } else if (selectedFilter === 2) {
      // Đồ KTX
      list = list.filter((p: any) =>
        (p.hashtags && p.hashtags.some((t: string) => t.toLowerCase().includes('ktx') || t.toLowerCase().includes('dorm'))) ||
        p.title.toLowerCase().includes('ktx') ||
        p.location.toLowerCase().includes('dom') ||
        p.title.toLowerCase().includes('tủ lạnh') ||
        p.title.toLowerCase().includes('nồi') ||
        p.title.toLowerCase().includes('bàn')
      );
    } else if (selectedFilter === 3) {
      // Pass rẻ (< 100k)
      list = list.filter((p) => {
        const numPrice = parseInt(p.price.replace(/[^\d]/g, ''), 10) || 0;
        return numPrice <= 100000;
      });
    }

    if (!searchText.trim()) return list;
    const term = searchText.toLowerCase().trim();
    const cleanTerm = term.replace(/^#+/, '');

    return list.filter((p: any) => {
      const matchTitle = p.title.toLowerCase().includes(cleanTerm);
      const matchSeller = p.seller.toLowerCase().includes(cleanTerm);
      const matchLocation = p.location.toLowerCase().includes(cleanTerm);
      const matchHashtags =
        Array.isArray(p.hashtags) &&
        p.hashtags.some((t: string) => t.toLowerCase().includes(cleanTerm));

      return matchTitle || matchSeller || matchLocation || matchHashtags;
    });
  }, [searchText, combinedProducts, selectedFilter, currentCampus]);

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
