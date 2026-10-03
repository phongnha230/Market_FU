import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface SellerIdentityCardProps {
  user: any;
  currentCampus: string;
  completionRate: number;
  soldCount: number;
  onPostNew: () => void;
}

export const SellerIdentityCard: React.FC<SellerIdentityCardProps> = ({
  user,
  currentCampus,
  completionRate,
  soldCount,
  onPostNew,
}) => {
  return (
    <View style={styles.sellerIdentityCard}>
      <View style={styles.identityLeft}>
        <View style={styles.avatarWrap}>
          {user?.avatarUrl || user?.avatar ? (
            <Image
              source={{ uri: user.avatarUrl || user.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
            </View>
          )}
          <View style={styles.starBadge}>
            <Ionicons name="star" size={10} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.identityInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.sellerName} numberOfLines={1}>
              {(user as any)?.storeName || user?.name || 'Gian hàng FPT'}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.vipBadge}>
              <Text style={styles.vipBadgeText}>TOP SELLER ⭐</Text>
            </View>
            <View style={styles.campusBadge}>
              <Text style={styles.campusBadgeText}>{user?.campus || currentCampus}</Text>
            </View>
          </View>
          <Text style={styles.trustScoreText}>
            Uy tín: <Text style={styles.trustScoreHighlight}>{completionRate}% hoàn tất ({soldCount} đơn đã giao)</Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.postNewBtn}
        activeOpacity={0.85}
        onPress={onPostNew}
      >
        <Ionicons name="add-circle" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
        <Text style={styles.postNewBtnText}>Đăng bán</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sellerIdentityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  identityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#EA580C',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  starBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  identityInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  vipBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  vipBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  campusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  campusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  trustScoreText: {
    fontSize: 11,
    color: '#64748B',
  },
  trustScoreHighlight: {
    color: '#059669',
    fontWeight: '800',
  },
  postNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  postNewBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
