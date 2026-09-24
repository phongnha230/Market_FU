import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface KycBannerProps {
  onPress?: () => void;
}

export const KycBanner: React.FC<KycBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.banner} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.shieldBox}>
        <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
      </View>
      <View style={styles.textBox}>
        <View style={styles.headerRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>FPT KYC PASS</Text>
          </View>
          <Text style={styles.subhead}>Bảo trợ sinh viên</Text>
        </View>
        <Text style={styles.desc}>
          Xác thực sinh viên để nhận huy hiệu tin cậy & giao dịch <Text style={styles.bold}>Safe-Handoff</Text> an toàn tại Sảnh Alpha & KTX.
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#F27024',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F27024',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  shieldBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  textBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  pillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#F27024',
  },
  subhead: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  desc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 15,
  },
  bold: {
    fontWeight: '800',
  },
});

export default KycBanner;
