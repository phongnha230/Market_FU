import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutProductCardProps {
  product: {
    id?: string;
    title: string;
    image: any;
    sellerName?: string;
    sellerCampus?: string;
  };
  isDifferentCampus: boolean;
  basePrice: number;
  formatCurrency: (val: number) => string;
}

const ProductSellerRow: React.FC<{ sellerName?: string }> = React.memo(({ sellerName }) => (
  <View style={styles.sellerRow}>
    <Ionicons name="person-circle-outline" size={14} color="#64748B" />
    <Text style={styles.sellerText}>Người bán: {sellerName || 'Nam NV'}</Text>
  </View>
));

const ProductCampusBadge: React.FC<{
  sellerCampus?: string;
  isDifferentCampus: boolean;
}> = React.memo(({ sellerCampus, isDifferentCampus }) => (
  <View style={styles.campusBadgeRow}>
    <View style={[styles.campusBadge, isDifferentCampus && styles.diffCampusBadge]}>
      <Text style={[styles.campusBadgeText, isDifferentCampus && styles.diffCampusBadgeText]}>
        {sellerCampus || 'Campus khác'}
      </Text>
    </View>
    {isDifferentCampus && (
      <Text style={styles.interCampusHint}>⚡ Ship xe FPT Bus 24h</Text>
    )}
  </View>
));

export const CheckoutProductCard: React.FC<CheckoutProductCardProps> = ({
  product,
  isDifferentCampus,
  basePrice,
  formatCurrency,
}) => {
  return (
    <>
      <Text style={styles.sectionHeader}>SẢN PHẨM GIAO DỊCH</Text>
      <View style={styles.productCard}>
        <Image
          source={typeof product.image === 'string' ? { uri: product.image } : product.image}
          style={styles.productThumb}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <ProductSellerRow sellerName={product.sellerName} />
          <ProductCampusBadge
            sellerCampus={product.sellerCampus}
            isDifferentCampus={isDifferentCampus}
          />
          <Text style={styles.productPrice}>{formatCurrency(basePrice)}</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productThumb: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  sellerText: {
    fontSize: 11,
    color: '#64748B',
  },
  campusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  campusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  campusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  diffCampusBadge: {
    backgroundColor: '#F5F3FF',
  },
  diffCampusBadgeText: {
    color: '#7C3AED',
  },
  interCampusHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 4,
  },
});
