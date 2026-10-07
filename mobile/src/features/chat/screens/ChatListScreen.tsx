import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { useChatStore } from '../../../stores/chatStore';
import { socketMobileService } from '../../../services/socketMobileService';
import { resolveProductImage } from '../../../lib/imageResolver';

interface ConversationItem {
  id: string;
  name: string;
  avatar: string;
  cohort: string;
  isOnline: boolean;
  productTitle: string;
  productPrice: string;
  productImage: any;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  type: 'buy' | 'sell' | 'system';
  isSafePointVerified?: boolean;
}

export const ChatListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useUserStore();
  const { conversations, fetchConversations, isLoading } = useChatStore();

  const [activeTab, setActiveTab] = useState<'all' | 'buy' | 'sell' | 'unread'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations().catch(() => {});
    }
  }, [isAuthenticated, fetchConversations]);

  // Lắng nghe socket khi có tin nhắn mới thì tải lại danh sách
  useEffect(() => {
    const unsub = socketMobileService.onNewMessageNotification(() => {
      fetchConversations().catch(() => {});
    });
    return () => {
      unsub();
    };
  }, [fetchConversations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations().catch(() => {});
    setRefreshing(false);
  }, [fetchConversations]);

  const handleBack = () => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  };

  // Fallback Guest
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.fallbackCenter, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.fallbackCard}>
          <View style={styles.fallbackIconCircle}>
            <Ionicons name="chatbubbles-outline" size={40} color="#EA580C" />
          </View>
          <Text style={styles.fallbackTitle}>Hộp thư Tin nhắn Sinh viên</Text>
          <Text style={styles.fallbackSubtitle}>
            Bạn đang ở chế độ xem hàng (Khách). Vui lòng đăng nhập tài khoản Sinh viên FPT để trao đổi, trả giá và hẹn giao dịch Safe-Point.
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

  // Chuyển đổi dữ liệu từ ChatStore
  const mappedList: ConversationItem[] = (conversations || []).map((c) => ({
    id: c.id,
    name: c.partnerName || 'Sinh viên FPT',
    avatar: c.partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cohort: c.partnerCohort || 'FPT Campus',
    isOnline: !!c.isOnline,
    productTitle: c.productTitle || 'Món đồ Campus',
    productPrice: typeof c.productPrice === 'number' ? `${c.productPrice.toLocaleString('vi-VN')}đ` : 'Thỏa thuận',
    productImage: resolveProductImage(c.productImage),
    lastMessage: c.lastMessage || 'Bắt đầu cuộc trò chuyện',
    lastTime: c.lastTime ? (c.lastTime.includes(':') ? c.lastTime : new Date(c.lastTime).toLocaleDateString('vi-VN')) : 'Gần đây',
    unreadCount: c.unreadCount || 0,
    type: 'buy',
    isSafePointVerified: true,
  }));

  const filteredList = mappedList.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.productTitle.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(searchKeyword.toLowerCase());

    if (!matchSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'buy') return item.type === 'buy';
    if (activeTab === 'sell') return item.type === 'sell';
    if (activeTab === 'unread') return item.unreadCount > 0;
    return true;
  });

  const handleOpenConversation = (item: ConversationItem) => {
    navigation.navigate('ChatDetail', {
      conversationId: item.id,
      partner: {
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        cohort: item.cohort,
        isOnline: item.isOnline,
      },
      product: {
        id: item.id,
        title: item.productTitle,
        price: item.productPrice,
        image: item.productImage,
      },
    });
  };

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={styles.chatRow}
      activeOpacity={0.75}
      onPress={() => handleOpenConversation(item)}
    >
      {/* Avatar with Online Dot */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Main Info */}
      <View style={styles.contentCol}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.timeText}>{item.lastTime}</Text>
        </View>

        {/* Product mini badge */}
        <View style={styles.productTagRow}>
          <Ionicons name="pricetag" size={11} color="#EA580C" />
          <Text style={styles.productTagText} numberOfLines={1}>
            {item.productTitle} • <Text style={{ fontWeight: '800' }}>{item.productPrice}</Text>
          </Text>
        </View>

        {/* Last message + unread badge */}
        <View style={styles.lastMsgRow}>
          <Text
            style={[styles.lastMsgText, item.unreadCount > 0 && styles.unreadMsgText]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn & Giao dịch</Text>
        <TouchableOpacity
          style={styles.aiHelpBtn}
          onPress={() => navigation.navigate('AiAssistant')}
        >
          <Ionicons name="sparkles" size={14} color="#EA580C" />
          <Text style={styles.aiHelpText}>Hỏi AI Campus</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm đoạn chat, người bán hoặc sản phẩm..."
          placeholderTextColor="#94A3B8"
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
        {searchKeyword.length > 0 && (
          <TouchableOpacity onPress={() => setSearchKeyword('')}>
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'buy', label: 'Mua hàng' },
          { key: 'sell', label: 'Bán hàng' },
          { key: 'unread', label: 'Chưa đọc' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, isActive && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabBtnText, isActive && styles.activeTabBtnText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Safe Point Escrow Reminder Bar */}
      <View style={styles.safetyStrip}>
        <Ionicons name="shield-checkmark" size={14} color="#059669" />
        <Text style={styles.safetyStripText}>
          Chỉ bàn giao tại Safe-Point có camera giám sát để đảm bảo an toàn 100%.
        </Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={['#EA580C']} />
        }
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={38} color="#CBD5E1" />
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào trong mục này</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A', flex: 1, marginLeft: 10 },
  aiHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  aiHelpText: { fontSize: 11.5, fontWeight: '800', color: '#EA580C' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A', marginLeft: 8 },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 6,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  activeTabBtn: { backgroundColor: '#EA580C' },
  tabBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  activeTabBtnText: { color: '#FFFFFF' },
  safetyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
    marginTop: 6,
  },
  safetyStripText: { fontSize: 11, color: '#047857', fontWeight: '600' },
  listContent: { paddingBottom: 85 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarWrapper: { position: 'relative', marginRight: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E2E8F0' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentCol: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameText: { fontSize: 14, fontWeight: '800', color: '#0F172A', flex: 1, marginRight: 8 },
  timeText: { fontSize: 10.5, color: '#94A3B8' },
  productTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    marginTop: 3,
    marginBottom: 4,
  },
  productTagText: { fontSize: 10.5, color: '#C2410C', fontWeight: '600' },
  lastMsgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsgText: { fontSize: 12.5, color: '#64748B', flex: 1, marginRight: 8 },
  unreadMsgText: { color: '#0F172A', fontWeight: '700' },
  unreadBadge: {
    backgroundColor: '#EA580C',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginLeft: 78 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 13, color: '#94A3B8', marginTop: 10 },
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
    backgroundColor: '#FFEDD5',
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
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  fallbackBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackBackBtn: {
    paddingVertical: 8,
  },
  fallbackBackText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ChatListScreen;
