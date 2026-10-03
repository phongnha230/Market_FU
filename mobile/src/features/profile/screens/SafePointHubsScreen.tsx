import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { safeHandoffMobileService, SafeHandoffHub } from '../../../services/safeHandoffMobileService';
import { useCampusStore } from '../../../stores/useCampusStore';

const CAMPUSES = [
  { id: 'HÒA LẠC', name: 'Hòa Lạc (HN)' },
  { id: 'TP.HCM', name: 'Hồ Chí Minh' },
  { id: 'ĐÀ NẴNG', name: 'Đà Nẵng' },
  { id: 'CẦN THƠ', name: 'Cần Thơ' },
  { id: 'QUY NHƠN', name: 'Quy Nhơn' },
];

export const SafePointHubsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentCampus } = useCampusStore();

  const [selectedCampus, setSelectedCampus] = useState<string>(
    route.params?.selectedCampus || currentCampus || 'HÒA LẠC'
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [hubs, setHubs] = useState<SafeHandoffHub[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    safeHandoffMobileService
      .getHubs(selectedCampus)
      .then((data) => {
        if (isMounted) {
          setHubs(data);
        }
      })
      .catch(() => {
        // fallback handles in service
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCampus]);

  const handleCopyLocation = async (hub: SafeHandoffHub) => {
    const locText = `${hub.name} - ${hub.description} (Cơ sở ${hub.campus})`;
    try {
      await Share.share({
        title: `Điểm hẹn Safe-Point: ${hub.name}`,
        message: `Hẹn gặp tại Trạm Safe-Point Market FU: ${locText}`,
      });
    } catch {
      Alert.alert('📍 Địa chỉ Safe-Point', locText);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 8) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs', { screen: 'Home' });
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Trạm Hẹn Safe-Point FPT</Text>
          <Text style={styles.headerSub}>Điểm giao dịch an toàn có camera & nguồn điện</Text>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Safe-Point Guarantee */}
        <View style={styles.shieldBanner}>
          <View style={styles.shieldIconCircle}>
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.shieldTitle}>BẢO VỆ GIAO DỊCH 100% TẠI TRẠM</Text>
            <Text style={styles.shieldDesc}>
              Tránh rủi ro bị bùng kèo, hàng lỗi hoặc cướp giật bằng cách hẹn gặp tại các trạm Safe-Point do Nhà trường bố trí.
            </Text>
          </View>
        </View>

        {/* Campus Filter Selector */}
        <Text style={styles.sectionHeader}>CHỌN CƠ SỞ HOẠT ĐỘNG</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.campusChipsScroll}
        >
          {CAMPUSES.map((c) => {
            const isSelected = selectedCampus === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.campusChip, isSelected && styles.campusChipActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedCampus(c.id)}
              >
                <Ionicons
                  name="location"
                  size={13}
                  color={isSelected ? '#FFFFFF' : '#64748B'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.campusChipText, isSelected && styles.campusChipTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hubs List */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionHeader}>
            DANH SÁCH TRẠM TẠI CƠ SỞ ({hubs.length})
          </Text>
          <View style={styles.liveDotRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Camera 24/7 Hoạt động</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#EA580C" />
            <Text style={styles.loadingText}>Đang dò tìm trạm Safe-Point gần nhất...</Text>
          </View>
        ) : (
          hubs.map((hub) => (
            <View key={hub.id} style={styles.hubCard}>
              <View style={styles.hubTopRow}>
                <View style={styles.hubIconBg}>
                  <MaterialCommunityIcons name="security" size={22} color="#059669" />
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.hubName}>{hub.name}</Text>
                  <Text style={styles.hubCampus}>Cơ sở: {hub.campus}</Text>
                </View>

                <View style={[styles.statusBadge, hub.isActive ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, hub.isActive ? styles.statusActiveText : styles.statusInactiveText]}>
                    {hub.isActive ? 'ĐANG MỞ' : 'TẠM NGHỈ'}
                  </Text>
                </View>
              </View>

              <Text style={styles.hubDesc}>{hub.description}</Text>

              {/* Amenities chips */}
              <View style={styles.amenitiesRow}>
                {hub.hasPower220v && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="flash" size={12} color="#D97706" />
                    <Text style={styles.amenityText}>Nguồn 220V test máy</Text>
                  </View>
                )}
                {hub.hasCctv && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="videocam" size={12} color="#059669" />
                    <Text style={styles.amenityText}>Camera HD 24/7</Text>
                  </View>
                )}
                {hub.hasGuard247 && (
                  <View style={styles.amenityChip}>
                    <Ionicons name="shield-checkmark" size={12} color="#2563EB" />
                    <Text style={styles.amenityText}>Cán bộ / Bảo vệ trực</Text>
                  </View>
                )}
              </View>

              {/* Footer info: Giờ mở cửa & Nút copy */}
              <View style={styles.hubFooter}>
                <View style={styles.hoursRow}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.hoursText}>Giờ mở: {hub.operatingHours || '07:00 - 22:00'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.copyBtn}
                  activeOpacity={0.7}
                  onPress={() => handleCopyLocation(hub)}
                >
                  <Ionicons name="copy-outline" size={13} color="#EA580C" />
                  <Text style={styles.copyBtnText}>Sao chép địa chỉ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Quy tắc giao dịch tại Safe-Point */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>💡 Quy chuẩn 3 bước giao dịch an toàn:</Text>
          <View style={styles.guideStep}>
            <Text style={styles.stepNum}>1.</Text>
            <Text style={styles.stepText}>
              <Text style={{ fontWeight: '800' }}>Hẹn gặp tại bàn giao dịch:</Text> Cắm điện test chức năng loa, màn hình, bàn phím kỹ càng trước camera an ninh.
            </Text>
          </View>
          <View style={styles.guideStep}>
            <Text style={styles.stepNum}>2.</Text>
            <Text style={styles.stepText}>
              <Text style={{ fontWeight: '800' }}>Quét mã QR Handshake:</Text> Sau khi ưng ý, người mua đưa mã QR trên app cho người bán quét để xác thực đối chứng.
            </Text>
          </View>
          <View style={styles.guideStep}>
            <Text style={styles.stepNum}>3.</Text>
            <Text style={styles.stepText}>
              <Text style={{ fontWeight: '800' }}>Bảo lưu giải ngân Escrow:</Text> Tiền được hệ thống nhà trường bảo vệ, giải phóng ngay lập tức cho người bán sau quét mã thành công.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  scrollContent: { paddingBottom: 40 },
  shieldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
  },
  shieldIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldTitle: { fontSize: 12, fontWeight: '900', color: '#6EE7B7', letterSpacing: 0.5 },
  shieldDesc: { fontSize: 11, color: '#D1FAE5', marginTop: 3, lineHeight: 16 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 18,
    letterSpacing: 0.5,
  },
  campusChipsScroll: { paddingHorizontal: 16, gap: 8 },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  campusChipActive: { backgroundColor: '#EA580C', borderColor: '#EA580C' },
  campusChipText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  campusChipTextActive: { color: '#FFFFFF' },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  liveDotRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  liveText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  loadingBox: { padding: 30, alignItems: 'center' },
  loadingText: { fontSize: 12, color: '#64748B', marginTop: 8 },
  hubCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
  },
  hubTopRow: { flexDirection: 'row', alignItems: 'center' },
  hubIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubName: { fontSize: 13.5, fontWeight: '800', color: '#0F172A' },
  hubCampus: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusInactive: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 9.5, fontWeight: '900' },
  statusActiveText: { color: '#16A34A' },
  statusInactiveText: { color: '#64748B' },
  hubDesc: { fontSize: 11.5, color: '#475569', marginTop: 8, lineHeight: 16 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  amenityText: { fontSize: 10, color: '#334155', fontWeight: '600' },
  hubFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hoursText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyBtnText: { fontSize: 10.5, fontWeight: '700', color: '#EA580C' },
  guideCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  guideTitle: { fontSize: 12.5, fontWeight: '900', color: '#1E40AF', marginBottom: 8 },
  guideStep: { flexDirection: 'row', marginTop: 6 },
  stepNum: { fontSize: 11.5, fontWeight: '900', color: '#2563EB', width: 18 },
  stepText: { fontSize: 11, color: '#1E3A8A', flex: 1, lineHeight: 16 },
});

export default SafePointHubsScreen;
