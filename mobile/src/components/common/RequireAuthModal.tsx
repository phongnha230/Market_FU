import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface RequireAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateLogin?: () => void;
  onNavigateKyc?: () => void;
  mode?: 'auth' | 'seller' | 'kyc';
  title?: string;
  message?: string;
}

interface RequireAuthModalModeConfig {
  defaultTitle: string;
  defaultMessage: string;
  icon: React.ReactNode;
  iconCircleStyleKey: 'iconCircleAuth' | 'iconCircleKyc' | 'iconCircleSeller';
  primaryBtnStyleKey: 'primaryBtnAuth' | 'primaryBtnKyc' | 'primaryBtnSeller';
  primaryBtnText: string;
  features: string[];
}

const MODE_CONFIGS: Record<'auth' | 'seller' | 'kyc', RequireAuthModalModeConfig> = {
  auth: {
    defaultTitle: 'Yêu cầu đăng nhập tài khoản',
    defaultMessage:
      'Chức năng này chỉ dành cho thành viên Market FU. Bạn vui lòng đăng nhập tài khoản Sinh viên FPT để trải nghiệm đầy đủ các tính năng!',
    icon: <Ionicons name="lock-closed" size={32} color="#EA580C" />,
    iconCircleStyleKey: 'iconCircleAuth',
    primaryBtnStyleKey: 'primaryBtnAuth',
    primaryBtnText: 'Đăng nhập ngay',
    features: [
      'Chat & Trả giá trực tiếp với người bán qua Safe-Point',
      'Bảo vệ tiền 100% trong quỹ tạm giữ Escrow',
      'Đổi voucher đồ ăn Canteen, Passio Coffee',
    ],
  },
  seller: {
    defaultTitle: 'Chỉ dành cho Người Bán (Seller)',
    defaultMessage:
      'Theo quy định chợ Market FU, chỉ tài khoản có vai trò Người Bán (Seller) mới được quyền đăng bán sản phẩm và quản lý kho hàng. Tài khoản Người Mua (Buyer) chỉ có quyền xem, trả giá và đặt mua.',
    icon: <MaterialCommunityIcons name="storefront" size={34} color="#4338CA" />,
    iconCircleStyleKey: 'iconCircleSeller',
    primaryBtnStyleKey: 'primaryBtnSeller',
    primaryBtnText: 'Xem quyền Seller',
    features: [
      'Quyền mở gian hàng và đăng bán đồ không giới hạn',
      'Quản lý kho hàng, đơn đặt cọc và quỹ bảo hộ Escrow',
      'Huy hiệu TOP SELLER uy tín toàn hệ thống 5 Campus',
    ],
  },
  kyc: {
    defaultTitle: 'Yêu cầu xác thực Sinh viên FPT',
    defaultMessage:
      'Theo quy định chợ Market FU, bạn cần xác thực Thẻ Sinh Viên FPT để trải nghiệm các đặc quyền Campus.',
    icon: <Ionicons name="shield-checkmark" size={32} color="#2563EB" />,
    iconCircleStyleKey: 'iconCircleKyc',
    primaryBtnStyleKey: 'primaryBtnKyc',
    primaryBtnText: 'Xác thực ngay',
    features: [
      'Chat & Trả giá trực tiếp với người bán qua Safe-Point',
      'Bảo vệ tiền 100% trong quỹ tạm giữ Escrow',
      'Đổi voucher đồ ăn Canteen, Passio Coffee',
    ],
  },
};

export const RequireAuthModal: React.FC<RequireAuthModalProps> = React.memo(({
  visible,
  onClose,
  onNavigateLogin,
  onNavigateKyc,
  mode = 'auth',
  title,
  message,
}) => {
  const insets = useSafeAreaInsets();
  const config = MODE_CONFIGS[mode] || MODE_CONFIGS.auth;

  const handlePrimaryPress = () => {
    onClose();
    if (mode === 'seller' || mode === 'kyc') {
      if (onNavigateKyc) {
        onNavigateKyc();
        return;
      }
    }
    if (onNavigateLogin) {
      onNavigateLogin();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.dialogCard, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          <View style={[styles.iconCircle, styles[config.iconCircleStyleKey]]}>
            {config.icon}
          </View>

          <Text style={styles.titleText}>{title || config.defaultTitle}</Text>
          <Text style={styles.messageText}>{message || config.defaultMessage}</Text>

          <View style={styles.featureBox}>
            {config.features.map((featureText, idx) => (
              <View key={featureText} style={[styles.featureRow, idx > 0 && { marginTop: 6 }]}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={styles.featureText}>{featureText}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Để sau</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, styles[config.primaryBtnStyleKey]]}
              onPress={handlePrimaryPress}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {config.primaryBtnText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default RequireAuthModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleAuth: {
    backgroundColor: '#FFEDD5',
  },
  iconCircleKyc: {
    backgroundColor: '#DBEAFE',
  },
  iconCircleSeller: {
    backgroundColor: '#EEF2FF',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  featureBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  primaryBtn: {
    flex: 1.3,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnAuth: {
    backgroundColor: '#EA580C',
  },
  primaryBtnKyc: {
    backgroundColor: '#2563EB',
  },
  primaryBtnSeller: {
    backgroundColor: '#4338CA',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
