import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VietQrInvoice } from '../../../services/paymentMobileService';

interface DepositQrViewProps {
  invoice: VietQrInvoice;
}

export const DepositQrView: React.FC<DepositQrViewProps> = memo(({ invoice }) => {
  const handleCopy = (label: string, text: string) => {
    Alert.alert('Đã sao chép', `Đã sao chép ${label}: ${text}`);
  };

  return (
    <View style={styles.container}>
      {/* QR Image */}
      <View style={styles.qrWrapper}>
        <Image
          source={{ uri: invoice.qrCodeUrl }}
          style={styles.qrImage}
          resizeMode="contain"
        />
        <Text style={styles.qrHint}>Mở app ngân hàng bất kỳ để quét mã QR</Text>
      </View>

      {/* Transfer details */}
      <View style={styles.infoBox}>
        <View style={styles.row}>
          <Text style={styles.label}>Ngân hàng:</Text>
          <Text style={styles.valBold}>{invoice.bankName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Số tài khoản:</Text>
          <TouchableOpacity
            style={styles.copyRow}
            onPress={() => handleCopy('Số tài khoản', invoice.accountNo)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.valCopyable}>{invoice.accountNo}</Text>
            <Ionicons name="copy-outline" size={14} color="#EA580C" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Chủ tài khoản:</Text>
          <Text style={styles.val}>{invoice.accountName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Số tiền:</Text>
          <Text style={styles.valAmount}>{invoice.amount.toLocaleString('vi-VN')} VNĐ</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Nội dung:</Text>
          <TouchableOpacity
            style={styles.copyRow}
            onPress={() => handleCopy('Nội dung chuyển khoản', invoice.description)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.valCopyable}>{invoice.description}</Text>
            <Ionicons name="copy-outline" size={14} color="#EA580C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 6,
  },
  qrWrapper: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  qrImage: {
    width: 220,
    height: 220,
    borderRadius: 8,
  },
  qrHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '600',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  val: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  valBold: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '800',
  },
  valAmount: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '800',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  valCopyable: {
    fontSize: 12.5,
    color: '#EA580C',
    fontWeight: '800',
  },
});

export default DepositQrView;
