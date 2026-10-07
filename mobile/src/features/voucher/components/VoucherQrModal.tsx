import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { UserVoucher } from '../../../stores/voucherStore';

interface VoucherQrModalProps {
  voucher: UserVoucher | null;
  onClose: () => void;
  onConfirmUse: (voucher: UserVoucher) => Promise<void>;
}

export const VoucherQrModal: React.FC<VoucherQrModalProps> = ({
  voucher,
  onClose,
  onConfirmUse,
}) => {
  const [isUsing, setIsUsing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!voucher) return null;

  const isUnused = voucher.status === 'UNUSED';

  const partnerName =
    voucher.voucher?.partner === 'CANTEEN'
      ? 'Căn Tin FPT'
      : voucher.voucher?.partner === 'PASSIO'
      ? 'Passio Coffee'
      : voucher.voucher?.partner === 'SEVEN_ELEVEN'
      ? '7-Eleven FPT'
      : 'CampusShip Express';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    voucher.voucherCode
  )}`;

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(voucher.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('📋 Đã sao chép', `Mã voucher "${voucher.voucherCode}" đã được sao chép.`);
    } catch {
      Alert.alert('Mã voucher', voucher.voucherCode);
    }
  };

  const handleConfirm = async () => {
    Alert.alert(
      'Xác nhận dùng voucher',
      'Bạn chỉ xác nhận sau khi nhân viên tại quầy đã quét mã hoặc áp dụng giảm giá. Bạn có chắc chắn muốn xác nhận?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận ngay',
          onPress: async () => {
            setIsUsing(true);
            try {
              await onConfirmUse(voucher);
            } finally {
              setIsUsing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={!!voucher} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <View style={styles.iconCircle}>
                <Ionicons name="ticket" size={18} color="#EA580C" />
              </View>
              <View>
                <Text style={styles.title}>Mã Ưu Đãi Sinh Viên</Text>
                <Text style={styles.subTitle}>Độc quyền riêng bạn • Dùng 1 lần tại quầy</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Partner & Title */}
          <View style={styles.metaSection}>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerText}>{partnerName.toUpperCase()}</Text>
            </View>
            <Text style={styles.voucherTitle}>{voucher.voucher?.title}</Text>
            <Text style={styles.discountHighlight}>
              Giảm {(voucher.voucher?.discountValue || 10000).toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <Text style={styles.qrNote}>
              Đưa mã QR cho nhân viên Căn tin / Passio / 7-Eleven quét
            </Text>
          </View>

          {/* Code string with copy button */}
          <View style={styles.codeRow}>
            <View style={styles.codeTextWrapper}>
              <Text style={styles.codeLabel}>MÃ VOUCHER</Text>
              <Text style={styles.codeText}>{voucher.voucherCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={14}
                color="#EA580C"
              />
              <Text style={styles.copyBtnText}>{copied ? 'Đã chép' : 'Sao chép'}</Text>
            </TouchableOpacity>
          </View>

          {/* Expiry */}
          <View style={styles.expiryRow}>
            <Text style={styles.expiryLabel}>Hạn sử dụng:</Text>
            <Text style={styles.expiryValue}>{voucher.expiredAt}</Text>
          </View>

          {/* Confirmation button */}
          {isUnused ? (
            <TouchableOpacity
              style={styles.confirmBtn}
              activeOpacity={0.85}
              disabled={isUsing}
              onPress={handleConfirm}
            >
              {isUsing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmBtnText}>Tôi đã dùng tại quầy (Xác nhận)</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.usedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.usedBadgeText}>
                Voucher này đã được xác nhận sử dụng {voucher.usedAt ? `vào ${voucher.usedAt}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  metaSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  partnerBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  partnerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  voucherTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  discountHighlight: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  qrImage: {
    width: 170,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  qrNote: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  codeTextWrapper: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  expiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  expiryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  expiryValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  usedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  usedBadgeText: {
    color: '#065F46',
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
});

export default VoucherQrModal;
