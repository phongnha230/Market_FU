import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MessageItem {
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

interface ChatOfferBubbleProps {
  item: MessageItem;
  isMe: boolean;
  onAcceptOffer: (msgId: string) => void;
}

const ChatOfferBubble: React.FC<ChatOfferBubbleProps> = ({ item, isMe, onAcceptOffer }) => {
  const offerData = item.offerData!;
  return (
    <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
      <View style={styles.offerCard}>
        <View style={styles.offerHeader}>
          <Ionicons name="pricetag" size={16} color="#EA580C" />
          <Text style={styles.offerHeaderTitle}>Đề xuất giá đặc biệt</Text>
        </View>
        <View style={styles.offerBody}>
          <Text style={styles.offerOriginalPrice}>
            Giá gốc: {offerData.originalPrice.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.offerNewPrice}>
            Đề xuất: {offerData.offeredPrice.toLocaleString('vi-VN')}đ
          </Text>
          {item.text && <Text style={styles.offerNote}>"{item.text}"</Text>}
        </View>
        <View style={styles.offerFooter}>
          {offerData.status === 'accepted' ? (
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
                onPress={() => onAcceptOffer(item.id)}
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
};

interface ChatSafePointBubbleProps {
  item: MessageItem;
  isMe: boolean;
  onBookSafePoint: (safePointLocation?: string) => void;
}

const ChatSafePointBubble: React.FC<ChatSafePointBubbleProps> = ({ item, isMe, onBookSafePoint }) => {
  const safePointData = item.safePointData!;
  return (
    <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
      <View style={styles.safepointCard}>
        <View style={styles.safepointHeader}>
          <Ionicons name="shield-checkmark" size={16} color="#059669" />
          <Text style={styles.safepointTitle}>Ghim điểm hẹn an toàn</Text>
        </View>
        <Text style={styles.safepointLoc}>{safePointData.location}</Text>
        <Text style={styles.safepointTime}>{safePointData.timeSlot}</Text>
        <TouchableOpacity
          style={styles.safepointBookBtn}
          activeOpacity={0.85}
          onPress={() => onBookSafePoint(safePointData.location)}
        >
          <Ionicons name="calendar-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.safepointBookBtnText}>Chốt hẹn & Đặt lịch Safe-Point</Text>
        </TouchableOpacity>
        <Text style={styles.msgTime}>{item.time}</Text>
      </View>
    </View>
  );
};

interface ChatTextBubbleProps {
  item: MessageItem;
  isMe: boolean;
}

const ChatTextBubble: React.FC<ChatTextBubbleProps> = ({ item, isMe }) => {
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

interface ChatDetailMessageItemProps {
  item: MessageItem;
  onAcceptOffer: (msgId: string) => void;
  onBookSafePoint: (safePointLocation?: string) => void;
}

export const ChatDetailMessageItem: React.FC<ChatDetailMessageItemProps> = ({
  item,
  onAcceptOffer,
  onBookSafePoint,
}) => {
  const isMe = item.sender === 'me';

  if (item.type === 'offer' && item.offerData) {
    return <ChatOfferBubble item={item} isMe={isMe} onAcceptOffer={onAcceptOffer} />;
  }

  if (item.type === 'safepoint' && item.safePointData) {
    return <ChatSafePointBubble item={item} isMe={isMe} onBookSafePoint={onBookSafePoint} />;
  }

  return <ChatTextBubble item={item} isMe={isMe} />;
};

const styles = StyleSheet.create({
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
  safepointBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  safepointBookBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  msgTime: { fontSize: 9.5, color: '#94A3B8', alignSelf: 'flex-end', marginTop: 4 },
});
