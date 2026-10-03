import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEPOSIT_PACKAGES, DepositPackage } from '../constants/depositPackages.constants';
import { DepositPackageSelector } from './DepositPackageSelector';
import { DepositQrView } from './DepositQrView';
import { paymentMobileService, VietQrInvoice } from '../../../services/paymentMobileService';
import { useWalletStore } from '../../../stores/walletStore';

interface DepositCoinModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export const DepositCoinModal: React.FC<DepositCoinModalProps> = ({
  visible,
  onClose,
  userId,
}) => {
  const insets = useSafeAreaInsets();
  const { addCoins, deposit } = useWalletStore();

  const [selectedPkg, setSelectedPkg] = useState<DepositPackage>(DEPOSIT_PACKAGES[1]);
  const [step, setStep] = useState<'SELECT' | 'QR'>('SELECT');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const invoice: VietQrInvoice = useMemo(() => {
    return paymentMobileService.createDepositInvoice(selectedPkg.amount, userId);
  }, [selectedPkg.amount, userId]);

  const handleSelectPackage = useCallback((pkg: DepositPackage) => {
    setSelectedPkg(pkg);
  }, []);

  const handleProceedToQr = useCallback(() => {
    setStep('QR');
  }, []);

  const handleBackToSelect = useCallback(() => {
    setStep('SELECT');
  }, []);

  const handleConfirmTransfer = useCallback(async () => {
    setIsVerifying(true);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1200));

    // Optimistically credit coins & escrow balance
    addCoins(selectedPkg.coins);
    await deposit(selectedPkg.amount);

    setIsVerifying(false);
    Alert.alert(
      '🎉 Nạp thành công!',
      `Đã cộng +${selectedPkg.coins} Xu và ${selectedPkg.amount.toLocaleString(
        'vi-VN'
      )}đ vào Ví Campus của bạn.`
    );
    setStep('SELECT');
    onClose();
  }, [selectedPkg, addCoins, deposit, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              {step === 'QR' && (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={handleBackToSelect}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </TouchableOpacity>
              )}
              <Text style={styles.title}>
                {step === 'SELECT' ? 'Nạp Xu & Tiền Ví Campus' : 'Quét Mã VietQR Napas'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {step === 'SELECT' ? (
              <>
                <Text style={styles.subtitle}>
                  Chọn gói Xu tích lũy để đẩy bài viết, mua huy hiệu hoặc thanh toán ký quỹ:
                </Text>
                <DepositPackageSelector
                  selectedAmount={selectedPkg.amount}
                  onSelectPackage={handleSelectPackage}
                />
                <View style={styles.guaranteeBox}>
                  <Ionicons name="shield-checkmark" size={16} color="#059669" />
                  <Text style={styles.guaranteeText}>
                    Hỗ trợ nạp tự động qua VietQR 24/7. Hoàn tiền 100% nếu có sai sót.
                  </Text>
                </View>
              </>
            ) : (
              <DepositQrView invoice={invoice} />
            )}
          </ScrollView>

          {/* Footer action */}
          <View style={styles.footer}>
            {step === 'SELECT' ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleProceedToQr}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>
                  Tiếp tục ({selectedPkg.amount.toLocaleString('vi-VN')}đ)
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, isVerifying && styles.btnDisabled]}
                onPress={handleConfirmTransfer}
                disabled={isVerifying}
                activeOpacity={0.85}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>Tôi đã chuyển khoản</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    maxHeight: 460,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  guaranteeText: {
    fontSize: 11.5,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#EA580C',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DepositCoinModal;
