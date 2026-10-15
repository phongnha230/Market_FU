import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductDetailData } from '../types/product-detail.types';

interface ProductInfoCardProps {
  product: ProductDetailData;
  onPressHashtag?: (tag: string) => void;
}

export const ProductInfoCard: React.FC<ProductInfoCardProps> = ({ product, onPressHashtag }) => {
  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{product.price}đ</Text>
        {product.originalPrice && <Text style={styles.originalPrice}>{product.originalPrice}đ</Text>}
        {product.discountBadge ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discountBadge}</Text>
          </View>
        ) : (
          <View style={styles.studentPriceBadge}>
            <Text style={styles.studentPriceText}>Giá sinh viên</Text>
          </View>
        )}
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{product.conditionBadge}</Text>
        </View>
      </View>

      <Text style={styles.title}>{product.title}</Text>

      <View style={styles.locationRow}>
        <Ionicons name="location" size={14} color="#F27024" style={{ marginRight: 4 }} />
        <Text style={styles.locationText}>{product.location}</Text>
      </View>

      {/* Thẻ Hashtags từ khóa tìm kiếm Meilisearch */}
      {product.hashtags && product.hashtags.length > 0 && (
        <View style={styles.hashtagContainer}>
          <Ionicons name="pricetags-outline" size={13} color="#EA580C" style={{ marginTop: 2, marginRight: 6 }} />
          <View style={styles.hashtagWrap}>
            {product.hashtags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.hashtagBadge}
                onPress={() => onPressHashtag && onPressHashtag(tag)}
                activeOpacity={0.7}
              >
                <Text style={styles.hashtagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  price: { fontSize: 22, fontWeight: '900', color: '#DC2626', marginRight: 8 },
  originalPrice: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through', marginRight: 6 },
  discountBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 6, marginRight: 6 },
  discountText: { fontSize: 10.5, fontWeight: '800', color: '#DC2626' },
  studentPriceBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 6, marginRight: 6 },
  studentPriceText: { fontSize: 10.5, fontWeight: '700', color: '#059669' },
  conditionBadge: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  conditionText: { fontSize: 10.5, fontWeight: '700', color: '#475569' },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A', lineHeight: 22, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  hashtagContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  hashtagWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hashtagBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  hashtagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
});

export default ProductInfoCard;
