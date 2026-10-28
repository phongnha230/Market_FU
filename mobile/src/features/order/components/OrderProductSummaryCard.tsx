import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
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
  isSeller?: boolean;
  platformFee?: number;
  sellerNetEarning?: number;
}

export const OrderProductSummaryCard: React.FC<OrderProductSummaryCardProps> = ({
  product,
  isSeller = false,
  platformFee,
  sellerNetEarning,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [product?.image]);

  const imageSource = imgError ? DEFAULT_PRODUCT_FALLBACK : resolveProductImage(product?.image);

  const priceNum = typeof product.price === 'number' ? product.price : 0;
  const fee = (platformFee && platformFee > 0) ? platformFee : Math.round(priceNum * 0.05);
  const net = (sellerNetEarning && sellerNetEarning > 0) ? sellerNetEarning : Math.max(0, priceNum - fee);

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
            {product.priceStr || (priceNum > 0 ? priceNum.toLocaleString('vi-VN') + 'đ' : '0đ')}
          </Text>
        </View>
      </View>

      {isSeller && priceNum > 0 && (
        <View style={styles.financialContainer}>
          <View style={styles.financialHeader}>
            <Ionicons name="receipt-outline" size={14} color="#EA580C" style={{ marginRight: 5 }} />
            <Text style={styles.financialTitle}>Minh bạch tài chính người bán</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Giá niêm yết:</Text>
            <Text style={styles.financialValue}>{priceNum.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialFeeLabel}>Phí sàn FMarket (5%):</Text>
            <Text style={styles.financialFeeValue}>-{fee.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.financialRow}>
            <Text style={styles.financialNetLabel}>Thực nhận về ví:</Text>
            <Text style={styles.financialNetValue}>+{net.toLocaleString('vi-VN')} đ</Text>
          </View>
          <Text style={styles.financialNote}>
            🛡️ Khoản phí sàn 5% hỗ trợ duy trì hệ thống bảo vệ Escrow & Safe-point. Khi đơn hoàn tất, bạn nhận được đúng số dư thực nhận để rút về ngân hàng.
          </Text>
        </View>
      )}
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
  financialContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginTop: 10,
  },
  financialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  financialTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C2410C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  financialLabel: {
    fontSize: 12,
    color: '#475569',
  },
  financialValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  financialFeeLabel: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  financialFeeValue: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#FED7AA',
    marginVertical: 6,
  },
  financialNetLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  financialNetValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#15803D',
  },
  financialNote: {
    fontSize: 10.5,
    color: '#9A3412',
    lineHeight: 14,
    marginTop: 4,
  },
});
