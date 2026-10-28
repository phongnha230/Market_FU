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
          iconName: 'cafe' as const,
          label: 'Passio Coffee',
          shortLabel: 'Passio',
        };
      case 'SEVEN_ELEVEN':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#2563EB',
          iconName: 'storefront' as const,
          label: '7-Eleven FPT',
          shortLabel: '7-Eleven',
        };
      case 'CAMPUS_SHIP':
      case 'OTHER':
        return {
          bg: '#F5F3FF',
          border: '#DDD6FE',
          text: '#7C3AED',
          iconName: 'bicycle' as const,
          label: 'CampusShip',
          shortLabel: 'CampusShip',
        };
      case 'CANTEEN':
      default:
        return {
          bg: '#FFF7ED',
          border: '#FED7AA',
          text: '#EA580C',
          iconName: 'restaurant' as const,
          label: 'Căn Tin FPT',
          shortLabel: 'Căn Tin',
        };
    }
  };

  const theme = getPartnerTheme(voucher.partner);
  const canAfford = !isAuthenticated || userCoins >= voucher.coinCost;

  const discountFormatted =
    voucher.discountValue >= 1000
      ? `-${Math.round(voucher.discountValue / 1000)}k`
      : `-${voucher.discountValue}đ`;

  const minSpendFormatted = voucher.minOrderValue
    ? voucher.minOrderValue >= 1000
      ? `Đơn từ ${Math.round(voucher.minOrderValue / 1000)}k`
      : `Đơn từ ${voucher.minOrderValue}đ`
    : 'Mọi đơn';

  return (
    <View style={styles.cardWrapper}>
      <View style={[styles.card, { borderColor: theme.border }]}>
        {/* ================= LEFT STUB (Cuống vé Shopee) ================= */}
        <View style={[styles.stub, { backgroundColor: theme.bg }]}>
          {/* Semicircular notches at the ticket perforation line */}
          <View style={styles.notchTop} />
          <View style={styles.notchBottom} />

          <View style={[styles.iconBox, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name={theme.iconName} size={18} color={theme.text} />
          </View>
          <Text
            style={[styles.stubDiscount, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {discountFormatted}
          </Text>
          <Text
            style={[styles.stubPartner, { color: theme.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {theme.shortLabel}
          </Text>
        </View>

        {/* ================= RIGHT BODY (Nội dung nhỏ nhắn không tràn chữ) ================= */}
        <View style={styles.body}>
          {/* Top row: Campus tag + Expiry */}
          <View style={styles.topRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText} numberOfLines={1}>CAMPUS VOUCHER</Text>
            </View>
            <Text style={styles.expiryText} numberOfLines={1} ellipsizeMode="tail">
              HSD: {voucher.validDays || 30} ngày
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {voucher.title}
          </Text>

          {/* Condition & Stock info */}
          <Text style={styles.conditionText} numberOfLines={1} ellipsizeMode="tail">
            {minSpendFormatted} • Còn {voucher.quantity} lượt
          </Text>

          {/* Bottom row: Coin cost & Compact Action Button */}
          <View style={styles.bottomRow}>
            <View style={styles.coinBox}>
              <Ionicons name="sparkles" size={12} color="#F59E0B" />
              <Text style={styles.coinAmount} numberOfLines={1}>{voucher.coinCost}</Text>
              <Text style={styles.coinUnit}>Coins</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.redeemBtn,
                isAuthenticated && !canAfford && styles.btnDisabled,
                isRedeemed && styles.btnRedeemed,
              ]}
              disabled={isAuthenticated && !canAfford}
              activeOpacity={0.75}
              delayPressIn={0}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={() => onRedeem(voucher)}
            >
              <Text
                style={[
                  styles.btnText,
                  isAuthenticated && !canAfford && styles.btnTextDisabled,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {!isAuthenticated
                  ? 'Đổi'
                  : !canAfford
                  ? `Thiếu ${voucher.coinCost - userCoins}`
                  : isRedeemed
                  ? 'Đổi thêm'
                  : 'Đổi ngay'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 96,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stub: {
    width: 84,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    borderStyle: 'dashed',
    position: 'relative',
  },
  notchTop: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 2,
  },
  notchBottom: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 2,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stubDiscount: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 16,
    maxWidth: 76,
    textAlign: 'center',
  },
  stubPartner: {
    fontSize: 9.5,
    fontWeight: '700',
    opacity: 0.85,
    marginTop: 1,
    maxWidth: 76,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    minWidth: 0, // prevents flex overflow in RN
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    flexShrink: 0,
  },
  tagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.3,
  },
  expiryText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
    marginVertical: 2,
  },
  conditionText: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  coinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
    minWidth: 0,
  },
  coinAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
  },
  coinUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  redeemBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  btnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  btnRedeemed: {
    backgroundColor: '#0284C7',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  btnTextDisabled: {
    color: '#94A3B8',
  },
});

export default VoucherCard;
