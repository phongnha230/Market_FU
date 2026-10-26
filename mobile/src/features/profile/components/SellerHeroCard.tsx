import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { resolveAvatarImage } from '../../../lib/imageResolver';

interface SellerHeroCardProps {
  profile: any;
  paramSellerName: string;
  productsCount: number;
  reviewsCount: number;
  averageRating?: number | null;
  onPressListings?: () => void;
  onPressReviews?: () => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  canFollow?: boolean;
}

export const SellerHeroCard: React.FC<SellerHeroCardProps> = ({
  profile,
  paramSellerName,
  productsCount,
  reviewsCount,
  averageRating,
  onPressListings,
  onPressReviews,
  isFollowing = false,
  onToggleFollow,
  canFollow = true,
}) => {
  const sellerName = profile?.fullName || paramSellerName || 'Sinh viên FPT';
  const dealCount = typeof profile?.dealCount === 'number' ? profile.dealCount : (reviewsCount > 0 ? reviewsCount : 0);
  const rawRating =
    typeof averageRating === 'number' && averageRating > 0
      ? averageRating
      : typeof profile?.rating === 'number'
      ? profile.rating
      : (reviewsCount > 0 ? 5.0 : null);
  const rating = rawRating !== null ? Number(rawRating).toFixed(1) : null;
  const reputationScore = profile?.reputationScore ?? 100;
  const campus = profile?.campus || 'HÒA LẠC';
  const cohort = profile?.cohort || 'Sinh viên FPT';
  const bio = profile?.bio || 'Sinh viên FPT giao lưu pass đồ tử tế, có thể hẹn test máy tại Safe-Point campus.';

  const isDummyAvatar = (url?: string | null) =>
    !url ||
    url.includes('photo-1535713875002-d1d0cf377fde') ||
    url.includes('photo-1534528741775-53994a69daeb') ||
    url.includes('photo-1570295999919-56ceb5ecca61');

  const rawAvatar = profile?.avatarUrl || profile?.avatar;
  const hasValidAvatar = Boolean(rawAvatar && !isDummyAvatar(rawAvatar));

  return (
    <View style={styles.profileCard}>
      {/* 1. Header Row: Avatar + Identity */}
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrap}>
          {hasValidAvatar ? (
            <Image
              source={resolveAvatarImage(rawAvatar)}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {sellerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {/* Online green dot */}
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.profileTextCol}>
          <View style={styles.nameRow}>
            <Text style={styles.sellerName} numberOfLines={1}>
              {sellerName}
            </Text>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
          </View>

          <View style={styles.tagRow}>
            <View style={styles.campusChip}>
              <Ionicons name="location-sharp" size={10} color="#EA580C" />
              <Text style={styles.campusChipText}>{campus}</Text>
            </View>
            <View style={styles.cohortChip}>
              <Text style={styles.cohortChipText}>{cohort}</Text>
            </View>
            <View style={styles.verifiedChip}>
              <Text style={styles.verifiedChipText}>KYC SV</Text>
            </View>
          </View>

          {/* Bio snippet */}
          <Text style={styles.bioText} numberOfLines={2}>
            {bio}
          </Text>
        </View>
      </View>

      {/* 2. Real Trust Metrics 4-Box Grid (Không số ảo) */}
      <View style={styles.statsGrid}>
        {/* Box 1: Điểm tín nhiệm */}
        <View style={styles.statBox}>
          <View style={styles.statHeaderRow}>
            <Ionicons name="shield-checkmark" size={12} color="#059669" />
            <Text style={styles.statLabel}>Tín nhiệm</Text>
          </View>
          <Text style={[styles.statNum, { color: '#059669' }]}>
            {reputationScore}
            <Text style={styles.statSub}>/100</Text>
          </Text>
        </View>

        <View style={styles.statDivider} />

        {/* Box 2: Đang rao bán (Clickable -> Tab Listings) */}
        <TouchableOpacity
          style={styles.statBox}
          activeOpacity={0.7}
          onPress={onPressListings}
        >
          <View style={styles.statHeaderRow}>
            <Ionicons name="pricetags-outline" size={12} color="#475569" />
            <Text style={styles.statLabel}>Đang bán</Text>
          </View>
          <Text style={styles.statNum}>{productsCount}</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        {/* Box 3: Đã giao dịch (Clickable -> Tab Listings) */}
        <TouchableOpacity
          style={styles.statBox}
          activeOpacity={0.7}
          onPress={onPressListings}
        >
          <View style={styles.statHeaderRow}>
            <Ionicons name="cube-outline" size={12} color="#EA580C" />
            <Text style={styles.statLabel}>Đã bán</Text>
          </View>
          <Text style={[styles.statNum, { color: '#EA580C' }]}>
            {dealCount}
            <Text style={styles.statSub}> đơn</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        {/* Box 4: Đánh giá sao (Clickable -> Tab Reviews) */}
        <TouchableOpacity
          style={styles.statBox}
          activeOpacity={0.7}
          onPress={onPressReviews}
        >
          <View style={styles.statHeaderRow}>
            <Ionicons name="star" size={12} color="#D97706" />
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          {reviewsCount > 0 && rating !== null ? (
            <Text style={[styles.statNum, { color: '#D97706' }]}>
              {rating}
              <Text style={styles.statSub}> ⭐</Text>
            </Text>
          ) : (
            <Text style={[styles.statNum, { color: '#94A3B8', fontSize: 12 }]}>
              Chưa có
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. Safety Guarantees Pill Bar */}
      <View style={styles.trustBanner}>
        <View style={styles.trustItem}>
          <Ionicons name="checkmark-done-circle" size={13} color="#059669" />
          <Text style={styles.trustText}>Thẻ SV xác thực</Text>
        </View>
        <View style={styles.trustDot} />
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark" size={13} color="#059669" />
          <Text style={styles.trustText}>Safe-Point 24/7</Text>
        </View>
        <View style={styles.trustDot} />
        <View style={styles.trustItem}>
          <Ionicons name="lock-closed" size={13} color="#059669" />
          <Text style={styles.trustText}>Bảo lãnh Escrow</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
    borderWidth: 0.5,
    borderColor: '#FFEDD5',
  },
  campusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  cohortChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cohortChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  verifiedChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  verifiedChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  bioText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    marginLeft: 6,
  },
  followingBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  followingBtnText: {
    color: '#059669',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  statNum: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  statSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#86EFAC',
  },
});

export default SellerHeroCard;
