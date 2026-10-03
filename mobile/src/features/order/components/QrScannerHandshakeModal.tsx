import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore } from '../../../stores/orderStore';

interface QrScannerHandshakeModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  expectedOtp?: string;
  onSuccess?: () => void;
}

export const QrScannerHandshakeModal: React.FC<QrScannerHandshakeModalProps> = ({
  visible,
  onClose,
  orderId,
  expectedOtp = '738192',
  onSuccess,
}) => {
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyHandshakeOtp } = useOrderStore();

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpInput).trim();
    if (!code) {
      Alert.alert('Chưa nhập mã', 'Vui lòng nhập mã OTP 6 số từ màn hình vé nhận hàng của Người mua.');
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate quick scanning network latency
      await new Promise((resolve) => setTimeout(() => resolve(true), 600));

      const res = verifyHandshakeOtp(orderId, code);
      if (res.success) {
        Alert.alert('🎉 Bàn giao thành công!', res.message);
        setOtpInput('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        Alert.alert('Xác thực thất bại', res.message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanSample = () => {
    setOtpInput(expectedOtp);
    handleVerify(expectedOtp);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.scannerModal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="scan-outline" size={20} color="#EA580C" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>Xác Nhận Nhận Hàng Safe-Point</Text>
                <Text style={styles.headerSub}>Khớp mã QR Handshake giữa 2 bên</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Viewfinder simulation */}
          <View style={styles.viewfinderWrapper}>
            <View style={styles.viewfinderBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              <View style={styles.laserLine} />
              <Ionicons name="qr-code-outline" size={72} color="rgba(255,255,255,0.4)" />
              <Text style={styles.viewfinderText}>Hướng camera vào mã QR của Người mua</Text>
            </View>
          </View>

          {/* Quick scan trigger */}
          <TouchableOpacity
            style={styles.quickScanBtn}
            onPress={handleScanSample}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={16} color="#EA580C" />
            <Text style={styles.quickScanText}>Quét tự động mã QR ({expectedOtp})</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC NHẬP MÃ OTP THỦ CÔNG</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Manual Input */}
          <View style={styles.inputBox}>
            <TextInput
              style={styles.otpInput}
              value={otpInput}
              onChangeText={setOtpInput}
              placeholder="Nhập 6 số OTP (VD: 738192)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, isVerifying && { opacity: 0.7 }]}
            onPress={() => handleVerify()}
            disabled={isVerifying}
            activeOpacity={0.85}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.confirmBtnText}>Xác Thực Bàn Giao Đồ</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerModal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    boxShadow: '0 10px 16px rgba(0, 0, 0, 0.25)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  viewfinderWrapper: {
    alignItems: 'center',
    marginBottom: 14,
  },
  viewfinderBox: {
    width: 220,
    height: 180,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#EA580C',
  },
  topLeft: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  laserLine: {
    position: 'absolute',
    top: '48%',
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: '#EF4444',
    boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)',
  },
  viewfinderText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  quickScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  quickScanText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 14,
  },
  otpInput: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 2,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 48,
    borderRadius: 12,
    boxShadow: '0 4px 6px rgba(5, 150, 105, 0.25)',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default QrScannerHandshakeModal;
