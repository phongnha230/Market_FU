import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { resolveProductImage } from '../../../lib/imageResolver';

interface SellerProductsGridProps {
  products: any[];
  onSelectProduct: (id: string) => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  canFollow?: boolean;
}

export const SellerProductsGrid: React.FC<SellerProductsGridProps> = ({
  products,
  onSelectProduct,
  isFollowing = false,
  onToggleFollow,
  canFollow = true,
}) => {
  if (products.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="cube-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>Shop hiện đang tạm hết hàng</Text>
        <Text style={styles.emptySub}>Người bán này hiện đã bán hết các món đồ đăng tải. Lịch sử giao dịch Safe-Point và đánh giá uy tín vẫn được bảo lưu 100% bên dưới!</Text>
        {canFollow && onToggleFollow && (
          <TouchableOpacity
            style={[styles.emptyFollowBtn, isFollowing && styles.emptyFollowingBtn]}
            onPress={onToggleFollow}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFollowing ? 'checkmark-circle' : 'notifications-outline'}
              size={16}
              color={isFollowing ? '#059669' : '#EA580C'}
            />
            <Text style={[styles.emptyFollowText, isFollowing && styles.emptyFollowingText]}>
              {isFollowing ? 'Đang theo dõi Shop này' : 'Theo dõi để nhận báo khi có hàng mới'}
            </Text>
          </TouchableOpacity>
        )}
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
  emptyFollowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 14,
  },
  emptyFollowingBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  emptyFollowText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  emptyFollowingText: {
    color: '#059669',
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
