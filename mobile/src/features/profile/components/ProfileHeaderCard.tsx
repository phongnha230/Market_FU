import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../../stores/useAuthStore';

interface ProfileHeaderCardProps {
  user: UserProfile | null;
  currentCampus: string;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ user, currentCampus }) => {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrapper}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={28} color="#FFFFFF" />
          </View>
        )}
        {user?.isKycVerified && (
          <View style={styles.verifiedDot}>
            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user?.name || 'Sinh viên FPT'}</Text>
          <View style={styles.campusBadge}>
            <Text style={styles.campusBadgeText}>{currentCampus}</Text>
          </View>
        </View>

        <Text style={styles.major}>{user?.major || 'K17 Kỹ thuật phần mềm'}</Text>
        <Text style={styles.studentId}>MSSV: {user?.studentId || 'HE163829'}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 3 }} />
          <Text style={styles.ratingText}>4.9 (28 lượt đánh giá uy tín)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F27024', alignItems: 'center', justifyContent: 'center' },
  verifiedDot: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  info: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  campusBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  campusBadgeText: { fontSize: 9.5, fontWeight: '800', color: '#F27024' },
  major: { fontSize: 11.5, color: '#475569', marginTop: 2 },
  studentId: { fontSize: 10.5, color: '#94A3B8', marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#B45309' },
});

export default ProfileHeaderCard;
