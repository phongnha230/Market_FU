import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { resolveProductImage, DEFAULT_PRODUCT_FALLBACK } from '../../../lib/imageResolver';

interface OrderProductSummaryCardProps {
  product: {
    title: string;
    image: any;
    sellerName?: string;
    sellerCampus?: string;
    price?: number;
    priceStr?: string;
  };
}

export const OrderProductSummaryCard: React.FC<OrderProductSummaryCardProps> = ({ product }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [product?.image]);

  const imageSource = imgError ? DEFAULT_PRODUCT_FALLBACK : resolveProductImage(product?.image);

  return (
    <>
      <Text style={styles.sectionHeader}>THÔNG TIN SẢN PHẨM</Text>
      <View style={styles.productCard}>
        <Image
          source={imageSource}
          style={styles.productThumb}
          contentFit="cover"
          transition={150}
          onError={() => setImgError(true)}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.sellerText} numberOfLines={1}>
            Người bán: {product.sellerName || 'Người bán FPT'} ({product.sellerCampus || 'Campus FPT'})
          </Text>
          <Text style={styles.productPrice}>
            {product.priceStr || (typeof product.price === 'number' && product.price > 0 ? product.price.toLocaleString('vi-VN') + 'đ' : '0đ')}
          </Text>
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
    marginTop: 18,
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
    width: 72,
    height: 72,
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
  sellerText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 4,
  },
});
