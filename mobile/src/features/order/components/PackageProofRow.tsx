import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HIT_SLOP_6 = { top: 6, bottom: 6, left: 6, right: 6 } as const;

interface PackageProofRowProps {
  onPress: () => void;
}

export const PackageProofRow: React.FC<PackageProofRowProps> = React.memo(({ onPress }) => (
  <TouchableOpacity
    style={styles.viewProofRowBtn}
    activeOpacity={0.82}
    onPress={onPress}
    hitSlop={HIT_SLOP_6}
  >
    <View style={styles.viewProofRowLeft}>
      <View style={styles.viewProofIconWrap}>
        <Ionicons name="images" size={17} color="#2563EB" />
      </View>
      <View style={styles.flexOne}>
        <Text style={styles.viewProofTitle}>Ảnh kiện hàng lúc bàn giao tại Safe-Point</Text>
        <Text style={styles.viewProofSub}>Tem niêm phong FPT-88921 • Camera đối chứng 24/7</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#64748B" />
  </TouchableOpacity>
));

PackageProofRow.displayName = 'PackageProofRow';

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  viewProofRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewProofRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  viewProofIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProofTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  viewProofSub: {
    fontSize: 10.5,
    color: '#3B82F6',
    marginTop: 2,
  },
});
