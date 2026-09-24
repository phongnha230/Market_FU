import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface VoucherItem {
  id: string;
  categoryTag: string;
  categoryColor: string;
  hotTag?: boolean;
  priorityTag?: string;
  title: string;
  description: string;
  minOrder?: string;
  code?: string;
  hsd?: string;
  autoApply?: boolean;
  emailNote?: string;
  coinCost?: number;
  usedPercent?: number;
  daysLeft?: number;
  actionType: 'save' | 'saved' | 'ready' | 'exchange';
  accentColor: string;
  lightBg: string;
  borderColor: string;
}

type TabKey = 'all' | 'ship' | 'exchange';

interface MissionItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  reward: string;
  status: 'done' | 'pending' | 'action';
  actionLabel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const VOUCHERS: VoucherItem[] = [
  {
    id: 'v1',
    categoryTag: 'CampusShip',
    categoryColor: '#1D4ED8',
    hotTag: true,
    title: 'Giảm 100% Phí Vận Chuyển Liên ...',
    description: 'Tới đa 40.000đ khi đặt từ 1 đơn liên campus HL - HCM - Đà - Quy Nhơn - CT...',
    usedPercent: 92,
    daysLeft: 2,
    actionType: 'save',
    accentColor: '#1D4ED8',
    lightBg: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  {
    id: 'v2',
    categoryTag: 'Đồ án Capstone',
    categoryColor: '#059669',
    priorityTag: 'K10, K17 Ưu tiên',
    title: 'Giảm ngay 50.000đ Linh Kiện &...',
    description: 'Mua đồ làm nhóm Đồ án type-C, kit test tự điều khiến IoT, laptop đồ án cc...',
    minOrder: 'Đơn tối thiểu 500.000đ',
    code: 'CAPSTONE2025',
    actionType: 'saved',
    accentColor: '#059669',
    lightBg: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  {
    id: 'v3',
    categoryTag: 'Đồ án Capstone K17',
    categoryColor: '#D97706',
    priorityTag: 'Năm & Sảnh Alpha',
    title: 'Giảm 20.000đ Combo Sách & Sli...',
    description: 'Hẹn nhận tại Bàn tập người Thư viện hoặc Sảnh Tòa Alpha & Beta',
    hsd: '30/11/2025',
    actionType: 'save',
    accentColor: '#D97706',
    lightBg: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  {
    id: 'v4',
    categoryTag: 'K30 Tín Sinh Viên',
    categoryColor: '#7C3AED',
    autoApply: true,
    title: 'Giảm K30 Tín Sinh Viên: K20 - Giảm 30.00...',
    description: 'Tự động kích hoạt khi tài khoản liên kết email @fpt.edu.vn chính chủ.',
    emailNote: 'Đã tư động xác minh email',
    actionType: 'ready',
    accentColor: '#7C3AED',
    lightBg: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  {
    id: 'v5',
    categoryTag: 'Đổi Coins',
    categoryColor: '#EA580C',
    coinCost: 200,
    title: 'Voucher Coins 25.000đ Voucher...',
    description: 'Dùng được thanh toán đặt hàng bất kỳ. Các đơn đặt trực tiếp tiền mặt không áp dụng...',
    actionType: 'exchange',
    accentColor: '#EA580C',
    lightBg: '#FFF7ED',
    borderColor: '#FDBA74',
  },
];

const MISSIONS: MissionItem[] = [
  {
    id: 'm1',
    icon: 'camera',
    iconBg: '#DBEAFE',
    iconColor: '#1D4ED8',
    title: 'Đánh giá kèm ảnh s...',
    subtitle: 'Giúp người khác biết về chất lượng trên campus',
    reward: '+50 Coins',
    status: 'done',
  },
  {
    id: 'm2',
    icon: 'tag',
    iconBg: '#FFEDD5',
    iconColor: '#EA580C',
    title: 'Đăng bán 1 món đồ...',
    subtitle: 'Chia sẻ đồ không dùng, giúp tân sinh viên K20',
    reward: '',
    status: 'action',
    actionLabel: 'Đăng bán →',
  },
  {
    id: 'm3',
    icon: 'shield-checkmark',
    iconBg: '#DCFCE7',
    iconColor: '#059669',
    title: 'Giao dịch an toàn Sa...',
    subtitle: 'Hoàn thành 1 đơn tại Safe-Point Sảnh Alpha / Beta',
    reward: 'Đã nhận +40',
    status: 'done',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// VoucherCard Component
// ─────────────────────────────────────────────────────────────────────────────
const VoucherCard: React.FC<{ item: VoucherItem; onAction: () => void }> = ({ item, onAction }) => {
  const actionBtnStyle = () => {
    switch (item.actionType) {
      case 'save': return [cardStyles.actionBtn, { backgroundColor: '#EA580C' }];
      case 'saved': return [cardStyles.actionBtn, { backgroundColor: '#059669' }];
      case 'ready': return [cardStyles.actionBtn, { backgroundColor: '#059669' }];
      case 'exchange': return [cardStyles.actionBtn, { backgroundColor: '#EA580C' }];
    }
  };
  const actionLabel = {
    save: 'Lưu mã',
    saved: 'Đã lưu về',
    ready: 'Sẵn sàng',
    exchange: 'Đổi mã ngay',
  }[item.actionType];

  return (
    <View style={[cardStyles.card, { borderColor: item.borderColor, backgroundColor: '#FFFFFF' }]}>
      {/* Left accent stripe */}
      <View style={[cardStyles.leftStripe, { backgroundColor: item.accentColor }]} />

      <View style={[cardStyles.cardInner, { backgroundColor: item.lightBg }]}>
        {/* Category tags */}
        <View style={cardStyles.tagsRow}>
          <View style={[cardStyles.categoryTag, { backgroundColor: item.accentColor }]}>
            <Text style={cardStyles.categoryTagText}>{item.categoryTag}</Text>
          </View>
          {item.hotTag && (
            <View style={cardStyles.hotTag}>
              <Text style={cardStyles.hotTagText}>Hot</Text>
            </View>
          )}
          {item.priorityTag && (
            <View style={cardStyles.priorityTag}>
              <Text style={cardStyles.priorityTagText}>{item.priorityTag}</Text>
            </View>
          )}
          {item.autoApply && (
            <View style={cardStyles.autoApplyTag}>
              <Ionicons name="flash" size={10} color="#7C3AED" style={{ marginRight: 2 }} />
              <Text style={cardStyles.autoApplyText}>Auto Apply</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={cardStyles.voucherTitle} numberOfLines={1}>{item.title}</Text>

        {/* Description */}
        <Text style={cardStyles.voucherDesc} numberOfLines={2}>{item.description}</Text>

        {/* Meta info row */}
        <View style={cardStyles.metaRow}>
          {item.usedPercent !== undefined && (
            <View style={cardStyles.progressWrapper}>
              <View style={cardStyles.progressBar}>
                <View style={[cardStyles.progressFill, { width: `${item.usedPercent}%` as any }]} />
              </View>
              <Text style={cardStyles.progressLabel}>Đã dùng {item.usedPercent}%</Text>
            </View>
          )}
          {item.daysLeft !== undefined && (
            <Text style={cardStyles.hsdText}>HSD: {item.daysLeft} ngày nữa</Text>
          )}
          {item.hsd && (
            <Text style={cardStyles.hsdText}>HSD: {item.hsd}</Text>
          )}
          {item.minOrder && (
            <Text style={cardStyles.minOrderText}>{item.minOrder}</Text>
          )}
          {item.code && (
            <View style={cardStyles.codeBox}>
              <Text style={cardStyles.codeLabel}>Mã: </Text>
              <Text style={cardStyles.codeValue}>{item.code}</Text>
            </View>
          )}
          {item.emailNote && (
            <View style={cardStyles.emailNoteRow}>
              <Ionicons name="checkmark-circle" size={12} color="#059669" style={{ marginRight: 3 }} />
              <Text style={cardStyles.emailNoteText}>{item.emailNote}</Text>
            </View>
          )}
          {item.coinCost !== undefined && (
            <View style={cardStyles.coinCostRow}>
              <MaterialCommunityIcons name="bitcoin" size={13} color="#EA580C" style={{ marginRight: 3 }} />
              <Text style={cardStyles.coinCostText}>Giá: {item.coinCost} Coins</Text>
            </View>
          )}
        </View>
      </View>

      {/* Divider dots */}
      <View style={cardStyles.dividerDots}>
        <View style={cardStyles.dividerCircleTop} />
        <View style={cardStyles.dividerLine} />
        <View style={cardStyles.dividerCircleBottom} />
      </View>

      {/* Right action side */}
      <View style={[cardStyles.rightSide, { backgroundColor: item.lightBg }]}>
        <TouchableOpacity
          style={actionBtnStyle()}
          activeOpacity={0.8}
          onPress={onAction}
        >
          <Text style={cardStyles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  leftStripe: {
    width: 5,
  },
  cardInner: {
    flex: 1,
    padding: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hotTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  hotTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  priorityTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  autoApplyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoApplyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  voucherTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  voucherDesc: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  metaRow: {
    gap: 4,
  },
  progressWrapper: {
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    width: '100%',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#EA580C',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  hsdText: {
    fontSize: 10.5,
    color: '#DC2626',
    fontWeight: '600',
  },
  minOrderText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 10.5,
    color: '#64748B',
  },
  codeValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emailNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailNoteText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },
  coinCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinCostText: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
  },
  dividerDots: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dividerCircleTop: {
    position: 'absolute',
    top: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dividerLine: {
    flex: 1,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dividerCircleBottom: {
    position: 'absolute',
    bottom: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rightSide: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main VoucherScreen
// ─────────────────────────────────────────────────────────────────────────────
interface VoucherScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
}

const VoucherScreen: React.FC<VoucherScreenProps> = ({ onGoBack, onTabChange }) => {
  const insets = useSafeAreaInsets();
  const [promoCode, setPromoCode] = useState('CAPSTONE25...');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [autoApply, setAutoApply] = useState(true);
  const [coins] = useState(350);
  const [activeNavTab, setActiveNavTab] = useState<string>('profile');

  const handleNavPress = (tab: string) => {
    setActiveNavTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const filteredVouchers = VOUCHERS.filter((v) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ship') return v.categoryTag === 'CampusShip';
    if (activeTab === 'exchange') return v.actionType === 'exchange';
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* ═══════════════════════════════════════════════════════════
          1. TOP HEADER
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          {/* FPT Logo */}
          <View style={styles.logoBox}>
            <Text style={styles.logoF}>F</Text>
            <Text style={styles.logoPT}>PT</Text>
          </View>
          <View style={styles.logoTextBox}>
            <Text style={styles.logoTitle}>FPT</Text>
            <Text style={styles.logoSub}>5Campus</Text>
          </View>
          <Text style={styles.campusLabel}>HÒA LẠC ▾</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => Alert.alert('Tìm kiếm')}>
            <Ionicons name="search-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#0F172A" />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>1</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn}>
            <Ionicons name="person" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Privilege Label Row */}
      <View style={styles.privilegeBar}>
        <View style={styles.privilegeLabelRow}>
          <Ionicons name="diamond" size={13} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.privilegeLabel}>FPT 5CAMPUS PRIVILEGE</Text>
        </View>
        <Text style={styles.pageTitle}>Kho Voucher & Coins</Text>
        <View style={styles.pageTitleRight}>
          <View style={styles.k17Badge}>
            <Text style={styles.k17BadgeText}>K17 SE</Text>
          </View>
          <View style={styles.holaBadge}>
            <Ionicons name="location" size={11} color="#EA580C" />
            <Text style={styles.holaBadgeText}>Hola</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ═══════════════════════════════════════════════════════════
            2. VÍ THƯỞNG SINH VIÊN - Gradient Card
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.walletCard}>
          {/* Top Row: Icon + FPT Student ID Badge */}
          <View style={styles.walletTopRow}>
            <View style={styles.walletIconBox}>
              <MaterialCommunityIcons name="wallet" size={18} color="#EA580C" />
              <Text style={styles.walletLabel}>VÍ THƯỞNG SINH VIÊN</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#059669" style={{ marginRight: 3 }} />
              <Text style={styles.verifiedText}>FPT Student ID Verified</Text>
            </View>
          </View>

          {/* Coins + Tier */}
          <View style={styles.coinsRow}>
            <View>
              <View style={styles.coinsValueRow}>
                <MaterialCommunityIcons name="bitcoin" size={26} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.coinsValue}>{coins}</Text>
                <Text style={styles.coinsUnit}>Coins</Text>
              </View>
              <Text style={styles.coinsDesc}>
                + 35.000đ khi đủ 100 lần đặt hàng{'\n'}CampusShip
              </Text>
            </View>
            <View style={styles.tierBox}>
              <Text style={styles.tierLabel}>Hạng hiện tại</Text>
              <View style={styles.diamondRow}>
                <Ionicons name="diamond" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.tierName}>Diamond</Text>
              </View>
              <Text style={styles.tierSub}>Student</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Tiến trình lên Master Pioneer</Text>
            <View style={styles.progressBarOuter}>
              <View style={[styles.progressBarFill, { width: `${(coins / 500) * 100}%` as any }]} />
            </View>
            <View style={styles.progressEndRow}>
              <Text style={styles.progressStart}>{coins} / 500 Gates</Text>
            </View>
          </View>

          {/* Check-in Button */}
          <TouchableOpacity
            style={styles.checkinBtn}
            activeOpacity={0.88}
            onPress={() => Alert.alert('✅ Điểm danh thành công!', '+20 Coins đã được cộng vào ví')}
          >
            <Ionicons name="flash" size={15} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.checkinBtnText}>Điểm danh nhận +20 Coins hôm nay</Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. NHẬP MÃ ƯU ĐÃI
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.promoRow}>
          <View style={styles.promoIconBox}>
            <MaterialCommunityIcons name="barcode-scan" size={18} color="#EA580C" />
          </View>
          <TextInput
            style={styles.promoInput}
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="NHẬP MÃ: CAPSTONE25..."
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity
            style={styles.applyBtn}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Mã đã áp dụng!', `Mã "${promoCode}" hợp lệ ✓`)}
          >
            <Text style={styles.applyBtnText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. TABS
        ═══════════════════════════════════════════════════════════ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {[
            { key: 'all', label: 'Tất cả (14)' },
            { key: 'ship', label: 'Phí ship liên campus (5)' },
            { key: 'exchange', label: 'Giao hàng & Đổi...' },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabChip, activeTab === t.key && styles.tabChipActive]}
              activeOpacity={0.75}
              onPress={() => setActiveTab(t.key as TabKey)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ═══════════════════════════════════════════════════════════
            5. VOUCHER LIST
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.voucherListHeader}>
          <Text style={styles.voucherListTitle}>Voucher Khả Dụng</Text>
          <View style={styles.autoApplyRow}>
            <Text style={styles.autoApplyLabel}>Tự động áp dụng mã tốt nhất</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, autoApply && styles.toggleBtnActive]}
              onPress={() => setAutoApply(!autoApply)}
              activeOpacity={0.8}
            >
              <View style={[styles.toggleThumb, autoApply && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {filteredVouchers.map((v) => (
          <VoucherCard
            key={v.id}
            item={v}
            onAction={() => {
              if (v.actionType === 'save') Alert.alert('✅ Đã lưu mã!', `Voucher "${v.title.substring(0, 30)}..." đã được lưu`);
              else if (v.actionType === 'exchange') Alert.alert('Đổi Coins', `Xác nhận dùng ${v.coinCost} Coins để đổi voucher này?`);
              else Alert.alert('Thông báo', 'Voucher đã được lưu sẵn trong ví của bạn!');
            }}
          />
        ))}

        {/* ═══════════════════════════════════════════════════════════
            6. NHIỆM VỤ KIẾM COINS
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeaderRow}>
            <Text style={styles.missionTitle}>Nhiệm Vụ Kiếm Coins Tuần Này</Text>
            <View style={styles.resetBadge}>
              <Ionicons name="time-outline" size={11} color="#EA580C" style={{ marginRight: 3 }} />
              <Text style={styles.resetText}>Reset Thứ Hai</Text>
            </View>
          </View>

          {MISSIONS.map((mission, idx) => (
            <View key={mission.id}>
              {idx > 0 && <View style={styles.missionDivider} />}
              <View style={styles.missionRow}>
                {/* Icon */}
                <View style={[styles.missionIconBox, { backgroundColor: mission.iconBg }]}>
                  <Ionicons name={mission.icon as any} size={18} color={mission.iconColor} />
                </View>

                {/* Text */}
                <View style={styles.missionTextBox}>
                  <Text style={styles.missionItemTitle} numberOfLines={1}>{mission.title}</Text>
                  <Text style={styles.missionItemSub} numberOfLines={1}>{mission.subtitle}</Text>
                </View>

                {/* Reward / Action */}
                {mission.status === 'done' && (
                  <View style={styles.rewardBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#059669" style={{ marginRight: 3 }} />
                    <Text style={styles.rewardText}>{mission.reward}</Text>
                  </View>
                )}
                {mission.status === 'action' && (
                  <TouchableOpacity
                    style={styles.missionActionBtn}
                    activeOpacity={0.8}
                    onPress={() => onTabChange && onTabChange('post')}
                  >
                    <Text style={styles.missionActionText}>{mission.actionLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Cam kết note */}
          <View style={styles.commitNote}>
            <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{ marginRight: 6, marginTop: 1 }} />
            <Text style={styles.commitText}>
              Cam kết Trợ Giá Sinh Viên FPT{'\n'}
              Tất cả voucher được kiểm tra bởi Ban Thanh Niên & Ban Công Tác Sinh Viên (CTSV) của cơ sở. Nghiêm cấm hành vi tự phát hoặc thanh clone hoặc gian lận voucher sinh viên.
            </Text>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          7. BOTTOM NAV
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {/* Tab: Trang chủ */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => handleNavPress('home')}
        >
          <Ionicons
            name={activeNavTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeNavTab === 'home' ? '#EA580C' : '#64748B'}
          />
          <Text style={[styles.navLabel, activeNavTab === 'home' && styles.navLabelActive]}>Trang chủ</Text>
        </TouchableOpacity>

        {/* Tab: Khám phá */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => handleNavPress('explore')}
        >
          <Ionicons
            name={activeNavTab === 'explore' ? 'compass' : 'compass-outline'}
            size={22}
            color={activeNavTab === 'explore' ? '#EA580C' : '#64748B'}
          />
          <Text style={[styles.navLabel, activeNavTab === 'explore' && styles.navLabelActive]}>Khám phá</Text>
        </TouchableOpacity>

        {/* Tab: Đăng bán (center FAB) */}
        <TouchableOpacity
          style={styles.navTabCenter}
          activeOpacity={0.85}
          onPress={() => handleNavPress('post')}
        >
          <View style={styles.fabBtn}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.navLabel}>Đăng bán</Text>
        </TouchableOpacity>

        {/* Tab: Tin nhắn */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => handleNavPress('chat')}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name={activeNavTab === 'chat' ? 'chatbubble' : 'chatbubble-outline'}
              size={22}
              color={activeNavTab === 'chat' ? '#EA580C' : '#64748B'}
            />
            <View style={styles.msgBadge}>
              <Text style={styles.msgBadgeText}>2</Text>
            </View>
          </View>
          <Text style={[styles.navLabel, activeNavTab === 'chat' && styles.navLabelActive]}>Tin nhắn</Text>
        </TouchableOpacity>

        {/* Tab: Hồ sơ */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => handleNavPress('profile')}
        >
          <Ionicons
            name={activeNavTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeNavTab === 'profile' ? '#EA580C' : '#64748B'}
          />
          <Text style={[styles.navLabel, activeNavTab === 'profile' && styles.navLabelActive]}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VoucherScreen;

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
    alignItems: 'baseline',
    backgroundColor: '#EA580C',
    width: 30,
    height: 30,
    borderRadius: 8,
    alignSelf: 'center',
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
  logoTextBox: {
    marginLeft: 4,
  },
  logoTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EA580C',
    lineHeight: 13,
  },
  logoSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 13,
  },
  campusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 4,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9A3412',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Privilege Bar
  privilegeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 6,
  },
  privilegeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privilegeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginLeft: 8,
  },
  pageTitleRight: {
    flexDirection: 'row',
    gap: 6,
  },
  k17Badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  k17BadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  holaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  holaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 14,
    gap: 10,
  },

  // Wallet Card
  walletCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 4,
    overflow: 'hidden',
    backgroundColor: '#C2410C',
    ...Platform.select({
      ios: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  walletTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  walletIconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  coinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  coinsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  coinsValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  coinsUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  coinsDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 16,
  },
  tierBox: {
    alignItems: 'flex-end',
  },
  tierLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  diamondRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tierSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 14,
  },
  progressLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  progressBarOuter: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressEndRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStart: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
  checkinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 11,
  },
  checkinBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },

  // Promo Input Row
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  promoIconBox: {
    padding: 4,
  },
  promoInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  applyBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Tabs
  tabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Voucher List Header
  voucherListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  voucherListTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  autoApplyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  autoApplyLabel: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '500',
  },
  toggleBtn: {
    width: 34,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleBtnActive: {
    backgroundColor: '#EA580C',
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  // Mission Card
  missionCard: {
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
  missionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  resetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  missionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  missionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionTextBox: {
    flex: 1,
  },
  missionItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  missionItemSub: {
    fontSize: 11,
    color: '#64748B',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  missionActionBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  missionActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  commitNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  commitText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    flex: 1,
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
    width: 52,
    height: 52,
    borderRadius: 26,
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
