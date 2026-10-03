import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export type ListingStatus = 'active' | 'scheduled' | 'sold';

interface ManageListingsTabsProps {
  activeTab: ListingStatus;
  onSelectTab: (tab: ListingStatus) => void;
  activeCount: number;
  scheduledCount: number;
  soldCount: number;
}

export const ManageListingsTabs: React.FC<ManageListingsTabsProps> = ({
  activeTab,
  onSelectTab,
  activeCount,
  scheduledCount,
  soldCount,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.statusTabsRow}
    >
      {/* Tab 1: Đang hiển thị */}
      <TouchableOpacity
        style={[styles.statusTab, activeTab === 'active' && styles.statusTabActive]}
        activeOpacity={0.8}
        onPress={() => onSelectTab('active')}
      >
        <Text style={[styles.statusTabText, activeTab === 'active' && styles.statusTabTextActive]}>
          Đang hiển thị
        </Text>
        <View
          style={[
            styles.tabCountBadge,
            activeTab === 'active' ? styles.tabCountBadgeActive : styles.tabCountBadgeInactive,
          ]}
        >
          <Text
            style={[
              styles.tabCountText,
              activeTab === 'active' ? styles.tabCountTextActive : styles.tabCountTextInactive,
            ]}
          >
            {activeCount}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Tab 2: Đang hẹn giao */}
      <TouchableOpacity
        style={[styles.statusTab, activeTab === 'scheduled' && styles.statusTabActiveBlue]}
        activeOpacity={0.8}
        onPress={() => onSelectTab('scheduled')}
      >
        <Text
          style={[
            styles.statusTabText,
            activeTab === 'scheduled' && styles.statusTabTextActiveBlue,
          ]}
        >
          Đang hẹn giao
        </Text>
        <View style={[styles.tabCountBadge, styles.tabCountBadgeBlue]}>
          <Text style={styles.tabCountTextBlue}>{scheduledCount}</Text>
        </View>
      </TouchableOpacity>

      {/* Tab 3: Đã thanh toán / Đã bán */}
      <TouchableOpacity
        style={[styles.statusTab, activeTab === 'sold' && styles.statusTabActive]}
        activeOpacity={0.8}
        onPress={() => onSelectTab('sold')}
      >
        <Text style={[styles.statusTabText, activeTab === 'sold' && styles.statusTabTextActive]}>
          Đã thanh toán
        </Text>
        {soldCount > 0 && (
          <View style={[styles.tabCountBadge, styles.tabCountBadgeInactive]}>
            <Text style={styles.tabCountTextInactive}>{soldCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statusTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 2,
  },
  statusTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusTabActive: {
    backgroundColor: '#9A3412',
  },
  statusTabActiveBlue: {
    backgroundColor: '#DBEAFE',
  },
  statusTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  statusTabTextActive: {
    color: '#FFFFFF',
  },
  statusTabTextActiveBlue: {
    color: '#1E3A8A',
  },
  tabCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  tabCountBadgeInactive: {
    backgroundColor: '#DBEAFE',
  },
  tabCountBadgeBlue: {
    backgroundColor: '#1E3A8A',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '900',
  },
  tabCountTextActive: {
    color: '#9A3412',
  },
  tabCountTextInactive: {
    color: '#1E40AF',
  },
  tabCountTextBlue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
