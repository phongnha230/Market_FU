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
import { theme } from '../../config/theme';

interface CampusDropdownOption {
  value: string;
  label: string;
  tag: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CAMPUS_DROPDOWN_ITEMS: CampusDropdownOption[] = [
  {
    value: 'TẤT CẢ',
    label: 'Tất cả 5 Cơ sở',
    tag: 'Toàn quốc',
    subtitle: 'Xem toàn bộ tin đăng từ 5 Campus FPT',
    icon: 'globe-outline',
  },
  {
    value: 'HÒA LẠC',
    label: 'FU Hòa Lạc',
    tag: 'Hola • Hà Nội',
    subtitle: 'Sảnh Alpha, Beta, Gamma & KTX Dom A–H',
    icon: 'school-outline',
  },
  {
    value: 'TP.HCM',
    label: 'FU TP. Hồ Chí Minh',
    tag: 'Xavalo • Q.9',
    subtitle: 'Khu CNC Quận 9 • Sảnh chính & Nhà văn hóa',
    icon: 'business-outline',
  },
  {
    value: 'ĐÀ NẴNG',
    label: 'FU Đà Nẵng',
    tag: 'Fuda • Ngũ Hành Sơn',
    subtitle: 'KĐT FPT City • Sảnh Alpha & Khu KTX',
    icon: 'sunny-outline',
  },
  {
    value: 'CẦN THƠ',
    label: 'FU Cần Thơ',
    tag: 'Fuct • Ninh Kiều',
    subtitle: 'Cầu Rau Răm • Sảnh Gamma & Canteen',
    icon: 'leaf-outline',
  },
  {
    value: 'QUY NHƠN',
    label: 'FU Quy Nhơn',
    tag: 'Fuqn • AI Campus',
    subtitle: 'KĐT An Phú Thịnh • Tòa Alpha & Beta',
    icon: 'hardware-chip-outline',
  },
];

export interface HomeHeaderProps {
  userName?: string;
  campusName?: string;
  selectedCampusIndex?: number;
  avatarUrl?: string;
  isAuthenticated?: boolean;
  coins?: number;
  unreadNotificationCount?: number;
  onSearchPress?: () => void;
  onAiPress?: () => void;
  onNotificationPress?: () => void;
  onCoinsPress?: () => void;
  onAvatarPress?: () => void;
  onCampusSelect?: (index: number, campusValue: string) => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = memo(({
  userName = 'Bạn',
  campusName = 'TẤT CẢ',
  selectedCampusIndex,
  avatarUrl,
  isAuthenticated = false,
  coins = 0,
  unreadNotificationCount = 0,
  onSearchPress,
  onAiPress,
  onNotificationPress,
  onCoinsPress,
  onAvatarPress,
  onCampusSelect,
}) => {
  const insets = useSafeAreaInsets();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const currentCampus = useCampusStore((s) => s.currentCampus);
  const setCampusByIndex = useCampusStore((s) => s.setCampusByIndex);

  const activeCampusValue = campusName || currentCampus || 'TẤT CẢ';

  const handleSelectOption = (index: number, item: CampusDropdownOption) => {
    setCampusByIndex(index);
    if (onCampusSelect) {
      onCampusSelect(index, item.value);
    }
    setDropdownVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.topBar}>
        <View style={styles.leftGroup}>
          <View style={styles.logoBox}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              contentFit="cover"
            />
          </View>

          <TouchableOpacity
            style={[styles.campusBadge, dropdownVisible && styles.campusBadgeActive]}
            activeOpacity={0.75}
            onPress={() => setDropdownVisible(true)}
          >
            <Ionicons
              name={activeCampusValue === 'TẤT CẢ' ? 'globe-outline' : 'location'}
              size={12}
              color={theme.colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.campusBadgeText} numberOfLines={1}>
              {activeCampusValue}
            </Text>
            <Ionicons
              name={dropdownVisible ? 'caret-up' : 'caret-down'}
              size={10}
              color={theme.colors.primary}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rightSection}>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.coinChip}
              activeOpacity={0.8}
              onPress={onCoinsPress}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Ionicons name="sparkles" size={12} color={theme.colors.primary} />
              <Text style={styles.coinChipText}>{coins.toLocaleString('vi-VN')} xu</Text>
            </TouchableOpacity>
          )}

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
            <Ionicons name="notifications-outline" size={21} color={theme.colors.text.primary} />
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
              <View style={styles.guestLoginChip}>
                <Ionicons name="person-outline" size={14} color={theme.colors.text.primary} />
                <Text style={styles.guestLoginText}>Đăng nhập</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Thanh tìm kiếm 1 chạm + lối vào Trợ lý Cóc AI */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.searchTrigger}
          activeOpacity={0.85}
          onPress={onSearchPress}
        >
          <Ionicons name="search-outline" size={18} color={theme.colors.neutral.iconMuted} />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            Tìm giáo trình, laptop, đồ KTX...
          </Text>
        </TouchableOpacity>
        {onAiPress && (
          <TouchableOpacity
            style={styles.aiTriggerChip}
            activeOpacity={0.85}
            onPress={onAiPress}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
            <Text style={styles.aiTriggerText}>Hỏi AI</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Popover Chọn Cơ Sở FPT (chỉ mount khi mở để giữ nhẹ cây UI) */}
      {dropdownVisible && (
        <Modal
          visible
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setDropdownVisible(false)}
        >
          <Pressable
            style={[styles.dropdownBackdrop, { paddingTop: Math.max(insets.top, 10) + 52 }]}
            onPress={() => setDropdownVisible(false)}
          >
            <Pressable style={styles.dropdownWrapper} onPress={(e) => e.stopPropagation()}>
              <View style={styles.dropdownArrowUp} />

              <View style={styles.dropdownCard}>
                <View style={styles.dropdownHeader}>
                  <View style={styles.dropdownHeaderLeft}>
                    <View style={styles.dropdownHeaderIconBox}>
                      <Ionicons name="compass" size={16} color={theme.colors.primary} />
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
                    <Ionicons name="close" size={16} color={theme.colors.neutral.iconMuted} />
                  </TouchableOpacity>
                </View>

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
                            isSelected ? styles.optionIconBoxActive : styles.optionIconBoxDefault,
                          ]}
                        >
                          <Ionicons
                            name={item.icon}
                            size={18}
                            color={isSelected ? theme.colors.text.inverse : theme.colors.neutral.icon}
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
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
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
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    gap: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 1,
  },
  campusBadgeActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  campusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: 0.2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
    gap: 6,
  },
  coinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
  },
  coinChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  iconButton: {
    padding: 5,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: theme.colors.card,
  },
  notificationBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: theme.colors.card,
  },
  notificationBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 8.5,
    fontWeight: '800',
    lineHeight: 10,
  },
  avatarButton: {
    marginLeft: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.neutral.surface,
  },
  avatarInitialBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  guestLoginChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: theme.colors.neutral.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  guestLoginText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  searchTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text.muted,
    fontWeight: '500',
  },
  aiTriggerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexShrink: 0,
  },
  aiTriggerText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: theme.colors.primary,
  },
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
    borderBottomColor: theme.colors.card,
    marginBottom: -1,
    zIndex: 10,
  },
  dropdownCard: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 14,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
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
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  dropdownHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  dropdownHeaderSub: {
    fontSize: 11,
    color: theme.colors.neutral.iconMuted,
    marginTop: 1,
  },
  dropdownCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dropdownOptionActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: '#FED7AA',
  },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionIconBoxDefault: {
    backgroundColor: theme.colors.neutral.surface,
  },
  optionIconBoxActive: {
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.text.primary,
  },
  optionTitleActive: {
    fontWeight: '800',
    color: theme.colors.primary,
  },
  optionTagPill: {
    backgroundColor: theme.colors.border,
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
    color: theme.colors.neutral.icon,
  },
  optionTagTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: '800',
  },
  optionSubtitle: {
    fontSize: 11,
    color: theme.colors.neutral.iconMuted,
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
    backgroundColor: theme.colors.card,
  },
});

export default HomeHeader;
