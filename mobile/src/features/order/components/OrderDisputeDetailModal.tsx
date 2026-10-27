import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { OrderDisputeData } from '../../../stores/orderStore';

interface OrderDisputeDetailModalProps {
  visible: boolean;
  orderCode: string;
  productTitle: string;
  isSeller: boolean;
  buyerName?: string;
  sellerName?: string;
  dispute?: OrderDisputeData;
  onClose: () => void;
  onOpenChat: () => void;
}

export const OrderDisputeDetailModal: React.FC<OrderDisputeDetailModalProps> = ({
  visible,
  orderCode,
  productTitle,
  isSeller,
  buyerName,
  sellerName,
  dispute,
  onClose,
  onOpenChat,
}) => {
  if (!dispute && !visible) return null;

  const status = (dispute?.status || 'PENDING') as string;

  const getStatusBadge = () => {
    switch (status) {
      case 'PENDING':
        return {
          label: '⏳ Chờ BQT tiếp nhận',
          color: '#D97706',
          bg: '#FEF3C7',
          desc: 'Người mua đã mở hồ sơ. Tiền cọc Escrow tạm khóa bảo hộ trong thời gian BQT xem xét.',
        };
      case 'INVESTIGATING':
        return {
          label: '🔍 BQT đang thẩm tra',
          color: '#2563EB',
          bg: '#EFF6FF',
          desc: 'Ban Quản Trị đang kiểm tra video unboxing và đối chiếu biên bản giao nhận Safe-Point / bưu tá.',
        };
      case 'RESOLVED':
      case 'REFUNDED':
        return {
          label: '✅ Đã chấp thuận hoàn tiền',
          color: '#059669',
          bg: '#ECFDF5',
          desc: 'BQT xác nhận hàng lỗi kỹ thuật. Tiền cọc Escrow đã được tự động hoàn lại cho Người mua.',
        };
      case 'REJECTED':
        return {
          label: '🚫 Khiếu nại bị bác bỏ',
          color: '#64748B',
          bg: '#F1F5F9',
          desc: 'BQT bác bỏ khiếu nại (bằng chứng không hợp lệ). Toàn bộ tiền giao dịch được giải ngân cho Người bán.',
        };
      default:
        return {
          label: 'Đang xử lý',
          color: '#D97706',
          bg: '#FEF3C7',
          desc: 'Hồ sơ khiếu nại đang được xử lý minh bạch bởi BQT FPT Campus.',
        };
    }
  };

  const statusInfo = getStatusBadge();

  const handleWatchVideo = async () => {
    if (!dispute?.proofVideoUrl) {
      Alert.alert('Thông báo', 'Không tìm thấy liên kết video bằng chứng.');
      return;
    }

    try {
      if (dispute.proofVideoUrl.startsWith('http')) {
        await WebBrowser.openBrowserAsync(dispute.proofVideoUrl);
      } else {
        await Linking.openURL(dispute.proofVideoUrl);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể mở video bằng chứng lúc này.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="shield-half-outline" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  Phiếu Khiếu Nại Đơn Hàng
                </Text>
                <Text style={styles.orderCodeText}>Mã đơn: #{orderCode}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Status Banner */}
            <View style={[styles.statusBox, { backgroundColor: statusInfo.bg }]}>
              <View style={styles.statusBadgeRow}>
                <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
                <Text style={styles.createdAtText}>{dispute?.createdAt || 'Gần đây'}</Text>
              </View>
              <Text style={styles.statusDescText}>{statusInfo.desc}</Text>
            </View>

            {/* Product Summary */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>SẢN PHẨM TRANH CHẤP</Text>
              <Text style={styles.productTitle} numberOfLines={2}>
                📦 {productTitle}
              </Text>
              <Text style={styles.personRow}>
                Người mua: <Text style={styles.boldText}>{buyerName || 'Người mua FPT'}</Text>
              </Text>
              <Text style={styles.personRow}>
                Người bán: <Text style={styles.boldText}>{sellerName || 'Người bán FPT'}</Text>
              </Text>
            </View>

            {/* Dispute Details */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>LÝ DO KHIẾU NẠI TỪ NGƯỜI MUA</Text>
              <View style={styles.reasonBadge}>
                <Ionicons name="warning" size={14} color="#DC2626" />
                <Text style={styles.reasonBadgeText}>
                  {dispute?.reason || 'Hàng lỗi kỹ thuật / Sai mô tả'}
                </Text>
              </View>

              {!!dispute?.details && dispute.details !== dispute.reason && (
                <Text style={styles.detailsContent}>
                  &ldquo;{dispute.details}&rdquo;
                </Text>
              )}
            </View>

            {/* Proof Video Box */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>BẰNG CHỨNG VIDEO UNBOXING</Text>
              <Text style={styles.proofDesc}>
                Người mua đã tải lên video quay mở kiện hàng và test sản phẩm làm căn cứ đối soát.
              </Text>
              <TouchableOpacity
                style={styles.watchVideoBtn}
                activeOpacity={0.85}
                onPress={handleWatchVideo}
              >
                <Ionicons name="play-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.watchVideoText}>Xem video bằng chứng mở hộp</Text>
              </TouchableOpacity>
            </View>

            {/* Admin Resolution Note */}
            {!!dispute?.adminNote && (
              <View style={styles.adminNoteCard}>
                <View style={styles.adminHeaderRow}>
                  <Ionicons name="ribbon" size={16} color="#059669" />
                  <Text style={styles.adminTitle}>KẾT LUẬN CỦA BAN QUẢN TRỊ</Text>
                </View>
                <Text style={styles.adminNoteContent}>{dispute.adminNote}</Text>
                {!!dispute.resolvedAt && (
                  <Text style={styles.adminTimeText}>Phán quyết lúc: {dispute.resolvedAt}</Text>
                )}
              </View>
            )}

            {/* Role Notice */}
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.noticeText}>
                {isSeller
                  ? 'Quyền phán quyết thuộc về BQT Campus. Bạn có thể bấm Nhắn tin để đối chất hoặc tự thương lượng phương án khắc phục với Người mua.'
                  : 'Nếu bạn và Người bán đã tự thương lượng xong, bạn có thể tự rút đơn khiếu nại tại màn hình chi tiết đơn.'}
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.chatBtn}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onOpenChat();
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#0F172A" style={{ marginRight: 6 }} />
              <Text style={styles.chatBtnText}>Nhắn tin thương lượng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.closeBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  body: {
    padding: 16,
  },
  statusBox: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  createdAtText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  statusDescText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  personRow: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
    color: '#1E293B',
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  reasonBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  detailsContent: {
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 4,
  },
  proofDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  watchVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  watchVideoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminNoteCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  adminTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  adminNoteContent: {
    fontSize: 12,
    color: '#065F46',
    lineHeight: 18,
    fontWeight: '600',
  },
  adminTimeText: {
    fontSize: 10,
    color: '#059669',
    marginTop: 4,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 10.5,
    color: '#64748B',
    flex: 1,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  chatBtn: {
    flex: 2,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
