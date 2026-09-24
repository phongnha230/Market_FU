import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const DisputeStatusBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <View style={styles.topRow}>
        <Text style={styles.caseCode}>HỒ SƠ #GRD-BS382-HCM</Text>
        <View style={styles.escrowBadge}>
          <Ionicons name="shield-checkmark" size={12} color="#059669" style={{ marginRight: 3 }} />
          <Text style={styles.escrowText}>Escrow bảo vệ</Text>
        </View>
      </View>

      <Text style={styles.title}>Đang trong thời gian bảo vệ khiếu nại</Text>

      {/* Countdown timer */}
      <View style={styles.countdownRow}>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNum}>38</Text>
          <Text style={styles.countdownUnit}>Giờ</Text>
        </View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNum}>14</Text>
          <Text style={styles.countdownUnit}>Phút</Text>
        </View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.countdownBox}>
          <Text style={styles.countdownNum}>35</Text>
          <Text style={styles.countdownUnit}>Giây</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { backgroundColor: '#F8FAFC', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  caseCode: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  escrowBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  escrowText: { fontSize: 9.5, fontWeight: '800', color: '#059669' },
  title: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 4, marginBottom: 8 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  countdownBox: { backgroundColor: '#0F172A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignItems: 'center' },
  countdownNum: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  countdownUnit: { fontSize: 8, color: '#94A3B8' },
  colon: { fontSize: 14, fontWeight: '900', color: '#0F172A', marginHorizontal: 6 },
});

export default DisputeStatusBanner;
