import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SettingItem {
  id: string;
  icon: string;
  iconLib: 'ionicons' | 'mci';
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  dotAlert?: boolean;
  chevron?: boolean;
}

interface ProfileScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const SETTING_ITEMS: SettingItem[] = [
  {
    id: 's1',
    icon: 'shield-checkmark',
    iconLib: 'ionicons',
    iconBg: '#DCFCE7',
    iconColor: '#059669',
    title: 'Xác minh Thẻ SV & KYC',
    subtitle: 'Đã duyệt cơ sở Hòa Lạc (ID: 017842)',
    chevron: true,
  },
  {
    id: 's2',
    icon: 'ticket-confirmation-outline',
    iconLib: 'mci',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    title: 'Kho Voucher & Đổi thưởng...',
    subtitle: '14 mã giảm giá quần ăn & phụ kiện Hola',
    badge: '14 mới',
    badgeColor: '#EA580C',
    chevron: true,
  },
  {
    id: 's3',
    icon: 'location',
    iconLib: 'ionicons',
    iconBg: '#EFF6FF',
    iconColor: '#1D4ED8',
    title: 'Trạm Safe-Handoff yêu thích',
    subtitle: 'Sảnh Tòa Alpha & Thư viện Beta (Camera 24/7)',
    chevron: true,
  },
  {
    id: 's4',
    icon: 'alert-circle',
    iconLib: 'ionicons',
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    title: 'Trung tâm Khiếu nại & Hoàn tiền...',
    subtitle: '1 yêu cầu hoàn cọc tại nghe đang xử lý',
    dotAlert: true,
    chevron: true,
  },
  {
    id: 's5',
    icon: 'notifications',
    iconLib: 'ionicons',
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    title: 'Cài đặt thông báo & Bảo mật',
    subtitle: '2FA qua email FPT Edu & SMS OTP',
    chevron: true,
  },
  {
    id: 's6',
    icon: 'key',
    iconLib: 'ionicons',
    iconBg: '#F8FAFC',
    iconColor: '#475569',
    title: 'Đổi mật khẩu tài khoản',
    subtitle: 'Cập nhật lần cuối 45 ngày trước',
    chevron: true,
  },
  {
    id: 's7',
    icon: 'document-text',
    iconLib: 'ionicons',
    iconBg: '#EFF6FF',
    iconColor: '#0369A1',
    title: 'Quy chế Chợ sinh viên & Điều khoản...',
    subtitle: 'Quy tắc bảo giao độ đặc trong nhóm sinh viên 5Campus',
    chevron: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SettingRow component
// ─────────────────────────────────────────────────────────────────────────────
const SettingRow: React.FC<{ item: SettingItem; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={rowStyles.row} activeOpacity={0.7} onPress={onPress}>
    <View style={[rowStyles.iconBox, { backgroundColor: item.iconBg }]}>
      {item.iconLib === 'ionicons' ? (
        <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
      ) : (
        <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
      )}
    </View>
    <View style={rowStyles.textBox}>
      <View style={rowStyles.titleRow}>
        <Text style={rowStyles.title} numberOfLines={1}>{item.title}</Text>
        {item.badge && (
          <View style={[rowStyles.badge, { backgroundColor: item.badgeColor }]}>
            <Text style={rowStyles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.dotAlert && (
          <View style={rowStyles.dotAlert} />
        )}
      </View>
      <Text style={rowStyles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
    </View>
    {item.chevron && (
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    )}
  </TouchableOpacity>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 2,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dotAlert: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────
const ProfileScreen: React.FC<ProfileScreenProps> = ({ onGoBack, onTabChange }) => {
  const insets = useSafeAreaInsets();
  const [activeNavTab, setActiveNavTab] = useState('profile');
  const coins = 350;
  const escrowBalance = '1.250.000đ';
  const trustScore = 98;

  const handleNavPress = (tab: string) => {
    setActiveNavTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleSettingPress = (item: SettingItem) => {
    if (item.id === 's2' && onTabChange) {
      onTabChange('voucher');
    } else if (item.id === 's4' && onTabChange) {
      onTabChange('dispute');
    } else {
      Alert.alert(item.title, item.subtitle);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* ═══════════════════════════════════════════════════════════
          1. TOP HEADER
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoF}>F</Text>
            <Text style={styles.logoPT}>PT</Text>
          </View>
          <View>
            <Text style={styles.logoTitle}>FPT</Text>
            <Text style={styles.logoSub}>5Campus</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Coins display */}
          <View style={styles.coinsChip}>
            <MaterialCommunityIcons name="bitcoin" size={14} color="#EA580C" />
            <Text style={styles.coinsChipText}>1.250 C</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Verified Bar */}
      <View style={styles.verifiedBar}>
        <View style={styles.verifiedLeft}>
          <Ionicons name="location-sharp" size={12} color="#EA580C" style={{ marginRight: 3 }} />
          <Text style={styles.verifiedBarText}>FPT HOLA • K17 SE VERIFIED</Text>
        </View>
        <View style={styles.verifiedRight}>
          <TouchableOpacity style={styles.qrBtn} onPress={() => Alert.alert('QR Code', 'Mã QR cá nhân của bạn')}>
            <MaterialCommunityIcons name="qrcode" size={18} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ═══════════════════════════════════════════════════════════
            2. PROFILE HERO
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.profileHero}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
            {/* Verified tick */}
            <View style={styles.avatarVerifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
            </View>
          </View>

          {/* Name & Info */}
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>Lê Minh Quân</Text>
              <View style={styles.k17Badge}>
                <Text style={styles.k17BadgeText}>K17 SE</Text>
              </View>
            </View>
            <Text style={styles.profileRole}>Kỹ thuật phần mềm • Đại học FPT Hòa Lạc</Text>
            <View style={styles.verifyRow}>
              <Ionicons name="checkmark-circle" size={13} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.verifyText}>Thẻ SV & FAP SSO xác thực 100%</Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. TRUST SCORE CARD
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.trustCard}>
          <View style={styles.trustMetricsRow}>
            {/* Trust Score */}
            <View style={styles.trustMetric}>
              <Text style={styles.trustMetricLabel}>TRUST SCORE</Text>
              <View style={styles.trustScoreRow}>
                <Text style={styles.trustScoreNum}>{trustScore}</Text>
                <Text style={styles.trustScoreMax}>/100</Text>
                <View style={styles.top1Badge}>
                  <Text style={styles.top1Text}>TOP{'\n'}1%</Text>
                </View>
              </View>
            </View>

            <View style={styles.trustDivider} />

            {/* Safe Deals */}
            <View style={styles.trustMetric}>
              <Text style={styles.trustMetricLabel}>GIAO DỊCH AN TOÀN</Text>
              <View style={styles.trustValueRow}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.trustValue}>24 kèo</Text>
              </View>
            </View>

            <View style={styles.trustDivider} />

            {/* Peer Rating */}
            <View style={styles.trustMetric}>
              <Text style={styles.trustMetricLabel}>UY TÍN PEER</Text>
              <View style={styles.trustValueRow}>
                <Ionicons name="star" size={14} color="#FBBF24" style={{ marginRight: 3 }} />
                <Text style={styles.trustValue}>4.9</Text>
                <Text style={styles.trustValueSub}>(31)</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.trustActionRow}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Chỉnh sửa hồ sơ')}
            >
              <Ionicons name="create-outline" size={15} color="#1E293B" style={{ marginRight: 6 }} />
              <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fapSecurityBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Bảo mật FAP', 'Liên kết tài khoản FAP SSO')}
            >
              <MaterialCommunityIcons name="security" size={15} color="#1D4ED8" style={{ marginRight: 6 }} />
              <Text style={styles.fapSecurityText}>Bảo mật FAP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. VÍ ESCROW & CAMPUS ASSETS
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.walletSection}>
          {/* Section Header */}
          <View style={styles.walletSectionHeader}>
            <Text style={styles.walletSectionTitle}>Ví Escrow & Campus Assets</Text>
            <View style={styles.fptPayBadge}>
              <Text style={styles.fptPayText}>FPT PAY</Text>
            </View>
            <TouchableOpacity style={styles.historyBtn}>
              <Text style={styles.historyBtnText}>Lịch sử →</Text>
            </TouchableOpacity>
          </View>

          {/* Balance Row */}
          <View style={styles.balanceRow}>
            {/* Escrow Balance */}
            <View style={styles.balanceBox}>
              <View style={styles.balanceLabelRow}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.balanceLabel}>VÍ ESCROW BẢO VỆ</Text>
              </View>
              <Text style={styles.escrowAmount}>{escrowBalance}</Text>
            </View>

            <View style={styles.balanceDivider} />

            {/* Campus Coins */}
            <View style={styles.balanceBox}>
              <View style={styles.balanceLabelRow}>
                <MaterialCommunityIcons name="bitcoin" size={13} color="#EA580C" style={{ marginRight: 4 }} />
                <Text style={styles.balanceLabel}>CAMPUS COINS</Text>
              </View>
              <Text style={styles.coinsAmount}>{coins}</Text>
              <Text style={styles.coinsBonus}>+50 ngày mai</Text>
            </View>
          </View>

          {/* Wallet Actions */}
          <View style={styles.walletActionsRow}>
            <TouchableOpacity
              style={styles.walletActionChip}
              onPress={() => Alert.alert('Giao dịch', '+ 1 GD cho nhận')}
            >
              <Text style={styles.walletActionChipText}>+1 GD cho nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.walletActionChip, styles.withdrawBtn]}
              onPress={() => Alert.alert('Rút tiền', 'Xác nhận rút tiền từ ví Escrow?')}
            >
              <Text style={styles.withdrawBtnText}>Rút tiền</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.walletActionChip, styles.exchangeBtn]}
              onPress={() => handleNavPress('voucher')}
            >
              <Text style={styles.exchangeBtnText}>Đổi Voucher</Text>
            </TouchableOpacity>
          </View>

          {/* Diamond Tier Banner */}
          <TouchableOpacity style={styles.diamondBanner} activeOpacity={0.85}>
            <View style={styles.diamondBannerLeft}>
              <Ionicons name="diamond" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.diamondBannerTitle}>Diamond Student K17 ◆</Text>
                <Text style={styles.diamondBannerSub}>Miễn phí 100% phí bảo lãnh Escrow tháng nay</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            5. ĐƠN MUA CỦA BẠN
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.ordersCard}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTitle}>Đơn Mua Của Bạn</Text>
            <TouchableOpacity onPress={() => Alert.alert('Xem tất cả đơn hàng')}>
              <Text style={styles.ordersSeeAll}>Tất cả (7) →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ordersGrid}>
            {[
              { icon: 'checkmark-circle-outline', label: 'Chờ xác\nnhận', badge: '1', color: '#94A3B8' },
              { icon: 'bicycle-outline', label: 'Campus\nShip', badge: '2', color: '#1D4ED8' },
              { icon: 'location-outline', label: 'Safe-Point', badge: '3', color: '#059669' },
              { icon: 'star-outline', label: 'Đánh giá', badge: '3', color: '#FBBF24' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.orderItem}
                activeOpacity={0.75}
                onPress={() => Alert.alert(item.label.replace('\n', ' '))}
              >
                <View style={{ position: 'relative' }}>
                  <Ionicons name={item.icon as any} size={30} color={item.color} />
                  <View style={[styles.orderBadge, item.badge === '1' ? { backgroundColor: '#94A3B8' } : {}]}>
                    <Text style={styles.orderBadgeText}>{item.badge}</Text>
                  </View>
                </View>
                <Text style={styles.orderLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            6. GIAN HÀNG CÁ NHÂN
        ═══════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={styles.shopBanner}
          activeOpacity={0.85}
          onPress={() => Alert.alert('Gian hàng cá nhân', 'Quản lý các sản phẩm đang bán')}
        >
          <View style={styles.shopBannerLeft}>
            <View style={styles.shopIconBox}>
              <Ionicons name="storefront" size={20} color="#EA580C" />
            </View>
            <View style={styles.shopTextBox}>
              <View style={styles.shopTitleRow}>
                <Text style={styles.shopTitle}>Gian hàng cá nhân</Text>
                <View style={styles.activeShopBadge}>
                  <Text style={styles.activeShopText}>5 tin đang bán</Text>
                </View>
              </View>
              <Text style={styles.shopSub} numberOfLines={1}>
                3 Giáo trình C/C++, 1 Bàn phím cơ, 1 Ve F-Camp...
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        {/* ═══════════════════════════════════════════════════════════
            7. TIỆN ÍCH & THIẾT LẬP TÀI KHOẢN
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsSectionLabel}>TIỆN ÍCH & THIẾT LẬP TÀI KHOẢN</Text>
          {SETTING_ITEMS.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.settingsDivider} />}
              <SettingRow item={item} onPress={() => handleSettingPress(item)} />
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi FPT 5Campus?', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Đăng xuất', style: 'destructive', onPress: onGoBack },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            FPT 5Campus Marketplace • Hoa Lac Version 2.4.1{'\n'}
            Bảo trợ an toàn bởi Phòng Công tác sinh viên FPTu
          </Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          8. BOTTOM NAVIGATION
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {/* Trang chủ */}
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7} onPress={() => handleNavPress('home')}>
          <Ionicons name={activeNavTab === 'home' ? 'home' : 'home-outline'} size={22} color={activeNavTab === 'home' ? '#EA580C' : '#64748B'} />
          <Text style={[styles.navLabel, activeNavTab === 'home' && styles.navLabelActive]}>Trang chủ</Text>
        </TouchableOpacity>

        {/* Khám phá */}
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7} onPress={() => handleNavPress('explore')}>
          <Ionicons name={activeNavTab === 'explore' ? 'compass' : 'compass-outline'} size={22} color={activeNavTab === 'explore' ? '#EA580C' : '#64748B'} />
          <Text style={[styles.navLabel, activeNavTab === 'explore' && styles.navLabelActive]}>Khám phá</Text>
        </TouchableOpacity>

        {/* Đơn hàng (center) */}
        <TouchableOpacity style={styles.navTabCenter} activeOpacity={0.85} onPress={() => handleNavPress('orders')}>
          <View style={styles.fabBtn}>
            <Ionicons name="receipt" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.navLabel}>Đơn hàng</Text>
        </TouchableOpacity>

        {/* Tin nhắn */}
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7} onPress={() => handleNavPress('chat')}>
          <View style={{ position: 'relative' }}>
            <Ionicons name={activeNavTab === 'chat' ? 'chatbubble' : 'chatbubble-outline'} size={22} color={activeNavTab === 'chat' ? '#EA580C' : '#64748B'} />
            <View style={styles.msgBadge}>
              <Text style={styles.msgBadgeText}>2</Text>
            </View>
          </View>
          <Text style={[styles.navLabel, activeNavTab === 'chat' && styles.navLabelActive]}>Tin nhắn</Text>
        </TouchableOpacity>

        {/* Hồ sơ */}
        <TouchableOpacity style={styles.navTab} activeOpacity={0.7} onPress={() => handleNavPress('profile')}>
          <Ionicons name={activeNavTab === 'profile' ? 'person' : 'person-outline'} size={22} color={activeNavTab === 'profile' ? '#EA580C' : '#64748B'} />
          <Text style={[styles.navLabel, activeNavTab === 'profile' && styles.navLabelActive]}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBox: {
    flexDirection: 'row',
    backgroundColor: '#EA580C',
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoF: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  logoPT: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  logoTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EA580C',
  },
  logoSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  coinsChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  iconBtn: {
    padding: 4,
  },

  // Verified Bar
  verifiedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  verifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  verifiedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qrBtn: {
    padding: 4,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 12,
    gap: 10,
  },

  // Profile Hero
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFEDD5',
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  k17Badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  k17BadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  profileRole: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },

  // Trust Card
  trustCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  trustMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  trustMetric: {
    flex: 1,
    alignItems: 'center',
  },
  trustMetricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  trustScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  trustScoreNum: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  trustScoreMax: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  top1Badge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  top1Text: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 12,
  },
  trustDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4,
  },
  trustValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  trustValueSub: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 2,
  },
  trustActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editProfileText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  fapSecurityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  fapSecurityText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  // Wallet Section
  walletSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  walletSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  fptPayBadge: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fptPayText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  historyBtn: {
    padding: 2,
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  balanceRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  balanceBox: {
    flex: 1,
    padding: 14,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  escrowAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  coinsAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: '#EA580C',
  },
  coinsBonus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  walletActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  walletActionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  walletActionChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  withdrawBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  withdrawBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  exchangeBtn: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  exchangeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  diamondBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  diamondBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  diamondBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5B21B6',
    marginBottom: 2,
  },
  diamondBannerSub: {
    fontSize: 11,
    color: '#7C3AED',
  },

  // Orders Card
  ordersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  ordersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ordersTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  ordersSeeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  ordersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  orderItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  orderBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  orderLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Shop Banner
  shopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  shopBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  shopIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  shopTextBox: {
    flex: 1,
  },
  shopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  shopTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeShopBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeShopText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  shopSub: {
    fontSize: 11.5,
    color: '#64748B',
  },

  // Settings
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  settingsSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Footer Note
  footerNote: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  footerNoteText: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    paddingHorizontal: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 10 },
    }),
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 2,
  },
  navTabCenter: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 4,
  },
  fabBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    ...Platform.select({
      ios: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  msgBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
