import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VoucherTabKey } from '../types/voucher.types';

interface VoucherTabsProps {
  activeTab: VoucherTabKey;
  onTabChange: (tab: VoucherTabKey) => void;
}

export const VoucherTabs: React.FC<VoucherTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { key: VoucherTabKey; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'ship', label: 'CampusShip' },
    { key: 'exchange', label: 'Đổi xu' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9', marginHorizontal: 3 },
  tabActive: { backgroundColor: '#F27024' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },
});

export default VoucherTabs;
