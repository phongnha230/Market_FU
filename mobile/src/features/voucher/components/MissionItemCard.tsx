import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MissionItem } from '../types/voucher.types';

interface MissionItemCardProps {
  mission: MissionItem;
  onAction?: (mission: MissionItem) => void;
}

export const MissionItemCard: React.FC<MissionItemCardProps> = ({ mission, onAction }) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: mission.iconBg }]}>
        <Ionicons name={mission.icon as any} size={18} color={mission.iconColor} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{mission.title}</Text>
        <Text style={styles.subtitle}>{mission.subtitle}</Text>
      </View>

      {mission.status === 'done' ? (
        <View style={styles.doneBadge}>
          <Text style={styles.doneText}>Đã nhận</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => (onAction ? onAction(mission) : Alert.alert('Nhiệm vụ', mission.title))}
        >
          <Text style={styles.actionText}>{mission.reward}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 10 },
  title: { fontSize: 12.5, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 10.5, color: '#64748B', marginTop: 1 },
  doneBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  doneText: { fontSize: 10.5, fontWeight: '700', color: '#15803D' },
  actionBtn: { backgroundColor: '#EA580C', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  actionText: { color: '#FFFFFF', fontSize: 10.5, fontWeight: '800' },
});

export default MissionItemCard;
