import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermission, registerForPushNotificationsAsync } from '../../../services/notificationMobileService';
import { useNotificationStore } from '../../../stores/notificationStore';

const STORAGE_KEY_NOTIF = 'user_notification_settings_v1';

const HeaderNavBtn: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  onPress: () => void;
}> = React.memo(({ icon, size = 24, onPress }) => (
  <TouchableOpacity
    style={styles.backBtn}
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Ionicons name={icon} size={size} color="#0F172A" />
  </TouchableOpacity>
));

export const NotificationSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const pushPermissionGranted = useNotificationStore((state) => state.pushPermissionGranted);
  const setPushPermissionGranted = useNotificationStore((state) => state.setPushPermissionGranted);

  const [chatMessages, setChatMessages] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [safePointAlerts, setSafePointAlerts] = useState(true);
  const [voucherPromos, setVoucherPromos] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_NOTIF)
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (typeof parsed.chatMessages === 'boolean') setChatMessages(parsed.chatMessages);
            if (typeof parsed.orderUpdates === 'boolean') setOrderUpdates(parsed.orderUpdates);
            if (typeof parsed.safePointAlerts === 'boolean') setSafePointAlerts(parsed.safePointAlerts);
            if (typeof parsed.voucherPromos === 'boolean') setVoucherPromos(parsed.voucherPromos);
            if (typeof parsed.soundEnabled === 'boolean') setSoundEnabled(parsed.soundEnabled);
            if (typeof parsed.vibrateEnabled === 'boolean') setVibrateEnabled(parsed.vibrateEnabled);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const updateNotifSetting = (key: string, val: boolean) => {
    const updated = {
      chatMessages: key === 'chatMessages' ? val : chatMessages,
      orderUpdates: key === 'orderUpdates' ? val : orderUpdates,
      safePointAlerts: key === 'safePointAlerts' ? val : safePointAlerts,
      voucherPromos: key === 'voucherPromos' ? val : voucherPromos,
      soundEnabled: key === 'soundEnabled' ? val : soundEnabled,
      vibrateEnabled: key === 'vibrateEnabled' ? val : vibrateEnabled,
    };
    if (key === 'chatMessages') setChatMessages(val);
    if (key === 'orderUpdates') setOrderUpdates(val);
    if (key === 'safePointAlerts') setSafePointAlerts(val);
    if (key === 'voucherPromos') setVoucherPromos(val);
    if (key === 'soundEnabled') setSoundEnabled(val);
    if (key === 'vibrateEnabled') setVibrateEnabled(val);
    AsyncStorage.setItem(STORAGE_KEY_NOTIF, JSON.stringify(updated)).catch(() => {});
  };

  const handleToggleMasterPush = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await registerForPushNotificationsAsync();
        setPushPermissionGranted(true);
      } else {
        setPushPermissionGranted(false);
      }
    } else {
      setPushPermissionGranted(false);
    }
  };

  const renderSwitchRow = (
    icon: any,
    iconColor: string,
    iconBg: string,
    title: string,
    desc: string,
    value: boolean,
    onValueChange: (val: boolean) => void
  ) => (
    <View style={styles.switchRow}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? '#F27024' : '#F1F5F9'}
        trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
      />
    </View>
  );

  const handleBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  }, [navigation]);

  const handleGoHome = React.useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <HeaderNavBtn
          icon="arrow-back"
          size={24}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
        <HeaderNavBtn
          icon="home-outline"
          size={22}
          onPress={handleGoHome}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Master Switch */}
        <View style={styles.masterCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.masterTitle}>Thông báo đẩy (Push Notifications)</Text>
            <Text style={styles.masterDesc}>Nhận thông báo tức thì trên màn hình khóa</Text>
          </View>
          <Switch
            value={pushPermissionGranted}
            onValueChange={handleToggleMasterPush}
            thumbColor={pushPermissionGranted ? '#F27024' : '#F1F5F9'}
            trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
          />
        </View>

        {/* Section 1: Tin nhắn & Giao dịch */}
        <Text style={styles.sectionHeader}>GIAO DỊCH & TIN NHẮN</Text>
        <View style={styles.cardGroup}>
          {renderSwitchRow(
            'chatbubble-ellipses-outline',
            '#0284C7',
            '#E0F2FE',
            'Tin nhắn người mua / người bán',
            'Thông báo khi có người hỏi mua, trả giá sản phẩm',
            chatMessages,
            (val) => updateNotifSetting('chatMessages', val)
          )}
          <View style={styles.divider} />
          {renderSwitchRow(
            'shield-checkmark-outline',
            '#059669',
            '#D1FAE5',
            'Tiến độ đơn hàng & Escrow',
            'Cập nhật khi người mua cọc tiền hoặc bấm giải ngân',
            orderUpdates,
            (val) => updateNotifSetting('orderUpdates', val)
          )}
          <View style={styles.divider} />
          {renderSwitchRow(
            'location-outline',
            '#EA580C',
            '#FFEDD5',
            'Trạm Safe-Point Handoff',
            'Nhắc nhở giờ hẹn giao nhận tại sảnh tòa nhà',
            safePointAlerts,
            (val) => updateNotifSetting('safePointAlerts', val)
          )}
        </View>

        {/* Section 2: Ưu đãi & Hệ thống */}
        <Text style={styles.sectionHeader}>ƯU ĐÃI & ÂM THANH</Text>
        <View style={styles.cardGroup}>
          {renderSwitchRow(
            'ticket-outline',
            '#D97706',
            '#FEF3C7',
            'Voucher & Khuyến mãi Campus',
            'Thông báo mã giảm giá dịch vụ ăn uống & đồ KTX',
            voucherPromos,
            (val) => updateNotifSetting('voucherPromos', val)
          )}
          <View style={styles.divider} />
          {renderSwitchRow(
            'volume-high-outline',
            '#7C3AED',
            '#F5F3FF',
            'Âm thanh thông báo',
            'Phát tiếng chuông khi có tin nhắn mới',
            soundEnabled,
            (val) => updateNotifSetting('soundEnabled', val)
          )}
          <View style={styles.divider} />
          {renderSwitchRow(
            'phone-portrait-outline',
            '#475569',
            '#F1F5F9',
            'Rung khi có thông báo',
            'Rung nhẹ điện thoại',
            vibrateEnabled,
            (val) => updateNotifSetting('vibrateEnabled', val)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 40 },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.06)',
  },
  masterTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  masterDesc: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: { flex: 1, marginRight: 10 },
  rowTitle: { fontSize: 13.5, fontWeight: '700', color: '#0F172A' },
  rowDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },
});

export default NotificationSettingsScreen;
