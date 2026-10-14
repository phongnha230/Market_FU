import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrderItem, OrderReviewData, useOrderStore } from '../../../stores/orderStore';
import { resolveProductImage } from '../../../lib/imageResolver';

interface ReviewDetailModalProps {
  visible: boolean;
  order: OrderItem | null;
  onClose: () => void;
  onEditReview: (order: OrderItem) => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  visible,
  order,
  onClose,
  onEditReview,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);

  if (!order) return null;

  const defaultReview: OrderReviewData = {
    rating: 5,
    comment: 'Sản phẩm bàn giao nguyên tem như mô tả, người bán thân thiện và đúng giờ tại Safe-Point!',
    tags: ['Đúng mô tả', 'Thân thiện', 'Hàng nguyên tem'],
    images: [],
    isAnonymous: true,
    reviewedAt: order.createdAt || 'Gần đây',
    isPublic: false,
    canEdit: true,
    bonusCoins: 100,
  };

  const review: OrderReviewData = order.reviewData || defaultReview;
  const isPublic = !!review.isPublic;

  const ratingLabels: { [key: number]: string } = {
    1: 'Rất tệ 😡',
    2: 'Chưa hài lòng 🙁',
    3: 'Bình thường 😐',
    4: 'Hài lòng 🙂',
    5: 'Rất hài lòng & Uy tín ⭐',
  };

  const handleToggleBlindPublic = () => {
    useOrderStore.getState().toggleReviewPublic(order.orderNumber || order.id);
    Alert.alert(
      isPublic ? '🔒 Đã chuyển sang Đánh giá kín' : '🌍 Đã công khai đánh giá',
      isPublic
        ? 'Đánh giá đã được đưa về chế độ bảo mật kín (Blind Review).'
        : 'Đánh giá đã được mở khóa và sẽ xuất hiện ngay trên Profile Người Bán!'
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 10), paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Chi tiết Đánh giá của bạn</Text>
            <Text style={styles.headerSub}>Đơn hàng #{order.orderNumber || order.id}</Text>
          </View>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => {
              onClose();
              onEditReview(order);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="create-outline" size={20} color="#EA580C" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          {/* 1. Trạng thái Blind Review Banner */}
          <View style={[styles.statusBanner, isPublic ? styles.statusBannerPublic : styles.statusBannerBlind]}>
            <View style={styles.statusHeaderRow}>
              <View style={[styles.statusIconCircle, isPublic ? styles.iconCirclePublic : styles.iconCircleBlind]}>
                <Ionicons
                  name={isPublic ? 'earth' : 'shield-checkmark'}
                  size={18}
                  color={isPublic ? '#059669' : '#D97706'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusTitle, isPublic ? styles.statusTitlePublic : styles.statusTitleBlind]}>
                  {isPublic ? '🌍 Đã công khai trên Hồ sơ Người Bán' : '🔒 Đang bảo mật kín (Blind Review 2 chiều)'}
                </Text>
                <Text style={styles.statusDesc}>
                  {isPublic
                    ? 'Cả hai bên đã hoàn tất đánh giá (hoặc quá hạn 7 ngày). Đánh giá này hiện đang hiển thị trên trang cá nhân của người bán.'
                    : 'Đánh giá của bạn đang được hệ thống bảo mật để người bán chưa thể biết điểm số, tránh việc trả đũa sao. Sẽ tự động công khai khi Người bán đánh giá lại bạn hoặc sau 7 ngày!'}
                </Text>
              </View>
            </View>

            {/* Nút mô phỏng mở khóa / ẩn lại */}
            <TouchableOpacity
              style={[styles.toggleBtn, isPublic ? styles.toggleBtnPublic : styles.toggleBtnBlind]}
              onPress={handleToggleBlindPublic}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPublic ? 'lock-closed-outline' : 'sparkles'}
                size={14}
                color={isPublic ? '#475569' : '#D97706'}
              />
              <Text style={[styles.toggleBtnText, isPublic ? styles.toggleBtnTextPublic : styles.toggleBtnTextBlind]}>
                {isPublic ? 'Chuyển về Đánh giá kín để kiểm tra' : 'Thử mở khóa công khai lên Profile'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2. Thẻ tóm tắt sản phẩm & Người bán */}
          <View style={styles.productCard}>
            <Image
              source={resolveProductImage(order.productImage)}
              style={styles.productThumb}
              contentFit="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {order.productTitle}
              </Text>
              <Text style={styles.sellerName}>
                Người bán: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{order.sellerName}</Text> ({order.sellerCampus || 'Campus'})
              </Text>
              <Text style={styles.safePoint}>
                Safe-Point: {order.safePoint}
              </Text>
            </View>
          </View>

          {/* 3. Chi tiết đánh giá sao & tags */}
          <View style={styles.reviewMainCard}>
            <View style={styles.starsSection}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= review.rating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= review.rating ? '#F59E0B' : '#CBD5E1'}
                  />
                ))}
              </View>
              <Text style={styles.ratingScoreText}>{review.rating}.0 / 5.0</Text>
              <Text style={styles.ratingLabel}>{ratingLabels[review.rating] || 'Rất hài lòng ⭐'}</Text>
            </View>

            {/* Tag chips */}
            {review.tags && review.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {review.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagBadge}>
                    <Ionicons name="checkmark" size={12} color="#059669" />
                    <Text style={styles.tagBadgeText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            {/* Nội dung nhận xét */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>Bình luận của bạn:</Text>
              <View style={styles.commentBubble}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                <Text style={styles.commentText}>
                  {review.comment ? review.comment : 'Bạn không để lại lời nhận xét bằng văn bản.'}
                </Text>
              </View>
            </View>

            {/* Ảnh và Video unbox đính kèm */}
            {((review.images && review.images.length > 0) || review.proofVideoUrl) && (
              <View style={styles.mediaSection}>
                <Text style={styles.sectionLabel}>Hình ảnh & Video đính kèm:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaList}>
                  {review.images?.map((imgUri, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.mediaBox}
                      activeOpacity={0.8}
                      onPress={() => setSelectedFullImage(imgUri)}
                    >
                      <Image source={{ uri: imgUri }} style={styles.mediaThumb} contentFit="cover" />
                      <View style={styles.zoomHint}>
                        <Ionicons name="search" size={10} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ))}

                  {review.proofVideoUrl && (
                    <View style={styles.mediaBox}>
                      <Image source={{ uri: review.proofVideoUrl }} style={styles.mediaThumb} contentFit="cover" />
                      <View style={styles.videoBadge}>
                        <Ionicons name="play" size={12} color="#FFFFFF" />
                        <Text style={styles.videoText}>Video unbox</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            <View style={styles.divider} />

            {/* Thông tin phụ: Xu & Ẩn danh & Ngày */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="gift" size={16} color="#D97706" />
                <Text style={styles.metaText}>
                  Thưởng: <Text style={{ fontWeight: '800', color: '#D97706' }}>+{review.bonusCoins || 100} Xu</Text>
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name={review.isAnonymous ? 'shield-outline' : 'person-outline'} size={15} color="#64748B" />
                <Text style={styles.metaText}>
                  {review.isAnonymous ? 'Đánh giá ẩn danh' : 'Hiện tên thật'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
                <Text style={styles.metaSubText}>{review.reviewedAt || 'Vừa xong'}</Text>
              </View>
            </View>
          </View>

          {/* 4. Thao tác chỉnh sửa & chính sách */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.88}
              onPress={() => {
                onClose();
                onEditReview(order);
              }}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text style={styles.editBtnText}>Chỉnh sửa đánh giá (Đổi sao / bình luận / ảnh)</Text>
            </TouchableOpacity>

            <View style={styles.policyCard}>
              <Ionicons name="information-circle-outline" size={18} color="#64748B" style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.policyTitle}>Quy định bảo vệ Xu & Uy tín Campus</Text>
                <Text style={styles.policyText}>
                  Theo quy chế FPT Market, sinh viên <Text style={{ fontWeight: '700' }}>không được tự ý xóa đánh giá</Text> nhằm bảo toàn số FPT Xu đã nhận (+{review.bonusCoins || 100} Xu) và tính minh bạch của Điểm Uy Tín. Nếu phát hiện sai sót nghiêm trọng, vui lòng liên hệ Admin qua chức năng Báo cáo.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modal xem ảnh full screen */}
        {selectedFullImage && (
          <Modal visible={!!selectedFullImage} transparent animationType="fade">
            <TouchableOpacity
              style={styles.fullModalBg}
              activeOpacity={1}
              onPress={() => setSelectedFullImage(null)}
            >
              <View style={styles.fullModalContent}>
                <Image source={{ uri: selectedFullImage }} style={styles.fullModalImage} contentFit="contain" />
                <TouchableOpacity
                  style={styles.closeFullBtn}
                  onPress={() => setSelectedFullImage(null)}
                >
                  <Text style={styles.closeFullBtnText}>Đóng xem ảnh</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  editHeaderBtn: {
    padding: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
  },
  scrollBody: {
    padding: 16,
    gap: 14,
  },
  statusBanner: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  statusBannerBlind: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusBannerPublic: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBlind: {
    backgroundColor: '#FEF3C7',
  },
  iconCirclePublic: {
    backgroundColor: '#D1FAE5',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusTitleBlind: {
    color: '#B45309',
  },
  statusTitlePublic: {
    color: '#059669',
  },
  statusDesc: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleBtnBlind: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FCD34D',
  },
  toggleBtnPublic: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  toggleBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  toggleBtnTextBlind: {
    color: '#B45309',
  },
  toggleBtnTextPublic: {
    color: '#475569',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  productThumb: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  sellerName: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  safePoint: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
    fontWeight: '600',
  },
  reviewMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  starsSection: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ratingScoreText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 6,
  },
  ratingLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  commentSection: {},
  commentBubble: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentText: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 20,
  },
  mediaSection: {},
  mediaList: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaBox: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    padding: 2,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 3,
    borderRadius: 3,
  },
  videoText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  metaSubText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  actionSection: {
    gap: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 13,
  },
  editBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  policyCard: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  policyTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  policyText: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15,
  },
  fullModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullModalContent: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullModalImage: {
    width: '100%',
    height: '85%',
    borderRadius: 12,
  },
  closeFullBtn: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeFullBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
});

export default ReviewDetailModal;
