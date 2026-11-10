import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SettingItem } from '../types/profile.types';

interface SettingRowProps {
  item: SettingItem;
  onPress: () => void;
}

export const SettingRow: React.FC<SettingRowProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
        {item.iconLib === 'ionicons' ? (
          <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
        ) : (
          <MaterialCommunityIcons name={item.icon as any} size={18} color={item.iconColor} />
        )}
      </View>

      <View style={styles.textBox}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          {item.badge && (
            <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          {item.dotAlert && <View style={styles.dotAlert} />}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>

      {item.chevron && (
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 0, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textBox: { flex: 1, minWidth: 0, marginLeft: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  title: { flexShrink: 1, fontSize: 13, fontWeight: '700', color: '#0F172A' },
  badge: { paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4, marginLeft: 6, flexShrink: 0 },
  badgeText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '800' },
  dotAlert: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', marginLeft: 6, flexShrink: 0 },
  subtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
});

export default SettingRow;
