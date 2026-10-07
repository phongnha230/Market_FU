import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

interface CheckoutCoinDiscountCardProps {
  userCoins: number;
  maxCoinsAllowed: number;
  useCoinDiscount: boolean;
  onToggleCoinDiscount: (enabled: boolean) => void;
  formatCurrency: (val: number) => string;
}

export const CheckoutCoinDiscountCard: React.FC<CheckoutCoinDiscountCardProps> = ({
  userCoins,
  maxCoinsAllowed,
  useCoinDiscount,
  onToggleCoinDiscount,
  formatCurrency,
}) => {
  const isEligible = userCoins >= 10 && maxCoinsAllowed > 0;
  const discountAmount = useCoinDiscount && isEligible ? maxCoinsAllowed * 1000 : 0;

  return (
    <>
      <Text style={styles.sectionHeader}>FPT CAMPUS COIN</Text>
      <View style={styles.card}>
        <View style={styles.contentRow}>
          <View style={styles.coinBadge}>
            <Text style={styles.coinEmoji}>🪙</Text>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>
                Dùng {maxCoinsAllowed > 0 ? maxCoinsAllowed : 0} FPT Coin
              </Text>
              {discountAmount > 0 && (
                <Text style={styles.discountBadge}>
                  -{formatCurrency(discountAmount)}
                </Text>
              )}
            </View>
            <Text style={styles.subText}>
              Số dư ví: <Text style={styles.boldText}>{userCoins} Xu</Text>
              {userCoins < 10
                ? ' (Tối thiểu 10 Xu để quy đổi)'
                : ' (Giảm tối đa 10% giá trị sản phẩm)'}
            </Text>
          </View>
          <Switch
            value={useCoinDiscount && isEligible}
            onValueChange={onToggleCoinDiscount}
            disabled={!isEligible}
            trackColor={{ false: '#E2E8F0', true: '#FDBA74' }}
            thumbColor={useCoinDiscount && isEligible ? '#EA580C' : '#94A3B8'}
          />
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
  card: {
    backgroundColor: '#FFFBF5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinEmoji: {
    fontSize: 18,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  discountBadge: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#059669',
  },
  subText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  boldText: {
    color: '#D97706',
    fontWeight: '700',
  },
});
