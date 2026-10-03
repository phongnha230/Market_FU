import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KycType } from '../../../stores/kycStore';

interface KycHeaderTabsProps {
  activeTab: KycType;
  onSelectTab: (tab: KycType) => void;
  onClose: () => void;
}

export const KycHeaderTabs: React.FC<KycHeaderTabsProps> = ({
  activeTab,
  onSelectTab,
  onClose,
}) => {
  return (
    <>
      {/* Header */}
      <View style={styles.sheetHeader}>
        <View style={styles.indicator} />
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={activeTab === 'SELLER' ? 'storefront' : 'shield-checkmark'}
              size={20}
              color="#EA580C"
            />
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.sheetTitle}>
              {activeTab === 'SELLER' ? 'Đăng Ký Mở Người Bán (Seller)' : 'Xác Thực Thẻ Sinh Viên FPT'}
            </Text>
            <Text style={styles.sheetSubtitle}>
              {activeTab === 'SELLER'
                ? 'Mở quyền đăng bài pass đồ & nhận thanh toán Escrow'
                : 'Định danh sinh viên chính quy & huy hiệu TrustScore 100%'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2 Tabs Navigator */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'STUDENT' && styles.tabBtnActive]}
          onPress={() => onSelectTab('STUDENT')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="school"
            size={16}
            color={activeTab === 'STUDENT' ? '#EA580C' : '#64748B'}
          />
          <Text style={[styles.tabBtnText, activeTab === 'STUDENT' && styles.tabBtnTextActive]}>
            1. Sinh viên FPT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'SELLER' && styles.tabBtnActive]}
          onPress={() => onSelectTab('SELLER')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="storefront"
            size={16}
            color={activeTab === 'SELLER' ? '#EA580C' : '#64748B'}
          />
          <Text style={[styles.tabBtnText, activeTab === 'SELLER' && styles.tabBtnTextActive]}>
            2. Trở thành Người bán
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  indicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
    marginLeft: 10,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 44,
  },
  tabBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
});
