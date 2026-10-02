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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface RequireAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateLogin?: () => void;
  onNavigateKyc?: () => void;
  mode?: 'auth' | 'kyc';
  title?: string;
  message?: string;
}

export const RequireAuthModal: React.FC<RequireAuthModalProps> = ({
  visible,
  onClose,
  onNavigateLogin,
  onNavigateKyc,
  mode = 'auth',
  title,
  message,
}) => {
  const insets = useSafeAreaInsets();

  const isKyc = mode === 'kyc';

  const defaultTitle = isKyc
    ? 'Yêu cầu xác thực Sinh viên FPT'
    : 'Yêu cầu đăng nhập tài khoản';

  const defaultMessage = isKyc
    ? 'Theo quy định chợ Market FU, bạn cần xác thực Thẻ Sinh Viên FPT để đăng bán hàng và quản lý tin rao. Hãy xác thực ngay để nhận Tích Xanh uy tín!'
    : 'Chức năng này chỉ dành cho thành viên Market FU. Bạn vui lòng đăng nhập tài khoản Sinh viên FPT để trải nghiệm đầy đủ các tính năng!';

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
          <View style={[styles.iconCircle, isKyc ? styles.iconCircleKyc : styles.iconCircleAuth]}>
            <Ionicons
              name={isKyc ? 'shield-checkmark' : 'lock-closed'}
              size={32}
              color={isKyc ? '#2563EB' : '#EA580C'}
            />
          </View>

          <Text style={styles.titleText}>{title || defaultTitle}</Text>
          <Text style={styles.messageText}>{message || defaultMessage}</Text>

          <View style={styles.featureBox}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.featureText}>
                {isKyc ? 'Đăng bán đồ thanh lý không giới hạn' : 'Chat & Trả giá trực tiếp với người bán'}
              </Text>
            </View>
            <View style={[styles.featureRow, { marginTop: 6 }]}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.featureText}>
                {isKyc ? 'Bảo đảm giao dịch qua Quỹ Escrow sinh viên' : 'Đổi voucher đồ ăn canteen, Passio giảm 15k'}
              </Text>
            </View>
            <View style={[styles.featureRow, { marginTop: 6 }]}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.featureText}>
                {isKyc ? 'Huy hiệu Sinh viên FPT xác thực uy tín' : 'Trợ lý ảo FU Chatbot hỗ trợ 24/7'}
              </Text>
            </View>
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
              style={[styles.primaryBtn, isKyc ? styles.primaryBtnKyc : styles.primaryBtnAuth]}
              onPress={() => {
                onClose();
                if (isKyc && onNavigateKyc) {
                  onNavigateKyc();
                } else if (!isKyc && onNavigateLogin) {
                  onNavigateLogin();
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {isKyc ? 'Xác thực ngay' : 'Đăng nhập ngay'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
