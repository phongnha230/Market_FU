import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveAvatarImage } from '../../lib/imageResolver';
import { useCampusStore } from '../../stores/useCampusStore';

interface CampusDropdownOption {
  value: string;
  label: string;
  tag: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const CAMPUS_DROPDOWN_ITEMS: CampusDropdownOption[] = [
  {
    value: 'TẤT CẢ',
    label: 'Tất cả 5 Cơ sở',
    tag: 'Toàn quốc',
    subtitle: 'Xem toàn bộ tin đăng từ 5 Campus FPT',
    icon: 'globe-outline',
    color: '#EA580C',
    bgColor: '#FFF7ED',
  },
  {
    value: 'HÒA LẠC',
    label: 'FU Hòa Lạc',
    tag: 'Hola • Hà Nội',
    subtitle: 'Sảnh Alpha, Beta, Gamma & KTX Dom A–H',
    icon: 'school-outline',
    color: '#0284C7',
    bgColor: '#E0F2FE',
  },
  {
    value: 'TP.HCM',
    label: 'FU TP. Hồ Chí Minh',
    tag: 'Xavalo • Q.9',
    subtitle: 'Khu CNC Quận 9 • Sảnh chính & Nhà văn hóa',
    icon: 'business-outline',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
  },
  {
    value: 'ĐÀ NẴNG',
    label: 'FU Đà Nẵng',
    tag: 'Fuda • Ngũ Hành Sơn',
    subtitle: 'KĐT FPT City • Sảnh Alpha & Khu KTX',
    icon: 'sunny-outline',
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
  {
    value: 'CẦN THƠ',
    label: 'FU Cần Thơ',
    tag: 'Fuct • Ninh Kiều',
    subtitle: 'Cầu Rau Răm • Sảnh Gamma & Canteen',
    icon: 'leaf-outline',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    value: 'QUY NHƠN',
    label: 'FU Quy Nhơn',
    tag: 'Fuqn • AI Campus',
    subtitle: 'KĐT An Phú Thịnh • Tòa Alpha & Beta',
    icon: 'hardware-chip-outline',
    color: '#E11D48',
    bgColor: '#FFE4E6',
  },
];

export interface HomeHeaderProps {
  userName?: string;
  campusName?: string;
  selectedCampusIndex?: number;
  avatarUrl?: string;
  isAuthenticated?: boolean;
  isSeller?: boolean;
  unreadNotificationCount?: number;
  khoCount?: number;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onKhoPress?: () => void;
  onAvatarPress?: () => void;
  onCampusChangePress?: () => void;
  onCampusSelect?: (index: number, campusValue: string) => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = memo(({
  userName = 'Bạn',
  campusName = 'TẤT CẢ',
  selectedCampusIndex,
  avatarUrl,
  isAuthenticated = false,
  isSeller = false,
  unreadNotificationCount = 0,
  khoCount = 0,
  onSearchPress,
  onNotificationPress,
  onKhoPress,
  onAvatarPress,
  onCampusChangePress,
  onCampusSelect,
}) => {
  const insets = useSafeAreaInsets();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { currentCampus, setCampusByIndex } = useCampusStore();

  const activeCampusValue = campusName || currentCampus || 'TẤT CẢ';

  const handleSelectOption = (index: number, item: CampusDropdownOption) => {
    setCampusByIndex(index);
    if (onCampusSelect) {
      onCampusSelect(index, item.value);
    }
    setDropdownVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../../assets/icon.png')}
                style={{ width: '100%', height: '100%', borderRadius: 12 }}
                contentFit="cover"
              />
            </View>
            <View style={styles.logoBadge5}>
              <Text style={styles.logoBadge5Text}>5 Cơ sở</Text>
            </View>
          </View>
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.brandTitle}>FPT 5Campus</Text>
          <TouchableOpacity
            style={[styles.campusBadge, dropdownVisible && styles.campusBadgeActive]}
            activeOpacity={0.75}
            onPress={() => setDropdownVisible(true)}
          >
            <Ionicons
              name={activeCampusValue === 'TẤT CẢ' ? 'globe-outline' : 'location'}
              size={11}
              color="#EA580C"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.campusBadgeText}>{activeCampusValue}</Text>
            <Ionicons
              name={dropdownVisible ? 'caret-up' : 'caret-down'}
              size={10}
              color="#EA580C"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onSearchPress}
          >
            <Ionicons name="search-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onNotificationPress}
          >
            {isAuthenticated && unreadNotificationCount > 0 && (
              unreadNotificationCount > 1 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </Text>
                </View>
              ) : (
                <View style={styles.notificationDot} />
              )
            )}
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.8}
            onPress={onAvatarPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isAuthenticated ? (
              avatarUrl ? (
                <Image
                  source={resolveAvatarImage(avatarUrl)}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.avatarInitialBox}>
                  <Text style={styles.avatarInitialText}>
                    {(userName || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.guestAvatarCircle}>
                <Ionicons name="person" size={18} color="#64748B" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingRow}>
        <View style={styles.greetingTextCol}>
          <Text style={styles.welcomeTitle} numberOfLines={1}>Welcome to FPT Market 👋</Text>
          <Text style={styles.welcomeSubtitle} numberOfLines={1}>
            Trao đổi đồ dùng sinh viên{' '}
            {activeCampusValue === 'TẤT CẢ'
              ? '• Toàn hệ thống 5 Campus'
              : `• FU ${activeCampusValue}`}
          </Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.liveBadgeText}>Campus Live</Text>
        </View>
      </View>

      {/* Dropdown Popover Chọn Cơ Sở FPT */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable
          style={[styles.dropdownBackdrop, { paddingTop: Math.max(insets.top, 12) + 52 }]}
          onPress={() => setDropdownVisible(false)}
        >
          <Pressable style={styles.dropdownWrapper} onPress={(e) => e.stopPropagation()}>
            {/* Mũi tên trỏ lên thẳng nút [TẤT CẢ ▼] */}
            <View style={styles.dropdownArrowUp} />

            <View style={styles.dropdownCard}>
              {/* Header của Dropdown */}
              <View style={styles.dropdownHeader}>
                <View style={styles.dropdownHeaderLeft}>
                  <View style={styles.dropdownHeaderIconBox}>
                    <Ionicons name="compass" size={16} color="#EA580C" />
                  </View>
                  <View>
                    <Text style={styles.dropdownHeaderTitle}>Chọn cơ sở FPT University</Text>
                    <Text style={styles.dropdownHeaderSub}>
                      Lọc tin đăng & trạm Safe-Point theo khu vực
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.dropdownCloseBtn}
                  onPress={() => setDropdownVisible(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Danh sách 6 lựa chọn (Tất cả + 5 Campus) */}
              <View style={styles.dropdownList}>
                {CAMPUS_DROPDOWN_ITEMS.map((item, idx) => {
                  const isSelected =
                    selectedCampusIndex !== undefined
                      ? selectedCampusIndex === idx
                      : activeCampusValue.toUpperCase() === item.value.toUpperCase();

                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.dropdownOption,
                        isSelected && styles.dropdownOptionActive,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => handleSelectOption(idx, item)}
                    >
                      <View
                        style={[
                          styles.optionIconBox,
                          { backgroundColor: isSelected ? '#EA580C' : item.bgColor },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={isSelected ? '#FFFFFF' : item.color}
                        />
                      </View>

                      <View style={styles.optionTextCol}>
                        <View style={styles.optionTitleRow}>
                          <Text
                            style={[
                              styles.optionTitle,
                              isSelected && styles.optionTitleActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                          <View
                            style={[
                              styles.optionTagPill,
                              isSelected && styles.optionTagPillActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionTagText,
                                isSelected && styles.optionTagTextActive,
                              ]}
                            >
                              {item.tag}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.optionSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      </View>

                      <View style={styles.optionRightCol}>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={22} color="#EA580C" />
                        ) : (
                          <View style={styles.unselectedRadio} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingBottom: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 },
  leftSection: { width: 64, justifyContent: 'center', overflow: 'visible' },
  logoWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    overflow: 'visible',
    marginTop: 4,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  logoBadge5: {
    position: 'absolute',
    top: -7,
    right: -12,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 9,
    zIndex: 99,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge5Text: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  centerSection: { alignItems: 'center', justifyContent: 'center' },
  brandTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', letterSpacing: -0.2 },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  campusBadgeActive: {
    backgroundColor: '#FFEDD5',
    borderColor: '#EA580C',
  },
  campusBadgeText: { fontSize: 10.5, fontWeight: '800', color: '#EA580C', letterSpacing: 0.2 },
  rightSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 110 },
  iconButton: { padding: 6, position: 'relative', marginLeft: 2 },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  khoBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  khoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  avatarButton: { marginLeft: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  guestAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EA580C',
  },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 8 },
  greetingTextCol: { flex: 1, minWidth: 0, marginRight: 6 },
  welcomeTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  welcomeSubtitle: { fontSize: 12, fontWeight: '500', color: '#64748B', marginTop: 2 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    flexShrink: 0,
  },
  greenPulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  liveBadgeText: { fontSize: 11, color: '#047857', fontWeight: '600' },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dropdownWrapper: {
    width: '100%',
    maxWidth: 370,
    alignItems: 'center',
  },
  dropdownArrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    marginBottom: -1,
    zIndex: 10,
  },
  dropdownCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownHeaderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  dropdownHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  dropdownHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  dropdownCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownList: {
    gap: 6,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dropdownOptionActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  optionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionTextCol: {
    flex: 1,
    minWidth: 0,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionTitleActive: {
    fontWeight: '800',
    color: '#EA580C',
  },
  optionTagPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  optionTagPillActive: {
    backgroundColor: '#FFEDD5',
  },
  optionTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  optionTagTextActive: {
    color: '#C2410C',
    fontWeight: '800',
  },
  optionSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  optionRightCol: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
});

export default HomeHeader;
