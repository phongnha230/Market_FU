import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

interface MessageItem {
  id: string;
  sender: 'me' | 'partner';
  type: 'text' | 'offer' | 'safepoint';
  text?: string;
  time: string;
  offerData?: {
    originalPrice: number;
    offeredPrice: number;
    status: 'pending' | 'accepted' | 'declined';
  };
  safePointData?: {
    location: string;
    timeSlot: string;
  };
}

export const ChatDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const flatListRef = useRef<FlatList>(null);

  const partner = route.params?.partner || {
    id: 'u-nam',
    name: 'Hoàng Anh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cohort: 'K16 SE - Hola',
    isOnline: true,
  };

  const product = route.params?.product || {
    id: 'p1',
    title: 'Bàn phím cơ Akko 3087 v2 Silent',
    price: '480.000đ',
    image: require('../../../../assets/products/keyboard-akko.jpg'),
  };

  const initialOffer = route.params?.initialOffer;

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      sender: 'partner',
      type: 'text',
      text: 'Chào bạn! Mình có thể hỗ trợ bạn xem món đồ này nhé.',
      time: '14:20',
    },
    {
      id: 'm2',
      sender: 'partner',
      type: 'safepoint',
      time: '14:21',
      safePointData: {
        location: 'Trạm Safe-Point Sảnh Tòa Alpha (Camera 24/7)',
        timeSlot: 'Hôm nay: 16:30 - 17:30',
      },
    },
  ]);

  // If navigated with initial offer from MakeOfferModal
  useEffect(() => {
    if (initialOffer) {
      const offerMsg: MessageItem = {
        id: 'offer-' + Date.now(),
        sender: 'me',
        type: 'offer',
        text: initialOffer.message,
        time: 'Vừa xong',
        offerData: {
          originalPrice: initialOffer.originalPrice || 480000,
          offeredPrice: initialOffer.offeredPrice || 430000,
          status: 'pending',
        },
      };
      setMessages((prev) => [...prev, offerMsg]);
    }
  }, [initialOffer]);

  const quickReplies = [
    'Sản phẩm còn không bạn?',
    'Có fix thêm một chút không ạ?',
    'Hẹn sảnh Alpha lúc mấy giờ?',
    'Đã tới trạm Safe-point rồi nhé!',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: MessageItem = {
      id: 'm-' + Date.now(),
      sender: 'me',
      type: 'text',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate auto reply from seller
    setTimeout(() => {
      const replyMsg: MessageItem = {
        id: 'reply-' + Date.now(),
        sender: 'partner',
        type: 'text',
        text: 'Oke bạn nha! Mình đồng ý hẹn nhau tại trạm Safe-point có camera để bạn test đồ kỹ càng nhé.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1000);
  };

  const handleAcceptOffer = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.offerData
          ? { ...m, offerData: { ...m.offerData, status: 'accepted' } }
          : m
      )
    );
    Alert.alert('Thành công', 'Bạn đã chấp nhận đề xuất giá này!');
  };

  const renderMessageItem = ({ item }: { item: MessageItem }) => {
    const isMe = item.sender === 'me';

    if (item.type === 'offer' && item.offerData) {
      return (
        <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
          <View style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <Ionicons name="pricetag" size={16} color="#EA580C" />
              <Text style={styles.offerHeaderTitle}>Đề xuất giá đặc biệt</Text>
            </View>
            <View style={styles.offerBody}>
              <Text style={styles.offerOriginalPrice}>
                Giá gốc: {item.offerData.originalPrice.toLocaleString('vi-VN')}đ
              </Text>
              <Text style={styles.offerNewPrice}>
                Đề xuất: {item.offerData.offeredPrice.toLocaleString('vi-VN')}đ
              </Text>
              {item.text && <Text style={styles.offerNote}>"{item.text}"</Text>}
            </View>
            <View style={styles.offerFooter}>
              {item.offerData.status === 'accepted' ? (
                <View style={styles.acceptedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.acceptedText}>Đã chấp nhận mức giá này</Text>
                </View>
              ) : isMe ? (
                <Text style={styles.offerWaitingText}>⏳ Đang chờ người bán phản hồi...</Text>
              ) : (
                <View style={styles.offerActionsRow}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptOffer(item.id)}
                  >
                    <Text style={styles.acceptBtnText}>Đồng ý giá này</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Text style={styles.msgTime}>{item.time}</Text>
          </View>
        </View>
      );
    }

    if (item.type === 'safepoint' && item.safePointData) {
      return (
        <View style={[styles.msgWrapper, styles.theirMsgWrapper]}>
          <View style={styles.safepointCard}>
            <View style={styles.safepointHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text style={styles.safepointTitle}>Ghim điểm hẹn an toàn</Text>
            </View>
            <Text style={styles.safepointLoc}>{item.safePointData.location}</Text>
            <Text style={styles.safepointTime}>{item.safePointData.timeSlot}</Text>
            <Text style={styles.msgTime}>{item.time}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.bubbleText, isMe ? styles.myBubbleText : styles.theirBubbleText]}>
            {item.text}
          </Text>
          <Text style={[styles.bubbleTime, isMe ? styles.myBubbleTime : styles.theirBubbleTime]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
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
              navigation.navigate('MainTabs', { screen: 'Chat' });
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.headerAvatarWrapper}>
            <Image
              source={{ uri: partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
              style={styles.headerAvatar}
            />
            {partner.isOnline && <View style={styles.headerOnlineDot} />}
          </View>
          <View>
            <Text style={styles.headerName}>{partner.name}</Text>
            <Text style={styles.headerSub}>{partner.cohort || 'K16 - FPT Hola'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="home-outline" size={19} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Alert.alert('Gọi thoại', `Kết nối cuộc gọi bảo mật với ${partner.name}`)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="call-outline" size={19} color="#EA580C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pinned Product Strip */}
      <View style={styles.productStrip}>
        <Image
          source={typeof product.image === 'string' ? { uri: product.image } : product.image}
          style={styles.productStripThumb}
        />
        <View style={styles.productStripInfo}>
          <Text style={styles.productStripTitle} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.productStripPrice}>{product.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewProductBtn}
          onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        >
          <Text style={styles.viewProductBtnText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Quick Replies Bar */}
        <View style={styles.quickRepliesBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={quickReplies}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleSendMessage(item)}
              >
                <Text style={styles.quickChipText}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          />
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => Alert.alert('Gửi ảnh', 'Chọn ảnh chụp thực tế sản phẩm từ thiết bị')}
          >
            <Ionicons name="camera-outline" size={22} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => Alert.alert('Gửi vị trí', 'Chia sẻ vị trí trạm Safe-point gần bạn')}
          >
            <Ionicons name="location-outline" size={22} color="#64748B" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim()}
            onPress={() => handleSendMessage()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatarWrapper: { position: 'relative', marginRight: 10 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E2E8F0' },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerName: { fontSize: 14.5, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#059669', fontWeight: '600' },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  productStripThumb: { width: 38, height: 38, borderRadius: 8, marginRight: 10 },
  productStripInfo: { flex: 1 },
  productStripTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  productStripPrice: { fontSize: 12, fontWeight: '900', color: '#EA580C', marginTop: 1 },
  viewProductBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewProductBtnText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 14 },
  msgWrapper: { marginVertical: 4, maxWidth: '82%' },
  myMsgWrapper: { alignSelf: 'flex-end' },
  theirMsgWrapper: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  myBubble: { backgroundColor: '#EA580C', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 13.5, lineHeight: 19 },
  myBubbleText: { color: '#FFFFFF' },
  theirBubbleText: { color: '#0F172A' },
  bubbleTime: { fontSize: 9.5, alignSelf: 'flex-end', marginTop: 4 },
  myBubbleTime: { color: 'rgba(255, 255, 255, 0.75)' },
  theirBubbleTime: { color: '#94A3B8' },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  offerHeaderTitle: { fontSize: 12, fontWeight: '800', color: '#EA580C' },
  offerBody: { backgroundColor: '#FFF7ED', borderRadius: 8, padding: 8, marginBottom: 8 },
  offerOriginalPrice: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' },
  offerNewPrice: { fontSize: 16, fontWeight: '900', color: '#EA580C', marginTop: 1 },
  offerNote: { fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 4 },
  offerFooter: { marginTop: 4 },
  acceptedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  acceptedText: { fontSize: 11.5, fontWeight: '700', color: '#059669' },
  offerWaitingText: { fontSize: 11, color: '#D97706', fontStyle: 'italic' },
  offerActionsRow: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  acceptBtnText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' },
  safepointCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 12,
  },
  safepointHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  safepointTitle: { fontSize: 12, fontWeight: '800', color: '#065F46' },
  safepointLoc: { fontSize: 12.5, fontWeight: '700', color: '#047857' },
  safepointTime: { fontSize: 11, color: '#059669', marginTop: 2 },
  msgTime: { fontSize: 9.5, color: '#94A3B8', alignSelf: 'flex-end', marginTop: 4 },
  quickRepliesBar: { backgroundColor: '#FFFFFF', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  quickChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChipText: { fontSize: 11.5, color: '#475569', fontWeight: '600' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  attachBtn: { padding: 6, marginRight: 4 },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 13,
    color: '#0F172A',
    maxHeight: 80,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#CBD5E1' },
});

export default ChatDetailScreen;
