import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ManageListingsFallback } from '../components/ManageListingsFallback';
import { ManageListingsHeader } from '../components/ManageListingsHeader';
import { ManageListingsAnalytics } from '../components/ManageListingsAnalytics';
import { ManageListingsTabs, ListingStatus } from '../components/ManageListingsTabs';
import { ManageListingsCard } from '../components/ManageListingsCard';
import { useManageListings } from '../hooks/useManageListings';
import { BoostProductModal } from '../../seller/components/BoostProductModal';

export type { ListingStatus };

export interface ListingItemData {
  id: string;
  title: string;
  price: string;
  timeAgo: string;
  location: string;
  locationIcon: 'location-outline' | 'school-outline' | 'fitness-outline';
  image: any;
  tag?: string;
  tagColor?: string;
  tagTextColor?: string;
  unreadMessages?: number;
  scheduledAppointments?: number;
  views: number;
  status: ListingStatus;
  isBoosted?: boolean;
  rawStatus?: string;
}

export interface ManageListingsScreenProps {
  onGoBack?: () => void;
  onPostNew?: () => void;
}

export const ManageListingsScreen: React.FC<ManageListingsScreenProps> = ({
  onGoBack,
  onPostNew,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    currentCampus,
    isAuthenticated,
    isSeller,
    activeTab,
    setActiveTab,
    refreshing,
    onRefresh,
    filteredListings,
    activeCount,
    scheduledCount,
    soldCount,
    handleBoost,
    handleRenew,
    handleMarkSold,
    handleToggleHide,
    handleDelete,
    handleEdit,
  } = useManageListings();

  const [boostTarget, setBoostTarget] = useState<{
    id: string;
    title: string;
    price: number;
    image?: any;
  } | null>(null);

  const handleOpenBoostModal = useCallback((id: string, title: string) => {
    const item = filteredListings.find((l) => l.id === id);
    const numericPrice = item?.price ? Number(String(item.price).replace(/[^\d]/g, '')) : 0;
    setBoostTarget({
      id,
      title: item?.title || title,
      price: numericPrice,
      image: item?.image,
    });
  }, [filteredListings]);

  const handleBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  }, [navigation, onGoBack]);

  const handleCreatePost = useCallback(() => {
    if (onPostNew) {
      onPostNew();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'PostItem' });
    }
  }, [navigation, onPostNew]);

  const handleProfile = useCallback(() => {
    if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  }, [navigation]);

  const handleSafeHandoffReminderPress = useCallback(() => {
    Alert.alert(
      '🤝 Nhắc nhở Safe-Handoff',
      'Lịch hẹn: 16:30 hôm nay tại Dom B KTX với bạn Hoàng Long (HE180293).\n\nĐịa điểm có bàn test đồ điện tử và camera an ninh trường học.'
    );
  }, []);

  // 1. Nếu chưa đăng nhập (Guest)
  if (!isAuthenticated) {
    return (
      <View style={styles.screen}>
        <ManageListingsFallback
          type="guest"
          insetsTop={insets.top}
          onLogin={() => navigation.navigate('Login')}
          onProfile={handleProfile}
          onBack={handleBack}
        />
      </View>
    );
  }

  // 2. Nếu đã đăng nhập nhưng KHÔNG PHẢI SELLER
  if (!isSeller) {
    return (
      <View style={styles.screen}>
        <ManageListingsFallback
          type="non-seller"
          insetsTop={insets.top}
          onLogin={() => navigation.navigate('Login')}
          onProfile={handleProfile}
          onBack={handleBack}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ManageListingsHeader
        insetsTop={insets.top}
        currentCampus={currentCampus}
        onBack={handleBack}
        onProfile={handleProfile}
        onPostNew={handleCreatePost}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 70 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
        }
      >
        <ManageListingsAnalytics onSafeHandoffPress={handleSafeHandoffReminderPress} />

        <ManageListingsTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeCount={activeCount}
          scheduledCount={scheduledCount}
          soldCount={soldCount}
        />

        <View style={styles.listingList}>
          {filteredListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có món đồ nào trong mục này</Text>
            </View>
          ) : (
            filteredListings.map((item) => (
              <ManageListingsCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onBoost={handleOpenBoostModal}
                onRenew={handleRenew}
                onToggleHide={handleToggleHide}
                onMarkSold={handleMarkSold}
                onDelete={handleDelete}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Boost / VIP / Renew Modal */}
      <BoostProductModal
        visible={Boolean(boostTarget)}
        onClose={() => setBoostTarget(null)}
        product={boostTarget}
        onSuccess={(msg) => {
          Alert.alert('🎉 Thành công', msg);
          onRefresh();
        }}
        onNavigateToDeposit={() => {
          navigation.navigate('MainTabs', { screen: 'Profile' });
        }}
      />
    </View>
  );
};

export default ManageListingsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listingList: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
  },
});
