import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export type ListingStatus = 'active' | 'pending' | 'rejected' | 'scheduled' | 'sold';

interface ManageListingsTabsProps {
  activeTab: ListingStatus;
  onSelectTab: (tab: ListingStatus) => void;
  activeCount: number;
  pendingCount: number;
  rejectedCount: number;
  scheduledCount: number;
  soldCount: number;
}

export const ManageListingsTabs: React.FC<ManageListingsTabsProps> = ({
  activeTab,
  onSelectTab,
  activeCount,
  pendingCount,
  rejectedCount,
  scheduledCount,
  soldCount,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.statusTabsRow}
    >
      {/* Tab 1: Đang hiển thị (Active) */}
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

      {/* Tab 2: Chờ BQT duyệt (Pending) */}
      <TouchableOpacity
        style={[
          styles.statusTab,
          styles.statusTabAmber,
          activeTab === 'pending' && styles.statusTabActiveAmber,
        ]}
        activeOpacity={0.8}
        onPress={() => onSelectTab('pending')}
      >
        <Text
          style={[
            styles.statusTabText,
            styles.statusTabTextAmber,
            activeTab === 'pending' && styles.statusTabTextActiveWhite,
          ]}
        >
          Chờ duyệt
        </Text>
        <View
          style={[
            styles.tabCountBadge,
            activeTab === 'pending' ? styles.tabCountBadgeActiveWhite : styles.tabCountBadgeAmber,
          ]}
        >
          <Text
            style={[
              styles.tabCountText,
              activeTab === 'pending' ? styles.tabCountTextAmber : styles.tabCountTextWhite,
            ]}
          >
            {pendingCount}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Tab 3: Bị từ chối (Rejected) */}
      <TouchableOpacity
        style={[
          styles.statusTab,
          styles.statusTabRed,
          activeTab === 'rejected' && styles.statusTabActiveRed,
        ]}
        activeOpacity={0.8}
        onPress={() => onSelectTab('rejected')}
      >
        <Text
          style={[
            styles.statusTabText,
            styles.statusTabTextRed,
            activeTab === 'rejected' && styles.statusTabTextActiveWhite,
          ]}
        >
          Bị từ chối
        </Text>
        <View
          style={[
            styles.tabCountBadge,
            activeTab === 'rejected' ? styles.tabCountBadgeActiveWhite : styles.tabCountBadgeRed,
          ]}
        >
          <Text
            style={[
              styles.tabCountText,
              activeTab === 'rejected' ? styles.tabCountTextRed : styles.tabCountTextWhite,
            ]}
          >
            {rejectedCount}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Tab 4: Đang hẹn giao (Scheduled) */}
      <TouchableOpacity
        style={[
          styles.statusTab,
          activeTab === 'scheduled' && styles.statusTabActiveBlue,
        ]}
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

      {/* Tab 5: Đã bán / Đã giao dịch (Sold) */}
      <TouchableOpacity
        style={[styles.statusTab, activeTab === 'sold' && styles.statusTabActiveSlate]}
        activeOpacity={0.8}
        onPress={() => onSelectTab('sold')}
      >
        <Text style={[styles.statusTabText, activeTab === 'sold' && styles.statusTabTextActive]}>
          Đã bán
        </Text>
        {soldCount > 0 && (
          <View style={[styles.tabCountBadge, activeTab === 'sold' ? styles.tabCountBadgeActive : styles.tabCountBadgeInactive]}>
            <Text style={[styles.tabCountText, activeTab === 'sold' ? styles.tabCountTextSlate : styles.tabCountTextInactive]}>
              {soldCount}
            </Text>
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
    backgroundColor: '#EA580C',
  },
  statusTabActiveBlue: {
    backgroundColor: '#DBEAFE',
  },
  statusTabActiveSlate: {
    backgroundColor: '#475569',
  },
  statusTabAmber: {
    backgroundColor: '#FEF3C7',
  },
  statusTabActiveAmber: {
    backgroundColor: '#D97706',
  },
  statusTabRed: {
    backgroundColor: '#FEE2E2',
  },
  statusTabActiveRed: {
    backgroundColor: '#DC2626',
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
  statusTabTextActiveWhite: {
    color: '#FFFFFF',
  },
  statusTabTextAmber: {
    color: '#92400E',
  },
  statusTabTextRed: {
    color: '#991B1B',
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
  tabCountBadgeActiveWhite: {
    backgroundColor: '#FFFFFF',
  },
  tabCountBadgeInactive: {
    backgroundColor: '#DBEAFE',
  },
  tabCountBadgeBlue: {
    backgroundColor: '#1E3A8A',
  },
  tabCountBadgeAmber: {
    backgroundColor: '#B45309',
  },
  tabCountBadgeRed: {
    backgroundColor: '#B91C1C',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '900',
  },
  tabCountTextActive: {
    color: '#EA580C',
  },
  tabCountTextInactive: {
    color: '#1E40AF',
  },
  tabCountTextBlue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  tabCountTextWhite: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  tabCountTextAmber: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '900',
  },
  tabCountTextRed: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '900',
  },
  tabCountTextSlate: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
  },
});
