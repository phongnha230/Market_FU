import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { resolveProductImage, DEFAULT_PRODUCT_FALLBACK } from '../../lib/imageResolver';

import { useUserStore } from '../../stores/userStore';
import { useFavoriteStore } from '../../stores/useFavoriteStore';
import { useProductStore } from '../../stores/productStore';
import { Alert } from 'react-native';

import { useNavigation } from '@react-navigation/native';

export interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  seller: string;
  sellerId?: string;
  sellerYear?: string;
  image: any;
  badge?: string;
  badgeVariant?: 'white' | 'green' | 'orange';
  isVerified?: boolean;
  viewsCount?: number;
  likesCount?: number;
  isTrending?: boolean;
  cardStyle?: any;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  location,
  seller,
  sellerId,
  sellerYear,
  image,
  badge,
  badgeVariant = 'white',
  isVerified = true,
  viewsCount,
  likesCount,
  isTrending,
  cardStyle,
  onPress,
}) => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const isFavorite = useFavoriteStore((s) => s.favoriteIds.includes(id));
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  const isOwn = Boolean(
    user && user.name && seller && user.name.trim().toLowerCase() === seller.trim().toLowerCase()
  );
  const [hasError, setHasError] = useState(false);
  const imageSource = hasError ? DEFAULT_PRODUCT_FALLBACK : resolveProductImage(image);

  const handleToggleLike = () => {
    if (isOwn) {
      Alert.alert('Thông báo', 'Bạn không thể tự lưu sản phẩm do chính bạn đăng bán!');
      return;
    }
    const storeProduct = useProductStore.getState().products.find((p) => p.id === id);
    const numericPrice = typeof price === 'number' ? price : parseInt(String(price).replace(/\D/g, ''), 10) || 0;
    const productData = storeProduct || {
      id,
      title,
      price: numericPrice,
      condition: badge || '95%',
      category: 'other',
      images: [image],
      campus: location,
      sellerId: sellerId || '',
      sellerName: seller,
      sellerCohort: sellerYear,
      sellerIsVerified: isVerified,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      viewsCount,
      likesCount,
    };
    toggleFavorite(id, productData);
  };

  return (
    <TouchableOpacity style={[styles.card, cardStyle]} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.imageBox}>
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onError={() => setHasError(true)}
        />
        {badge && (
          <View
            style={[
              styles.badge,
              badgeVariant === 'green'
                ? styles.badgeGreen
                : badgeVariant === 'orange'
                ? styles.badgeOrange
                : styles.badgeWhite,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                badgeVariant === 'green' || badgeVariant === 'orange' ? styles.textWhite : styles.textDark,
              ]}
              numberOfLines={1}
            >
              {badge}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.heartBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleToggleLike}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={15} color={isFavorite ? '#EF4444' : '#64748B'} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}đ</Text>
          {viewsCount !== undefined && viewsCount > 0 && (
            <View style={styles.viewsCountBadge}>
              <Ionicons name="eye-outline" size={10} color="#64748B" style={{ marginRight: 2 }} />
              <Text style={styles.viewsCountText}>{viewsCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{location}</Text>
        </View>
        <TouchableOpacity
          style={styles.sellerRow}
          activeOpacity={0.7}
          onPress={() => {
            navigation.navigate('PublicSellerProfile', {
              userId: sellerId || '',
              sellerName: seller,
            });
          }}
        >
          <Text style={styles.sellerName} numberOfLines={1}>{seller}</Text>
          {sellerYear && <Text style={styles.sellerYear}> ({sellerYear})</Text>}
          {isVerified && <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginLeft: 3 }} />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
  },
  imageBox: { width: '100%', height: 135, backgroundColor: '#F8FAFC', position: 'relative' },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 7,
    left: 7,
    maxWidth: 90,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  badgeWhite: { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  badgeGreen: { backgroundColor: '#10B981' },
  badgeOrange: { backgroundColor: '#EA580C' },
  badgeText: { fontSize: 9.5, fontWeight: '700' },
  textWhite: { color: '#FFFFFF' },
  textDark: { color: '#0F172A' },
  heartBtn: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  content: { padding: 10 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  price: { fontSize: 16, fontWeight: '900', color: '#DC2626' },
  viewsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  viewsCountText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  title: { fontSize: 13, fontWeight: '700', color: '#0F172A', lineHeight: 18, marginBottom: 6, minHeight: 36 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerName: { fontSize: 11, color: '#0F172A', fontWeight: '600' },
  sellerYear: { fontSize: 10, color: '#64748B', fontWeight: '500' },
});

export default ProductCard;
