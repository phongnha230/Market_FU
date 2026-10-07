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

  const partnerName =
    userVoucher.voucher?.partner === 'CANTEEN'
      ? 'Căn Tin FPT'
      : userVoucher.voucher?.partner === 'PASSIO'
      ? 'Passio Coffee'
      : userVoucher.voucher?.partner === 'SEVEN_ELEVEN'
      ? '7-Eleven FPT'
      : 'CampusShip Express';

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(userVoucher.voucherCode);
      Alert.alert('📋 Đã sao chép', `Mã voucher "${userVoucher.voucherCode}" đã được sao chép vào bộ nhớ tạm.`);
    } catch {
      Alert.alert('Mã voucher', userVoucher.voucherCode);
    }
  };

  return (
    <View
      style={[
        styles.card,
        isUnused ? styles.cardUnused : isUsed ? styles.cardUsed : styles.cardExpired,
      ]}
    >
      {/* Top Status Row */}
      <View style={styles.topRow}>
        <View style={styles.partnerBadge}>
          <Text style={styles.partnerText}>{partnerName.toUpperCase()}</Text>
        </View>

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
          >
            {isUnused ? '🟢 Sẵn sàng dùng' : isUsed ? '✅ Đã sử dụng' : '⏳ Đã hết hạn'}
          </Text>
        </View>
      </View>

      {/* Main Info */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {userVoucher.voucher?.title || 'Voucher Sinh Viên Campus'}
        </Text>
        <Text style={styles.discountText}>
          Giảm {(userVoucher.voucher?.discountValue || 10000).toLocaleString('vi-VN')} VNĐ
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {userVoucher.voucher?.description || 'Áp dụng giảm trực tiếp khi thanh toán tại quầy.'}
        </Text>
      </View>

      {/* Voucher Code Box */}
      <View style={styles.codeBox}>
        <View style={styles.codeInfo}>
          <Text style={styles.codeLabel}>MÃ VOUCHER:</Text>
          <Text style={styles.codeValue}>{userVoucher.voucherCode}</Text>
        </View>

        <TouchableOpacity
          style={styles.copyBtn}
          activeOpacity={0.7}
          onPress={handleCopyCode}
        >
          <Ionicons name="copy-outline" size={16} color="#EA580C" />
          <Text style={styles.copyText}>Chép mã</Text>
        </TouchableOpacity>
      </View>

      {/* Expiry & Timestamps */}
      <View style={styles.timeBox}>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Hạn dùng:</Text>
          <Text style={styles.timeValue}>{userVoucher.expiredAt}</Text>
        </View>
        {isUsed && userVoucher.usedAt && (
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Đã dùng lúc:</Text>
            <Text style={styles.timeValue}>{userVoucher.usedAt}</Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.actionBtn, isUnused ? styles.btnOpenQr : styles.btnViewDetail]}
        activeOpacity={0.85}
        onPress={() => onOpenQr(userVoucher)}
      >
        <Ionicons
          name="qr-code-outline"
          size={16}
          color={isUnused ? '#FFFFFF' : '#475569'}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.actionBtnText, isUnused ? styles.btnOpenQrText : styles.btnViewDetailText]}>
          {isUnused ? 'Mở Mã QR & Quét Tại Quầy' : 'Xem Chi Tiết Mã'}
        </Text>
      </TouchableOpacity>
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
  cardUnused: {
    borderColor: '#FED7AA',
  },
  cardUsed: {
    borderColor: '#E2E8F0',
    opacity: 0.9,
  },
  cardExpired: {
    borderColor: '#F1F5F9',
    opacity: 0.65,
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  partnerText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusUnused: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusUsed: {
    backgroundColor: '#F1F5F9',
  },
  statusExpired: {
    backgroundColor: '#FFE4E6',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statusTextUnused: {
    color: '#065F46',
  },
  statusTextUsed: {
    color: '#64748B',
  },
  statusTextExpired: {
    color: '#BE123C',
  },
  body: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 19,
    marginBottom: 2,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
    marginBottom: 4,
  },
  desc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  codeInfo: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  copyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  timeBox: {
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
    marginBottom: 10,
    gap: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  timeValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnOpenQr: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnViewDetail: {
    backgroundColor: '#F1F5F9',
  },
  actionBtnText: {
    fontSize: 12.5,
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
