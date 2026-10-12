import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { resolveAvatarImage } from '../../../lib/imageResolver';

interface RatingStats {
  totalReceived: number;
  averageRating: number | null;
  ratingDistribution: Record<number, number>;
}

interface SellerReviewsListProps {
  reviews: any[];
  stats?: RatingStats;
  reviewDirection: 'received' | 'given';
  onChangeDirection: (dir: 'received' | 'given') => void;
  selectedRating: number | null;
  onSelectRating: (star: number | null) => void;
  onlyHasImages: boolean;
  onToggleOnlyHasImages: () => void;
}

export const SellerReviewsList: React.FC<SellerReviewsListProps> = ({
  reviews,
  stats,
  reviewDirection,
  onChangeDirection,
  selectedRating,
  onSelectRating,
  onlyHasImages,
  onToggleOnlyHasImages,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const totalReviews = stats?.totalReceived ?? reviews.length;
  const avgRating = stats?.averageRating ?? (reviews.length > 0 ? 5.0 : null);
  const distribution = stats?.ratingDistribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <View style={styles.container}>
      {/* 1. Switcher: Đánh giá nhận được vs Đánh giá đã gửi */}
      <View style={styles.directionSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, reviewDirection === 'received' && styles.switchBtnActive]}
          onPress={() => onChangeDirection('received')}
          activeOpacity={0.7}
        >
          <Text style={[styles.switchBtnText, reviewDirection === 'received' && styles.switchBtnTextActive]}>
            Nhận được ({totalReviews})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, reviewDirection === 'given' && styles.switchBtnActive]}
          onPress={() => onChangeDirection('given')}
          activeOpacity={0.7}
        >
          <Text style={[styles.switchBtnText, reviewDirection === 'given' && styles.switchBtnTextActive]}>
            Đã gửi (Khi mua đồ)
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Rating Overview Banner (Khi xem đánh giá nhận được & có review) */}
      {reviewDirection === 'received' && totalReviews > 0 && (
        <View style={styles.overviewCard}>
          <View style={styles.scoreCol}>
            <Text style={styles.bigScore}>{avgRating || '5.0'}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={13} color="#F59E0B" />
              ))}
            </View>
            <Text style={styles.reviewCountText}>{totalReviews} đánh giá mở khóa</Text>
          </View>

          <View style={styles.distCol}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <View key={star} style={styles.distRow}>
                  <Text style={styles.distStarLabel}>{star}★</Text>
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.distCountText}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 3. Filter Chips Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, selectedRating === null && !onlyHasImages && styles.filterChipActive]}
          onPress={() => onSelectRating(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, selectedRating === null && !onlyHasImages && styles.filterChipTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>

        {[5, 4, 3].map((star) => (
          <TouchableOpacity
            key={star}
            style={[styles.filterChip, selectedRating === star && styles.filterChipActive]}
            onPress={() => onSelectRating(selectedRating === star ? null : star)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, selectedRating === star && styles.filterChipTextActive]}>
              {star}★
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.filterChip, onlyHasImages && styles.filterChipActive]}
          onPress={onToggleOnlyHasImages}
          activeOpacity={0.7}
        >
          <Ionicons
            name="image-outline"
            size={12}
            color={onlyHasImages ? '#FFFFFF' : '#475569'}
          />
          <Text style={[styles.filterChipText, onlyHasImages && styles.filterChipTextActive, { marginLeft: 3 }]}>
            Có ảnh
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Reviews List */}
      {reviews.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="star" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.emptyTitle}>
            {reviewDirection === 'received'
              ? 'Chưa có đánh giá nào phù hợp'
              : 'Người dùng này chưa viết đánh giá nào'}
          </Text>
          <Text style={styles.emptySubtitle}>
            Hệ thống áp dụng cơ chế Đánh giá kín 2 chiều (Blind Review). Đánh giá sẽ tự động công khai sau khi hoàn tất giao dịch tại Safe-Point!
          </Text>
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.map((rev) => {
            const reviewerName = rev.reviewerName || rev.reviewer?.profile?.fullName || 'Sinh viên FPT';
            const rawAvatar =
              rev.reviewerAvatar ||
              rev.reviewer?.profile?.avatarUrl ||
              rev.reviewer?.avatarUrl ||
              rev.reviewer?.avatar;
            const reviewerCampus = rev.reviewerCampus || rev.reviewer?.profile?.campus || 'FPT Campus';
            const initial = reviewerName.charAt(0).toUpperCase();

            return (
              <View key={rev.id} style={styles.reviewCard}>
                {/* Header: Avatar, Name, Stars */}
                <View style={styles.reviewHeader}>
                  <View style={styles.avatarWrap}>
                    {rawAvatar ? (
                      <Image
                        source={resolveAvatarImage(rawAvatar)}
                        style={styles.reviewerAvatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.reviewerAvatarPlaceholder}>
                        <Text style={styles.reviewerInitial}>{initial}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.reviewerInfo}>
                    <View style={styles.nameVerifiedRow}>
                      <Text style={styles.reviewerName}>{reviewerName}</Text>
                      <Ionicons name="checkmark-circle" size={13} color="#10B981" style={{ marginLeft: 3 }} />
                    </View>
                    <Text style={styles.reviewMetaText}>
                      {reviewerCampus} • {rev.createdAt || 'Gần đây'}
                    </Text>
                  </View>

                  {/* Rating badge */}
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingBadgeText}>{rev.rating || 5}</Text>
                    <Ionicons name="star" size={12} color="#D97706" />
                  </View>
                </View>

                {/* Product Tag */}
                {rev.productTitle && (
                  <View style={styles.productTag}>
                    <Ionicons name="cube-outline" size={12} color="#475569" />
                    <Text style={styles.productTagText} numberOfLines={1}>
                      Đã mua: <Text style={{ fontWeight: '700' }}>{rev.productTitle}</Text>
                    </Text>
                  </View>
                )}

                {/* Comment */}
                <Text style={styles.reviewComment}>{rev.comment}</Text>

                {/* Proof Images */}
                {rev.images && rev.images.length > 0 && (
                  <View style={styles.imagesRow}>
                    {rev.images.map((imgUri: string, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.imageThumbWrap}
                        activeOpacity={0.8}
                        onPress={() => setSelectedImage(imgUri)}
                      >
                        <Image source={{ uri: imgUri }} style={styles.imageThumb} contentFit="cover" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Safe Point Trust Footer */}
                <View style={styles.cardFooter}>
                  <Ionicons name="shield-checkmark" size={12} color="#059669" />
                  <Text style={styles.cardFooterText}>
                    Đã xác thực giao dịch Safe-Point & Escrow
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 5. Proof Image Modal */}
      {selectedImage && (
        <Modal visible={!!selectedImage} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalBg}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedImage }} style={styles.modalImage} contentFit="contain" />
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedImage(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  directionSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  switchBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  switchBtnTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  scoreCol: {
    alignItems: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    minWidth: 95,
  },
  bigScore: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 2,
  },
  reviewCountText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  distCol: {
    flex: 1,
    paddingLeft: 14,
    gap: 3,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distStarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    width: 18,
  },
  distBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  distCountText: {
    fontSize: 10,
    color: '#94A3B8',
    width: 14,
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrap: {
    marginRight: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  reviewerInfo: {
    flex: 1,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewMetaText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  productTagText: {
    fontSize: 11,
    color: '#475569',
  },
  reviewComment: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 8,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  imageThumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  cardFooterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 350,
    borderRadius: 16,
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
});

export default SellerReviewsList;
