import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface ProductCardProps {
  title: string;
  price: string;
  location: string;
  seller: string;
  sellerYear: string;
  image: string;
  badge?: string;
  isVerified?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  location,
  seller,
  sellerYear,
  image,
  badge,
  isVerified = true,
}) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} contentFit="cover" transition={200} />
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.wishlistBtn}>
          <Ionicons name="heart-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.price}>{price}₫</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.metaItem}>
          <Ionicons name="location-sharp" size={12} color="#888" />
          <Text style={styles.metaText} numberOfLines={1}>
            {location}
          </Text>
        </View>

        <View style={styles.sellerRow}>
          <Text style={styles.sellerText}>
            {seller} ({sellerYear})
          </Text>
          {isVerified && (
            <View style={styles.verifyBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#34C759" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '48%',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E65100', // Màu giá cam đậm chuẩn Chợ Tốt / Shopee
  },
  title: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
    height: 36,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#888',
    marginLeft: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sellerText: {
    fontSize: 10,
    color: '#666',
  },
  verifyBadge: {
    marginLeft: 4,
  },
});

export default ProductCard;
