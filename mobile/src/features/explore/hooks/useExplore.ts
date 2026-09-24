import { useState, useMemo } from 'react';
import {
  CAMPUS_FILTERS,
  CATEGORY_TABS,
  PRICE_RANGES,
  EXPLORE_PRODUCTS,
} from '../constants/explore.constants';
import { ExploreProduct } from '../types/explore.types';
import { useCampusStore } from '../../../stores/useCampusStore';

export const useExplore = () => {
  const { currentCampus } = useCampusStore();
  const [searchText, setSearchText] = useState('CSL201');
  const [selectedCampus, setSelectedCampus] = useState('hol');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterSafeHandoff, setFilterSafeHandoff] = useState(false);
  const [filterTestable, setFilterTestable] = useState(false);

  const filteredProducts = useMemo(() => {
    return EXPLORE_PRODUCTS.filter((product) => {
      if (searchText.trim()) {
        const term = searchText.toLowerCase();
        const matches =
          product.title.toLowerCase().includes(term) ||
          product.seller.toLowerCase().includes(term) ||
          product.location.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (filterVerified && !product.sellerBadge) return false;
      if (filterSafeHandoff && !product.greenTag) return false;
      return true;
    });
  }, [searchText, filterVerified, filterSafeHandoff]);

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
