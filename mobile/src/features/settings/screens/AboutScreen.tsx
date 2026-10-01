import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở liên kết'));
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Profile' });
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Về Market FU</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* App Logo & Version */}
        <View style={styles.appBanner}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>FPT</Text>
          </View>
          <Text style={styles.appName}>Market FU - 5Campus</Text>
          <Text style={styles.appVersion}>Phiên bản 2.4.0 (Build 2026.09-Production)</Text>
          <View style={styles.shieldTag}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.shieldTagText}>Nền tảng thương mại an toàn sinh viên FPT</Text>
          </View>
        </View>

        {/* Introduction Card */}
        <Text style={styles.sectionHeader}>GIỚI THIỆU DỰ ÁN</Text>
        <View style={styles.card}>
          <Text style={styles.cardBodyText}>
            <Text style={{ fontWeight: '800', color: '#EA580C' }}>Market FU</Text> là hệ sinh thái trao đổi, mua bán đồ dùng sinh viên dành riêng cho 5 cơ sở thuộc Đại học FPT: Hòa Lạc (Hà Nội), TP. Hồ Chí Minh, Đà Nẵng, Cần Thơ và Quy Nhơn.
          </Text>
          <Text style={[styles.cardBodyText, { marginTop: 10 }]}>
            Với cơ chế độc quyền <Text style={{ fontWeight: '700' }}>FPT Safe-Point Handoff</Text> có camera giám sát và hệ thống ký quỹ trung gian <Text style={{ fontWeight: '700' }}>Escrow Guarantee</Text>, các bạn sinh viên hoàn toàn yên tâm không lo bị lừa đảo hay bùng cọc.
          </Text>
        </View>

        {/* Legal & Policy Links */}
        <Text style={styles.sectionHeader}>ĐIỀU KHOẢN & PHÁP LÝ</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'Quy chế cộng đồng',
                'Nghiêm cấm buôn bán hàng cấm, vũ khí, tài liệu thi cử lộ đề, vi phạm bản quyền. Mọi giao dịch gian lận sẽ bị xử lý kỷ luật sinh viên FPT.'
              )
            }
          >
            <Ionicons name="newspaper-outline" size={20} color="#0284C7" />
            <Text style={styles.rowTitle}>Quy chế hoạt động Chợ Sinh viên</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'Chính sách bảo mật',
                'Dữ liệu MSSV và thông tin cá nhân của bạn được mã hóa an toàn theo tiêu chuẩn Edu-Security của Tập đoàn FPT.'
              )
            }
          >
            <Ionicons name="lock-closed-outline" size={20} color="#059669" />
            <Text style={styles.rowTitle}>Chính sách bảo vệ quyền riêng tư</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'Điều khoản Escrow',
                'Số tiền đặt cọc được giữ trung gian đến khi người mua nhận hàng tại Safe-Point và xác nhận trong vòng 24 giờ.'
              )
            }
          >
            <Ionicons name="shield-outline" size={20} color="#EA580C" />
            <Text style={styles.rowTitle}>Điều khoản ký quỹ an toàn Escrow</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightBox}>
          <Text style={styles.copyrightText}>© 2026 FPT Education. All rights reserved.</Text>
          <Text style={styles.subCopyrightText}>Phát triển bởi Đội ngũ Công nghệ Sinh viên FPT</Text>
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
  appBanner: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoBadge: {
    backgroundColor: '#F27024',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  logoText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  appName: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  appVersion: { fontSize: 12, color: '#64748B', marginTop: 4 },
  shieldTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  shieldTagText: { fontSize: 11, fontWeight: '700', color: '#059669', marginLeft: 6 },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardBodyText: { fontSize: 13, color: '#334155', lineHeight: 21 },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowTitle: { flex: 1, fontSize: 13.5, fontWeight: '700', color: '#0F172A', marginLeft: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 46 },
  copyrightBox: { alignItems: 'center', marginTop: 28, marginBottom: 10 },
  copyrightText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  subCopyrightText: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
});

export default AboutScreen;
