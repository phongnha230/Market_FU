import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socketMobileService } from '../../../services/socketMobileService';
import { paymentMobileService } from '../../../services/paymentMobileService';

interface MobileVietQRModalProps {
  visible: boolean;
  onClose: () => void;
  orderCode: string;
  totalAmount: number;
  productTitle: string;
  onPaymentSuccess: () => void;
}

export const MobileVietQRModal: React.FC<MobileVietQRModalProps> = ({
  visible,
  onClose,
  orderCode,
  totalAmount,
  productTitle,
  onPaymentSuccess,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);

  const BANK_ID = 'MB';
  const ACCOUNT_NO = '0000305848243';
  const ACCOUNT_NAME = 'HOANG THI DIEU HUYEN';
  const BANK_NAME = 'MB Bank (Ngân hàng Quân Đội)';

  // URL VietQR Quicklink Napas 24/7
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    orderCode
  )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  // 1. Lắng nghe Webhook thanh toán qua Socket.IO Realtime
  useEffect(() => {
    if (!visible) return;

    console.log(`🔌 [MobileVietQRModal] Bắt đầu lắng nghe sự kiện order_paid cho mã ${orderCode}...`);
    const unsubscribe = socketMobileService.onOrderPaid((data) => {
      if (data?.orderCode === orderCode || !data?.orderCode) {
        Alert.alert(
          '🎉 Thanh toán Escrow thành công!',
          `Hệ thống đã nhận được ${totalAmount.toLocaleString('vi-VN')}đ qua PayOS/VietQR. Tiền đang được bảo lãnh ký quỹ an toàn.`,
          [{ text: 'Xem đơn hàng', onPress: onPaymentSuccess }]
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [visible, orderCode, totalAmount, onPaymentSuccess]);

  const handleCopy = (field: string, text: string) => {
    setCopiedField(field);
    Alert.alert('Đã sao chép', text, [{ text: 'OK' }]);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Mở App Ngân hàng qua Deep Link hoặc PayOS Web
  const handleOpenBankApp = async () => {
    try {
      // Thử mở qua scheme ngân hàng hoặc Napas QuickLink
      const napasDeepLink = `vietqr://transfer?bankId=${BANK_ID}&accountNo=${ACCOUNT_NO}&amount=${totalAmount}&memo=${encodeURIComponent(
        orderCode
      )}`;
      
      const canOpen = await Linking.canOpenURL(napasDeepLink);
      if (canOpen) {
        await Linking.openURL(napasDeepLink);
      } else {
        // Fallback: Mở ảnh QR trực tiếp để người dùng chụp màn hình / quét trong app ngân hàng
        await Linking.openURL(vietQrUrl);
      }
    } catch {
      // Mở trình duyệt ngoài
      await Linking.openURL(vietQrUrl);
    }
  };

  // Nút kiểm tra trạng thái thanh toán từ máy chủ
  const handleManualCheck = async () => {
    try {
      setIsChecking(true);
      const res = await paymentMobileService.checkPaymentStatus(orderCode);
      if (res.isPaid) {
        Alert.alert(
          '🎉 Khớp lệnh thanh toán thành công!',
          `Đã xác nhận khoản cọc Escrow ${totalAmount.toLocaleString('vi-VN')}đ cho đơn #${orderCode}.`,
          [{ text: 'Tiếp tục', onPress: onPaymentSuccess }]
        );
      } else {
        Alert.alert(
          'Chưa nhận được thanh toán',
          'Hệ thống đang chờ giao dịch chuyển khoản từ ngân hàng của bạn. Vui lòng thử lại sau giây lát hoặc đợi thông báo tự động.'
        );
      }
    } catch {
      Alert.alert(
        'Chưa nhận được thanh toán',
        'Chưa phát hiện giao dịch thành công. Vui lòng kiểm tra lại nội dung chuyển khoản.'
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Chờ thanh toán (Tự động khớp)</Text>
              </View>
              <Text style={styles.headerTitle}>Quét mã VietQR Napas 24/7</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Banner Hướng dẫn */}
            <View style={styles.hintBanner}>
              <Ionicons name="flash" size={16} color="#EA580C" />
              <Text style={styles.hintBannerText}>
                Mở bất kỳ App Ngân hàng nào (VCB, MB, Techcombank, TPBank,...) hoặc MoMo quét mã dưới đây để chuyển khoản 0đ phí.
              </Text>
            </View>

            {/* QR Code Container */}
            <View style={styles.qrWrapper}>
              {qrLoading && (
                <View style={styles.qrLoadingBox}>
                  <ActivityIndicator size="large" color="#EA580C" />
                  <Text style={styles.qrLoadingText}>Đang tạo mã VietQR bảo mật...</Text>
                </View>
              )}
              <Image
                source={{ uri: vietQrUrl }}
                style={styles.qrImage}
                onLoadEnd={() => setQrLoading(false)}
                resizeMode="contain"
              />
              <Text style={styles.scanNotice}>⚡ Hệ thống tự động duyệt trong 2-3 giây</Text>
            </View>

            {/* Thông tin chuyển khoản chi tiết */}
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>THÔNG TIN CHUYỂN KHOẢN CHÍNH XÁC</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngân hàng</Text>
                <Text style={styles.infoValueBold}>{BANK_NAME}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tài khoản</Text>
                <TouchableOpacity
                  style={styles.copyRow}
                  onPress={() => handleCopy('stk', ACCOUNT_NO)}
                >
                  <Text style={styles.infoValueHighlight}>{ACCOUNT_NO}</Text>
                  <Ionicons
                    name={copiedField === 'stk' ? 'checkmark-circle' : 'copy-outline'}
                    size={16}
                    color="#EA580C"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Chủ tài khoản</Text>
                <Text style={styles.infoValueBold}>{ACCOUNT_NAME}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tiền cọc</Text>
                <TouchableOpacity
                  style={styles.copyRow}
                  onPress={() => handleCopy('amount', totalAmount.toString())}
                >
                  <Text style={styles.infoAmount}>{totalAmount.toLocaleString('vi-VN')} đ</Text>
                  <Ionicons
                    name={copiedField === 'amount' ? 'checkmark-circle' : 'copy-outline'}
                    size={16}
                    color="#EA580C"
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Nội dung CK</Text>
                <TouchableOpacity
                  style={styles.copyRow}
                  onPress={() => handleCopy('memo', orderCode)}
                >
                  <Text style={styles.infoMemo}>{orderCode}</Text>
                  <Ionicons
                    name={copiedField === 'memo' ? 'checkmark-circle' : 'copy-outline'}
                    size={16}
                    color="#EA580C"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.warningNote}>
                <Ionicons name="alert-circle" size={14} color="#D97706" />
                <Text style={styles.warningText}>
                  Bắt buộc ghi đúng nội dung <Text style={{ fontWeight: '800' }}>{orderCode}</Text> để hệ thống tự động nhận diện và bảo lãnh tiền.
                </Text>
              </View>
            </View>

            {/* Smart Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.bankAppBtn}
                onPress={handleOpenBankApp}
                activeOpacity={0.85}
              >
                <Ionicons name="phone-portrait-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.bankAppBtnText}>Mở App Ngân hàng thanh toán</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkPaidBtn}
                onPress={handleManualCheck}
                disabled={isChecking}
                activeOpacity={0.8}
              >
                {isChecking ? (
                  <ActivityIndicator size="small" color="#EA580C" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={18} color="#EA580C" style={{ marginRight: 6 }} />
                    <Text style={styles.checkPaidBtnText}>Tôi đã chuyển khoản xong (Kiểm tra)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 16,
  },
  hintBannerText: {
    flex: 1,
    fontSize: 11.5,
    color: '#9A3412',
    lineHeight: 16,
  },
  qrWrapper: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  qrLoadingBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    zIndex: 10,
    borderRadius: 16,
  },
  qrLoadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '600',
  },
  qrImage: {
    width: 230,
    height: 230,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  scanNotice: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  infoBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValueBold: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  infoMemo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  warningNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    marginTop: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  actionButtons: {
    gap: 10,
  },
  bankAppBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 5px rgba(234, 88, 12, 0.25)',
  },
  bankAppBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  checkPaidBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkPaidBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EA580C',
  },
});

export default MobileVietQRModal;
