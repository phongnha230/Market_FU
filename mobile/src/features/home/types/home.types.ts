import { ProductCardProps } from '../../../components/common/ProductCard';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
}

export interface HomeScreenProps {
  onTabChange?: (tab: 'home' | 'explore' | 'post' | 'chat' | 'profile') => void;
  onProductPress?: (productId: string) => void;
  onPostPress?: () => void;
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
