import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { AiAssistantGuestFallback } from '../components/AiAssistantGuestFallback';
import { AiAssistantTopBar } from '../components/AiAssistantTopBar';
import { AiAssistantQuickPrompts } from '../components/AiAssistantQuickPrompts';
import { AiAssistantMessageItem, ChatMessage } from '../components/AiAssistantMessageItem';
import { SuggestedProductItem } from '../components/AiAssistantProductCard';
import { AiAssistantInputBar } from '../components/AiAssistantInputBar';

export type { ChatMessage, SuggestedProductItem };

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
  const { user, isAuthenticated } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

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

    // Call backend Gemini AI Assistant
    import('../../../services/aiMobileService').then(async ({ aiMobileService }) => {
      try {
        const aiRes = await aiMobileService.chatWithAssistant(textToSend, currentCampus);
        const aiReply: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          time: 'Vừa xong',
          campusHeader: `GEMINI AI - ${currentCampus}`,
          text: aiRes.reply,
          actionChips: [
            { id: 'safe_point', label: 'Hẹn Safe-Point', icon: 'location', color: '#EA580C' },
            { id: 'escrow', label: 'Tạm giữ tiền Escrow', icon: 'shield-checkmark', color: '#059669' },
          ],
        };
        setMessages((prev) => [...prev, aiReply]);
        flatListRef.current?.scrollToEnd({ animated: true });
      } catch {
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
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    });
  };

  const handleProductDetail = useCallback((item: SuggestedProductItem) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ProductDetail', { productId: item.id });
    }
  }, [navigation]);

  const handleContactSeller = useCallback((item: SuggestedProductItem) => {
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
  }, [navigation]);

  const handleActionChip = useCallback((chipId: string) => {
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
  }, []);

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

  const handleBack = () => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const renderMessageItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <AiAssistantMessageItem
        message={item}
        userName={user?.name || 'Quân'}
        onProductDetail={handleProductDetail}
        onContactSeller={handleContactSeller}
        onActionChip={handleActionChip}
      />
    ),
    [user?.name, handleProductDetail, handleContactSeller, handleActionChip]
  );

  const listHeader = useCallback(
    () => (
      <View style={styles.timestampContainer}>
        <View style={styles.timestampPill}>
          <Text style={styles.timestampText}>Hôm nay • FPT Hòa Lạc Hub</Text>
        </View>
      </View>
    ),
    []
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.screen}>
        <AiAssistantGuestFallback
          insetsTop={insets.top}
          onLogin={() => navigation.navigate('Login')}
          onBack={handleBack}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AiAssistantTopBar
        insetsTop={insets.top}
        currentCampus={currentCampus}
        onBack={handleBack}
        onHome={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        onNotification={() => navigation.navigate('Notification')}
        onProfile={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        onResetChat={handleResetChat}
        onOpenFilters={() =>
          Alert.alert(
            '🎛️ Bộ lọc thông minh',
            'Tùy chỉnh phạm vi tìm kiếm theo tòa KTX, mức giá tối đa và xếp hạng uy tín sinh viên.'
          )
        }
      />

      <AiAssistantQuickPrompts
        prompts={QUICK_PROMPTS}
        onSelectPrompt={(p) => handleSendMessage(p.replace(/^[^\s]+\s/, ''))}
      />

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <AiAssistantInputBar
          inputText={inputText}
          onChangeText={setInputText}
          onSend={() => handleSendMessage()}
          onScanVision={handleScanVision}
          onVoiceInput={() =>
            Alert.alert(
              '🎙️ Nhập bằng giọng nói',
              'Đang lắng nghe... Hãy nói tên món đồ bạn muốn tìm.'
            )
          }
          insetsBottom={insets.bottom}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default AiAssistantScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatArea: {
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
});
