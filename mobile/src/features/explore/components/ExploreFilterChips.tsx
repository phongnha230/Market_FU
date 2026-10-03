import React, { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CampusFilterOption,
  CategoryTabOption,
  PriceRangeOption,
} from '../types/explore.types';

// Memoized Campus Chip Item
interface CampusChipItemProps {
  item: CampusFilterOption;
  isActive: boolean;
  onSelect: (id: string) => void;
}

const CampusChipItem: React.FC<CampusChipItemProps> = React.memo(({ item, isActive, onSelect }) => {
  const handlePress = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.campusChip, isActive && styles.campusChipActive]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {item.icon && (
        <Ionicons
          name={item.icon as any}
          size={13}
          color={isActive ? '#FFFFFF' : '#475569'}
          style={styles.chipIcon}
        />
      )}
      <Text style={[styles.campusChipText, isActive && styles.campusChipTextActive]}>{item.label}</Text>
    </TouchableOpacity>
  );
});

// Memoized Category Tab Item
interface CategoryTabItemProps {
  item: CategoryTabOption;
  isActive: boolean;
  onSelect: (id: string) => void;
}

const CategoryTabItem: React.FC<CategoryTabItemProps> = React.memo(({ item, isActive, onSelect }) => {
  const handlePress = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.catTab, isActive && styles.catTabActive]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Text style={[styles.catTabText, isActive && styles.catTabTextActive]}>{item.label}</Text>
      {item.count !== undefined && (
        <View style={[styles.badge, isActive && styles.badgeActive]}>
          <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>{item.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

// Memoized Price Chip Item
interface PriceChipItemProps {
  item: PriceRangeOption;
  isActive: boolean;
  onSelect: (id: string) => void;
}

const PriceChipItem: React.FC<PriceChipItemProps> = React.memo(({ item, isActive, onSelect }) => {
  const handlePress = useCallback(() => {
    onSelect(isActive ? '' : item.id);
  }, [isActive, item.id, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.priceChip, isActive && styles.priceChipActive]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {item.icon && (
        <Ionicons
          name={item.icon as any}
          size={13}
          color={isActive ? '#FFFFFF' : '#F27024'}
          style={styles.chipIcon}
        />
      )}
      <Text style={[styles.priceChipText, isActive && styles.priceChipTextActive]}>{item.label}</Text>
    </TouchableOpacity>
  );
});

interface ExploreFilterChipsProps {
  campusFilters: CampusFilterOption[];
  selectedCampus: string;
  onSelectCampus: (id: string) => void;
  categoryTabs: CategoryTabOption[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  priceRanges: PriceRangeOption[];
  selectedPrice: string | null;
  onSelectPrice: (id: string) => void;
}

export const ExploreFilterChips: React.FC<ExploreFilterChipsProps> = ({
  campusFilters,
  selectedCampus,
  onSelectCampus,
  categoryTabs,
  selectedCategory,
  onSelectCategory,
  priceRanges,
  selectedPrice,
  onSelectPrice,
}) => {
  const renderCampusItem: ListRenderItem<CampusFilterOption> = useCallback(
    ({ item }) => (
      <CampusChipItem
        item={item}
        isActive={selectedCampus === item.id}
        onSelect={onSelectCampus}
      />
    ),
    [selectedCampus, onSelectCampus]
  );

  const renderCategoryItem: ListRenderItem<CategoryTabOption> = useCallback(
    ({ item }) => (
      <CategoryTabItem
        item={item}
        isActive={selectedCategory === item.id}
        onSelect={onSelectCategory}
      />
    ),
    [selectedCategory, onSelectCategory]
  );

  const renderPriceItem: ListRenderItem<PriceRangeOption> = useCallback(
    ({ item }) => (
      <PriceChipItem
        item={item}
        isActive={selectedPrice === item.id}
        onSelect={onSelectPrice}
      />
    ),
    [selectedPrice, onSelectPrice]
  );

  const keyCampus = useCallback((item: CampusFilterOption) => item.id, []);
  const keyCategory = useCallback((item: CategoryTabOption) => item.id, []);
  const keyPrice = useCallback((item: PriceRangeOption) => item.id, []);

  return (
    <View style={styles.container}>
      {/* 1. Campus Chips */}
      <FlatList<CampusFilterOption>
        horizontal
        showsHorizontalScrollIndicator={false}
        data={campusFilters}
        keyExtractor={keyCampus}
        renderItem={renderCampusItem}
        contentContainerStyle={styles.row}
      />

      {/* 2. Category Tabs */}
      <FlatList<CategoryTabOption>
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categoryTabs}
        keyExtractor={keyCategory}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.row}
      />

      {/* 3. Price Chips */}
      <FlatList<PriceRangeOption>
        horizontal
        showsHorizontalScrollIndicator={false}
        data={priceRanges}
        keyExtractor={keyPrice}
        renderItem={renderPriceItem}
        contentContainerStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 6 },
  row: { paddingHorizontal: 16, marginBottom: 8 },
  chipIcon: { marginRight: 4 },
  campusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F1F5F9', marginRight: 8 },
  campusChipActive: { backgroundColor: '#F27024' },
  campusChipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  campusChipTextActive: { color: '#FFFFFF' },
  catTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#EFF6FF', marginRight: 8 },
  catTabActive: { backgroundColor: '#1E293B' },
  catTabText: { fontSize: 11, fontWeight: '700', color: '#3B82F6' },
  catTabTextActive: { color: '#FFFFFF' },
  badge: { backgroundColor: '#DBEAFE', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8, marginLeft: 5 },
  badgeActive: { backgroundColor: '#334155' },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#1D4ED8' },
  badgeTextActive: { color: '#FFFFFF' },
  priceChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 14, backgroundColor: '#FFF7ED', marginRight: 8, borderWidth: 1, borderColor: '#FFEDD5' },
  priceChipActive: { backgroundColor: '#F27024', borderColor: '#F27024' },
  priceChipText: { fontSize: 11, fontWeight: '700', color: '#EA580C' },
  priceChipTextActive: { color: '#FFFFFF' },
});

export default ExploreFilterChips;
