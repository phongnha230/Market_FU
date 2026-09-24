import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductDetailData } from '../types/product-detail.types';

interface ProductInfoCardProps {
  product: ProductDetailData;
}

export const ProductInfoCard: React.FC<ProductInfoCardProps> = ({ product }) => {
  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{product.price}đ</Text>
        {product.originalPrice && <Text style={styles.originalPrice}>{product.originalPrice}đ</Text>}
        {product.discountBadge && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discountBadge}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  price: { fontSize: 22, fontWeight: '900', color: '#DC2626', marginRight: 8 },
  originalPrice: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through', marginRight: 6 },
  discountBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  discountText: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  conditionBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  conditionText: { fontSize: 10.5, fontWeight: '700', color: '#059669' },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A', lineHeight: 22, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
});

export default ProductInfoCard;
