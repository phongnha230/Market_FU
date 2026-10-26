import React, { useState, useEffect } from 'react';
import { reviewMobileService } from '../../../services/reviewMobileService';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrderItem, OrderReviewData, useOrderStore } from '../../../stores/orderStore';
import { resolveProductImage } from '../../../lib/imageResolver';

interface ReviewDetailModalProps {
  visible: boolean;
  order: OrderItem | null;
  isSeller?: boolean;
  onClose: () => void;
  onEditReview?: (order: OrderItem) => void;
}

function formatDateTime(d?: string | Date | null): string {
  if (!d) return 'Gần đây';
  const date = new Date(d);
  if (isNaN(date.getTime())) return typeof d === 'string' ? d : 'Gần đây';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} · ${day}/${month}/${year}`;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  visible,
  order,
  isSeller = false,
  onClose,
  onEditReview,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const replyOrderReview = useOrderStore((s) => s.replyOrderReview);

  const [fetchedReview, setFetchedReview] = useState<OrderReviewData | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<{ name?: string; campus?: string } | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  useEffect(() => {
    if (!visible || !order) {
      setFetchedReview(null);
      setBuyerInfo(null);
      return;
    }

    if (order.reviewData && (order.reviewData.comment !== undefined || order.reviewData.rating !== undefined)) {
      setFetchedReview(order.reviewData);
    }

    const orderIdToFetch = (order.id || order.orderNumber || '').replace(/^#/, '');
    if (orderIdToFetch) {
      setIsLoadingReview(true);
      reviewMobileService
        .getOrderReviews(orderIdToFetch)
        .then((reviews: any[]) => {
          if (Array.isArray(reviews) && reviews.length > 0) {
            const rev = reviews[0];
            const freshRev: OrderReviewData = {
              rating: Number(rev.rating) || 5,
              comment: rev.comment || '',
              tags: Array.isArray(rev.tags) ? rev.tags : [],
              images: Array.isArray(rev.images) ? rev.images : [],
              proofVideoUrl: rev.proofVideoUrl,
              reviewedAt: rev.createdAt || new Date().toISOString(),
              isPublic: rev.isPublic ?? true,
              canEdit: true,
              replyComment: rev.replyComment,
              repliedAt: rev.repliedAt || rev.replyCreatedAt,
            };
            setFetchedReview(freshRev);
            if (rev.reviewer) {
              setBuyerInfo({
                name: rev.reviewer.profile?.fullName || rev.reviewer.fullName || rev.reviewer.name || 'Người mua FPT',
                campus: rev.reviewer.profile?.campus || 'Hòa Lạc',
              });
            }
            useOrderStore.getState().markOrderReviewed(order.orderNumber || order.id, freshRev);
          }
        })
        .catch((err) => {
          console.warn('[ReviewDetailModal] fetch review err:', err);
        })
        .finally(() => {
          setIsLoadingReview(false);
        });
    }
  }, [visible, order?.id, order?.orderNumber]);

  if (!order) return null;

  const review: OrderReviewData | undefined = fetchedReview || order.reviewData;
  const hasReview = Boolean(review && (review.rating || review.comment));
  const buyerDisplayName = review?.isAnonymous
    ? 'Sinh viên FPT (Ẩn danh)'
    : (buyerInfo?.name || order.buyerName || 'Người mua FPT');

  const ratingLabels: { [key: number]: string } = {
    1: 'Rất tệ 😡',
    2: 'Chưa hài lòng 🙁',
    3: 'Bình thường 😐',
    4: 'Hài lòng 🙂',
    5: 'Rất hài lòng & Uy tín ⭐',
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Chưa nhập phản hồi', 'Vui lòng nhập lời cảm ơn hoặc phản hồi gửi đến người mua.');
      return;
    }
    const cleanReply = replyText.trim();
    const orderIdentifier = (order.id || order.orderNumber || '').replace(/^#/, '');
    try {
      await reviewMobileService.replyReview(orderIdentifier, cleanReply);
    } catch (e) {
      console.warn('Backend reply err, saved locally:', e);
    }
    replyOrderReview(order.orderNumber || order.id, cleanReply);
    setFetchedReview((prev) => (prev ? { ...prev, replyComment: cleanReply, repliedAt: 'Vừa xong' } : prev));
    setIsReplying(false);
    setReplyText('');
    Alert.alert('🎉 Phản hồi thành công', 'Phản hồi của bạn đã được công khai cùng với đánh giá của người mua!');
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
            <Text style={styles.headerTitle}>
              {isSeller ? 'Đánh giá từ Người Mua' : 'Chi tiết Đánh giá của bạn'}
            </Text>
            <Text style={styles.headerSub}>
              Đơn hàng #{order.orderNumber || order.id} {isSeller && hasReview ? `• ${buyerDisplayName}` : ''}
            </Text>
          </View>
          {!isSeller && onEditReview && hasReview ? (
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
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>

        {isLoadingReview && !hasReview ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color="#EA580C" />
            <Text style={{ marginTop: 14, fontSize: 13, color: '#64748B', fontWeight: '600' }}>
              Đang tải chi tiết đánh giá từ hệ thống...
            </Text>
          </View>
        ) : !hasReview || !review ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Thẻ tóm tắt sản phẩm & Đối tác */}
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
                {isSeller ? (
                  <Text style={styles.sellerName}>
                    Người mua: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{order.buyerName || 'Người mua FPT'}</Text> ({order.buyerCampus || 'Hòa Lạc'})
                  </Text>
                ) : (
                  <Text style={styles.sellerName}>
                    Người bán: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{order.sellerName || 'Người bán FPT'}</Text> ({order.sellerCampus || 'Campus'})
                  </Text>
                )}
                <Text style={styles.safePoint}>
                  Safe-Point: {order.safePoint || 'Trạm Safe-Point'}
                </Text>
              </View>
            </View>

            {/* Trạng thái chưa có đánh giá trung thực */}
            <View style={styles.emptyReviewCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={38} color="#94A3B8" />
              </View>
              <Text style={styles.emptyReviewTitle}>Chưa có đánh giá</Text>
              <Text style={styles.emptyReviewDesc}>
                {isSeller
                  ? 'Người mua chưa gửi đánh giá cho đơn hàng này sau khi nhận hàng tại Safe-Point. Khi có đánh giá thực tế từ người mua, nhận xét và điểm uy tín sẽ được hiển thị tại đây.'
                  : 'Bạn chưa đánh giá đơn hàng này. Đánh giá ngay để nhận +100 Xu Campus Coin và giúp người bán tích lũy điểm uy tín trong cộng đồng sinh viên FPT nhé!'}
              </Text>

              {!isSeller && onEditReview && (
                <TouchableOpacity
                  style={styles.editBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    onClose();
                    onEditReview(order);
                  }}
                >
                  <Ionicons name="star" size={18} color="#FFFFFF" />
                  <Text style={styles.editBtnText}>Viết đánh giá ngay (+100 Xu)</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.closeEmptyBtn} activeOpacity={0.8} onPress={onClose}>
                <Text style={styles.closeEmptyBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          {/* 1. Trạng thái Đánh giá công khai Banner */}
          <View style={[styles.statusBanner, styles.statusBannerPublic]}>
            <View style={styles.statusHeaderRow}>
              <View style={[styles.statusIconCircle, styles.iconCirclePublic]}>
                <Ionicons
                  name={isSeller ? 'star' : 'shield-checkmark'}
                  size={18}
                  color="#059669"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusTitle, styles.statusTitlePublic]}>
                  {isSeller ? '🌟 Đã nhận đánh giá công khai từ Người Mua' : '🌍 Đã công khai trên Hồ sơ Người Bán'}
                </Text>
                <Text style={styles.statusDesc}>
                  {isSeller
                    ? `Người mua (${buyerDisplayName}) đã hoàn tất đơn tại Safe-Point và đánh giá giao dịch. Điểm uy tín của bạn đã được cộng tức thì vào hồ sơ Người Bán.`
                    : 'Đánh giá của bạn đã được ghi nhận trực tiếp và hiển thị công khai trên hồ sơ của người bán, cộng điểm uy tín tức thì để hỗ trợ cộng đồng sinh viên FPT tham khảo.'}
                </Text>
              </View>
            </View>
          </View>

          {/* 2. Thẻ tóm tắt sản phẩm & Đối tác */}
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
              {isSeller ? (
                <Text style={styles.sellerName}>
                  Người mua: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{buyerDisplayName}</Text> ({order.buyerCampus || 'Hòa Lạc'})
                </Text>
              ) : (
                <Text style={styles.sellerName}>
                  Người bán: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{order.sellerName}</Text> ({order.sellerCampus || 'Campus'})
                </Text>
              )}
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
              <Text style={styles.sectionLabel}>
                {isSeller ? `Nhận xét từ Người Mua (${buyerDisplayName}):` : 'Bình luận của bạn:'}
              </Text>
              <View style={styles.commentBubble}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                <Text style={styles.commentText}>
                  {review.comment ? review.comment : (isSeller ? 'Người mua không để lại lời nhận xét bằng văn bản.' : 'Bạn không để lại lời nhận xét bằng văn bản.')}
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

            {/* Thông tin phụ: Điểm uy tín / Xu & Ẩn danh & Ngày */}
            <View style={styles.metaRow}>
              {isSeller ? (
                <View style={styles.metaItem}>
                  <Ionicons name="shield-checkmark" size={16} color="#059669" />
                  <Text style={styles.metaText}>
                    Uy tín: <Text style={{ fontWeight: '800', color: '#059669' }}>+{review.rating === 5 ? 5 : 2} Điểm</Text>
                  </Text>
                </View>
              ) : (
                <View style={styles.metaItem}>
                  <Ionicons name="gift" size={16} color="#D97706" />
                  <Text style={styles.metaText}>
                    Thưởng: <Text style={{ fontWeight: '800', color: '#D97706' }}>+{review.bonusCoins || 100} Xu</Text>
                  </Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Ionicons name={review.isAnonymous ? 'shield-outline' : 'person-outline'} size={15} color="#64748B" />
                <Text style={styles.metaText}>
                  {review.isAnonymous ? 'Đánh giá ẩn danh' : 'Hiện tên thật'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
                <Text style={styles.metaSubText}>{formatDateTime(review.reviewedAt)}</Text>
              </View>
            </View>
          </View>

          {/* Phản hồi từ Người Bán (nếu đã có) */}
          {review.replyComment && (
            <View style={styles.sellerRepliedCard}>
              <View style={styles.sellerRepliedHeader}>
                <Ionicons name="return-down-forward" size={16} color="#EA580C" />
                <Text style={styles.sellerRepliedTitle}>Phản hồi từ Người Bán</Text>
                {review.repliedAt && (
                  <Text style={styles.sellerRepliedTime}>• {formatDateTime(review.repliedAt)}</Text>
                )}
              </View>
              <Text style={styles.sellerRepliedContent}>{review.replyComment}</Text>
            </View>
          )}

          {/* 4. Thao tác dành cho Người Bán hoặc Người Mua */}
          {isSeller ? (
            <View style={styles.actionSection}>
              {!review.replyComment && (
                <>
                  {isReplying ? (
                    <View style={styles.replyInputWrapper}>
                      <Text style={styles.replyInputLabel}>Gửi phản hồi công khai tới người mua:</Text>
                      <TextInput
                        style={styles.replyTextInput}
                        placeholder="Ví dụ: Cảm ơn bạn đã tin tưởng ủng hộ shop nhé! Chúc bạn học tốt..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={3}
                        value={replyText}
                        onChangeText={setReplyText}
                      />
                      <View style={styles.replyBtnRow}>
                        <TouchableOpacity
                          style={styles.cancelReplyBtn}
                          onPress={() => {
                            setIsReplying(false);
                            setReplyText('');
                          }}
                        >
                          <Text style={styles.cancelReplyBtnText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.submitReplyBtn}
                          onPress={handleSendReply}
                        >
                          <Ionicons name="send" size={14} color="#FFFFFF" />
                          <Text style={styles.submitReplyBtnText}>Gửi phản hồi</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.replyTriggerBtn}
                      activeOpacity={0.88}
                      onPress={() => setIsReplying(true)}
                    >
                      <Ionicons name="chatbox-ellipses-outline" size={18} color="#EA580C" />
                      <Text style={styles.replyTriggerBtnText}>Phản hồi đánh giá của Người Mua</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={styles.policyCard}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#059669" style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.policyTitle}>Cơ chế Đánh giá 1 chiều minh bạch</Text>
                  <Text style={styles.policyText}>
                    Điểm đánh giá từ người mua được ghi nhận trực tiếp vào hồ sơ và Điểm Uy Tín của bạn (+{review.rating === 5 ? 5 : 2} điểm). Người bán có thể gửi lời cảm ơn hoặc phản hồi văn minh để củng cố uy tín tại Campus.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.actionSection}>
              {onEditReview && (
                <TouchableOpacity
                  style={styles.editBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    onClose();
                    onEditReview(order);
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.editBtnText}>Chỉnh sửa đánh giá</Text>
                </TouchableOpacity>
              )}

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
          )}
        </ScrollView>
        )}

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
    gap: 8,
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
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
  sellerRepliedCard: {
    backgroundColor: '#FFF7ED',
    borderLeftWidth: 3,
    borderLeftColor: '#F97316',
    borderRadius: 12,
    padding: 12,
    marginTop: 2,
    gap: 4,
  },
  sellerRepliedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerRepliedTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C2410C',
  },
  sellerRepliedTime: {
    fontSize: 11,
    color: '#9A3412',
  },
  sellerRepliedContent: {
    fontSize: 12.5,
    color: '#7C2D12',
    lineHeight: 18,
  },
  replyTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingVertical: 12,
  },
  replyTriggerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  replyInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  replyInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  replyTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  replyBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelReplyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelReplyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  submitReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EA580C',
  },
  submitReplyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyReviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyReviewTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyReviewDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeEmptyBtn: {
    marginTop: 10,
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeEmptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});

export default ReviewDetailModal;
