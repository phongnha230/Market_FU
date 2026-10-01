import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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

const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'c1',
    name: 'Hoàng Anh (K16 SE)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cohort: 'K16 - Kỹ thuật phần mềm',
    isOnline: true,
    productTitle: 'Bàn phím cơ Akko 3087 v2 Silent',
    productPrice: '480.000đ',
    productImage: require('../../../../assets/products/keyboard-akko.jpg'),
    lastMessage: 'Em qua sảnh Alpha lấy luôn chiều nay, fix em chút nhé anh!',
    lastTime: 'Vừa xong',
    unreadCount: 1,
    type: 'buy',
    isSafePointVerified: true,
  },
  {
    id: 'c2',
    name: 'Minh Thư (K18 MKT)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cohort: 'K18 - Quản trị kinh doanh',
    isOnline: true,
    productTitle: 'Võ phục Vovinam FPT size M',
    productPrice: '120.000đ',
    productImage: require('../../../../assets/products/vovinam-uniform.jpg'),
    lastMessage: 'Bạn ơi áo còn mới không ạ? Mình ở KTX Dom B qua thử được không?',
    lastTime: '15 phút',
    unreadCount: 2,
    type: 'sell',
    isSafePointVerified: true,
  },
  {
    id: 'c3',
    name: 'Trọng Phúc (K17 IA - Đà Nẵng)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cohort: 'K17 - An toàn thông tin',
    isOnline: false,
    productTitle: 'Màn hình Dell 24" UltraSharp',
    productPrice: '1.450.000đ',
    productImage: require('../../../../assets/products/monitor-dell-24.jpg'),
    lastMessage: 'Hàng đã gửi xe FPT Bus tuyến Đà Nẵng - Hà Nội rồi nhé bạn!',
    lastTime: '10:45',
    unreadCount: 0,
    type: 'buy',
    isSafePointVerified: true,
  },
  {
    id: 'c4',
    name: 'Ban Quản trị Safe-Point FPT',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    cohort: 'Hệ thống Quản lý Ký túc xá',
    isOnline: true,
    productTitle: 'Đơn hàng Escrow #SP-9912',
    productPrice: '350.000đ',
    productImage: require('../../../../assets/products/books-mas291.jpg'),
    lastMessage: 'Mã hẹn bàn giao trạm camera sảnh Alpha đã kích hoạt thành công.',
    lastTime: 'Hôm qua',
    unreadCount: 0,
    type: 'system',
    isSafePointVerified: true,
  },
];

export const ChatListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'all' | 'buy' | 'sell' | 'unread'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredList = MOCK_CONVERSATIONS.filter((item) => {
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
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
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
});

export default ChatListScreen;
