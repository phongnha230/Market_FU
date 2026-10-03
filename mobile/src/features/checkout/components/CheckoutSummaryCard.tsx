import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CheckoutSummaryCardProps {
  basePrice: number;
  shippingFee: number;
  isDifferentCampus: boolean;
  loadingShipping: boolean;
  estimatedDelivery: string;
  shippingPartner: string;
  discountAmount: number;
  totalAmount: number;
  formatCurrency: (val: number) => string;
}

export const CheckoutSummaryCard: React.FC<CheckoutSummaryCardProps> = ({
  basePrice,
  shippingFee,
  isDifferentCampus,
  loadingShipping,
  estimatedDelivery,
  shippingPartner,
  discountAmount,
  totalAmount,
  formatCurrency,
}) => {
  return (
    <>
      <Text style={styles.sectionHeader}>CHI TIẾT THANH TOÁN</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tiền hàng</Text>
          <Text style={styles.summaryVal}>{formatCurrency(basePrice)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.shippingCol}>
            <Text style={styles.summaryLabel}>
              Phí vận chuyển {isDifferentCampus ? '(FPT Bus liên Campus)' : '(Safe-Point)'}
            </Text>
            {loadingShipping ? (
              <Text style={styles.shippingLoading}>Đang tính toán cước...</Text>
            ) : (
              <Text style={styles.shippingInfo}>
                {estimatedDelivery} • {shippingPartner}
              </Text>
            )}
          </View>
          <Text style={styles.summaryVal}>
            {loadingShipping ? '...' : shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí bảo lãnh ký quỹ Escrow</Text>
          <Text style={[styles.summaryVal, styles.freeEscrow]}>Miễn phí (Tài trợ 100%)</Text>
        </View>

        {discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá voucher</Text>
            <Text style={[styles.summaryVal, styles.discountVal]}>
              -{formatCurrency(discountAmount)}
            </Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

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
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
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
  freeEscrow: {
    color: '#059669',
    fontWeight: '700',
  },
  discountVal: {
    color: '#EA580C',
    fontWeight: '700',
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
