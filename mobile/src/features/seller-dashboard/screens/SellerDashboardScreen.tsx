import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { useChatStore } from '../../../stores/chatStore';
import { useOrderStore } from '../../../stores/orderStore';
import { useKho } from '../../../context/KhoContext';
import { WithdrawalModal } from '../../profile/components/WithdrawalModal';
import orderMobileService from '../../../services/orderMobileService';
import { SellerIdentityCard } from '../components/SellerIdentityCard';
import { SellerBalanceCard } from '../components/SellerBalanceCard';
import { SellerKpiGrid } from '../components/SellerKpiGrid';
import { SellerQuickOpsCard } from '../components/SellerQuickOpsCard';
import { SellerRecentOrdersSection } from '../components/SellerRecentOrdersSection';
import { SellerAiTipCard } from '../components/SellerAiTipCard';

export interface SellerAnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingEscrow: number;
  completionRate: number;
  counts: {
    total: number;
    completed: number;
    shipping: number;
    processing: number;
    disputed: number;
    cancelled: number;
  };
  recentSales: Array<{
    id: string;
    orderCode: string;
    productTitle: string;
    productImage?: string;
    buyerName: string;
    amount: number;
    orderType: string;
    status: string;
    createdAt: string | Date;
  }>;
}

export const SellerDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { availableBalance, escrowBalance, myListings, currentCampus } = useKho();

  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [analytics, setAnalytics] = useState<SellerAnalyticsData | null>(null);

  const { orders } = useOrderStore();
  const currentUserId = user?.id || '';
  const unreadChatCount = useChatStore((s) =>
    s.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  );

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await orderMobileService.getSellerAnalytics();
      if (data) {
        setAnalytics(data);
      }
    } catch (e) {
      console.log('Error fetching seller analytics:', e);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  }, [fetchAnalytics]);

  const activeCount = useMemo(() => myListings.filter((l) => l.status === 'AVAILABLE').length, [myListings]);
  const reservedCount = useMemo(() => {
    if (analytics?.counts) {
      return analytics.counts.processing + analytics.counts.shipping;
    }
    return myListings.filter((l) => l.status === 'RESERVED').length;
  }, [analytics?.counts, myListings]);
  const soldCount = useMemo(() => {
    if (analytics?.counts) {
      return analytics.counts.completed;
    }
    return myListings.filter((l) => l.status === 'SOLD').length;
  }, [analytics?.counts, myListings]);
  const shippingCount = useMemo(() => (analytics?.counts ? analytics.counts.shipping : 0), [analytics?.counts]);

  const totalRevenue = useMemo(() => analytics?.monthlyRevenue ?? availableBalance ?? 0, [analytics?.monthlyRevenue, availableBalance]);
  const pendingEscrowAmount = useMemo(() => analytics?.pendingEscrow ?? escrowBalance ?? 0, [analytics?.pendingEscrow, escrowBalance]);
  const completionRate = useMemo(() => {
    if (analytics?.completionRate !== undefined) return analytics.completionRate;
    return soldCount + reservedCount > 0 ? 100 : 0;
  }, [analytics?.completionRate, soldCount, reservedCount]);

  const realRecentSales = useMemo(() => {
    if (analytics?.recentSales && analytics.recentSales.length > 0) {
      return analytics.recentSales;
    }
    const mySalesFromStore = orders.filter((o) => o.sellerId === currentUserId);
    if (mySalesFromStore.length > 0) {
      return mySalesFromStore.slice(0, 5).map((o) => ({
        id: o.id,
        orderCode: o.orderNumber || o.id,
        productTitle: o.productTitle,
        productImage: typeof o.productImage === 'string' ? o.productImage : undefined,
        buyerName: o.buyerName || 'Sinh viên FPT',
        amount: o.totalAmount || o.price,
        orderType: o.orderType || 'MEETUP',
        status: o.status,
        createdAt: o.createdAt || new Date(),
      }));
    }
    return [];
  }, [analytics?.recentSales, orders, currentUserId]);

  const totalOrdersCount = useMemo(() => {
    if (analytics?.counts?.total !== undefined) return analytics.counts.total;
    return realRecentSales.length;
  }, [analytics?.counts?.total, realRecentSales.length]);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs', { screen: 'Profile' });
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Kênh Quản Lý Người Bán</Text>
          <Text style={styles.headerSub}>Tổng quan kinh doanh & Vận hành kho đồ</Text>
        </View>

        <TouchableOpacity
          style={styles.chatShortcutBtn}
          onPress={() => navigation.navigate('ChatList')}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubbles-outline" size={20} color="#EA580C" />
          {unreadChatCount > 0 && (
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>
                {unreadChatCount > 99 ? '99+' : unreadChatCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
        }
      >
        <SellerIdentityCard
          user={user}
          currentCampus={currentCampus}
          completionRate={completionRate}
          soldCount={soldCount}
          onPostNew={() => navigation.navigate('MainTabs', { screen: 'PostItem' })}
        />

        <SellerBalanceCard
          availableBalance={availableBalance}
          pendingEscrowAmount={pendingEscrowAmount}
          totalRevenue={totalRevenue}
          onOpenWithdrawModal={() => setShowWithdrawModal(true)}
        />

        <SellerKpiGrid
          activeCount={activeCount}
          reservedCount={reservedCount}
          shippingCount={shippingCount}
          soldCount={soldCount}
          onNavigateMyListings={() => navigation.navigate('ManageListings')}
          onNavigateOrderList={() => navigation.navigate('OrderList')}
          onNavigateInterCampus={() => navigation.navigate('InterCampusTransaction')}
        />

        <SellerQuickOpsCard
          onPostItem={() => navigation.navigate('MainTabs', { screen: 'PostItem' })}
          onMyListings={() => navigation.navigate('ManageListings')}
          onInterCampus={() => navigation.navigate('InterCampusTransaction')}
          onWithdraw={() => setShowWithdrawModal(true)}
        />

        <SellerRecentOrdersSection
          recentSales={realRecentSales}
          totalOrdersCount={totalOrdersCount}
          onNavigateOrderList={() => navigation.navigate('OrderList')}
          onNavigateInterCampus={() => navigation.navigate('InterCampusTransaction')}
          onNavigateOrderDetail={(params) => navigation.navigate('OrderDetail', params)}
          userName={user?.name}
        />

        <SellerAiTipCard />
      </ScrollView>

      {/* Withdrawal Modal */}
      <WithdrawalModal visible={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} />
    </View>
  );
};

export default SellerDashboardScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  chatShortcutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    position: 'relative',
  },
  chatBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
});
