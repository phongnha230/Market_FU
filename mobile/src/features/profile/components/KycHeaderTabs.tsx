import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KycType } from '../../../stores/kycStore';

interface KycHeaderTabsProps {
  activeTab: KycType;
  onSelectTab: (tab: KycType) => void;
  onClose: () => void;
  isStudentVerified?: boolean;
  isSellerVerified?: boolean;
}

export const KycHeaderTabs: React.FC<KycHeaderTabsProps> = ({
  activeTab,
  onSelectTab,
  onClose,
  isStudentVerified,
  isSellerVerified,
}) => {
  const handlePressSellerTab = () => {
    if (!isStudentVerified) {
      Alert.alert(
        '🔒 Yêu cầu Thẻ Sinh Viên FPT',
        'Quy định an toàn FPT Campus: Bạn cần hoàn thành Xác thực Thẻ Sinh Viên (Bước 1) và được duyệt trước khi đăng ký mở gian hàng Người Bán!'
      );
      return;
    }
    onSelectTab('SELLER');
  };

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
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {activeTab === 'SELLER'
                ? (isSellerVerified ? 'Hồ Sơ Gian Hàng Người Bán' : 'Đăng Ký Mở Người Bán (Seller)')
                : 'Xác Thực Thẻ Sinh Viên FPT'}
            </Text>
            <Text style={styles.sheetSubtitle} numberOfLines={1}>
              {activeTab === 'SELLER'
                ? (isSellerVerified ? 'Tài khoản bán hàng & ví nhận tiền Escrow đã kích hoạt' : 'Mở quyền đăng bài pass đồ & nhận thanh toán Escrow')
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

      {/* 2 Tabs Step Navigator */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'STUDENT' && styles.tabBtnActive]}
          onPress={() => onSelectTab('STUDENT')}
          activeOpacity={0.8}
        >
          <View style={styles.tabIconWrap}>
            <Ionicons
              name="school"
              size={18}
              color={activeTab === 'STUDENT' ? '#EA580C' : '#64748B'}
            />
          </View>
          <View style={styles.tabTextCol}>
            <View style={styles.tabTopTitleRow}>
              <Text style={[styles.tabBtnText, activeTab === 'STUDENT' && styles.tabBtnTextActive]} numberOfLines={1}>
                1. Sinh viên FPT
              </Text>
              {isStudentVerified ? (
                <View style={styles.verifiedTabBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                  <Text style={styles.verifiedTabBadgeText}>Đã duyệt</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.tabSubText} numberOfLines={1}>
              {isStudentVerified ? 'Định danh FAP SSO ✓' : 'Xác thực thẻ SV'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'SELLER' && styles.tabBtnActive,
            !isStudentVerified && styles.tabBtnLocked,
          ]}
          onPress={handlePressSellerTab}
          activeOpacity={0.8}
        >
          <View style={styles.tabIconWrap}>
            <Ionicons
              name={!isStudentVerified ? 'lock-closed' : 'storefront'}
              size={18}
              color={
                activeTab === 'SELLER'
                  ? '#EA580C'
                  : !isStudentVerified
                  ? '#94A3B8'
                  : '#64748B'
              }
            />
          </View>
          <View style={styles.tabTextCol}>
            <View style={styles.tabTopTitleRow}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'SELLER' && styles.tabBtnTextActive,
                  !isStudentVerified && styles.tabBtnTextLocked,
                ]}
                numberOfLines={1}
              >
                2. Người bán
              </Text>
              {isSellerVerified ? (
                <View style={styles.verifiedTabBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                  <Text style={styles.verifiedTabBadgeText}>Đã mở</Text>
                </View>
              ) : !isStudentVerified ? (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>Khóa</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.tabSubText} numberOfLines={1}>
              {isSellerVerified ? 'Gian hàng hoạt động' : isStudentVerified ? 'Mở gian hàng' : 'Cần bước 1'}
            </Text>
          </View>
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 11,
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
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minHeight: 52,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  tabIconWrap: {
    marginRight: 8,
  },
  tabTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  tabTopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    flexShrink: 1,
  },
  tabBtnTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  tabSubText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  verifiedTabBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  verifiedTabBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  tabBtnLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75,
  },
  tabBtnTextLocked: {
    color: '#94A3B8',
  },
  lockedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  lockedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
});

export default KycHeaderTabs;
