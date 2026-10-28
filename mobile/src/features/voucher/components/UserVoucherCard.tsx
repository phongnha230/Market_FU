import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { UserVoucher } from '../../../stores/voucherStore';

interface UserVoucherCardProps {
  userVoucher: UserVoucher;
  onOpenQr: (voucher: UserVoucher) => void;
}

export const UserVoucherCard: React.FC<UserVoucherCardProps> = ({
  userVoucher,
  onOpenQr,
}) => {
  const isUnused = userVoucher.status === 'UNUSED';
  const isUsed = userVoucher.status === 'USED';

  const getPartnerMeta = () => {
    switch (userVoucher.voucher?.partner) {
      case 'PASSIO':
        return {
          iconName: 'cafe' as const,
          label: 'Passio',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#059669',
        };
      case 'SEVEN_ELEVEN':
        return {
          iconName: 'storefront' as const,
          label: '7-Eleven',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#2563EB',
        };
      case 'CAMPUS_SHIP':
      case 'OTHER':
        return {
          iconName: 'bicycle' as const,
          label: 'CampusShip',
          bg: '#F5F3FF',
          border: '#DDD6FE',
          text: '#7C3AED',
        };
      case 'CANTEEN':
      default:
        return {
          iconName: 'restaurant' as const,
          label: 'Căn Tin',
          bg: '#FFF7ED',
          border: '#FED7AA',
          text: '#EA580C',
        };
    }
  };

  const partner = getPartnerMeta();
  const discountVal = userVoucher.voucher?.discountValue || 10000;
  const discountFormatted =
    discountVal >= 1000 ? `-${Math.round(discountVal / 1000)}k` : `-${discountVal}đ`;

  // Format date to short clean string, avoiding long datetime overflow
  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return '30 ngày';
    try {
      const parts = dateStr.split(' ');
      if (parts.length > 0 && parts[0].includes('-')) {
        const [y, m, d] = parts[0].split('-');
        if (y && m && d) return `${d}/${m}/${y}`;
      }
      if (parts.length > 0 && parts[0].includes('/')) {
        return parts[0];
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(userVoucher.voucherCode);
      Alert.alert('📋 Đã sao chép', `Mã voucher "${userVoucher.voucherCode}" đã được sao chép vào bộ nhớ tạm.`);
    } catch {
      Alert.alert('Mã voucher', userVoucher.voucherCode);
    }
  };

  return (
    <View style={styles.cardWrapper}>
      <View
        style={[
          styles.card,
          isUnused ? styles.cardUnused : isUsed ? styles.cardUsed : styles.cardExpired,
        ]}
      >
        {/* ================= LEFT STUB (Cuống vé Shopee) ================= */}
        <View style={[styles.stub, { backgroundColor: isUnused ? partner.bg : '#F8FAFC' }]}>
          <View style={styles.notchTop} />
          <View style={styles.notchBottom} />

          <View style={[styles.iconBox, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons
              name={partner.iconName}
              size={18}
              color={isUnused ? partner.text : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              styles.stubDiscount,
              { color: isUnused ? partner.text : '#64748B' },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {discountFormatted}
          </Text>
          <Text
            style={[
              styles.stubPartner,
              { color: isUnused ? partner.text : '#94A3B8' },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {partner.label}
          </Text>
        </View>

        {/* ================= RIGHT BODY (Nội dung nhỏ gọn không tràn chữ) ================= */}
        <View style={styles.body}>
          {/* Top row: Status Badge + Expiry Date */}
          <View style={styles.topRow}>
            <View
              style={[
                styles.statusBadge,
                isUnused
                  ? styles.statusUnused
                  : isUsed
                  ? styles.statusUsed
                  : styles.statusExpired,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isUnused
                    ? styles.statusTextUnused
                    : isUsed
                    ? styles.statusTextUsed
                    : styles.statusTextExpired,
                ]}
                numberOfLines={1}
              >
                {isUnused ? '🟢 Sẵn sàng' : isUsed ? '✅ Đã dùng' : '⏳ Hết hạn'}
              </Text>
            </View>

            <Text style={styles.expiryText} numberOfLines={1} ellipsizeMode="tail">
              HSD: {formatExpiry(userVoucher.expiredAt)}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {userVoucher.voucher?.title || 'Voucher Sinh Viên Campus'}
          </Text>

          {/* Code box row & Action button */}
          <View style={styles.bottomRow}>
            {/* Clickable mini code pill to copy */}
            <TouchableOpacity
              style={styles.codePill}
              activeOpacity={0.7}
              delayPressIn={0}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={handleCopyCode}
            >
              <Text style={styles.codeText} numberOfLines={1} ellipsizeMode="middle">
                {userVoucher.voucherCode}
              </Text>
              <Ionicons name="copy-outline" size={11} color="#EA580C" style={{ marginLeft: 3 }} />
            </TouchableOpacity>

            {/* Shopee-style compact QR / detail action button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isUnused ? styles.btnOpenQr : styles.btnViewDetail,
              ]}
              activeOpacity={0.75}
              delayPressIn={0}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={() => onOpenQr(userVoucher)}
            >
              <Ionicons
                name={isUnused ? 'qr-code-outline' : 'eye-outline'}
                size={12}
                color={isUnused ? '#FFFFFF' : '#475569'}
                style={{ marginRight: 3 }}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  isUnused ? styles.btnOpenQrText : styles.btnViewDetailText,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {isUnused ? 'Quét QR' : 'Chi tiết'}
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
  cardUnused: {
    borderColor: '#FED7AA',
  },
  cardUsed: {
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  cardExpired: {
    borderColor: '#F1F5F9',
    opacity: 0.6,
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
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    flexShrink: 0,
  },
  statusUnused: {
    backgroundColor: '#ECFDF5',
  },
  statusUsed: {
    backgroundColor: '#F1F5F9',
  },
  statusExpired: {
    backgroundColor: '#FFE4E6',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextUnused: {
    color: '#059669',
  },
  statusTextUsed: {
    color: '#64748B',
  },
  statusTextExpired: {
    color: '#E11D48',
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  codeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#C2410C',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 68,
    flexShrink: 0,
  },
  btnOpenQr: {
    backgroundColor: '#EA580C',
  },
  btnViewDetail: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  btnOpenQrText: {
    color: '#FFFFFF',
  },
  btnViewDetailText: {
    color: '#475569',
  },
});

export default UserVoucherCard;
