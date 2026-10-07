import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { resolveProductImage } from '../../../lib/imageResolver';

interface SellerProductsGridProps {
  products: any[];
  onSelectProduct: (id: string) => void;
}

export const SellerProductsGrid: React.FC<SellerProductsGridProps> = ({
  products,
  onSelectProduct,
}) => {
  if (products.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="cube-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>Chưa có món đồ nào đang bán</Text>
        <Text style={styles.emptySub}>Người bán này hiện đã bán hết các món đồ đăng tải.</Text>
      </View>
    );
  }

  return (
    <View style={styles.productGrid}>
      {products.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.productCard}
          activeOpacity={0.85}
          onPress={() => onSelectProduct(item.id)}
        >
          <Image
            source={resolveProductImage(item.images?.[0])}
            style={styles.productThumb}
            contentFit="cover"
          />
          <View style={styles.productMeta}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.productPrice}>
              {Number(item.price).toLocaleString('vi-VN')} đ
            </Text>
            <View style={styles.productBottomRow}>
              <Text style={styles.productSafePoint} numberOfLines={1}>
                📍 {item.safePoint || 'Safe-Point Sảnh Alpha'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productThumb: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  productMeta: {
    padding: 10,
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
  },
  productPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 4,
  },
  productBottomRow: {
    marginTop: 6,
  },
  productSafePoint: {
    fontSize: 10,
    color: '#64748B',
  },
});
