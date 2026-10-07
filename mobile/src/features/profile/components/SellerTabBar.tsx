import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SellerTabBarProps {
  activeTab: 'listings' | 'reviews' | 'guarantee';
  onSelectTab: (tab: 'listings' | 'reviews' | 'guarantee') => void;
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
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="storefront-outline"
          size={16}
          color={activeTab === 'listings' ? '#EA580C' : '#64748B'}
        />
        <Text style={[styles.tabLabel, activeTab === 'listings' && styles.tabLabelActive]}>
          Đang bán ({productsCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'reviews' && styles.tabItemActive]}
        onPress={() => onSelectTab('reviews')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="star-outline"
          size={15}
          color={activeTab === 'reviews' ? '#EA580C' : '#64748B'}
        />
        <Text style={[styles.tabLabel, activeTab === 'reviews' && styles.tabLabelActive]}>
          Đánh giá ({reviewsCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'guarantee' && styles.tabItemActive]}
        onPress={() => onSelectTab('guarantee')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={15}
          color={activeTab === 'guarantee' ? '#EA580C' : '#64748B'}
        />
        <Text style={[styles.tabLabel, activeTab === 'guarantee' && styles.tabLabelActive]}>
          FPT Care
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
    marginVertical: 10,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  tabLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
});

export default SellerTabBar;
