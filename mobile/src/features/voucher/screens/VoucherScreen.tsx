import React, { useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, RefreshControl, ListRenderItemInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import VoucherHeader from '../components/VoucherHeader';
import CoinBanner from '../components/CoinBanner';
import VoucherTabs from '../components/VoucherTabs';
import VoucherCard from '../components/VoucherCard';
import MissionItemCard from '../components/MissionItemCard';
import useVoucher from '../hooks/useVoucher';
import { useUserStore } from '../../../stores/userStore';
import { VoucherScreenProps, VoucherItem } from '../types/voucher.types';

export const VoucherScreen: React.FC<VoucherScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useUserStore();
  const {
    activeTab,
    setActiveTab,
    vouchers,
    missions,
    coins,
    handleAction,
    handleClaimMission,
    refreshing,
    onRefresh,
  } = useVoucher();

  const handleBack = useCallback(() => {
    if (onGoBack) onGoBack();
    else if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  }, [onGoBack, navigation]);

  const renderVoucherItem = useCallback(
    ({ item }: ListRenderItemInfo<VoucherItem>) => (
      <VoucherCard item={item} onAction={handleAction} />
    ),
    [handleAction]
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, styles.fallbackCenter, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.fallbackCard}>
          <View style={styles.fallbackIconCircle}>
            <Ionicons name="gift-outline" size={40} color="#EA580C" />
          </View>
          <Text style={styles.fallbackTitle}>Ví Voucher Sinh viên FPT</Text>
          <Text style={styles.fallbackSubtitle}>
            Bạn cần đăng nhập tài khoản Sinh viên FPT để đổi mã giảm giá Canteen, Passio và tích lũy Campus Coins!
          </Text>
          <TouchableOpacity
            style={styles.fallbackBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.fallbackBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fallbackBackBtn} onPress={handleBack}>
            <Text style={styles.fallbackBackText}>Quay lại trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <VoucherHeader onGoBack={handleBack} />

      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
        }
        data={vouchers}
        keyExtractor={(item) => item.id}
        renderItem={renderVoucherItem}
        ListHeaderComponent={
          <>
            <CoinBanner coins={coins} />
            <VoucherTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mã giảm giá khả dụng ({vouchers.length})</Text>
            </View>
          </>
        }
        ListFooterComponent={
          <>
            <View style={[styles.sectionHeader, { marginTop: 14 }]}>
              <Text style={styles.sectionTitle}>Nhiệm vụ kiếm thêm FU-Coins</Text>
            </View>
            {missions.map((m) => (
              <MissionItemCard key={m.id} mission={m} onAction={handleClaimMission} />
            ))}
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  fallbackCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
  },
  fallbackCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fallbackIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  fallbackBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackBackBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  fallbackBackText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default VoucherScreen;
