import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VoucherHeader from '../components/VoucherHeader';
import CoinBanner from '../components/CoinBanner';
import VoucherTabs from '../components/VoucherTabs';
import VoucherCard from '../components/VoucherCard';
import MissionItemCard from '../components/MissionItemCard';
import useVoucher from '../hooks/useVoucher';
import { VoucherScreenProps } from '../types/voucher.types';

export const VoucherScreen: React.FC<VoucherScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const { activeTab, setActiveTab, vouchers, missions, coins, handleAction } = useVoucher();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <VoucherHeader onGoBack={onGoBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <CoinBanner coins={coins} />
        <VoucherTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mã giảm giá khả dụng ({vouchers.length})</Text>
        </View>

        {vouchers.map((item) => (
          <VoucherCard key={item.id} item={item} onAction={handleAction} />
        ))}

        <View style={[styles.sectionHeader, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Nhiệm vụ kiếm thêm FU-Coins</Text>
        </View>

        {missions.map((m) => (
          <MissionItemCard key={m.id} mission={m} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
});

export default VoucherScreen;
