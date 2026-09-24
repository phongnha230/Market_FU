import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Types & Mock Data
// ─────────────────────────────────────────────────────────────────────────────
type MsgType =
  | 'text'
  | 'text_received'
  | 'safe_suggestion'
  | 'appointment_confirmed'
  | 'date_separator';

interface Message {
  id: string;
  type: MsgType;
  text?: string;
  time?: string;
  isRead?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 'd1', type: 'date_separator', text: 'Hôm nay, 14:15' },
  {
    id: 'm1',
    type: 'text',
    text: 'Chào Nam, bàn phím này còn không bán đó? Có cầm test thử switch tại chỗ được không?',
    time: '14:15',
    isRead: true,
  },
  {
    id: 'm2',
    type: 'text_received',
    text: 'Chào Quân! Còn nha bạn, phím mình mang theo balo đây rồi. Chiều nay mình học xong ca 4 ở Tòa Alpha.',
    time: '14:17',
  },
  { id: 'sg1', type: 'safe_suggestion' },
  {
    id: 'm3',
    type: 'text_received',
    text: 'Hẹn bạn 16h30 tại bàn số 04 sảnh Alpha nhé, mình đợi ở đó.',
    time: '14:18',
  },
  {
    id: 'm4',
    type: 'text',
    text: 'Ok chốt nhé Nam, mình qua ngay sau giờ học.',
    time: '14:20',
    isRead: true,
  },
  { id: 'ac1', type: 'appointment_confirmed' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const SafeSuggestionCard: React.FC<{ onSchedule: () => void }> = ({ onSchedule }) => (
  <View style={cardStyles.safeCard}>
    <View style={cardStyles.safeCardHeader}>
      <View style={cardStyles.safeIconCircle}>
        <MaterialCommunityIcons name="shield-check" size={16} color="#FFFFFF" />
      </View>
      <Text style={cardStyles.safeCardTitle}>Gợi ý giao dịch an toàn</Text>
    </View>
    <Text style={cardStyles.safeCardDesc}>
      Bạn có muốn tạo cuộc hẹn tại Trạm Safe-Handoff Sảnh Tòa Alpha? Đó có sẵn nguồn điện, cổng cắm switch test & camera giám sát?
    </Text>
    <TouchableOpacity style={cardStyles.scheduleBtn} activeOpacity={0.85} onPress={onSchedule}>
      <MaterialCommunityIcons name="calendar-clock" size={15} color="#FFFFFF" style={{ marginRight: 7 }} />
      <Text style={cardStyles.scheduleBtnText}>Tạo lịch hẹn Handoff lúc 16:30</Text>
    </TouchableOpacity>
  </View>
);

const AppointmentCard: React.FC = () => (
  <View style={cardStyles.apptCard}>
    {/* Header */}
    <View style={cardStyles.apptHeader}>
      <View style={cardStyles.apptCheckCircle}>
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      </View>
      <View style={cardStyles.apptHeaderText}>
        <Text style={cardStyles.apptTitle}>Cuộc hẹn giao dịch đã xác nhận</Text>
      </View>
      <View style={cardStyles.safeStationBadge}>
        <Text style={cardStyles.safeStationLine1}>SAFE</Text>
        <Text style={cardStyles.safeStationLine2}>STATION</Text>
      </View>
    </View>

    {/* Location */}
    <View style={cardStyles.apptInfoRow}>
      <View style={cardStyles.apptInfoIcon}>
        <Ionicons name="location-sharp" size={14} color="#EA580C" />
      </View>
      <View style={cardStyles.apptInfoContent}>
        <Text style={cardStyles.apptInfoLabel}>Địa điểm bàn giao</Text>
        <Text style={cardStyles.apptInfoValue}>Bàn test điện số 04 - Sảnh Tòa Alpha{'\n'}(Hola)</Text>
      </View>
    </View>

    {/* Time */}
    <View style={cardStyles.apptInfoRow}>
      <View style={cardStyles.apptInfoIcon}>
        <Ionicons name="time" size={14} color="#1D4ED8" />
      </View>
      <View style={cardStyles.apptInfoContent}>
        <Text style={cardStyles.apptInfoLabel}>Thời gian hẹn</Text>
        <Text style={cardStyles.apptInfoValue}>16:30 Hôm nay (Sau ca 4)</Text>
      </View>
    </View>

    {/* Map Thumbnail */}
    <View style={cardStyles.mapThumb}>
      <View style={cardStyles.mapThumbBg}>
        <MaterialCommunityIcons name="map-marker-radius" size={28} color="#EA580C" />
        <Text style={cardStyles.mapThumbText}>Alpha Building Lobby Station</Text>
      </View>
      <TouchableOpacity
        style={cardStyles.directionsBtn}
        onPress={() => Alert.alert('Chỉ đường', 'Mở Google Maps...')}
      >
        <Ionicons name="navigate" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
        <Text style={cardStyles.directionsBtnText}>Chỉ đường</Text>
      </TouchableOpacity>
    </View>

    {/* OTP Code */}
    <View style={cardStyles.otpSection}>
      <View style={cardStyles.otpLabelRow}>
        <MaterialCommunityIcons name="numeric" size={13} color="#64748B" style={{ marginRight: 4 }} />
        <Text style={cardStyles.otpLabel}>MÃ OTP NHẬN HÀNG</Text>
        <TouchableOpacity
          style={cardStyles.copyBtn}
          onPress={() => Alert.alert('Đã sao chép!', 'Mã OTP 829-411 đã được sao chép')}
        >
          <Ionicons name="copy-outline" size={12} color="#1D4ED8" style={{ marginRight: 4 }} />
          <Text style={cardStyles.copyBtnText}>Sao chép</Text>
        </TouchableOpacity>
      </View>
      <Text style={cardStyles.otpCode}>829 - 411</Text>
      <Text style={cardStyles.otpHint}>Đưa mã cho Nam khi nhận phẩm</Text>
    </View>

    {/* Feature chips */}
    <View style={cardStyles.featureChipsRow}>
      <View style={cardStyles.featureChip}>
        <Ionicons name="flash" size={11} color="#EA580C" style={{ marginRight: 3 }} />
        <Text style={cardStyles.featureChipText}>Sẵn ổ cắm 220V</Text>
      </View>
      <View style={cardStyles.featureChip}>
        <Ionicons name="videocam" size={11} color="#1D4ED8" style={{ marginRight: 3 }} />
        <Text style={cardStyles.featureChipText}>Camera an ninh</Text>
      </View>
      <View style={cardStyles.featureChip}>
        <Ionicons name="shield-checkmark" size={11} color="#059669" style={{ marginRight: 3 }} />
        <Text style={cardStyles.featureChipText}>Bảo vệ sẵn</Text>
      </View>
    </View>
  </View>
);

const cardStyles = StyleSheet.create({
  // Safe Suggestion Card
  safeCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 13,
    marginHorizontal: 14,
    marginVertical: 6,
    gap: 10,
  },
  safeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  safeCardDesc: {
    fontSize: 12,
    color: '#065F46',
    lineHeight: 17,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 11,
  },
  scheduleBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Appointment Card
  apptCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 14,
    marginVertical: 6,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#059669', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  apptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apptCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apptHeaderText: {
    flex: 1,
  },
  apptTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  safeStationBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  safeStationLine1: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    lineHeight: 10,
  },
  safeStationLine2: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    lineHeight: 10,
  },
  apptInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  apptInfoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  apptInfoContent: {
    flex: 1,
  },
  apptInfoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  apptInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  mapThumb: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapThumbBg: {
    height: 70,
    backgroundColor: '#E0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  mapThumbText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    paddingVertical: 8,
  },
  directionsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  otpLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  otpLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  otpCode: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 6,
    textAlign: 'center',
    marginVertical: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  otpHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  featureChipsRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main ChatScreen
// ─────────────────────────────────────────────────────────────────────────────
interface ChatScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onGoBack, onTabChange }) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [activeNavTab] = useState('chat');

  const handleSchedule = () => {
    Alert.alert(
      '📅 Tạo lịch hẹn',
      'Xác nhận tạo cuộc hẹn Safe-Handoff tại Sảnh Toa Alpha lúc 16:30 hôm nay?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () =>
            Alert.alert('✅ Đã tạo lịch hẹn!', 'Cả hai bên đã nhận mã OTP giao dịch. Gặp nhau tại Safe-Point lúc 16:30!'),
        },
      ]
    );
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      type: 'text',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = (msg: Message) => {
    switch (msg.type) {
      case 'date_separator':
        return (
          <View key={msg.id} style={msgStyles.dateSep}>
            <View style={msgStyles.dateLine} />
            <Text style={msgStyles.dateSepText}>{msg.text}</Text>
            <View style={msgStyles.dateLine} />
          </View>
        );

      case 'text':
        return (
          <View key={msg.id} style={msgStyles.sentRow}>
            <View style={msgStyles.sentBubble}>
              <Text style={msgStyles.sentText}>{msg.text}</Text>
            </View>
            <View style={msgStyles.sentMeta}>
              <Text style={msgStyles.timeText}>{msg.time}</Text>
              {msg.isRead && (
                <Ionicons name="checkmark-done" size={13} color="#1D4ED8" style={{ marginLeft: 3 }} />
              )}
            </View>
          </View>
        );

      case 'text_received':
        return (
          <View key={msg.id} style={msgStyles.receivedRow}>
            {/* Mini avatar */}
            <View style={msgStyles.receivedAvatar}>
              <Ionicons name="person" size={12} color="#FFFFFF" />
            </View>
            <View>
              <View style={msgStyles.receivedBubble}>
                <Text style={msgStyles.receivedText}>{msg.text}</Text>
              </View>
              <Text style={[msgStyles.timeText, { marginLeft: 4, marginTop: 3 }]}>{msg.time}</Text>
            </View>
          </View>
        );

      case 'safe_suggestion':
        return <SafeSuggestionCard key={msg.id} onSchedule={handleSchedule} />;

      case 'appointment_confirmed':
        return <AppointmentCard key={msg.id} />;

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* ═══════════════════════════════════════════════════════════
          1. PRODUCT BANNER (top)
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.productBanner}>
        <Image
          source={require('../../assets/products/keyboard-akko.jpg')}
          style={styles.bannerThumb}
          contentFit="cover"
        />
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle} numberOfLines={1}>Bàn phím cơ Akko 3087 v2</Text>
          <View style={styles.bannerRow2}>
            <Text style={styles.bannerPrice}>650.000đ</Text>
            <View style={styles.negotiatingBadge}>
              <Text style={styles.negotiatingText}>Đang thương lượng</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewListingBtn}
          activeOpacity={0.85}
          onPress={() => onTabChange && onTabChange('product_detail')}
        >
          <Text style={styles.viewListingText}>Xem tin</Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          2. CHAT HEADER
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.peerAvatarWrapper}>
          <View style={styles.peerAvatar}>
            <Ionicons name="person" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.onlineDot} />
        </View>

        {/* Name & Status */}
        <View style={styles.peerInfoBox}>
          <View style={styles.peerNameRow}>
            <Text style={styles.peerName}>Vũ Hải Nam</Text>
            <View style={styles.peerBadge}>
              <Text style={styles.peerBadgeText}>K18 AI</Text>
            </View>
          </View>
          <View style={styles.peerStatusRow}>
            <View style={styles.onlineGreenDot} />
            <Text style={styles.peerStatus}>Đang online tại Thư viện Gamma</Text>
          </View>
        </View>

        {/* Right actions */}
        <View style={styles.chatHeaderActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => Alert.alert('Gọi điện', 'Gọi điện cho Vũ Hải Nam...')}
          >
            <Ionicons name="call-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          3. MESSAGES LIST
      ═══════════════════════════════════════════════════════════ */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map(renderMessage)}
          <View style={{ height: 8 }} />
        </ScrollView>

        {/* ═══════════════════════════════════════════════════════════
            4. BOTTOM INPUT BAR
        ═══════════════════════════════════════════════════════════ */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {/* Quick action chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            <TouchableOpacity
              style={styles.quickActionChip}
              onPress={() => Alert.alert('Chia sẻ vị trí', 'Gửi vị trí sảnh Alpha cho người mua')}
            >
              <Ionicons name="location-outline" size={12} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={styles.quickActionText}>Chia sẻ vị trí sảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionChip}
              onPress={() => Alert.alert('Gửi ảnh', 'Chụp hoặc gửi ảnh bàn phím')}
            >
              <Ionicons name="camera-outline" size={12} color="#1D4ED8" style={{ marginRight: 4 }} />
              <Text style={styles.quickActionText}>Gửi ảnh bàn phím</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionChip}
              onPress={() => Alert.alert('Đổi giá', 'Đề xuất mức giá mới')}
            >
              <MaterialCommunityIcons name="swap-horizontal" size={13} color="#7C3AED" style={{ marginRight: 4 }} />
              <Text style={styles.quickActionText}>Đổi gi...</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Input row */}
          <View style={styles.inputRow}>
            {/* Attach button */}
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={() => Alert.alert('Đính kèm', 'Gửi ảnh, file, hoặc vị trí')}
            >
              <Ionicons name="add" size={22} color="#64748B" />
            </TouchableOpacity>

            {/* Text Input */}
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.chatInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Nhắn tin cho Hải Nam..."
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={styles.voiceBtn}
                onPress={() => Alert.alert('Ghi âm', 'Nhấn giữ để ghi âm...')}
              >
                <Ionicons name="mic-outline" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Send button */}
            <TouchableOpacity
              style={[styles.sendBtn, inputText.trim() && styles.sendBtnActive]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ═══════════════════════════════════════════════════════════
          5. BOTTOM NAVIGATION
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity style={styles.navTab} onPress={() => onTabChange && onTabChange('home')}>
          <Ionicons name="home-outline" size={22} color="#64748B" />
          <Text style={styles.navLabel}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => onTabChange && onTabChange('explore')}>
          <Ionicons name="compass-outline" size={22} color="#64748B" />
          <Text style={styles.navLabel}>Khám phá</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTabCenter} onPress={() => onTabChange && onTabChange('post')}>
          <View style={styles.fabBtn}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.navLabel}>Đăng bán</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} activeOpacity={0.7}>
          <View style={{ position: 'relative' }}>
            <Ionicons name="chatbubble" size={22} color="#EA580C" />
            <View style={styles.msgBadge}>
              <Text style={styles.msgBadgeText}>2</Text>
            </View>
          </View>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Tin nhắn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => onTabChange && onTabChange('profile')}>
          <Ionicons name="person-outline" size={22} color="#64748B" />
          <Text style={styles.navLabel}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const msgStyles = StyleSheet.create({
  dateSep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dateSepText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  sentRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  sentBubble: {
    backgroundColor: '#EA580C',
    borderRadius: 18,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: SCREEN_W * 0.72,
  },
  sentText: {
    fontSize: 13.5,
    color: '#FFFFFF',
    lineHeight: 19,
  },
  sentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  receivedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 8,
  },
  receivedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  receivedBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: SCREEN_W * 0.72,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  receivedText: {
    fontSize: 13.5,
    color: '#0F172A',
    lineHeight: 19,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Product Banner
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  bannerThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  bannerInfo: {
    flex: 1,
    gap: 3,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  bannerRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
  },
  negotiatingBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  negotiatingText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D97706',
  },
  viewListingBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewListingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  // Chat Header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  peerAvatarWrapper: {
    position: 'relative',
  },
  peerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  peerInfoBox: {
    flex: 1,
  },
  peerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 3,
  },
  peerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  peerBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  peerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
  },
  peerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  peerStatus: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: 2,
  },
  headerActionBtn: {
    padding: 6,
  },

  // Message List
  messageList: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messageListContent: {
    paddingTop: 6,
    paddingBottom: 10,
  },

  // Input Area
  inputArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 5 },
      android: { elevation: 5 },
    }),
  },
  quickActionsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 4,
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    gap: 6,
  },
  chatInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 80,
    paddingTop: 0,
    paddingBottom: 0,
  },
  voiceBtn: {
    padding: 2,
    marginBottom: 1,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  sendBtnActive: {
    backgroundColor: '#EA580C',
    ...Platform.select({
      ios: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },

  // Bottom Nav
  bottomNav: {
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
