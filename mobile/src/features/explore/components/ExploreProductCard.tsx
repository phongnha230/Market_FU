import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ExploreProduct } from '../types/explore.types';

interface ExploreProductCardProps {
  product: ExploreProduct;
  onPress?: () => void;
  onSelect?: (id: string) => void;
}

export const ExploreProductCard: React.FC<ExploreProductCardProps> = React.memo(
  ({ product, onPress, onSelect }) => {
    const handlePress = React.useCallback(() => {
      if (onSelect) onSelect(product.id);
      else if (onPress) onPress();
    }, [product.id, onSelect, onPress]);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={handlePress}>
      <View style={styles.imageBox}>
        <Image source={product.image} style={styles.image} contentFit="cover" transition={200} />
        <View style={[styles.badge, { backgroundColor: product.badgeColor }]}>
          <Text style={styles.badgeText}>{product.badge}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price}đ</Text>
          {product.greenTag && (
            <View style={styles.greenTag}>
              <Ionicons name="shield-checkmark" size={10} color="#059669" style={{ marginRight: 3 }} />
              <Text style={styles.greenTagText}>{product.greenTag}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.location} numberOfLines={1}>{product.location}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.seller}>{product.seller}</Text>
          {product.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#F59E0B" style={{ marginRight: 2 }} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 10,
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
  },
  imageBox: {
    width: 95,
    height: 95,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 5,
    left: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '800' },
  content: { flex: 1, marginLeft: 12, justifyContent: 'space-between', paddingVertical: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 16, fontWeight: '900', color: '#DC2626' },
  greenTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  greenTagText: { fontSize: 9.5, fontWeight: '700', color: '#059669' },
  title: { fontSize: 12.5, fontWeight: '700', color: '#0F172A', lineHeight: 17 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  location: { fontSize: 10.5, color: '#64748B', fontWeight: '500' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seller: { fontSize: 11, fontWeight: '600', color: '#334155' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4 },
  ratingText: { fontSize: 9.5, fontWeight: '800', color: '#D97706' },
});

export default ExploreProductCard;
