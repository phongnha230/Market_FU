import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutSummaryCardProps {
  basePrice: number;
  effectiveProductPrice?: number;
  isAgreedPriceApplied?: boolean;
  agreedPrice?: number | null;
  shippingFee: number;
  isDifferentCampus: boolean;
  isMeetup?: boolean;
  loadingShipping: boolean;
  estimatedDelivery: string;
  shippingPartner: string;
  discountAmount: number;
  appliedVoucher?: { code: string; discount: number; title?: string } | null;
  coinDiscountAmount?: number;
  coinsUsed?: number;
  totalAmount: number;
  formatCurrency: (val: number) => string;
}

export const CheckoutSummaryCard: React.FC<CheckoutSummaryCardProps> = ({
  basePrice,
  effectiveProductPrice,
  isAgreedPriceApplied = false,
  agreedPrice,
  shippingFee,
  isDifferentCampus,
  isMeetup = !isDifferentCampus,
  loadingShipping,
  estimatedDelivery,
  shippingPartner,
  discountAmount,
  appliedVoucher,
  coinDiscountAmount = 0,
  coinsUsed = 0,
  totalAmount,
  formatCurrency,
}) => {
  const finalProductPrice = effectiveProductPrice ?? (isAgreedPriceApplied && agreedPrice ? agreedPrice : basePrice);
  const priceDifference = isAgreedPriceApplied ? basePrice - finalProductPrice : 0;

  return (
    <>
      <Text style={styles.sectionHeader}>CHI TIẾT THANH TOÁN</Text>
      <View style={styles.summaryCard}>
        {/* Tiền hàng gốc */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tiền hàng</Text>
          <View style={styles.priceCol}>
            {isAgreedPriceApplied && (
              <Text style={styles.strikeVal}>{formatCurrency(basePrice)}</Text>
            )}
            <Text style={styles.summaryVal}>{formatCurrency(finalProductPrice)}</Text>
          </View>
        </View>

        {/* Ưu đãi thương lượng trong Chat */}
        {isAgreedPriceApplied && priceDifference > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.labelWithIcon}>
              <Ionicons name="sparkles" size={13} color="#059669" />
              <Text style={[styles.summaryLabel, styles.greenText]}>
                Giá chốt thương lượng trong Chat
              </Text>
            </View>
            <Text style={[styles.summaryVal, styles.greenVal]}>
              -{formatCurrency(priceDifference)}
            </Text>
          </View>
        )}

        {/* Phí vận chuyển */}
        <View style={styles.summaryRow}>
          <View style={styles.shippingCol}>
            <Text style={styles.summaryLabel}>
              Phí vận chuyển {isMeetup ? '(Safe-Point Meetup)' : '(FPT Bus liên Campus)'}
            </Text>
            {loadingShipping ? (
              <Text style={styles.shippingLoading}>Đang tính toán cước...</Text>
            ) : (
              <Text style={styles.shippingInfo}>
                {estimatedDelivery} • {shippingPartner}
              </Text>
            )}
          </View>
          <Text style={[styles.summaryVal, isMeetup && styles.freeShipping]}>
            {loadingShipping ? '...' : isMeetup ? 'Miễn phí (0đ)' : formatCurrency(shippingFee)}
          </Text>
        </View>

        {/* Bảo hiểm Escrow */}
        <View style={styles.summaryRow}>
          <View style={[styles.labelWithIcon, { flex: 1, marginRight: 8 }]}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.summaryLabel} numberOfLines={1}>
              Bảo lãnh ký quỹ Escrow
            </Text>
            <View style={styles.carePill}>
              <Text style={styles.carePillText}>Care 100%</Text>
            </View>
          </View>
          <Text style={[styles.summaryVal, styles.freeEscrow]}>Miễn phí (0đ)</Text>
        </View>

        {/* Giảm giá Voucher */}
        {discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Voucher giảm giá {appliedVoucher?.code ? `(${appliedVoucher.code})` : ''}
            </Text>
            <Text style={[styles.summaryVal, styles.discountVal]}>
              -{formatCurrency(discountAmount)}
            </Text>
          </View>
        )}

        {/* Giảm giá FPT Coin */}
        {coinDiscountAmount > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.labelWithIcon}>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={styles.summaryLabel}>FPT Coin ({coinsUsed} Xu)</Text>
            </View>
            <Text style={[styles.summaryVal, styles.greenVal]}>
              -{formatCurrency(coinDiscountAmount)}
            </Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

        {/* Tổng tiền */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng tiền thanh toán</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    alignItems: 'center',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strikeVal: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  summaryVal: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  greenText: {
    color: '#059669',
  },
  greenVal: {
    color: '#059669',
    fontWeight: '700',
  },
  freeShipping: {
    color: '#059669',
    fontWeight: '700',
  },
  freeEscrow: {
    color: '#059669',
    fontWeight: '700',
  },
  carePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
    marginLeft: 4,
  },
  carePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  discountVal: {
    color: '#EA580C',
    fontWeight: '700',
  },
  coinEmoji: {
    fontSize: 12,
  },
  shippingCol: {
    flex: 1,
    marginRight: 8,
  },
  shippingLoading: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  shippingInfo: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#EA580C',
  },
});
