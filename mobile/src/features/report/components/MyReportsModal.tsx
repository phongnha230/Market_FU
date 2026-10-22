import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import reportMobileService, { ReportItem } from '../../../services/reportMobileService';
import { withRefreshTimeout } from '../../../utils/safeRefresh';

interface MyReportsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MyReportsModal: React.FC<MyReportsModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportMobileService.getMyReports();
      setReports(data || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadReports();
    }
  }, [visible, loadReports]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    await withRefreshTimeout(loadReports, setRefreshing, 2000);
  }, [refreshing, loadReports]);

  const renderStatusBadge = (status: ReportItem['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <View style={[styles.badge, styles.badgePending]}>
            <Text style={[styles.badgeText, styles.badgeTextPending]}>⏳ Đang chờ BQT</Text>
          </View>
        );
      case 'INVESTIGATING':
        return (
          <View style={[styles.badge, styles.badgeInvestigating]}>
            <Text style={[styles.badgeText, styles.badgeTextInvestigating]}>🔍 Đang thẩm tra</Text>
          </View>
        );
      case 'RESOLVED':
        return (
          <View style={[styles.badge, styles.badgeResolved]}>
            <Text style={[styles.badgeText, styles.badgeTextResolved]}>✅ Đã xử lý</Text>
          </View>
        );
      case 'DISMISSED':
        return (
          <View style={[styles.badge, styles.badgeDismissed]}>
            <Text style={[styles.badgeText, styles.badgeTextDismissed]}>🚫 Bác bỏ</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="shield-half" size={20} color="#E11D48" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Lịch Sử Tố Cáo Vi Phạm</Text>
                <Text style={styles.headerSubtitle}>Tiến độ xử lý & Phản hồi từ BQT Campus</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#E11D48']}
                tintColor="#E11D48"
              />
            }
          >
            {loading && reports.length === 0 ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="small" color="#E11D48" />
                <Text style={styles.loadingText}>Đang tải danh sách báo cáo...</Text>
              </View>
            ) : reports.length === 0 ? (
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="shield-checkmark-outline" size={32} color="#059669" />
                </View>
                <Text style={styles.emptyTitle}>Chưa có báo cáo vi phạm nào</Text>
                <Text style={styles.emptyDesc}>
                  Khi bạn phát hiện sản phẩm giả mạo hoặc người dùng gian lận và gửi tố cáo, toàn bộ tiến độ xử lý của BQT sẽ được cập nhật minh bạch tại đây.
                </Text>
              </View>
            ) : (
              <View style={styles.reportsList}>
                {reports.map((item) => (
                  <View key={item.id} style={styles.reportCard}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.targetTypePill}>
                        <Ionicons
                          name={item.targetType === 'PRODUCT' ? 'cube-outline' : 'person-outline'}
                          size={12}
                          color="#475569"
                        />
                        <Text style={styles.targetTypeText}>
                          {item.targetType === 'PRODUCT' ? 'Sản phẩm' : 'Người dùng'}
                        </Text>
                      </View>
                      {renderStatusBadge(item.status)}
                    </View>

                    <Text style={styles.reasonText}>{item.reason}</Text>

                    {item.details ? (
                      <Text style={styles.detailsText} numberOfLines={3}>
                        "{item.details}"
                      </Text>
                    ) : null}

                    {/* Admin Response Note if available */}
                    {item.adminNote ? (
                      <View style={styles.adminNoteBox}>
                        <Ionicons name="chatbubble-ellipses" size={14} color="#0284C7" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.adminNoteHeading}>Phản hồi từ Ban Quản Trị:</Text>
                          <Text style={styles.adminNoteText}>{item.adminNote}</Text>
                        </View>
                      </View>
                    ) : null}

                    <View style={styles.cardFooter}>
                      <Ionicons name="time-outline" size={12} color="#94A3B8" />
                      <Text style={styles.timeText}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  reportsList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  targetTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  targetTypeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeTextPending: { color: '#B45309' },
  badgeInvestigating: { backgroundColor: '#EFF6FF' },
  badgeTextInvestigating: { color: '#1D4ED8' },
  badgeResolved: { backgroundColor: '#DCFCE7' },
  badgeTextResolved: { color: '#15803D' },
  badgeDismissed: { backgroundColor: '#F1F5F9' },
  badgeTextDismissed: { color: '#64748B' },
  reasonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 11.5,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 8,
  },
  adminNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 8,
  },
  adminNoteHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },
  adminNoteText: {
    fontSize: 11.5,
    color: '#0284C7',
    marginTop: 2,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
});
