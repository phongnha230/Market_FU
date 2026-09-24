import { useState, useMemo } from 'react';
import { CATEGORIES, FEED_FILTERS, GRID_PRODUCTS } from '../constants/home.constants';
import { UseHomeFeedReturn } from '../types/home.types';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useHomeFeed = (): UseHomeFeedReturn => {
  const { currentCampus, campuses, setCampusByIndex } = useCampusStore();
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [searchText, setSearchText] = useState('');

  const selectedCampusIndex = useMemo(() => {
    const idx = campuses.indexOf(currentCampus);
    return idx >= 0 ? idx : 0;
  }, [currentCampus, campuses]);

  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return GRID_PRODUCTS;
    const term = searchText.toLowerCase();
    return GRID_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.seller.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term)
    );
  }, [searchText]);

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
