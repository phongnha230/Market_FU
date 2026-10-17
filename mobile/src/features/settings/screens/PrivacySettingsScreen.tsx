import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PRIVACY = 'user_privacy_settings_v1';

const PrivacyHeaderNavBtn: React.FC<{
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

export const PrivacySettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [hideRoomNumber, setHideRoomNumber] = useState(true);
  const [hideMssvPublic, setHideMssvPublic] = useState(false);
  const [campusOnlyListing, setCampusOnlyListing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_PRIVACY)
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (typeof parsed.hideRoomNumber === 'boolean') setHideRoomNumber(parsed.hideRoomNumber);
            if (typeof parsed.hideMssvPublic === 'boolean') setHideMssvPublic(parsed.hideMssvPublic);
            if (typeof parsed.campusOnlyListing === 'boolean') setCampusOnlyListing(parsed.campusOnlyListing);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const updateSetting = (key: string, val: boolean) => {
    const updated = {
      hideRoomNumber: key === 'hideRoomNumber' ? val : hideRoomNumber,
      hideMssvPublic: key === 'hideMssvPublic' ? val : hideMssvPublic,
      campusOnlyListing: key === 'campusOnlyListing' ? val : campusOnlyListing,
    };
    if (key === 'hideRoomNumber') setHideRoomNumber(val);
    if (key === 'hideMssvPublic') setHideMssvPublic(val);
    if (key === 'campusOnlyListing') setCampusOnlyListing(val);
    AsyncStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(updated)).catch(() => {});
  };

  const handleClearCache = () => {
    Alert.alert('Xóa bộ nhớ đệm', 'Giải phóng 48.2 MB hình ảnh và dữ liệu tạm?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa ngay',
        onPress: () => Alert.alert('Đã xóa', 'Bộ nhớ đệm của ứng dụng đã được dọn sạch!'),
      },
    ]);
  };

  const handleBlockList = () => {
    Alert.alert('Danh sách chặn', 'Hiện tại bạn chưa chặn sinh viên nào.');
  };

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
        <PrivacyHeaderNavBtn
          icon="arrow-back"
          size={24}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>Quyền riêng tư & An toàn</Text>
        <PrivacyHeaderNavBtn
          icon="home-outline"
          size={22}
          onPress={handleGoHome}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Banner */}
        <View style={styles.shieldBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#0284C7" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.shieldTitle}>Bảo vệ danh tính sinh viên</Text>
            <Text style={styles.shieldSub}>
              Market FU cam kết không chia sẻ dữ liệu riêng tư ra ngoài phạm vi FPT Education.
            </Text>
          </View>
        </View>

        {/* Section 1: Hiển thị thông tin */}
        <Text style={styles.sectionHeader}>HIỂN THỊ TRÊN CHỢ CAMPUS</Text>
        <View style={styles.cardGroup}>
          <View style={styles.switchRow}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="home-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Ẩn số phòng KTX</Text>
              <Text style={styles.rowDesc}>Chỉ hiển thị tên Tòa nhà (ví dụ: Dom A, Dom B) để bảo đảm an toàn</Text>
            </View>
            <Switch
              value={hideRoomNumber}
              onValueChange={(val) => updateSetting('hideRoomNumber', val)}
              thumbColor={hideRoomNumber ? '#F27024' : '#F1F5F9'}
              trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="id-card-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Ẩn MSSV công khai</Text>
              <Text style={styles.rowDesc}>Chỉ hiển thị họ tên và khóa học (ví dụ: K18), ẩn mã MSSV</Text>
            </View>
            <Switch
              value={hideMssvPublic}
              onValueChange={(val) => updateSetting('hideMssvPublic', val)}
              thumbColor={hideMssvPublic ? '#F27024' : '#F1F5F9'}
              trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="business-outline" size={20} color="#059669" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Chế độ nội bộ Campus</Text>
              <Text style={styles.rowDesc}>Chỉ sinh viên cùng Campus mới xem và nhắn tin được cho bạn</Text>
            </View>
            <Switch
              value={campusOnlyListing}
              onValueChange={(val) => updateSetting('campusOnlyListing', val)}
              thumbColor={campusOnlyListing ? '#F27024' : '#F1F5F9'}
              trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
            />
          </View>
        </View>

        {/* Section 2: Quản lý bảo mật */}
        <Text style={styles.sectionHeader}>QUẢN LÝ BẢO MẬT & DỮ LIỆU</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={handleBlockList}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="ban-outline" size={20} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Danh sách người dùng đã chặn</Text>
              <Text style={styles.rowDesc}>Quản lý tài khoản không thể nhắn tin hoặc xem bài</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={handleClearCache}>
            <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="trash-outline" size={20} color="#475569" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Xóa bộ nhớ đệm (Cache)</Text>
              <Text style={styles.rowDesc}>Đang chiếm 48.2 MB</Text>
            </View>
            <Text style={styles.clearBtnText}>Dọn dẹp</Text>
          </TouchableOpacity>
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
  shieldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  shieldTitle: { fontSize: 13.5, fontWeight: '700', color: '#0369A1' },
  shieldSub: { fontSize: 11.5, color: '#0284C7', marginTop: 2 },
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
  actionRow: {
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
  clearBtnText: { fontSize: 12, fontWeight: '700', color: '#EA580C', marginRight: 4 },
});

export default PrivacySettingsScreen;
