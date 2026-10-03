import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ExploreSearchBar from '../components/ExploreSearchBar';
import ExploreFilterChips from '../components/ExploreFilterChips';
import VerificationFilters from '../components/VerificationFilters';
import ExploreProductCard from '../components/ExploreProductCard';
import useExplore from '../hooks/useExplore';
import { ExploreScreenProps, ExploreProduct } from '../types/explore.types';

// Memoized row component to avoid inline callback in renderItem
interface ExploreRowItemProps {
  item: ExploreProduct;
  onPress?: (id: string) => void;
}

const ExploreRowItem: React.FC<ExploreRowItemProps> = React.memo(({ item, onPress }) => {
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(item.id);
    }
  }, [item.id, onPress]);

  return <ExploreProductCard product={item} onPress={handlePress} />;
});

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onGoBack, onProductPress }) => {
  const insets = useSafeAreaInsets();
  const {
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
    campusFilters,
    categoryTabs,
    priceRanges,
    products,
    currentCampus,
  } = useExplore();

  const handleClearText = useCallback(() => {
    setSearchText('');
  }, [setSearchText]);

  const handleToggleVerified = useCallback(() => {
    setFilterVerified((prev) => !prev);
  }, [setFilterVerified]);

  const handleToggleSafeHandoff = useCallback(() => {
    setFilterSafeHandoff((prev) => !prev);
  }, [setFilterSafeHandoff]);

  const handleToggleTestable = useCallback(() => {
    setFilterTestable((prev) => !prev);
  }, [setFilterTestable]);

  const renderHeader = useCallback(() => (
    <View>
      <ExploreSearchBar
        searchText={searchText}
        onChangeText={setSearchText}
        onGoBack={onGoBack}
        onClearText={handleClearText}
      />
      <ExploreFilterChips
        campusFilters={campusFilters}
        selectedCampus={selectedCampus}
        onSelectCampus={setSelectedCampus}
        categoryTabs={categoryTabs}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        priceRanges={priceRanges}
        selectedPrice={selectedPrice}
        onSelectPrice={setSelectedPrice}
      />
      <VerificationFilters
        filterVerified={filterVerified}
        onToggleVerified={handleToggleVerified}
        filterSafeHandoff={filterSafeHandoff}
        onToggleSafeHandoff={handleToggleSafeHandoff}
        filterTestable={filterTestable}
        onToggleTestable={handleToggleTestable}
      />
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          Tìm thấy <Text style={styles.highlight}>{products.length} món đồ</Text> tại {currentCampus}
        </Text>
      </View>
    </View>
  ), [
    searchText,
    setSearchText,
    onGoBack,
    handleClearText,
    campusFilters,
    selectedCampus,
    setSelectedCampus,
    categoryTabs,
    selectedCategory,
    setSelectedCategory,
    priceRanges,
    selectedPrice,
    setSelectedPrice,
    filterVerified,
    handleToggleVerified,
    filterSafeHandoff,
    handleToggleSafeHandoff,
    filterTestable,
    handleToggleTestable,
    products.length,
    currentCampus,
  ]);

  const renderItem: ListRenderItem<ExploreProduct> = useCallback(
    ({ item }) => <ExploreRowItem item={item} onPress={onProductPress} />,
    [onProductPress]
  );

  const keyExtractor = useCallback((item: ExploreProduct) => item.id, []);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      <FlatList<ExploreProduct>
        data={products}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  listContent: { paddingBottom: 85 },
  resultsHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  resultsTitle: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  highlight: { color: '#F27024', fontWeight: '900' },
});

export default ExploreScreen;
