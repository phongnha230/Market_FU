import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { notificationMobileService } from '../../../services/notificationMobileService';

export interface NotificationItem {
  id: string;
  category: 'all' | 'order' | 'chat' | 'promo' | 'system';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
  targetScreen?: string;
  targetParams?: any;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_1',
    category: 'order',
    title: '🛡️ Bảo lãnh Escrow đã kích hoạt',
    body: 'Người mua đã nạp 480.000đ vào tài khoản bảo chứng Escrow cho đơn hàng #ORD-882194 (Màn hình Dell 24"). Tiền được giữ an toàn, vui lòng hẹn gặp giao hàng tại Safe-Point!',
    time: '5 phút trước',
    unread: true,
    icon: 'shield-checkmark',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    targetScreen: 'OrderDetail',
    targetParams: { orderId: 'ORD-882194' },
  },
  {
    id: 'n_2',
    category: 'chat',
    title: '💬 Đề xuất giá mới (-50.000đ)',
    body: 'Trần Minh Quân vừa gửi đề nghị giá 430.000đ cho sản phẩm Bàn phím cơ Akko 3087 của bạn. Hãy bấm để phản hồi ngay!',
    time: '25 phút trước',
    unread: true,
    icon: 'pricetag',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    targetScreen: 'ChatDetail',
    targetParams: {
      partner: { id: 'p1', name: 'Trần Minh Quân', cohort: 'K16 - FPT Hola', isOnline: true },
    },
  },
  {
    id: 'n_3',
    category: 'order',
    title: '📍 Nhắc hẹn tại Safe-Point Sảnh Alpha',
    body: 'Bạn có lịch hẹn giao nhận hàng lúc 16:30 chiều nay tại Bàn test Sảnh Tòa Alpha (Khu vực có Camera 24/7 và nguồn điện 220V).',
    time: '2 giờ trước',
    unread: true,
    icon: 'location',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    targetScreen: 'OrderDetail',
    targetParams: { orderId: 'ORD-882194' },
  },
  {
    id: 'n_4',
    category: 'promo',
    title: '⭐ Cộng +20 Điểm Uy tín Campus',
    body: 'Người mua đã xác nhận nhận hàng thành công và đánh giá 5 sao! Điểm uy tín của bạn tăng lên 98/100, mở khóa huy hiệu "Người bán tin cậy".',
    time: 'Hôm qua',
    unread: false,
    icon: 'star',
    iconColor: '#EAB308',
    iconBg: '#FEFCE8',
    targetScreen: 'Review',
    targetParams: { orderId: 'ORD-882194' },
  },
  {
    id: 'n_5',
    category: 'promo',
    title: '🎁 Thưởng Voucher Nước KTX mới',
    body: 'Chúc mừng bạn nhận được 1 Voucher giảm 100% nước uống tại Căn tin KTX Hòa Lạc sau khi hoàn tất giao dịch đồng kiểm an toàn đầu tiên!',
    time: '2 ngày trước',
    unread: false,
    icon: 'gift',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF',
    targetScreen: 'Voucher',
  },
  {
    id: 'n_6',
    category: 'system',
    title: '🔔 Nâng cấp Trạm Safe-Point KTX Dom B',
    body: 'Hệ thống trạm hẹn giao dịch tại Dom B vừa được trang bị thêm ổ cắm sạc nhanh đa năng và camera AI nhận diện khuôn mặt sinh viên.',
    time: '3 ngày trước',
    unread: false,
    icon: 'hardware-chip-outline',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA',
  },
];

function adaptBackendNotification(item: any): NotificationItem {
  const type = String(item.type || '').toUpperCase();
  let category: NotificationItem['category'] = 'system';
  let icon = 'notifications-outline';
  let iconColor = '#0D9488';
  let iconBg = '#F0FDFA';
  let targetScreen: string | undefined;
  let targetParams: any = undefined;

  if (type === 'ORDER') {
    category = 'order';
    icon = 'shield-checkmark';
    iconColor = '#059669';
    iconBg = '#ECFDF5';
    targetScreen = 'OrderDetail';
    if (item.targetUrl) {
      const match = item.targetUrl.match(/[?&]id=([^&]+)/) || item.targetUrl.match(/\/([^\/?]+)$/);
      if (match) targetParams = { orderId: match[1] };
    }
  } else if (type === 'CHAT') {
    category = 'chat';
    icon = 'chatbubble';
    iconColor = '#EA580C';
    iconBg = '#FFF7ED';
    targetScreen = 'ChatList';
  } else if (type === 'KYC') {
    category = 'system';
    icon = 'card-outline';
    iconColor = '#7C3AED';
    iconBg = '#F5F3FF';
    targetScreen = 'AccountSettings';
  } else if (item.targetUrl?.includes('voucher')) {
    category = 'promo';
    icon = 'gift';
    iconColor = '#9333EA';
    iconBg = '#FAF5FF';
    targetScreen = 'Voucher';
  }

  let timeStr = 'Vừa xong';
  if (item.createdAt) {
    const diffMs = Date.now() - new Date(item.createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) timeStr = `${Math.max(1, diffMins)} phút trước`;
    else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} giờ trước`;
    else timeStr = new Date(item.createdAt).toLocaleDateString('vi-VN');
  }

  return {
    id: item.id || item._id,
    category,
    title: item.title || 'Thông báo mới',
    body: item.body || '',
    time: timeStr,
    unread: !item.isRead,
    icon,
    iconColor,
    iconBg,
    targetScreen,
    targetParams,
  };
}

type FilterType = 'all' | 'order' | 'chat' | 'promo';

export const NotificationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useUserStore();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const items = await notificationMobileService.getNotifications();
      if (Array.isArray(items) && items.length > 0) {
        setNotifications(items.map(adaptBackendNotification));
      }
    } catch (e) {
      console.log('Error fetching notifications:', e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    await notificationMobileService.markAllNotificationsAsRead();
    Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc!');
  };

  const handleClearAll = () => {
    Alert.alert('Xóa thông báo', 'Bạn có chắc chắn muốn xóa toàn bộ danh sách thông báo?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa hết', style: 'destructive', onPress: () => setNotifications([]) },
    ]);
  };

  const handleNotificationPress = useCallback(async (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (item.unread) {
      await notificationMobileService.markNotificationAsRead(item.id);
    }

    if (item.targetScreen && navigation && navigation.navigate) {
      navigation.navigate(item.targetScreen, item.targetParams);
    } else {
      Alert.alert(item.title, item.body);
    }
  }, [navigation]);

  const filteredList = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const filterChips: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'order', label: 'Giao dịch', count: notifications.filter((n) => n.category === 'order' && n.unread).length },
    { key: 'chat', label: 'Tin nhắn', count: notifications.filter((n) => n.category === 'chat' && n.unread).length },
    { key: 'promo', label: 'Ưu đãi & Quà' },
  ];

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationItemRow item={item} onPress={handleNotificationPress} />
    ),
    [handleNotificationPress]
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* ═══════════════════════════════════════════════════════════
          HEADER: Back + Title + Mark Read + Home
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Home' });
            }
          }}
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
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          >
            <Ionicons name="home-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          FILTER CHIPS ROW
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.75}
                onPress={() => setActiveFilter(chip.key)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {chip.label}
                </Text>
                {chip.count !== undefined && chip.count > 0 && (
                  <View style={[styles.chipCountBadge, isActive && styles.chipCountBadgeActive]}>
                    <Text style={[styles.chipCountText, isActive && styles.chipCountTextActive]}>
                      {chip.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          >
            <Ionicons name="storefront-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.exploreBtnText}>Khám phá Chợ Campus ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

interface NotificationRowProps {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}

const NotificationItemRow = React.memo<NotificationRowProps>(({ item, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity
      style={[styles.itemCard, item.unread && styles.itemCardUnread]}
      activeOpacity={0.75}
      onPress={handlePress}
    >
      {/* Icon */}
      <View style={[styles.itemIconBox, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={22} color={item.iconColor} />
      </View>

      {/* Text Info */}
      <View style={styles.itemContent}>
        <View style={styles.itemHeaderRow}>
          <Text style={[styles.itemTitle, item.unread && styles.itemTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.itemBody} numberOfLines={3}>
          {item.body}
        </Text>
        <View style={styles.itemFooterRow}>
          <Text style={styles.itemTime}>{item.time}</Text>
          {item.targetScreen && (
            <View style={styles.actionArrowRow}>
              <Text style={styles.actionArrowText}>Xem chi tiết</Text>
              <Ionicons name="chevron-forward" size={13} color="#EA580C" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default NotificationScreen;

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
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FED7AA',
    borderLeftWidth: 4,
    borderLeftColor: '#EA580C',
  },
  itemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    marginLeft: 6,
  },
  itemBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  itemFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTime: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  actionArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionArrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
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
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
