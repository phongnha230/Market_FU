import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProfile } from '../../../stores/userStore';

interface TrustScoreModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export const TrustScoreModal: React.FC<TrustScoreModalProps> = ({
  visible,
  onClose,
  user,
}) => {
  const insets = useSafeAreaInsets();
  const isSeller = user?.role === 'SELLER';
  const isVerified = Boolean(
    user?.isKycVerified ||
    user?.kycStatus === 'APPROVED' ||
    ((user?.role as string) !== 'UNVERIFIED' && Boolean(user?.studentId))
  );

  const reputationScore = typeof user?.reputationScore === 'number' ? user.reputationScore : 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.indicator} />
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={22} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.title}>Hồ Sơ Uy Tín Campus</Text>
                <Text style={styles.subtitle}>Chỉ số TrustScore & Đánh giá giao dịch</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Big Score Card */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreVal}>{reputationScore}%</Text>
                <Text style={styles.scoreLabel}>TrustScore</Text>
              </View>
              <View style={styles.scoreMeta}>
                <View style={styles.starsRow}>
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Text style={styles.starText}>5.0 / 5.0</Text>
                </View>
                <Text style={styles.scoreDesc}>
                  Tài khoản đạt chuẩn uy tín cao nhất trên sàn Chợ Đồ Cũ Sinh Viên Đại Học FPT.
                </Text>
              </View>
            </View>

            {/* Trust Badges Breakdown */}
            <Text style={styles.sectionHeading}>CÁC TIÊU CHÍ XẾP HẠNG UY TÍN</Text>

            <View style={styles.criteriaCard}>
              <View style={styles.criteriaItem}>
                <View style={[styles.criteriaIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="school" size={18} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.criteriaTitle}>Định danh Sinh viên Chính quy</Text>
                  <Text style={styles.criteriaDesc}>
                    {isVerified ? 'Đã liên kết Thẻ SV & Email @fpt.edu.vn chính chủ' : 'Đang ở chế độ tài khoản cơ bản'}
                  </Text>
                </View>
                <Ionicons
                  name={isVerified ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={isVerified ? '#059669' : '#D97706'}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.criteriaItem}>
                <View style={[styles.criteriaIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.criteriaTitle}>Bảo vệ ký quỹ Escrow</Text>
                  <Text style={styles.criteriaDesc}>100% giao dịch được bảo đảm qua hệ thống giữ tiền an toàn</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
              </View>

              <View style={styles.divider} />

              <View style={styles.criteriaItem}>
                <View style={[styles.criteriaIcon, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="checkmark-done-circle" size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.criteriaTitle}>Tỷ lệ hoàn thành đơn</Text>
                  <Text style={styles.criteriaDesc}>
                    {isSeller ? 'Giao dịch thành công, không có báo cáo gian lận' : 'Giao nhận đồ đúng hẹn tại Safe-Point'}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
              </View>

              <View style={styles.divider} />

              <View style={styles.criteriaItem}>
                <View style={[styles.criteriaIcon, { backgroundColor: '#FAF5FF' }]}>
                  <Ionicons name="chatbubbles" size={18} color="#9333EA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.criteriaTitle}>Tốc độ phản hồi chat</Text>
                  <Text style={styles.criteriaDesc}>Thường phản hồi tin nhắn trong vòng dưới 5 phút</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
              </View>
            </View>

            {/* Note box */}
            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={18} color="#0284C7" />
              <Text style={styles.noteText}>
                TrustScore được tính toán tự động dựa trên lịch sử giao dịch thực tế, đánh giá từ bạn học và không thể gian lận.
              </Text>
            </View>

            {/* Close CTA */}
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <Text style={styles.actionBtnText}>Đã hiểu</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: 20,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 16,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D1FAE5',
    letterSpacing: 0.5,
  },
  scoreMeta: {
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  starText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 4,
  },
  scoreDesc: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  criteriaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  criteriaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  criteriaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  criteriaDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    marginBottom: 20,
  },
  noteText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 16,
  },
  actionBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default TrustScoreModal;
