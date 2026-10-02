import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useUserStore } from '../../../stores/userStore';

export type ListingStatus = 'active' | 'scheduled' | 'sold';

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
}

const INITIAL_LISTINGS: ListingItemData[] = [
  {
    id: 'l1',
    title: 'Bàn phím cơ Akko 3087 v2',
    price: '520.000 đ',
    timeAgo: '10:15 hôm nay',
    location: 'Sảnh Alpha Hòa Lạc',
    locationIcon: 'location-outline',
    image: require('../../../../assets/products/keyboard-akko.jpg'),
    tag: 'Active',
    tagColor: '#059669',
    tagTextColor: '#FFFFFF',
    unreadMessages: 3,
    views: 42,
    status: 'active',
  },
  {
    id: 'l2',
    title: 'Combo CSL201 + MAS291',
    price: '120.000 đ',
    timeAgo: '2 ngày trước',
    location: 'Thư viện Beta',
    locationIcon: 'school-outline',
    image: require('../../../../assets/products/books-mas291.jpg'),
    tag: 'K18',
    tagColor: 'rgba(255, 255, 255, 0.9)',
    tagTextColor: '#0F172A',
    scheduledAppointments: 1,
    views: 89,
    status: 'scheduled',
  },
  {
    id: 'l3',
    title: 'Võ phục Vovinam (kèm đai)',
    price: '90.000 đ',
    timeAgo: '5 ngày trước',
    location: 'Nhà thi đấu FPT',
    locationIcon: 'fitness-outline',
    image: require('../../../../assets/products/vovinam-uniform.jpg'),
    tag: 'Size L',
    tagColor: 'rgba(255, 255, 255, 0.9)',
    tagTextColor: '#0F172A',
    views: 18,
    status: 'active',
  },
];

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
  const { currentCampus } = useCampusStore();

  const [activeTab, setActiveTab] = useState<ListingStatus>('active');
  const [listings, setListings] = useState<ListingItemData[]>(INITIAL_LISTINGS);

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const handleCreatePost = () => {
    if (onPostNew) {
      onPostNew();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'PostItem' });
    }
  };

  const handleBoost = (id: string, title: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isBoosted: true, views: item.views + 15 } : item
      )
    );
    Alert.alert(
      '🚀 Đẩy tin thành công!',
      `Tin đăng "${title}" đã được ưu tiên hiển thị lên đầu trang Chợ Campus trong 24h.`
    );
  };

  const handleMarkSold = (id: string, title: string) => {
    Alert.alert(
      '✓ Xác nhận đã bán',
      `Bạn đã bán thành công "${title}" cho bạn cùng trường?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận đã bán',
          onPress: () => {
            setListings((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: 'sold' } : item
              )
            );
            Alert.alert('🎉 Chúc mừng!', 'Tin đã được chuyển vào mục Đã bán.');
          },
        },
      ]
    );
  };

  const handleToggleHide = (id: string, title: string) => {
    Alert.alert(
      '👁️ Ẩn tin đăng',
      `Tạm ẩn "${title}" khỏi kết quả tìm kiếm của sinh viên khác?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Tạm ẩn tin',
          onPress: () => {
            Alert.alert('Đã tạm ẩn', 'Bạn có thể mở lại tin bất cứ lúc nào.');
          },
        },
      ]
    );
  };

  const handleEdit = (title: string) => {
    Alert.alert('✏️ Chỉnh sửa tin', `Mở giao diện cập nhật nội dung và giá bán cho "${title}".`);
  };

  const handleSafeHandoffReminderPress = () => {
    Alert.alert(
      '🤝 Nhắc nhở Safe-Handoff',
      'Lịch hẹn: 16:30 hôm nay tại Dom B KTX với bạn Hoàng Long (HE180293).\n\nĐịa điểm có bàn test đồ điện tử và camera an ninh trường học.'
    );
  };

  // Filter listings based on tab
  const filteredListings = listings.filter((item) => {
    if (activeTab === 'active') return item.status === 'active';
    if (activeTab === 'scheduled') return item.status === 'scheduled';
    if (activeTab === 'sold') return item.status === 'sold';
    return true;
  });

  const activeCount = listings.filter((l) => l.status === 'active').length;
  const scheduledCount = listings.filter((l) => l.status === 'scheduled').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;

  const { user, isAuthenticated } = useUserStore();
  const isSeller = user?.role === 'SELLER';

  // 1. Nếu chưa đăng nhập (Guest)
  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, styles.fallbackCenter, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.fallbackCard}>
          <View style={styles.fallbackIconCircle}>
            <Ionicons name="lock-closed" size={40} color="#EA580C" />
          </View>
          <Text style={styles.fallbackTitle}>Yêu cầu đăng nhập</Text>
          <Text style={styles.fallbackSubtitle}>
            Bạn đang ở chế độ xem hàng (Khách). Vui lòng đăng nhập tài khoản Người Bán (Seller) để quản lý tin rao bán của bạn.
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

  // 2. Nếu đã đăng nhập nhưng KHÔNG PHẢI SELLER
  if (!isSeller) {
    return (
      <View style={[styles.screen, styles.fallbackCenter, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.fallbackCard}>
          <View style={[styles.fallbackIconCircle, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="storefront" size={40} color="#4338CA" />
          </View>
          <Text style={styles.fallbackTitle}>Chỉ dành cho Người Bán (Seller)</Text>
          <Text style={styles.fallbackSubtitle}>
            Theo quy định Chợ Market FU, chỉ tài khoản Người Bán (Seller) mới có quyền đăng bán và quản lý kho hàng. Tài khoản Sinh viên (Buyer) hiện chỉ có quyền tìm kiếm và mua đồ.
          </Text>
          <TouchableOpacity
            style={[styles.fallbackBtn, { backgroundColor: '#4338CA' }]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
            activeOpacity={0.85}
          >
            <Text style={styles.fallbackBtnText}>Xem hồ sơ tài khoản</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fallbackBackBtn} onPress={handleBack}>
            <Text style={styles.fallbackBackText}>Quay lại trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* ═══════════════════════════════════════════════════════════
          1. TOP BAR: Back Arrow + Đăng Bán + Avatar
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Đăng Bán</Text>

        <TouchableOpacity
          style={styles.avatarBtn}
          activeOpacity={0.8}
          onPress={() => {
            if (navigation && navigation.navigate) {
              navigation.navigate('MainTabs', { screen: 'Profile' });
            }
          }}
        >
          <Ionicons name="person" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 70 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════════════════
            2. KHO HÀNG CỦA TÔI & NÚT ĐĂNG TIN
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.warehouseRow}>
          <View style={styles.warehouseTextCol}>
            <Text style={styles.warehouseTitle}>Kho hàng của tôi</Text>
            <Text style={styles.warehouseSub}>
              Cập nhật lúc 11:20 • FPT {currentCampus || 'Hòa Lạc'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.postNewBtn}
            activeOpacity={0.88}
            onPress={handleCreatePost}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 2 }} />
            <Text style={styles.postNewBtnText}>Đăng tin</Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. THẺ THỐNG KÊ (ANALYTICS STRIP)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.analyticsStrip}>
          {/* Stat 1: Lượt xem */}
          <View style={styles.statItem}>
            <View style={styles.statIconPink}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#DC2626" />
            </View>
            <View style={styles.statTextCol}>
              <Text style={styles.statNumber}>1.240 lượt xem</Text>
              <Text style={styles.statSub}>30 ngày qua</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          {/* Stat 2: Sinh viên FPT kết nối */}
          <View style={styles.statItem}>
            <View style={styles.statIconMint}>
              <MaterialCommunityIcons name="handshake-outline" size={20} color="#059669" />
            </View>
            <View style={styles.statTextCol}>
              <Text style={styles.statNumber}>28 sinh viên FPT</Text>
              <Text style={styles.statSub}>Đã kết nối deal</Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. SAFE-HANDOFF NHẮC NHỞ
        ═══════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={styles.reminderCard}
          activeOpacity={0.85}
          onPress={handleSafeHandoffReminderPress}
        >
          <View style={styles.reminderClockCircle}>
            <Ionicons name="time" size={20} color="#FFFFFF" />
          </View>

          <View style={styles.reminderContentCol}>
            <View style={styles.reminderTitleRow}>
              <Text style={styles.reminderTitle}>SAFE-HANDOFF NHẮC NHỞ</Text>
              <View style={styles.reminderGreenDot} />
            </View>
            <Text style={styles.reminderDesc}>
              Hẹn lúc <Text style={styles.reminderOrangeText}>16:30 hôm nay</Text> tại{' '}
              <Text style={styles.reminderBold}>Dom B KTX</Text> với bạn{' '}
              <Text style={styles.reminderBold}>Hoàng Long (HE180293)</Text>
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#EA580C" style={styles.reminderArrow} />
        </TouchableOpacity>

        {/* ═══════════════════════════════════════════════════════════
            5. TABS TRẠNG THÁI (STATUS FILTER CHIPS)
        ═══════════════════════════════════════════════════════════ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusTabsRow}
        >
          {/* Tab 1: Đang hiển thị */}
          <TouchableOpacity
            style={[styles.statusTab, activeTab === 'active' && styles.statusTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.statusTabText, activeTab === 'active' && styles.statusTabTextActive]}>
              Đang hiển thị
            </Text>
            <View
              style={[
                styles.tabCountBadge,
                activeTab === 'active' ? styles.tabCountBadgeActive : styles.tabCountBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  activeTab === 'active' ? styles.tabCountTextActive : styles.tabCountTextInactive,
                ]}
              >
                {activeCount}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Tab 2: Đang hẹn giao */}
          <TouchableOpacity
            style={[styles.statusTab, activeTab === 'scheduled' && styles.statusTabActiveBlue]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('scheduled')}
          >
            <Text
              style={[
                styles.statusTabText,
                activeTab === 'scheduled' && styles.statusTabTextActiveBlue,
              ]}
            >
              Đang hẹn giao
            </Text>
            <View style={[styles.tabCountBadge, styles.tabCountBadgeBlue]}>
              <Text style={styles.tabCountTextBlue}>{scheduledCount}</Text>
            </View>
          </TouchableOpacity>

          {/* Tab 3: Đã thanh toán / Đã bán */}
          <TouchableOpacity
            style={[styles.statusTab, activeTab === 'sold' && styles.statusTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('sold')}
          >
            <Text style={[styles.statusTabText, activeTab === 'sold' && styles.statusTabTextActive]}>
              Đã thanh toán
            </Text>
            {soldCount > 0 && (
              <View style={[styles.tabCountBadge, styles.tabCountBadgeInactive]}>
                <Text style={styles.tabCountTextInactive}>{soldCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* ═══════════════════════════════════════════════════════════
            6. DANH SÁCH TIN ĐĂNG (LISTING CARDS)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.listingList}>
          {filteredListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có món đồ nào trong mục này</Text>
            </View>
          ) : (
            filteredListings.map((item) => (
              <View key={item.id} style={styles.listingCard}>
                {/* Main Content Row */}
                <View style={styles.cardMainRow}>
                  {/* Thumbnail Image with Tag */}
                  <View style={styles.thumbWrapper}>
                    <Image source={item.image} style={styles.thumbImage} contentFit="cover" />
                    {item.tag && (
                      <View
                        style={[
                          styles.thumbTag,
                          { backgroundColor: item.tagColor || 'rgba(0,0,0,0.6)' },
                        ]}
                      >
                        <Text style={[styles.thumbTagText, { color: item.tagTextColor || '#FFFFFF' }]}>
                          {item.tag}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Info Column */}
                  <View style={styles.cardInfoCol}>
                    <View style={styles.priceTimeRow}>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                      <Text style={styles.itemTimeAgo}>{item.timeAgo}</Text>
                    </View>

                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.locationRow}>
                      <Ionicons
                        name={item.locationIcon}
                        size={13}
                        color="#C2410C"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>

                    {/* Stats & Badge Tags */}
                    <View style={styles.tagsRow}>
                      {item.unreadMessages !== undefined && item.unreadMessages > 0 && (
                        <View style={styles.unreadMsgTag}>
                          <Ionicons name="chatbubble" size={11} color="#C2410C" style={{ marginRight: 3 }} />
                          <Text style={styles.unreadMsgText}>{item.unreadMessages} tin mới</Text>
                        </View>
                      )}

                      {item.scheduledAppointments !== undefined && item.scheduledAppointments > 0 && (
                        <View style={styles.scheduledTag}>
                          <Ionicons name="calendar" size={11} color="#1E40AF" style={{ marginRight: 3 }} />
                          <Text style={styles.scheduledTagText}>
                            {item.scheduledAppointments} người hẹn xem
                          </Text>
                        </View>
                      )}

                      <View style={styles.viewsTag}>
                        <Ionicons name="eye-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
                        <Text style={styles.viewsText}>{item.views} lượt xem</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Bottom Action Buttons Row */}
                <View style={styles.cardActionsRow}>
                  {/* Button 1: Sửa tin */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnBlue]}
                    activeOpacity={0.75}
                    onPress={() => handleEdit(item.title)}
                  >
                    <Ionicons name="pencil" size={13} color="#1E3A8A" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnBlueText}>Sửa tin</Text>
                  </TouchableOpacity>

                  {/* Button 2: Đẩy tin / Tạm ẩn (tùy mục) */}
                  {item.id === 'l1' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnOrange]}
                      activeOpacity={0.75}
                      onPress={() => handleBoost(item.id, item.title)}
                    >
                      <Ionicons name="rocket-outline" size={13} color="#C2410C" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnOrangeText}>Đẩy tin</Text>
                    </TouchableOpacity>
                  )}

                  {item.id === 'l2' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnBlue]}
                      activeOpacity={0.75}
                      onPress={() => handleToggleHide(item.id, item.title)}
                    >
                      <Ionicons name="eye-off-outline" size={13} color="#1E3A8A" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnBlueText}>Tạm ẩn</Text>
                    </TouchableOpacity>
                  )}

                  {/* Button 3: Đã bán */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnGreen]}
                    activeOpacity={0.75}
                    onPress={() => handleMarkSold(item.id, item.title)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={13} color="#065F46" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnGreenText}>Đã bán</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ManageListingsScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // 1. Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9A3412',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll Content
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // 2. Warehouse Row
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  warehouseTextCol: {
    flex: 1,
  },
  warehouseTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  warehouseSub: {
    fontSize: 12,
    color: '#64748B',
  },
  postNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9A3412',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#9A3412',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  postNewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // 3. Analytics Strip
  analyticsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconPink: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconMint: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextCol: {
    flex: 1,
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#DBEAFE',
    marginHorizontal: 8,
  },

  // 4. Safe-Handoff Reminder Card
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  reminderClockCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderContentCol: {
    flex: 1,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  reminderTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#047857',
    letterSpacing: 0.2,
  },
  reminderGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  reminderDesc: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16.5,
  },
  reminderOrangeText: {
    color: '#EA580C',
    fontWeight: '800',
  },
  reminderBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  reminderArrow: {
    marginLeft: 4,
  },

  // 5. Status Tabs Row
  statusTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 2,
  },
  statusTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusTabActive: {
    backgroundColor: '#9A3412',
  },
  statusTabActiveBlue: {
    backgroundColor: '#DBEAFE',
  },
  statusTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  statusTabTextActive: {
    color: '#FFFFFF',
  },
  statusTabTextActiveBlue: {
    color: '#1E3A8A',
  },
  tabCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  tabCountBadgeInactive: {
    backgroundColor: '#DBEAFE',
  },
  tabCountBadgeBlue: {
    backgroundColor: '#1E3A8A',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '900',
  },
  tabCountTextActive: {
    color: '#9A3412',
  },
  tabCountTextInactive: {
    color: '#1E40AF',
  },
  tabCountTextBlue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  // 6. Listing Card
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
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  thumbTagText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  cardInfoCol: {
    flex: 1,
  },
  priceTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#9A3412',
  },
  itemTimeAgo: {
    fontSize: 11,
    color: '#64748B',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  unreadMsgTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  unreadMsgText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  scheduledTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  scheduledTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  viewsTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 11,
    color: '#64748B',
  },

  // Action Buttons Row
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnBlue: {
    backgroundColor: '#EFF6FF',
  },
  actionBtnBlueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  actionBtnOrange: {
    backgroundColor: '#FFF7ED',
  },
  actionBtnOrangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
  },
  actionBtnGreen: {
    backgroundColor: '#ECFDF5',
  },
  actionBtnGreenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
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
