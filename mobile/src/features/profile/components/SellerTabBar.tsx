import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SellerTabBarProps {
  activeTab: 'listings' | 'reviews';
  onSelectTab: (tab: 'listings' | 'reviews') => void;
  productsCount: number;
  reviewsCount: number;
}

export const SellerTabBar: React.FC<SellerTabBarProps> = ({
  activeTab,
  onSelectTab,
  productsCount,
  reviewsCount,
}) => {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'listings' && styles.tabItemActive]}
        onPress={() => onSelectTab('listings')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="storefront-outline"
          size={18}
          color={activeTab === 'listings' ? '#EA580C' : '#64748B'}
        />
        <Text style={[styles.tabLabel, activeTab === 'listings' && styles.tabLabelActive]}>
          Đang rao bán ({productsCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'reviews' && styles.tabItemActive]}
        onPress={() => onSelectTab('reviews')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="star-outline"
          size={18}
          color={activeTab === 'reviews' ? '#EA580C' : '#64748B'}
        />
        <Text style={[styles.tabLabel, activeTab === 'reviews' && styles.tabLabelActive]}>
          Đánh giá ({reviewsCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#FFF7ED',
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
});
