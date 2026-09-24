import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import HomeHeader from '../../../components/common/HomeHeader';
import ProductCard from '../../../components/common/ProductCard';
import HomeSearchBar from '../components/HomeSearchBar';
import CampusSelector from '../components/CampusSelector';
import CategoryGrid from '../components/CategoryGrid';
import KycBanner from '../components/KycBanner';
import FeedHeader from '../components/FeedHeader';
import FeedFilterChips from '../components/FeedFilterChips';
import VovinamBanner from '../components/VovinamBanner';
import SafePointWidget from '../components/SafePointWidget';
import useHomeFeed from '../hooks/useHomeFeed';
import { useAuthStore } from '../../../stores/useAuthStore';
import { HomeScreenProps } from '../types/home.types';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onTabChange,
  onProductPress,
  onPostPress,
}) => {
  const { user } = useAuthStore();
  const {
    selectedCampus,
    setSelectedCampus,
    selectedFilter,
    setSelectedFilter,
    searchText,
    setSearchText,
    campuses,
    categories,
    feedFilters,
    products,
  } = useHomeFeed();

  return (
    <View style={styles.screen}>
      <HomeHeader userName={user?.name || 'Quân'} campusName={campuses[selectedCampus] || 'HÒA LẠC'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomeSearchBar value={searchText} onChangeText={setSearchText} />
        <CampusSelector campuses={campuses} selectedIndex={selectedCampus} onSelect={setSelectedCampus} />
        <CategoryGrid
          categories={categories}
          onCategoryPress={(cat) => {
            if (cat.id === '5' && onPostPress) onPostPress();
            else if (cat.id === '5' && onTabChange) onTabChange('post');
          }}
        />
        <KycBanner />
        <FeedHeader />
        <FeedFilterChips filters={feedFilters} selectedIndex={selectedFilter} onSelect={setSelectedFilter} />

        <View style={styles.productGrid}>
          {products.map((item) => (
            <ProductCard
              key={item.id}
              {...item}
              onPress={() => onProductPress && onProductPress(item.id)}
            />
          ))}
        </View>

        <VovinamBanner onPress={() => onProductPress && onProductPress('vovinam-uniform')} />
        <SafePointWidget />
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 24 },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bottomSpacer: { height: 30 },
});

export default HomeScreen;
