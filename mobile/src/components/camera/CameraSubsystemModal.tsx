import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(SCREEN_WIDTH * 0.72, 260);

export interface CameraSubsystemModalProps {
  visible: boolean;
  mode: 'qr' | 'capture';
  title?: string;
  subtitle?: string;
  onClose: () => void;
  // Callback cho QR Handshake
  onBarcodeScanned?: (data: string) => void;
  // Callback cho AI Vision Capture
  onCapture?: (photoUri: string) => void;
  // Giá trị mẫu hoặc OTP gợi ý để test nhanh trên simulator
  expectedOtp?: string;
}

export const CameraSubsystemModal: React.FC<CameraSubsystemModalProps> = ({
  visible,
  mode,
  title,
  subtitle,
  onClose,
  onBarcodeScanned,
  onCapture,
  expectedOtp,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanned, setScanned] = useState(false);
  const insets = useSafeAreaInsets();
  const [manualOtp, setManualOtp] = useState('');
  const cameraRef = useRef<CameraView>(null);

  // Reset scan lock khi modal mở lại
  React.useEffect(() => {
    if (visible) {
      setScanned(false);
      setIsProcessing(false);
      setManualOtp('');
    }
  }, [visible]);

  // Xử lý khi quét trúng mã QR (QR Handshake)
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);

    try {
      if (onBarcodeScanned) {
        onBarcodeScanned(data);
      }
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 800);
    }
  };

  // Xử lý chụp ảnh định giá AI (AI Vision Capture)
  const handleCapturePhoto = async () => {
    if (!cameraRef.current || isProcessing) return;
    setIsProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri && onCapture) {
        onCapture(photo.uri);
      }
    } catch (e: any) {
      Alert.alert('Lỗi chụp ảnh', e?.message || 'Không thể chụp ảnh từ Camera.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý nhập mã thủ công hoặc test nhanh
  const handleManualSubmit = () => {
    const code = manualOtp.trim();
    if (!code) {
      Alert.alert('Chưa nhập mã', 'Vui lòng nhập mã OTP hoặc mã đối soát Handshake.');
      return;
    }
    if (onBarcodeScanned) {
      onBarcodeScanned(code);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title || (mode === 'qr' ? 'Quét Mã QR Handshake' : 'Chụp Ảnh Định Giá AI')}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subtitle ||
                (mode === 'qr'
                  ? 'Hướng camera vào mã QR vé nhận hàng'
                  : 'Đặt trọn vẹn món đồ vào giữa khung hình')}
            </Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={[styles.iconCircleBtn, torch && styles.activeIconBtn]}
              onPress={() => setTorch((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Ionicons name={torch ? 'flash' : 'flash-outline'} size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {mode === 'capture' && (
              <TouchableOpacity
                style={[styles.iconCircleBtn, { marginLeft: 8 }]}
                onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Camera Viewport or Permission Request */}
        {!permission ? (
          <View style={styles.centerFallback}>
            <ActivityIndicator size="large" color="#EA580C" />
            <Text style={styles.fallbackText}>Đang khởi tạo cảm biến Camera...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.centerFallback}>
            <View style={styles.permissionIconCircle}>
              <Ionicons name="camera" size={36} color="#EA580C" />
            </View>
            <Text style={styles.permissionTitle}>Cần Cấp Quyền Camera</Text>
            <Text style={styles.permissionDesc}>
              Ứng dụng cần quyền sử dụng máy ảnh để quét mã QR Handshake hoặc chụp ảnh nhận diện sản phẩm qua Gemini AI.
            </Text>
            <TouchableOpacity style={styles.grantBtn} onPress={requestPermission} activeOpacity={0.85}>
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.grantBtnText}>Cho Phép Truy Cập Camera</Text>
            </TouchableOpacity>

            {/* Vẫn cho phép nhập mã OTP thủ công ngay cả khi từ chối quyền */}
            {mode === 'qr' && (
              <View style={styles.manualFallbackBox}>
                <Text style={styles.manualFallbackTitle}>HOẶC NHẬP MÃ OTP THỦ CÔNG</Text>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Nhập mã 4 hoặc 6 số"
                  placeholderTextColor="#64748B"
                  value={manualOtp}
                  onChangeText={setManualOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <TouchableOpacity style={styles.manualSubmitBtn} onPress={handleManualSubmit}>
                  <Text style={styles.manualSubmitBtnText}>Xác Thực Ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              enableTorch={torch}
              barcodeScannerSettings={
                mode === 'qr'
                  ? {
                      barcodeTypes: ['qr'],
                    }
                  : undefined
              }
              onBarcodeScanned={mode === 'qr' && !scanned ? handleBarcodeScanned : undefined}
            />

            {/* Overlay Viewfinder HUD */}
            <View style={styles.hudOverlay}>
              {mode === 'qr' ? (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.qrHudContainer}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                >
                  <View style={styles.viewfinderCenterWrap}>
                    <View style={styles.viewfinderBox}>
                      <View style={[styles.corner, styles.tl]} />
                      <View style={[styles.corner, styles.tr]} />
                      <View style={[styles.corner, styles.bl]} />
                      <View style={[styles.corner, styles.br]} />
                      <View style={styles.scanLaser} />
                    </View>
                    <Text style={styles.viewfinderHint}>
                      Căn chỉnh mã QR Handshake vào trong khung ngắm
                    </Text>
                  </View>

                  {/* Khối Nhập Mã OTP Cân Đối Ở Đáy */}
                  <View style={[styles.qrBottomCardWrapper, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
                    <View style={styles.qrBottomCard}>
                      <View style={styles.cardHeaderRow}>
                        <Ionicons name="key" size={15} color="#FB923C" />
                        <Text style={styles.cardHeaderTitle}>HOẶC NHẬP MÃ OTP TỪ NGƯỜI MUA</Text>
                      </View>

                      {Boolean(__DEV__) && !!expectedOtp && /^[0-9]{4,6}$/.test(expectedOtp) ? (
                        <TouchableOpacity
                          style={styles.quickTestBtn}
                          onPress={() => {
                            setManualOtp(expectedOtp);
                            if (onBarcodeScanned) onBarcodeScanned(expectedOtp);
                          }}
                        >
                          <Ionicons name="flash-outline" size={14} color="#EA580C" />
                          <Text style={styles.quickTestText}>Quét thử mẫu ({expectedOtp})</Text>
                        </TouchableOpacity>
                      ) : null}

                      <View style={styles.otpManualRow}>
                        <TextInput
                          style={styles.otpCompactInput}
                          placeholder="Mã OTP 4 số..."
                          placeholderTextColor="#64748B"
                          keyboardType="numeric"
                          maxLength={6}
                          value={manualOtp}
                          onChangeText={setManualOtp}
                        />
                        <TouchableOpacity
                          style={[styles.otpVerifyBtn, isProcessing && { opacity: 0.7 }]}
                          onPress={handleManualSubmit}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                              <Text style={styles.otpVerifyBtnText}>Khớp Mã</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              ) : (
                /* AI Capture Overlay */
                <View style={styles.captureHud}>
                  <View style={styles.captureFrameGuide}>
                    <Ionicons name="scan-outline" size={VIEWFINDER_SIZE * 0.9} color="rgba(255,255,255,0.25)" />
                  </View>

                  <View style={styles.captureBottomBar}>
                    <Text style={styles.captureHint}>
                      AI Gemini sẽ tự động phân tích chi tiết & định giá từ bức ảnh này
                    </Text>

                    <TouchableOpacity
                      style={[styles.shutterBtn, isProcessing && { opacity: 0.6 }]}
                      onPress={handleCapturePhoto}
                      disabled={isProcessing}
                      activeOpacity={0.8}
                    >
                      <View style={styles.shutterInnerCircle}>
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#EA580C" />
                        ) : (
                          <Ionicons name="camera" size={28} color="#EA580C" />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Global Loading Spinner when processing API */}
        {isProcessing && mode === 'qr' && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.processingText}>Đang đối soát mã QR Handshake...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  topBar: {
    height: Platform.OS === 'ios' ? 96 : 76,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBtn: {
    backgroundColor: '#EA580C',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderBox: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#F97316',
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  scanLaser: {
    position: 'absolute',
    top: '50%',
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#EF4444',
    boxShadow: '0 0 8px rgba(239, 68, 68, 0.9)',
  },
  viewfinderHint: {
    color: '#E2E8F0',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  qrHudContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewfinderCenterWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  qrBottomCardWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  qrBottomCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  quickTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.18)',
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    gap: 4,
  },
  quickTestText: {
    color: '#FB923C',
    fontSize: 11.5,
    fontWeight: '700',
  },
  otpManualRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  otpCompactInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    paddingHorizontal: 14,
    height: 48,
    textAlign: 'center',
    letterSpacing: 4,
  },
  otpVerifyBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
  },
  otpVerifyBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  captureHud: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  captureFrameGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBottomBar: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  captureHint: {
    color: '#E2E8F0',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  shutterBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  fallbackText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 12,
  },
  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  permissionDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  manualFallbackBox: {
    marginTop: 30,
    width: '100%',
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 14,
  },
  manualFallbackTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  manualInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  manualSubmitBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  manualSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
});

export default CameraSubsystemModal;
