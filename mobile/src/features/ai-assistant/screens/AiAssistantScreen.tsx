import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useAuthStore } from '../../../stores/useAuthStore';

interface SuggestedProductItem {
  id: string;
  domTag: string;
  conditionBadge: string;
  trustScore: string;
  title: string;
  sellerInfo: string;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  image: any;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text?: string;
  time: string;
  campusHeader?: string;
  suggestedProducts?: SuggestedProductItem[];
  safetyTip?: {
    title: string;
    desc: string;
    safePoint: string;
  };
  actionChips?: Array<{ id: string; label: string; icon: string; color: string }>;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: 'Chào Quân! Tôi là trợ lý chuyên sâu FPT 5Campus Marketplace. Tôi có thể hỗ trợ bạn thẩm định giá đồ dùng học tập, đối soát tài khoản MSSV chính quy, hoặc kết nối giao dịch trực tiếp ngay tại ký túc xá. Bạn cần hỗ trợ gì hôm nay?',
    time: '09:41',
  },
  {
    id: 'm2',
    sender: 'user',
    text: 'Mình muốn mua lại màn hình máy tính để làm đồ án OJT tại KTX Hola, bạn gợi ý mẫu nào bền mà tầm 1.5tr không?',
    time: '09:42',
  },
  {
    id: 'm3',
    sender: 'ai',
    time: '09:42',
    campusHeader: 'KHUYẾN NGHỊ THEO CAMPUS HÒA LẠC',
    text: 'Với ngân sách 1.500.000 đ tại Hola, hiện có 2 sinh viên K16 vừa kết thúc kỳ Capstone OJT đang thanh lý màn hình tình trạng tốt, hỗ trợ bạn test tận phòng:',
    suggestedProducts: [
      {
        id: 'p_dell',
        domTag: 'Hola Dom D',
        conditionBadge: 'Like New 98%',
        trustScore: '98/100',
        title: 'Dell 24" SE2422H Full HD 75Hz',
        sellerInfo: 'SV K16 SE • Bảo hành hãng 6T',
        price: '1.450.000 đ',
        originalPrice: '1.700.000 đ',
        image: require('../../../../assets/products/monitor-dell-24.jpg'),
      },
      {
        id: 'p_lg',
        domTag: 'Hola Dom A',
        conditionBadge: 'Tốt • IPS',
        trustScore: '0 Điểm chết',
        title: 'LG 24MK430H IPS 24 inch',
        sellerInfo: 'SV K17 Graphic Design • Tặng kèm cáp HDMI',
        price: '1.300.000 đ',
        discountBadge: 'Rẻ hơn 35%',
        image: require('../../../../assets/products/monitor-dell-24.jpg'),
      },
    ],
    safetyTip: {
      title: 'Mẹo an toàn giao dịch tại Hola',
      safePoint: 'Bàn Test Kỹ thuật Sảnh Alpha',
      desc: 'Bạn nên hẹn người bán tại Bàn Test Kỹ thuật Sảnh Alpha. Khu vực này được trang bị sẵn ổ cắm điện 220V và cáp chuyển HDMI/Type-C để test cổng hiển thị trước khi chuyển khoản.',
    },
    actionChips: [
      { id: 'compare', label: 'So sánh thông số 2 màn', icon: 'sparkles', color: '#2563EB' },
      { id: 'location', label: 'Xem vị trí Sảnh Alpha', icon: 'map', color: '#059669' },
    ],
  },
];

const QUICK_PROMPTS = [
  '📚 Định giá giáo trình PRF192 cũ?',
  '🛡️ Check uy tín MSSV người bán',
  '⚡ Tìm điểm cắm sạc test đồ điện tử',
];

export const AiAssistantScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentCampus } = useCampusStore();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputText.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        time: 'Vừa xong',
        campusHeader: `PHÂN TÍCH TỰ ĐỘNG - ${currentCampus}`,
        text: `Tôi đã quét dữ liệu nội bộ tại campus ${currentCampus} cho yêu cầu "${textToSend}". Tất cả bài đăng đều được đối soát MSSV FPT chính quy và có hỗ trợ bảo hộ quỹ Escrow.`,
        actionChips: [
          { id: 'safe_point', label: 'Hẹn Safe-Point', icon: 'location', color: '#EA580C' },
          { id: 'escrow', label: 'Tạm giữ tiền Escrow', icon: 'shield-checkmark', color: '#059669' },
        ],
      };
      setMessages((prev) => [...prev, aiReply]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 800);
  };

  const handleProductDetail = (item: SuggestedProductItem) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ProductDetail', { productId: item.id });
    }
  };

  const handleContactSeller = (item: SuggestedProductItem) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ContextualChatAuth', {
        product: {
          title: item.title,
          price: item.price,
          location: item.domTag,
          image: item.image,
        },
        sellerName: 'Nguyễn Văn An',
        sellerCohort: 'K16 SE',
      });
    }
  };

  const handleActionChip = (chipId: string) => {
    if (chipId === 'compare') {
      Alert.alert(
        '📊 So sánh màn hình',
        '• Dell SE2422H: Tần số quét 75Hz, tấm nền VA độ tương phản sâu, chân đế chắc chắn, phù hợp code & xem phim.\n\n• LG 24MK430H: Tấm nền IPS màu sắc chuẩn đồ họa, góc nhìn rộng 178°, phù hợp thiết kế & đa nhiệm.'
      );
    } else if (chipId === 'location') {
      Alert.alert(
        '📍 Bàn Test Sảnh Alpha',
        'Vị trí: Ngay sảnh chính tòa Alpha (cạnh bảo vệ).\nTrang bị: Bàn test có 4 ổ điện 220V, cổng HDMI/Type-C, camera an ninh 360° hỗ trợ ghi nhận tình trạng bàn giao máy.'
      );
    } else {
      Alert.alert('Trợ lý AI', 'Đã lưu yêu cầu của bạn.');
    }
  };

  const handleResetChat = () => {
    Alert.alert(
      '🔄 Làm mới hội thoại',
      'Bạn có muốn xóa lịch sử cuộc trò chuyện hiện tại để bắt đầu phiên mới không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Làm mới',
          onPress: () => {
            setMessages([INITIAL_MESSAGES[0]]);
          },
        },
      ]
    );
  };

  const handleScanVision = () => {
    Alert.alert(
      '📷 Quét định giá bằng AI Vision',
      'Tính năng quét ảnh món đồ bằng Gemini Vision: Tự động nhận diện tình trạng máy, tra cứu giá đồ cũ quanh KTX và soạn sẵn bài đăng trong 3 giây!'
    );
  };

  const { isAuthenticated } = useAuthStore();

  const handleBack = () => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, styles.fallbackCenter, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.fallbackCard}>
          <View style={styles.fallbackIconCircle}>
            <Ionicons name="sparkles" size={40} color="#EA580C" />
          </View>
          <Text style={styles.fallbackTitle}>Trợ lý AI FPT 5Campus</Text>
          <Text style={styles.fallbackSubtitle}>
            Bạn đang ở chế độ xem hàng (Khách). Vui lòng đăng nhập tài khoản Sinh viên FPT để trò chuyện với Trợ lý AI, định giá sản phẩm và tìm bạn cùng KTX.
          </Text>
          <TouchableOpacity
            style={styles.fallbackBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.fallbackBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fallbackBackBtn} onPress={handleBack}>
            <Text style={styles.fallbackBackText}>Quay lại trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* ═══════════════════════════════════════════════════════════
          1. TOP STATUS BAR: Campus Location + Bell + Avatar
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.topNavBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={styles.bellBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              if (navigation && navigation.canGoBack()) {
                navigation.goBack();
              } else if (navigation) {
                navigation.navigate('MainTabs', { screen: 'Home' });
              }
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.campusLocationChip} activeOpacity={0.8}>
            <Ionicons name="location-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
            <Text style={styles.campusLocationText}>FPT {currentCampus || 'Hòa Lạc'}</Text>
            <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.topRightIcons}>
          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (navigation) {
                navigation.navigate('MainTabs', { screen: 'Home' });
              }
            }}
          >
            <Ionicons name="home-outline" size={20} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (navigation && navigation.navigate) {
                navigation.navigate('Notification');
              }
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userAvatarBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (navigation && navigation.navigate) {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            }}
          >
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          2. AI ASSISTANT HEADER: Avatar + Name + Sync + Tools
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.aiHeaderBar}>
        <View style={styles.aiProfileRow}>
          <View style={styles.aiAvatarWrapper}>
            <MaterialCommunityIcons name="robot" size={22} color="#EA580C" />
            <View style={styles.aiPulseGreenDot} />
          </View>

          <View style={styles.aiNameCol}>
            <View style={styles.aiTitleTagRow}>
              <Text style={styles.aiTitle}>Trợ lý AI Campus</Text>
              <View style={styles.gptBadge}>
                <Text style={styles.gptBadgeText}>GPT-4o</Text>
              </View>
            </View>
            <Text style={styles.aiStatusSub}>🟢 Online 24/7 • 5Campus Sync</Text>
          </View>
        </View>

        <View style={styles.aiToolBtns}>
          <TouchableOpacity style={styles.toolIconBtn} activeOpacity={0.7} onPress={handleResetChat}>
            <Ionicons name="reload" size={18} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolIconBtn}
            activeOpacity={0.7}
            onPress={() => Alert.alert('🎛️ Bộ lọc thông minh', 'Tùy chỉnh phạm vi tìm kiếm theo tòa KTX, mức giá tối đa và xếp hạng uy tín sinh viên.')}
          >
            <Ionicons name="options-outline" size={18} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          3. QUICK PROMPT CHIPS
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.quickPromptsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsScroll}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickPromptChip}
              activeOpacity={0.75}
              onPress={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          4. CHAT STREAM MESSAGES
      ═══════════════════════════════════════════════════════════ */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Timestamp Header */}
          <View style={styles.timestampContainer}>
            <View style={styles.timestampPill}>
              <Text style={styles.timestampText}>Hôm nay • FPT Hòa Lạc Hub</Text>
            </View>
          </View>

          {/* Messages */}
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';

            if (!isAi) {
              // User message bubble
              return (
                <View key={msg.id} style={styles.userMsgWrapper}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{msg.text}</Text>
                  </View>
                  <View style={styles.userTimeRow}>
                    <Text style={styles.timeText}>{msg.time}</Text>
                    <Ionicons name="checkmark-done" size={14} color="#10B981" style={{ marginLeft: 3 }} />
                  </View>
                </View>
              );
            }

            // AI message bubble
            return (
              <View key={msg.id} style={styles.aiMsgRow}>
                {/* AI Avatar */}
                <View style={styles.aiSenderAvatar}>
                  <Ionicons name="globe-outline" size={14} color="#FFFFFF" />
                </View>

                {/* AI Bubble Content */}
                <View style={styles.aiBubbleCol}>
                  <View style={styles.aiBubble}>
                    {/* Optional Campus Highlight Header */}
                    {msg.campusHeader && (
                      <View style={styles.campusRecommendHeader}>
                        <Ionicons name="shield-checkmark" size={13} color="#EA580C" style={{ marginRight: 4 }} />
                        <Text style={styles.campusRecommendHeaderText}>{msg.campusHeader}</Text>
                      </View>
                    )}

                    {/* AI Main Text */}
                    {msg.text && (
                      <Text style={styles.aiBubbleText}>
                        {msg.id === 'm1' ? (
                          <>
                            Chào <Text style={styles.boldOrangeText}>{user?.name || 'Quân'}</Text>! Tôi là trợ lý chuyên sâu FPT 5Campus Marketplace. Tôi có thể hỗ trợ bạn thẩm định giá đồ dùng học tập, đối soát tài khoản MSSV chính quy, hoặc kết nối giao dịch trực tiếp ngay tại ký túc xá. Bạn cần hỗ trợ gì hôm nay?
                          </>
                        ) : (
                          msg.text
                        )}
                      </Text>
                    )}

                    {/* Suggested Products List inside AI Bubble */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <View style={styles.suggestedProductsContainer}>
                        {msg.suggestedProducts.map((p) => (
                          <View key={p.id} style={styles.productCard}>
                            <View style={styles.productCardTop}>
                              {/* Product Thumbnail */}
                              <View style={styles.prodThumbBox}>
                                <Image source={p.image} style={styles.prodThumbImg} contentFit="cover" />
                                <View style={styles.domBadge}>
                                  <Text style={styles.domBadgeText}>{p.domTag}</Text>
                                </View>
                              </View>

                              {/* Product Details */}
                              <View style={styles.prodDetailsCol}>
                                <View style={styles.prodBadgesRow}>
                                  <View style={styles.conditionBadge}>
                                    <Text style={styles.conditionBadgeText}>{p.conditionBadge}</Text>
                                  </View>
                                  <View style={styles.trustBadge}>
                                    <Ionicons name="shield-checkmark" size={10} color="#059669" style={{ marginRight: 2 }} />
                                    <Text style={styles.trustBadgeText}>{p.trustScore}</Text>
                                  </View>
                                </View>

                                <Text style={styles.prodTitle} numberOfLines={1}>
                                  {p.title}
                                </Text>

                                <Text style={styles.prodSellerSub} numberOfLines={1}>
                                  {p.sellerInfo}
                                </Text>

                                <View style={styles.prodPriceRow}>
                                  <Text style={styles.prodPrice}>{p.price}</Text>
                                  {p.originalPrice && (
                                    <Text style={styles.prodOriginalPrice}>{p.originalPrice}</Text>
                                  )}
                                  {p.discountBadge && (
                                    <View style={styles.discountBadge}>
                                      <Text style={styles.discountBadgeText}>{p.discountBadge}</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>

                            {/* Card Actions: Chi tiết & Nhắn bạn bán */}
                            <View style={styles.prodActionButtonsRow}>
                              <TouchableOpacity
                                style={styles.detailBtn}
                                activeOpacity={0.8}
                                onPress={() => handleProductDetail(p)}
                              >
                                <Ionicons name="information-circle-outline" size={14} color="#1E40AF" style={{ marginRight: 4 }} />
                                <Text style={styles.detailBtnText}>Chi tiết đồ</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.chatSellerBtn}
                                activeOpacity={0.88}
                                onPress={() => handleContactSeller(p)}
                              >
                                <Ionicons name="chatbubble-ellipses" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                                <Text style={styles.chatSellerBtnText}>Nhắn bạn bán</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Safety Tip Card */}
                    {msg.safetyTip && (
                      <View style={styles.safetyTipCard}>
                        <View style={styles.safetyTipHeader}>
                          <Ionicons name="shield-checkmark-outline" size={14} color="#EA580C" style={{ marginRight: 5 }} />
                          <Text style={styles.safetyTipTitle}>{msg.safetyTip.title}</Text>
                        </View>
                        <Text style={styles.safetyTipDesc}>
                          Bạn nên hẹn người bán tại <Text style={styles.boldText}>{msg.safetyTip.safePoint}</Text>. Khu vực này được trang bị sẵn ổ cắm điện 220V và cáp chuyển HDMI/Type-C để test cổng hiển thị trước khi chuyển khoản.
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Chips beneath AI reply */}
                  {msg.actionChips && (
                    <View style={styles.actionChipsRow}>
                      {msg.actionChips.map((chip) => (
                        <TouchableOpacity
                          key={chip.id}
                          style={styles.actionChipBtn}
                          activeOpacity={0.75}
                          onPress={() => handleActionChip(chip.id)}
                        >
                          <Ionicons name={chip.icon as any} size={13} color={chip.color} style={{ marginRight: 4 }} />
                          <Text style={[styles.actionChipText, { color: chip.color }]}>{chip.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* AI Time Text */}
                  <Text style={styles.aiTimeText}>{msg.time} • AI Bot Campus</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ═══════════════════════════════════════════════════════════
            5. BOTTOM INPUT BAR
        ═══════════════════════════════════════════════════════════ */}
        <View style={[styles.inputBarWrapper, { paddingBottom: Math.max(insets.bottom, 12) + 60 }]}>
          <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.75} onPress={handleScanVision}>
            <Ionicons name="camera-outline" size={21} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Hỏi giá sách, check MSSV, đồ..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.micBtn}
              activeOpacity={0.7}
              onPress={() => Alert.alert('🎙️ Nhập bằng giọng nói', 'Đang lắng nghe... Hãy nói tên món đồ bạn muốn tìm.')}
            >
              <Ionicons name="mic-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            activeOpacity={0.88}
            onPress={() => handleSendMessage()}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AiAssistantScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // 1. Top Nav Bar
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  campusLocationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  campusLocationText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 5,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  userAvatarBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9A3412',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. AI Header Bar
  aiHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  aiProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiPulseGreenDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  aiNameCol: {
    justifyContent: 'center',
  },
  aiTitleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  gptBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  gptBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  aiStatusSub: {
    fontSize: 10.5,
    color: '#059669',
    marginTop: 1,
    fontWeight: '600',
  },
  aiToolBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. Quick Prompts
  quickPromptsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickPromptText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E40AF',
  },

  // 4. Chat Area
  chatArea: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  timestampContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timestampPill: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timestampText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },

  // User Message
  userMsgWrapper: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '82%',
    backgroundColor: '#EA580C',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userBubbleText: {
    fontSize: 13.5,
    color: '#FFFFFF',
    lineHeight: 19,
    fontWeight: '600',
  },
  userTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginRight: 4,
  },
  timeText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },

  // AI Message
  aiMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 8,
  },
  aiSenderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexShrink: 0,
  },
  aiBubbleCol: {
    flex: 1,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  campusRecommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  campusRecommendHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.2,
  },
  aiBubbleText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 19,
    marginBottom: 8,
  },
  boldOrangeText: {
    color: '#EA580C',
    fontWeight: '800',
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },

  // Suggested Products List
  suggestedProductsContainer: {
    gap: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  productCardTop: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  prodThumbBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  prodThumbImg: {
    width: '100%',
    height: '100%',
  },
  domBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  domBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  prodDetailsCol: {
    flex: 1,
  },
  prodBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  conditionBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trustBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  prodTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  prodSellerSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 4,
  },
  prodPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prodPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#EA580C',
  },
  prodOriginalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
  },
  prodActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  detailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 7,
  },
  detailBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  chatSellerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 7,
  },
  chatSellerBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Safety Tip Card
  safetyTipCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  safetyTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  safetyTipTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  safetyTipDesc: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },

  // Action Chips beneath AI reply
  actionChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  actionChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  aiTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    marginLeft: 4,
  },

  // 5. Bottom Input Bar
  inputBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  cameraBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  micBtn: {
    paddingLeft: 4,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#FED7AA',
  },
  fallbackCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
  },
  fallbackCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fallbackIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  fallbackBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackBackBtn: {
    paddingVertical: 8,
  },
  fallbackBackText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
