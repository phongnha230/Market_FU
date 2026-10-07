import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveProductImage } from '../../../lib/imageResolver';

export interface PackageHandoverProofModalProps {
  visible: boolean;
  onClose: () => void;
  sealCode?: string;
  productTitle?: string;
  productImage?: any;
  safePointName?: string;
  handoffTime?: string;
  staffName?: string;
  onReportDispute?: () => void;
}

export const PackageHandoverProofModal: React.FC<PackageHandoverProofModalProps> = ({
  visible,
  onClose,
  sealCode = 'FPT-88921',
  productTitle = 'Kiện hàng giao dịch liên cơ sở',
  productImage,
  safePointName = 'Trạm Safe-Point Sảnh Tòa Alpha (Hòa Lạc)',
  handoffTime = '10:15 - Hôm nay',
  staffName = 'Trương Thế Cường (Trạm trưởng Alpha - ID: FPT-089)',
  onReportDispute,
}) => {
  const insets = useSafeAreaInsets();

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
            {
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="shield-checkmark" size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Biên Bản Ảnh Bàn Giao</Text>
                <Text style={styles.headerSubtitle}>Tem Seal niêm phong Safe-Handoff 24/7</Text>
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
          >
            {/* Package Photo Frame */}
            <View style={styles.photoContainer}>
              <Image
                source={resolveProductImage(productImage)}
                style={styles.packageImage}
                contentFit="cover"
              />
              <View style={styles.sealOverlayBadge}>
                <Ionicons name="barcode-outline" size={14} color="#FFFFFF" />
                <Text style={styles.sealOverlayText}>TEM SEAL: {sealCode}</Text>
              </View>
              <View style={styles.timestampOverlay}>
                <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                <Text style={styles.timestampOverlayText}>{handoffTime}</Text>
              </View>
            </View>

            {/* Product summary banner */}
            <View style={styles.productBanner}>
              <Ionicons name="cube-outline" size={16} color="#7C3AED" />
              <Text style={styles.productBannerText} numberOfLines={1}>
                {productTitle}
              </Text>
            </View>

            {/* Verification Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>THÔNG TIN XÁC THỰC NIÊM PHONG</Text>

              <View style={styles.metaRow}>
                <Ionicons name="pricetag" size={15} color="#2563EB" style={styles.metaIcon} />
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Mã Tem Niêm Phong (Seal ID):</Text>
                  <Text style={styles.metaValueHighlight}>{sealCode}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="business" size={15} color="#059669" style={styles.metaIcon} />
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Trạm Bàn Giao & Kiểm Tra:</Text>
                  <Text style={styles.metaValue}>{safePointName}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="person-circle" size={15} color="#EA580C" style={styles.metaIcon} />
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Cán Bộ Trạm Đối Chứng:</Text>
                  <Text style={styles.metaValue}>{staffName}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="videocam" size={15} color="#7C3AED" style={styles.metaIcon} />
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Tình Trạng Lúc Đóng Gói:</Text>
                  <Text style={styles.metaValue}>
                    Thùng hàng nguyên vẹn, bọc xốp chống sốc 3 lớp, tem vỡ dán kín các mép mở hộp. Đã lưu video ngoại quan vào camera Safe-Point 24/7.
                  </Text>
                </View>
              </View>
            </View>

            {/* Security Notice */}
            <View style={styles.noticeCard}>
              <Ionicons name="information-circle" size={18} color="#D97706" style={{ marginTop: 1 }} />
              <Text style={styles.noticeText}>
                <Text style={{ fontWeight: '800' }}>Lưu ý khi nhận hàng:</Text> Khi nhận kiện hàng tại trạm, vui lòng đối chiếu đúng mã tem niêm phong <Text style={{ fontWeight: '800', color: '#1E293B' }}>{sealCode}</Text>. Nếu tem bị rách hoặc biến dạng, bạn có quyền từ chối nhận và gửi yêu cầu khiếu nại để Escrow hoàn tiền 100%.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsWrap}>
              <TouchableOpacity
                style={styles.doneBtn}
                activeOpacity={0.88}
                onPress={onClose}
              >
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.doneBtnText}>Đã Kiểm Tra Ảnh Niêm Phong</Text>
              </TouchableOpacity>

              {onReportDispute && (
                <TouchableOpacity
                  style={styles.reportBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    onReportDispute();
                  }}
                >
                  <Ionicons name="warning-outline" size={15} color="#DC2626" style={{ marginRight: 5 }} />
                  <Text style={styles.reportBtnText}>Tem Seal Sai / Có Dấu Hiệu Cạy Phá</Text>
                </TouchableOpacity>
              )}
            </View>
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
    maxHeight: '88%',
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
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  packageImage: {
    width: '100%',
    height: '100%',
  },
  sealOverlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sealOverlayText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timestampOverlayText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
  },
  productBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6D28D9',
    flex: 1,
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  metaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValueHighlight: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2563EB',
    marginTop: 1,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
    lineHeight: 17,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },
  actionsWrap: {
    marginTop: 16,
    gap: 8,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 14,
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  reportBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },
});
