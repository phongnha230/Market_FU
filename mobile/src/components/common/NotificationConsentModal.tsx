import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../stores/notificationStore';
import { notificationMobileService } from '../../services/notificationMobileService';

const { width } = Dimensions.get('window');

export const NotificationConsentModal: React.FC = () => {
  const isVisible = useNotificationStore((state) => state.isPermissionModalVisible);
  const setPushPermissionGranted = useNotificationStore(
    (state) => state.setPushPermissionGranted
  );
  const setPermissionModalVisible = useNotificationStore(
    (state) => state.setPermissionModalVisible
  );

  const handleAccept = async () => {
    try {
      // 1. Xin quyền thông báo native từ hệ điều hành (Android / iOS)
      await notificationMobileService.requestNotificationPermission();
      // 2. Đăng ký Push Token với máy chủ
      await notificationMobileService.registerForPushNotificationsAsync();
      // 3. Đánh dấu người dùng đã đồng ý nhận thông báo
      setPushPermissionGranted(true);
    } catch {
      setPushPermissionGranted(true);
    }
  };

  const handleDecline = () => {
    // Người dùng từ chối -> Đánh dấu không cấp quyền, tắt modal
    setPushPermissionGranted(false);
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDecline}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Icon Ring */}
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Ionicons name="notifications" size={32} color="#F27024" />
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Bật thông báo Chợ FU?</Text>
          <Text style={styles.subtitle}>
            Đừng bỏ lỡ các giao dịch quan trọng và tin nhắn từ bạn học trong khuôn viên trường:
          </Text>

          {/* Benefit Items */}
          <View style={styles.benefitList}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="chatbubbles" size={18} color="#2563EB" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Tin nhắn & Mặc cả giá</Text>
                <Text style={styles.benefitDesc}>
                  Phản hồi ngay khi có người hỏi mua hoặc đề xuất giá mới.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#059669" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Bảo chứng Escrow</Text>
                <Text style={styles.benefitDesc}>
                  Biết ngay khi tiền cọc của đơn hàng được nạp bảo lãnh an toàn.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="location" size={18} color="#EA580C" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Lịch hẹn Safe-Point</Text>
                <Text style={styles.benefitDesc}>
                  Nhắc giờ hẹn gặp bàn giao đồ tại sảnh trường có Camera 24/7.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.88}
            onPress={handleAccept}
          >
            <Ionicons name="notifications-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>Cho phép & Bật thông báo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={handleDecline}
          >
            <Text style={styles.secondaryBtnText}>Để sau</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Bạn có thể bật hoặc tắt lại thông báo bất cứ lúc nào trong Cài đặt.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: Math.min(width - 40, 360),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  iconCircleOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  benefitList: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 1,
  },
  benefitDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
  },
  primaryBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#F27024',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F27024',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  primaryBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    width: '100%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  footerNote: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default NotificationConsentModal;
