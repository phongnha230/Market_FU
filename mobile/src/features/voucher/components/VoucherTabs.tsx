import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VoucherPageView } from '../types/voucher.types';

interface VoucherTabsProps {
  pageView: VoucherPageView;
  onViewChange: (view: VoucherPageView) => void;
  availableCount: number;
  unusedCount: number;
}

export const VoucherTabs: React.FC<VoucherTabsProps> = ({
  pageView,
  onViewChange,
  availableCount,
  unusedCount,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, pageView === 'store' && styles.tabActive]}
        activeOpacity={0.8}
        onPress={() => onViewChange('store')}
      >
        <Ionicons
          name="storefront"
          size={16}
          color={pageView === 'store' ? '#FFFFFF' : '#64748B'}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.tabText, pageView === 'store' && styles.tabTextActive]}>
          Kho Đổi Voucher
        </Text>
        <View
          style={[
            styles.badge,
            pageView === 'store' ? styles.badgeActive : styles.badgeInactive,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              pageView === 'store' ? styles.badgeTextActive : styles.badgeTextInactive,
            ]}
          >
            {availableCount}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, pageView === 'my_vouchers' && styles.tabActive]}
        activeOpacity={0.8}
        onPress={() => onViewChange('my_vouchers')}
      >
        <Ionicons
          name="ticket"
          size={16}
          color={pageView === 'my_vouchers' ? '#FFFFFF' : '#64748B'}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.tabText, pageView === 'my_vouchers' && styles.tabTextActive]}>
          Ví Voucher Của Tôi
        </Text>
        {unusedCount > 0 && (
          <View
            style={[
              styles.badge,
              pageView === 'my_vouchers' ? styles.badgeActive : styles.badgeNotice,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                pageView === 'my_vouchers' ? styles.badgeTextActive : styles.badgeNoticeText,
              ]}
            >
              {unusedCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 6,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeInactive: {
    backgroundColor: '#E2E8F0',
  },
  badgeNotice: {
    backgroundColor: '#FFEDD5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  badgeTextInactive: {
    color: '#475569',
  },
  badgeNoticeText: {
    color: '#EA580C',
  },
});

export default VoucherTabs;
