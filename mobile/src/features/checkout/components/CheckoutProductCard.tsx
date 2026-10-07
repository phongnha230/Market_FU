import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolveProductImage } from '../../../lib/imageResolver';

interface CheckoutProductCardProps {
  product: {
    id?: string;
    title: string;
    image: any;
    sellerName?: string;
    sellerCampus?: string;
    sellerCohort?: string;
  };
  isDifferentCampus: boolean;
  basePrice: number;
  agreedPrice?: number | null;
  isAgreedPriceApplied?: boolean;
  effectiveProductPrice?: number;
  formatCurrency: (val: number) => string;
}

const ProductSellerRow: React.FC<{ sellerName?: string; sellerCohort?: string }> = React.memo(
  ({ sellerName, sellerCohort }) => (
    <View style={styles.sellerRow}>
      <Ionicons name="person-circle-outline" size={14} color="#64748B" />
      <Text style={styles.sellerText}>
        Người bán: {sellerName || 'Sinh viên FPT'}{sellerCohort ? ` • ${sellerCohort}` : ''}
      </Text>
    </View>
  )
);

const ProductCampusBadge: React.FC<{
  sellerCampus?: string;
  isDifferentCampus: boolean;
}> = React.memo(({ sellerCampus, isDifferentCampus }) => (
  <View style={styles.campusBadgeRow}>
    <View style={[styles.campusBadge, isDifferentCampus && styles.diffCampusBadge]}>
      <Text style={[styles.campusBadgeText, isDifferentCampus && styles.diffCampusBadgeText]}>
        {sellerCampus || 'Campus Hòa Lạc'}
      </Text>
    </View>
    <Text style={[styles.campusHint, isDifferentCampus && styles.diffCampusHint]}>
      {isDifferentCampus ? '⚡ Ship xe FPT Bus 24h' : '🛡️ Safe-Handoff cùng Campus'}
    </Text>
  </View>
));

export const CheckoutProductCard: React.FC<CheckoutProductCardProps> = ({
  product,
  isDifferentCampus,
  basePrice,
  agreedPrice,
  isAgreedPriceApplied = false,
  effectiveProductPrice,
  formatCurrency,
}) => {
  const displayPrice = effectiveProductPrice ?? (isAgreedPriceApplied && agreedPrice ? agreedPrice : basePrice);

  return (
    <>
      <Text style={styles.sectionHeader}>SẢN PHẨM GIAO DỊCH</Text>
      <View style={styles.productCard}>
        <Image
          source={resolveProductImage(product.image)}
          style={styles.productThumb}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <ProductSellerRow
            sellerName={product.sellerName}
            sellerCohort={product.sellerCohort}
          />
          <ProductCampusBadge
            sellerCampus={product.sellerCampus}
            isDifferentCampus={isDifferentCampus}
          />

          {isAgreedPriceApplied && agreedPrice ? (
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.strikePrice}>{formatCurrency(basePrice)}</Text>
                <Text style={styles.negotiatedPrice}>{formatCurrency(agreedPrice)}</Text>
              </View>
              <View style={styles.negotiatedBadge}>
                <Ionicons name="sparkles" size={12} color="#059669" />
                <Text style={styles.negotiatedBadgeText}>
                  Giá chốt trong Chat (-{formatCurrency(basePrice - agreedPrice)})
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.productPrice}>{formatCurrency(displayPrice)}</Text>
          )}
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
    width: 80,
    height: 80,
    borderRadius: 12,
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
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  campusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  diffCampusBadge: {
    backgroundColor: '#F5F3FF',
  },
  diffCampusBadgeText: {
    color: '#7C3AED',
  },
  campusHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  diffCampusHint: {
    color: '#EA580C',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 5,
  },
  priceContainer: {
    marginTop: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strikePrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  negotiatedPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#EA580C',
  },
  negotiatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  negotiatedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
});
