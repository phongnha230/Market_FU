import React from 'react';
import { Alert } from 'react-native';
import { useOrderStore } from '../../../stores/orderStore';
import { CameraSubsystemModal } from '../../../components/camera/CameraSubsystemModal';

export interface QrScannerHandshakeModalProps {
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
  const { verifyHandshakeOtp } = useOrderStore();

  const handleVerify = (scannedCode: string) => {
    let cleanCode = (scannedCode || '').trim();

    // Nếu scan ra URL hoặc chuỗi json chứa orderId / handshakeOtp
    if (cleanCode.startsWith('http')) {
      try {
        const url = new URL(cleanCode);
        cleanCode = url.searchParams.get('otp') || url.searchParams.get('code') || cleanCode;
      } catch {
        // Giữ nguyên
      }
    }

    if (!cleanCode) {
      Alert.alert('Chưa có mã', 'Không đọc được dữ liệu mã QR hoặc mã OTP.');
      return;
    }

    const res = verifyHandshakeOtp(orderId, cleanCode);
    if (res.success) {
      Alert.alert('🎉 Bàn giao thành công!', res.message);
      onClose();
      if (onSuccess) onSuccess();
    } else {
      Alert.alert('Xác thực thất bại', res.message);
    }
  };

  return (
    <CameraSubsystemModal
      visible={visible}
      mode="qr"
      title="Xác Nhận Nhận Hàng Safe-Point"
      subtitle={`Khớp mã QR Handshake • Đơn #${orderId}`}
      onClose={onClose}
      onBarcodeScanned={handleVerify}
      expectedOtp={expectedOtp}
    />
  );
};

export default QrScannerHandshakeModal;
