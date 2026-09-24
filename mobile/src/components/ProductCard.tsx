import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  seller: string;
  sellerYear?: string;
  image: any;
  badge?: string;
  badgeVariant?: 'white' | 'green';
  isVerified?: boolean;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  location,
  seller,
  sellerYear,
  image,
  badge,
  badgeVariant = 'white',
  isVerified = true,
  onPress,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* Image Thumbnail Container */}
      <View style={styles.imageWrapper}>
        <Image
          source={imageSource}
          style={styles.productImage}
          contentFit="cover"
          transition={200}
        />

        {/* Top-left Badge */}
        {badge && (
          <View
            style={[
              styles.badgeContainer,
              badgeVariant === 'green' ? styles.greenBadge : styles.whiteBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                badgeVariant === 'green' ? styles.greenBadgeText : styles.whiteBadgeText,
              ]}
            >
              {badge}
            </Text>
          </View>
        )}

        {/* Top-right Heart Button */}
        <TouchableOpacity
          style={styles.heartButton}
          activeOpacity={0.8}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={isLiked ? '#EF4444' : '#1E293B'}
          />
        </TouchableOpacity>
      </View>

      {/* Info Body */}
      <View style={styles.contentBody}>
        {/* Price */}
        <Text style={styles.priceText}>{price}đ</Text>

        {/* Title */}
        <Text style={styles.titleText} numberOfLines={2}>
          {title}
        </Text>

        {/* Location Row */}
        <View style={styles.locationRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerRow}>
          <Text style={styles.sellerName} numberOfLines={1}>
            {seller} {sellerYear ? `(${sellerYear})` : ''}
          </Text>
          {isVerified && (
            <Ionicons
              name="checkmark-circle"
              size={13}
              color="#10B981"
              style={{ marginLeft: 3 }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '48.5%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 7,
    left: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  whiteBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  greenBadge: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  whiteBadgeText: {
    color: '#0F172A',
  },
  greenBadgeText: {
    color: '#FFFFFF',
  },
  heartButton: {
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
  contentBody: {
    padding: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 6,
    minHeight: 36,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
  },
});

export default ProductCard;
