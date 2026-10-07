import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { VoucherCategoryKey } from '../types/voucher.types';

interface VoucherCategoryFilterProps {
  activeCategory: VoucherCategoryKey;
  onSelectCategory: (category: VoucherCategoryKey) => void;
  counts: {
    all: number;
    coins: number;
    dorm: number;
    ship: number;
  };
}

export const VoucherCategoryFilter: React.FC<VoucherCategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
}) => {
  const categories: { key: VoucherCategoryKey; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả mã', count: counts.all },
    { key: 'coins', label: 'Căn tin & Cafe', count: counts.coins },
    { key: 'dorm', label: 'Cửa hàng KTX', count: counts.dorm },
    { key: 'ship', label: 'CampusShip', count: counts.ship },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.pill, isActive && styles.pillActive]}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(cat.key)}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {cat.label}
              </Text>
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countText, isActive && styles.countTextActive]}>
                  {cat.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});

export default VoucherCategoryFilter;
