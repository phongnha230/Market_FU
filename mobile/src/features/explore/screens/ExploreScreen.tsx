import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ExploreSearchBar from '../components/ExploreSearchBar';
import ExploreFilterChips from '../components/ExploreFilterChips';
import VerificationFilters from '../components/VerificationFilters';
import ExploreProductCard from '../components/ExploreProductCard';
import useExplore from '../hooks/useExplore';
import { ExploreScreenProps, ExploreProduct } from '../types/explore.types';

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

  const renderHeader = () => (
    <View>
      <ExploreSearchBar
        searchText={searchText}
        onChangeText={setSearchText}
        onGoBack={onGoBack}
        onClearText={() => setSearchText('')}
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
        onToggleVerified={() => setFilterVerified(!filterVerified)}
        filterSafeHandoff={filterSafeHandoff}
        onToggleSafeHandoff={() => setFilterSafeHandoff(!filterSafeHandoff)}
        filterTestable={filterTestable}
        onToggleTestable={() => setFilterTestable(!filterTestable)}
      />
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          Tìm thấy <Text style={styles.highlight}>{products.length} món đồ</Text> tại {currentCampus}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      <FlatList<ExploreProduct>
        data={products}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ExploreProductCard
            product={item}
            onPress={() => onProductPress && onProductPress(item.id)}
          />
        )}
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
