import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface SellerHeroCardProps {
  profile: any;
  paramSellerName: string;
  productsCount: number;
  reviewsCount: number;
}

export const SellerHeroCard: React.FC<SellerHeroCardProps> = ({
  profile,
  paramSellerName,
  productsCount,
  reviewsCount,
}) => {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrap}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(profile?.fullName || paramSellerName).charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {profile?.role === 'SELLER' && (
            <View style={styles.starBadge}>
              <Ionicons name="star" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.profileTextCol}>
          <View style={styles.nameRow}>
            <Text style={styles.sellerName} numberOfLines={1}>
              {profile?.fullName || paramSellerName}
            </Text>
            <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginLeft: 4 }} />
          </View>

          <View style={styles.tagRow}>
            <View style={styles.campusChip}>
              <Ionicons name="location-sharp" size={11} color="#EA580C" />
              <Text style={styles.campusChipText}>{profile?.campus || 'HÒA LẠC'}</Text>
            </View>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>
                {profile?.role === 'SELLER' ? 'TOP SELLER' : 'SINH VIÊN FPT'}
              </Text>
            </View>
          </View>

          <Text style={styles.reputationText}>
            🛡️ Điểm uy tín Campus: <Text style={styles.reputationScore}>{profile?.reputationScore ?? 100}/100</Text>
          </Text>
        </View>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{productsCount}</Text>
          <Text style={styles.statLabel}>Đang bán</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNum}>18</Text>
          <Text style={styles.statLabel}>Đã bán</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNum}>4.9 ⭐</Text>
          <Text style={styles.statLabel}>Đánh giá ({reviewsCount})</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNum}>99%</Text>
          <Text style={styles.statLabel}>Phản hồi nhanh</Text>
        </View>
      </View>

      {/* Trust Assurances */}
      <View style={styles.trustBanner}>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark" size={14} color="#059669" />
          <Text style={styles.trustText}>Thẻ SV đã duyệt KYC</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="camera" size={14} color="#059669" />
          <Text style={styles.trustText}>Giao dịch Safe-Point 24/7</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="lock-closed" size={14} color="#059669" />
          <Text style={styles.trustText}>Ký quỹ Escrow bảo lãnh</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#EA580C',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  starBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  campusChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  roleChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  reputationText: {
    fontSize: 11,
    color: '#64748B',
  },
  reputationScore: {
    color: '#059669',
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  trustBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
});
