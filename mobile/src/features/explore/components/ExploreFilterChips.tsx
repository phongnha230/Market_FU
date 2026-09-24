import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
  return (
    <View style={styles.container}>
      {/* 1. Campus Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {campusFilters.map((c) => {
          const active = selectedCampus === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.campusChip, active && styles.campusChipActive]}
              activeOpacity={0.8}
              onPress={() => onSelectCampus(c.id)}
            >
              {c.icon && <Ionicons name={c.icon as any} size={13} color={active ? '#FFFFFF' : '#475569'} style={{ marginRight: 4 }} />}
              <Text style={[styles.campusChipText, active && styles.campusChipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2. Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {categoryTabs.map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.catTab, active && styles.catTabActive]}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(tab.id)}
            >
              <Text style={[styles.catTabText, active && styles.catTabTextActive]}>{tab.label}</Text>
              {tab.count !== undefined && (
                <View style={[styles.badge, active && styles.badgeActive]}>
                  <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Price Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {priceRanges.map((range) => {
          const active = selectedPrice === range.id;
          return (
            <TouchableOpacity
              key={range.id}
              style={[styles.priceChip, active && styles.priceChipActive]}
              activeOpacity={0.8}
              onPress={() => onSelectPrice(active ? '' : range.id)}
            >
              {range.icon && <Ionicons name={range.icon as any} size={13} color={active ? '#FFFFFF' : '#F27024'} style={{ marginRight: 4 }} />}
              <Text style={[styles.priceChipText, active && styles.priceChipTextActive]}>{range.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
