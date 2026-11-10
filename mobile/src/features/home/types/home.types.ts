import { ProductCardProps } from '../../../components/common/ProductCard';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

export interface HomeScreenProps {
  onProductPress?: (productId: string) => void;
}

export interface UseHomeFeedReturn {
  selectedCampus: number;
  setSelectedCampus: (index: number) => void;
  selectedFilter: number;
  setSelectedFilter: (index: number) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  campuses: string[];
  categories: CategoryItem[];
  feedFilters: string[];
  products: ProductCardProps[];
}
