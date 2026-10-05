import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NotificationItem, NotificationFilterType } from '../types/notification.types';
import { INITIAL_NOTIFICATIONS } from '../constants/notification.constants';
import { NotificationCardItem } from '../components/NotificationCardItem';

interface FilterChipOption {
  key: NotificationFilterType;
  label: string;
  count?: number;
}

interface FilterChipItemProps {
  item: FilterChipOption;
  isActive: boolean;
  onSelect: (key: NotificationFilterType) => void;
}

const FilterChipItem: React.FC<FilterChipItemProps> = React.memo(({ item, isActive, onSelect }) => {
  const handlePress = useCallback(() => {
    onSelect(item.key);
  }, [item.key, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      activeOpacity={0.75}
      onPress={handlePress}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {item.label}
      </Text>
      {item.count !== undefined && item.count > 0 && (
        <View style={[styles.chipCountBadge, isActive && styles.chipCountBadgeActive]}>
          <Text style={[styles.chipCountText, isActive && styles.chipCountTextActive]}>
            {item.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

import { useNotificationStore } from '../../../stores/notificationStore';

export const NotificationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications().catch(() => {});
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications().catch(() => {});
    setRefreshing(false);
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const orderUnreadCount = useMemo(
    () => notifications.filter((n) => n.category === 'order' && n.unread).length,
    [notifications]
  );

  const chatUnreadCount = useMemo(
    () => notifications.filter((n) => n.category === 'chat' && n.unread).length,
    [notifications]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead();
    Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc!');
  }, [markAllAsRead]);

  const handleNotificationPress = useCallback(
    (item: NotificationItem) => {
      markAsRead(item.id);

      if (item.targetScreen && navigation && navigation.navigate) {
        navigation.navigate(item.targetScreen, item.targetParams);
      } else {
        Alert.alert(item.title, item.body);
      }
    },
    [markAsRead, navigation]
  );

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  }, [navigation]);

  const handleGoHome = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter((item) => item.category === activeFilter);
  }, [notifications, activeFilter]);

  const filterChips = useMemo(
    (): FilterChipOption[] => [
      { key: 'all', label: 'Tất cả' },
      { key: 'order', label: 'Giao dịch', count: orderUnreadCount },
      { key: 'chat', label: 'Tin nhắn', count: chatUnreadCount },
      { key: 'promo', label: 'Ưu đãi & Quà' },
    ],
    [orderUnreadCount, chatUnreadCount]
  );

  const renderFilterChipItem: ListRenderItem<FilterChipOption> = useCallback(
    ({ item }) => (
      <FilterChipItem
        item={item}
        isActive={activeFilter === item.key}
        onSelect={setActiveFilter}
      />
    ),
    [activeFilter, setActiveFilter]
  );

  const keyFilterChip = useCallback((item: FilterChipOption) => item.key, []);

  const renderItem: ListRenderItem<NotificationItem> = useCallback(
    ({ item }) => (
      <NotificationCardItem item={item} onPress={handleNotificationPress} />
    ),
    [handleNotificationPress]
  );

  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* ═══════════════════════════════════════════════════════════
          HEADER: Back + Title + Mark Read + Home
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.titleBox}>
          <Text style={styles.headerTitle}>Thông báo Campus</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} mới</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRightActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markReadBtn}
              activeOpacity={0.7}
              onPress={handleMarkAllRead}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="checkmark-done" size={20} color="#EA580C" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleGoHome}
          >
            <Ionicons name="home-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          FILTER CHIPS ROW (Virtualized FlatList horizontal)
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.filterRow}>
        <FlatList<FilterChipOption>
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterChips}
          keyExtractor={keyFilterChip}
          renderItem={renderFilterChipItem}
          contentContainerStyle={styles.filterScroll}
        />
      </View>

      {/* ═══════════════════════════════════════════════════════════
          NOTIFICATIONS LIST
      ═══════════════════════════════════════════════════════════ */}
      {filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-off-outline" size={42} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
          <Text style={styles.emptySub}>
            Khi có cập nhật về đơn hàng, tin nhắn trả giá hoặc ưu đãi Safe-Point, bạn sẽ nhận được thông báo tại đây.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.85}
            onPress={handleGoHome}
          >
            <Ionicons name="storefront-outline" size={18} color="#FFFFFF" style={styles.storeIcon} />
            <Text style={styles.exploreBtnText}>Khám phá Chợ Campus ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<NotificationItem>
          data={filteredList}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    padding: 6,
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markReadBtn: {
    padding: 6,
  },
  filterRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#EA580C',
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  chipCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 6,
  },
  chipCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  chipCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  chipCountTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  storeIcon: {
    marginRight: 6,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default NotificationScreen;
