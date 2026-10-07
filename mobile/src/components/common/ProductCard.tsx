import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { resolveProductImage, DEFAULT_PRODUCT_FALLBACK } from '../../lib/imageResolver';

import { useUserStore } from '../../stores/userStore';
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
  badgeVariant?: 'white' | 'green';
  isVerified?: boolean;
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
  onPress,
}) => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const isOwn = Boolean(
    user && user.name && seller && user.name.trim().toLowerCase() === seller.trim().toLowerCase()
  );
  const [isLiked, setIsLiked] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageSource = hasError ? DEFAULT_PRODUCT_FALLBACK : resolveProductImage(image);

  const handleToggleLike = () => {
    if (isOwn) {
      Alert.alert('Thông báo', 'Bạn không thể tự lưu sản phẩm do chính bạn đăng bán!');
      return;
    }
    setIsLiked(!isLiked);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.imageBox}>
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onError={() => setHasError(true)}
        />
        {badge && (
          <View style={[styles.badge, badgeVariant === 'green' ? styles.badgeGreen : styles.badgeWhite]}>
            <Text style={[styles.badgeText, badgeVariant === 'green' ? styles.textWhite : styles.textDark]}>
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
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={15} color={isLiked ? '#EF4444' : '#64748B'} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.price}>{price}đ</Text>
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
  badge: { position: 'absolute', top: 7, left: 7, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, zIndex: 2 },
  badgeWhite: { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  badgeGreen: { backgroundColor: '#10B981' },
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
  price: { fontSize: 16, fontWeight: '900', color: '#DC2626', marginBottom: 4 },
  title: { fontSize: 13, fontWeight: '700', color: '#0F172A', lineHeight: 18, marginBottom: 6, minHeight: 36 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerName: { fontSize: 11, color: '#0F172A', fontWeight: '600' },
  sellerYear: { fontSize: 10, color: '#64748B', fontWeight: '500' },
});

export default ProductCard;
