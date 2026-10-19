import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface FaqItem {
  id: string;
  q: string;
  a: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'f1',
    category: 'Escrow & Thanh toán',
    q: 'Bảo lãnh thanh toán Escrow bảo vệ sinh viên như thế nào?',
    a: 'Khi bạn bấm "Mua ngay", tiền của bạn sẽ được giữ an toàn tại tài khoản trung gian được bảo chứng bởi Nhà trường. Người bán KHÔNG THỂ rút tiền cho đến khi hai bạn gặp nhau đồng kiểm hàng tại trạm Safe-Point và bạn bấm nút "Đã nhận hàng thành công".',
  },
  {
    id: 'f2',
    category: 'Giao nhận tại Safe-Point',
    q: 'Trạm Safe-Point Handoff là gì? Tôi có thể tìm ở đâu?',
    a: 'Trạm Safe-Point là các điểm giao dịch an toàn được lắp camera an ninh 24/7 của trường FPT (Sảnh Tòa Alpha, Thư viện Beta, Căn tin KTX). Khi hẹn giao dịch ở đây, có bảo vệ và camera giám sát trực tiếp, tránh rủi ro lừa đảo hoặc cướp giật.',
  },
  {
    id: 'f3',
    category: 'Khiếu nại & Hoàn tiền',
    q: 'Nếu sản phẩm bị lỗi hoặc người bán không đến thì sao?',
    a: 'Bạn chỉ cần bấm nút "Khiếu nại / Hoàn tiền" ngay trong chi tiết đơn hàng. Tiền Escrow sẽ bị đóng băng ngay lập tức. Đội ngũ Trọng tài Sinh viên FPT sẽ kiểm tra camera tại Safe-Point và hoàn tiền 100% về ví FPT Pay của bạn trong vòng 2 giờ.',
  },
  {
    id: 'f4',
    category: 'Liên Campus',
    q: 'Tôi có thể mua đồ từ sinh viên ở Campus khác không?',
    a: 'Hoàn toàn được! Hệ thống hỗ trợ ship hàng qua xe FPT Bus liên campus giữa Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Quy Nhơn với cước phí đồng giá chỉ 25k - 30k. Hàng gửi đến phòng Quản lý KTX của cơ sở bạn.',
  },
];

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

export const HelpCenterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('f1');

  const filteredFaqs = FAQS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCallHotline = (phone: string) => {
    Alert.alert('Gọi tổng đài hỗ trợ', `Bạn muốn gọi đến số hotline: ${phone}?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Gọi ngay', onPress: () => Linking.openURL(`tel:${phone}`) },
    ]);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  };

  const handleGoHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <HeaderNavBtn icon="arrow-back" size={24} onPress={handleBack} />
        <Text style={styles.headerTitle}>Trợ giúp & Hỗ trợ SV</Text>
        <HeaderNavBtn icon="home-outline" size={22} onPress={handleGoHome} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Support Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Chúng mình có thể giúp gì cho bạn?</Text>
          <Text style={styles.heroSub}>
            Hỗ trợ giải đáp giao dịch Escrow, trạm Safe-Point và bảo vệ quyền lợi sinh viên 5Campus
          </Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm câu hỏi, vấn đề cần hỗ trợ..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hotlines Contact Cards */}
        <Text style={styles.sectionHeader}>KÊNH HỖ TRỢ TRỰC TIẾP</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.8}
            onPress={() => handleCallHotline('02473005588')}
          >
            <View style={[styles.contactIconBg, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="call" size={20} color="#EA580C" />
            </View>
            <Text style={styles.contactLabel}>Hotline 24/7</Text>
            <Text style={styles.contactValue}>024 7300 5588</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Dispute')}
          >
            <View style={[styles.contactIconBg, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
            </View>
            <Text style={styles.contactLabel}>Khiếu nại Escrow</Text>
            <Text style={styles.contactValue}>Gửi yêu cầu ngay</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Accordion */}
        <Text style={styles.sectionHeader}>CÂU HỎI THƯỜNG GẶP (FAQ)</Text>
        <View style={styles.faqList}>
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  activeOpacity={0.7}
                  onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                >
                  <View style={styles.faqBadge}>
                    <Text style={styles.faqBadgeText}>{faq.category}</Text>
                  </View>
                  <Text style={styles.faqQuestionText}>{faq.q}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswerText}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
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
  heroCard: {
    backgroundColor: '#EA580C',
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroTitle: { fontSize: 17, fontWeight: '900', color: '#FFFFFF' },
  heroSub: { fontSize: 12, color: 'rgba(255, 255, 255, 0.9)', marginTop: 4, lineHeight: 18 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 14,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A', marginLeft: 8 },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  contactValue: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  faqList: { gap: 10 },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqQuestionRow: {
    padding: 14,
    flexDirection: 'column',
    gap: 6,
  },
  faqBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  faqBadgeText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  faqQuestionText: { fontSize: 13.5, fontWeight: '700', color: '#0F172A', lineHeight: 20 },
  faqAnswerContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  faqAnswerText: { fontSize: 12.5, color: '#475569', lineHeight: 20 },
});

export default HelpCenterScreen;
