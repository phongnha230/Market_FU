import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SafeSuggestionCardProps {
  onSchedule: () => void;
}

export const SafeSuggestionCard: React.FC<SafeSuggestionCardProps> = ({ onSchedule }) => (
  <View style={styles.safeCard}>
    <View style={styles.safeHeader}>
      <View style={styles.safeIcon}>
        <MaterialCommunityIcons name="shield-check" size={15} color="#FFFFFF" />
      </View>
      <Text style={styles.safeTitle}>Gợi ý giao dịch an toàn</Text>
    </View>
    <Text style={styles.safeDesc}>
      Tạo cuộc hẹn tại Trạm Safe-Handoff Sảnh Tòa Alpha? Có sẵn nguồn điện, cổng cắm switch test & camera quan sát.
    </Text>
    <TouchableOpacity style={styles.scheduleBtn} activeOpacity={0.85} onPress={onSchedule}>
      <MaterialCommunityIcons name="calendar-clock" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
      <Text style={styles.scheduleText}>Chọn điểm hẹn & giờ gặp Safe-Handoff</Text>
    </TouchableOpacity>
  </View>
);

interface AppointmentCardProps {
  location?: string;
  timeSlot?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  location = 'Sảnh Tòa Alpha (Trạm test có Camera)',
  timeSlot = '16:30 Hôm nay (Sau ca 4)',
}) => (
  <View style={styles.apptCard}>
    <View style={styles.apptHeader}>
      <View style={styles.apptCheck}>
        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
      </View>
      <Text style={styles.apptTitle}>Cuộc hẹn đã xác nhận</Text>
      <View style={styles.stationBadge}>
        <Text style={styles.stationText}>SAFE-HANDOFF</Text>
      </View>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="location-sharp" size={14} color="#EA580C" style={{ marginRight: 6 }} />
      <Text style={styles.infoText}>{location}</Text>
    </View>

    <View style={styles.infoRow}>
      <Ionicons name="time" size={14} color="#1D4ED8" style={{ marginRight: 6 }} />
      <Text style={styles.infoText}>{timeSlot}</Text>
    </View>

    <TouchableOpacity
      style={styles.directBtn}
      onPress={() => Alert.alert('Chỉ đường', `Mở bản đồ vị trí: ${location}`)}
    >
      <Ionicons name="navigate" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
      <Text style={styles.directText}>Chỉ đường đến trạm Safe-Point</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  safeCard: { backgroundColor: '#FFF7ED', borderRadius: 12, padding: 12, marginHorizontal: 16, marginVertical: 8, borderWidth: 1, borderColor: '#FED7AA' },
  safeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  safeIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  safeTitle: { fontSize: 12, fontWeight: '800', color: '#9A3412' },
  safeDesc: { fontSize: 11, color: '#7C2D12', lineHeight: 15, marginBottom: 8 },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EA580C', paddingVertical: 8, borderRadius: 8 },
  scheduleText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' },
  apptCard: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginHorizontal: 16, marginVertical: 8, borderWidth: 1, borderColor: '#BBF7D0' },
  apptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  apptCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  apptTitle: { fontSize: 12, fontWeight: '800', color: '#166534', flex: 1 },
  stationBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  stationText: { fontSize: 8.5, fontWeight: '900', color: '#15803D' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { fontSize: 11, fontWeight: '600', color: '#14532D' },
  directBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16A34A', paddingVertical: 6, borderRadius: 6, marginTop: 6 },
  directText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
