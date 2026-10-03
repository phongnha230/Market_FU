import React, { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CampusFilterOption,
  CategoryTabOption,
  PriceRangeOption,
} from '../types/explore.types';

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
  const renderCampusItem = useCallback(
    ({ item }: { item: CampusFilterOption }) => {
      const active = selectedCampus === item.id;
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.campusChip, active && styles.campusChipActive]}
          activeOpacity={0.8}
          onPress={() => onSelectCampus(item.id)}
        >
          {item.icon && (
            <Ionicons
              name={item.icon as any}
              size={13}
              color={active ? '#FFFFFF' : '#475569'}
              style={{ marginRight: 4 }}
            />
          )}
          <Text style={[styles.campusChipText, active && styles.campusChipTextActive]}>{item.label}</Text>
        </TouchableOpacity>
      );
    },
    [selectedCampus, onSelectCampus]
  );

  const renderCategoryItem = useCallback(
    ({ item }: { item: CategoryTabOption }) => {
      const active = selectedCategory === item.id;
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.catTab, active && styles.catTabActive]}
          activeOpacity={0.8}
          onPress={() => onSelectCategory(item.id)}
        >
          <Text style={[styles.catTabText, active && styles.catTabTextActive]}>{item.label}</Text>
          {item.count !== undefined && (
            <View style={[styles.badge, active && styles.badgeActive]}>
              <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{item.count}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedCategory, onSelectCategory]
  );

  const renderPriceItem = useCallback(
    ({ item }: { item: PriceRangeOption }) => {
      const active = selectedPrice === item.id;
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.priceChip, active && styles.priceChipActive]}
          activeOpacity={0.8}
          onPress={() => onSelectPrice(active ? '' : item.id)}
        >
          {item.icon && (
            <Ionicons
              name={item.icon as any}
              size={13}
              color={active ? '#FFFFFF' : '#F27024'}
              style={{ marginRight: 4 }}
            />
          )}
          <Text style={[styles.priceChipText, active && styles.priceChipTextActive]}>{item.label}</Text>
        </TouchableOpacity>
      );
    },
    [selectedPrice, onSelectPrice]
  );

  return (
    <View style={styles.container}>
      {/* 1. Campus Chips */}
      <FlatList
        horizontal
        data={campusFilters}
        keyExtractor={(item) => item.id}
        renderItem={renderCampusItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      />

      {/* 2. Category Tabs */}
      <FlatList
        horizontal
        data={categoryTabs}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      />

      {/* 3. Price Chips */}
      <FlatList
        horizontal
        data={priceRanges}
        keyExtractor={(item) => item.id}
        renderItem={renderPriceItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 6 },
  row: { paddingHorizontal: 16, marginBottom: 8 },
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
