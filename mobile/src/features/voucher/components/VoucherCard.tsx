import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Voucher } from '../../../stores/voucherStore';

interface VoucherCardProps {
  voucher: Voucher;
  userCoins: number;
  isRedeemed?: boolean;
  isAuthenticated?: boolean;
  onRedeem: (voucher: Voucher) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  userCoins,
  isRedeemed = false,
  isAuthenticated = true,
  onRedeem,
}) => {
  const getPartnerTheme = (partner: string) => {
    switch (partner) {
      case 'PASSIO':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#059669',
          iconName: 'cafe-outline' as const,
          label: 'Passio Coffee',
        };
      case 'SEVEN_ELEVEN':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#2563EB',
          iconName: 'storefront-outline' as const,
          label: '7-Eleven FPT',
        };
      case 'CAMPUS_SHIP':
        return {
          bg: '#F5F3FF',
          border: '#DDD6FE',
          text: '#7C3AED',
          iconName: 'car-outline' as const,
          label: 'FPT CampusShip',
        };
      case 'OTHER':
        return {
          bg: '#F5F3FF',
          border: '#DDD6FE',
          text: '#7C3AED',
          iconName: 'car-outline' as const,
          label: 'CampusShip Express',
        };
      case 'CANTEEN':
      default:
        return {
          bg: '#FFF7ED',
          border: '#FED7AA',
          text: '#EA580C',
          iconName: 'restaurant-outline' as const,
          label: 'Căn Tin FPT',
        };
    }
  };

  const theme = getPartnerTheme(voucher.partner);
  const canAfford = !isAuthenticated || userCoins >= voucher.coinCost;

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      {/* Top Banner Tag */}
      <View style={styles.topRow}>
        <View style={[styles.partnerBadge, { backgroundColor: theme.bg }]}>
          <Ionicons name={theme.iconName} size={13} color={theme.text} />
          <Text style={[styles.partnerText, { color: theme.text }]}>
            {(voucher.partnerLabel || theme.label).toUpperCase()}
          </Text>
        </View>

        <Text style={[styles.discountTag, { color: theme.text }]}>
          Giảm {voucher.discountValue.toLocaleString('vi-VN')}đ
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.body}>
        <View style={[styles.iconCircle, { backgroundColor: theme.bg }]}>
          <Ionicons name={theme.iconName} size={24} color={theme.text} />
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {voucher.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginVertical: 3 }}>
            <View style={styles.coinCostPill}>
              <Text style={styles.coinCostPillText}>
                Đổi bằng {voucher.coinCost} Coins
              </Text>
            </View>
            {voucher.minOrderValue && voucher.minOrderValue > 0 ? (
              <View style={[styles.coinCostPill, { backgroundColor: '#F3E8FF' }]}>
                <Text style={[styles.coinCostPillText, { color: '#7E22CE' }]}>
                  Đơn từ {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.desc} numberOfLines={2}>
            {voucher.description || 'Áp dụng tại quầy đối tác Campus FPT'}
          </Text>
        </View>
      </View>

      {/* Usage meta & progress */}
      <View style={styles.metaRow}>
        <Text style={styles.stockText}>
          Còn {voucher.quantity} lượt đổi trong kho
        </Text>
        <Text style={styles.hsdText}>
          HSD: {voucher.validDays || 30} ngày
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Ionicons name="sparkles" size={14} color="#F59E0B" />
          <Text style={styles.coinPriceText}>{voucher.coinCost} Coins</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.redeemBtn,
            isAuthenticated && !canAfford && styles.btnDisabled,
            isRedeemed && styles.btnRedeemed,
          ]}
          disabled={isAuthenticated && !canAfford}
          activeOpacity={0.85}
          onPress={() => onRedeem(voucher)}
        >
          <Text style={[styles.btnText, isAuthenticated && !canAfford && styles.btnTextDisabled]}>
            {!isAuthenticated
              ? 'Đổi ngay'
              : !canAfford
              ? `Thiếu ${voucher.coinCost - userCoins} Xu`
              : isRedeemed
              ? 'Đổi thêm'
              : 'Đổi ngay'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 8,
    marginBottom: 10,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  partnerText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  discountTag: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 4,
  },
  coinCostPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  coinCostPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  desc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  stockText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  hsdText: {
    fontSize: 10.5,
    color: '#EA580C',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#EA580C',
  },
  redeemBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  btnRedeemed: {
    backgroundColor: '#0284C7',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  btnTextDisabled: {
    color: '#94A3B8',
  },
});

export default VoucherCard;
