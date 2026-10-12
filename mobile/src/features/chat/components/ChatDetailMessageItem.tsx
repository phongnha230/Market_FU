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
    status: 'pending' | 'accepted' | 'declined' | 'expired' | 'unavailable';
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
  onRejectOffer?: (msgId: string) => void;
  onCheckoutOffer?: (offeredPrice: number) => void;
}

const ChatOfferBubble: React.FC<ChatOfferBubbleProps> = ({
  item,
  isMe,
  onAcceptOffer,
  onRejectOffer,
  onCheckoutOffer,
}) => {
  const offerData = item.offerData!;
  const hasDiscount = offerData.originalPrice > offerData.offeredPrice;
  const discountPercent = hasDiscount
    ? Math.round(((offerData.originalPrice - offerData.offeredPrice) / offerData.originalPrice) * 100)
    : 0;

  return (
    <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
      <View style={styles.offerCard}>
        {/* Header Tag + Time */}
        <View style={styles.offerHeaderRow}>
          <View style={styles.offerPill}>
            <Ionicons name="pricetag" size={10} color="#EA580C" />
            <Text style={styles.offerPillText}>Đề xuất giá</Text>
          </View>
          <Text style={styles.offerTimeText}>{item.time}</Text>
        </View>

        {/* Compact Price Row */}
        <View style={styles.offerPriceRow}>
          <Text style={styles.offerNewPrice}>
            {offerData.offeredPrice.toLocaleString('vi-VN')}đ
          </Text>
          {hasDiscount && (
            <View style={styles.originalPriceWrap}>
              <Text style={styles.offerOriginalPrice}>
                {offerData.originalPrice.toLocaleString('vi-VN')}đ
              </Text>
              {discountPercent > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Optional Note */}
        {item.text ? (
          <View style={styles.offerNoteBox}>
            <Text style={styles.offerNoteText} numberOfLines={2}>
              &ldquo;{item.text}&rdquo;
            </Text>
          </View>
        ) : null}

        {/* Status / Actions */}
        <View style={styles.offerFooter}>
          {offerData.status === 'unavailable' ? (
            <View style={styles.declinedBadge}>
              <Ionicons name="alert-circle" size={12} color="#DC2626" />
              <Text style={styles.declinedText}>Món đồ đã có người khác đặt mua</Text>
            </View>
          ) : offerData.status === 'expired' ? (
            <View style={[styles.declinedBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Ionicons name="time" size={12} color="#B45309" />
              <Text style={[styles.declinedText, { color: '#B45309' }]}>Thỏa thuận đã hết hạn (30 phút)</Text>
            </View>
          ) : offerData.status === 'accepted' ? (
            <View style={styles.statusCol}>
              <View style={styles.acceptedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.acceptedText}>Đã chốt mức giá này (Ưu đãi 30p)</Text>
              </View>
              {isMe && onCheckoutOffer && (
                <TouchableOpacity
                  style={styles.checkoutOfferBtn}
                  activeOpacity={0.85}
                  onPress={() => onCheckoutOffer(offerData.offeredPrice)}
                >
                  <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                  <Text style={styles.checkoutOfferBtnText}>
                    Đặt mua ngay ({offerData.offeredPrice.toLocaleString('vi-VN')}đ)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : offerData.status === 'declined' ? (
            <View style={styles.declinedBadge}>
              <Ionicons name="close-circle" size={12} color="#DC2626" />
              <Text style={styles.declinedText}>Đã từ chối mức giá đề xuất</Text>
            </View>
          ) : isMe ? (
            <View style={styles.waitingBadge}>
              <Text style={styles.offerWaitingText}>⏳ Đang chờ người bán phản hồi...</Text>
            </View>
          ) : (
            <View style={styles.offerActionsRow}>
              {onRejectOffer && (
                <TouchableOpacity
                  style={styles.rejectBtn}
                  activeOpacity={0.8}
                  onPress={() => onRejectOffer(item.id)}
                >
                  <Text style={styles.rejectBtnText}>Từ chối</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.acceptBtn}
                activeOpacity={0.8}
                onPress={() => onAcceptOffer(item.id)}
              >
                <Ionicons name="checkmark" size={12} color="#FFFFFF" style={{ marginRight: 2 }} />
                <Text style={styles.acceptBtnText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
        <View style={styles.safepointHeaderRow}>
          <View style={styles.safepointPill}>
            <Ionicons name="shield-checkmark" size={10} color="#059669" />
            <Text style={styles.safepointPillText}>Safe-Handoff</Text>
          </View>
          <Text style={styles.safepointTimeText}>{item.time}</Text>
        </View>
        <Text style={styles.safepointLoc} numberOfLines={2}>
          📍 {safePointData.location}
        </Text>
        <TouchableOpacity
          style={styles.safepointBookBtn}
          activeOpacity={0.85}
          onPress={() => onBookSafePoint(safePointData.location)}
        >
          <Ionicons name="calendar-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.safepointBookBtnText}>Chốt hẹn & Đặt lịch</Text>
        </TouchableOpacity>
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
  onRejectOffer?: (msgId: string) => void;
  onBookSafePoint: (safePointLocation?: string) => void;
  onCheckoutOffer?: (offeredPrice: number) => void;
}

export const ChatDetailMessageItem: React.FC<ChatDetailMessageItemProps> = ({
  item,
  onAcceptOffer,
  onRejectOffer,
  onBookSafePoint,
  onCheckoutOffer,
}) => {
  const isMe = item.sender === 'me';

  if (item.type === 'offer' && item.offerData) {
    return (
      <ChatOfferBubble
        item={item}
        isMe={isMe}
        onAcceptOffer={onAcceptOffer}
        onRejectOffer={onRejectOffer}
        onCheckoutOffer={onCheckoutOffer}
      />
    );
  }

  if (item.type === 'safepoint' && item.safePointData) {
    return <ChatSafePointBubble item={item} isMe={isMe} onBookSafePoint={onBookSafePoint} />;
  }

  return <ChatTextBubble item={item} isMe={isMe} />;
};

const styles = StyleSheet.create({
  msgWrapper: { marginVertical: 3, maxWidth: '82%' },
  myMsgWrapper: { alignSelf: 'flex-end' },
  theirMsgWrapper: { alignSelf: 'flex-start' },

  // Text bubble
  bubble: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7 },
  myBubble: { backgroundColor: '#EA580C', borderBottomRightRadius: 3 },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 3,
  },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  myBubbleText: { color: '#FFFFFF' },
  theirBubbleText: { color: '#0F172A' },
  bubbleTime: { fontSize: 9, alignSelf: 'flex-end', marginTop: 2 },
  myBubbleTime: { color: 'rgba(255, 255, 255, 0.75)' },
  theirBubbleTime: { color: '#94A3B8' },

  // Offer card - Compact & polished
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    padding: 9,
    minWidth: 200,
    maxWidth: 260,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  offerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  offerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offerPillText: { fontSize: 10, fontWeight: '800', color: '#EA580C' },
  offerTimeText: { fontSize: 9, color: '#94A3B8' },

  offerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  offerNewPrice: { fontSize: 16, fontWeight: '900', color: '#EA580C' },
  originalPriceWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  offerOriginalPrice: { fontSize: 10.5, color: '#94A3B8', textDecorationLine: 'line-through' },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 3.5,
    paddingVertical: 0.5,
    borderRadius: 4,
  },
  discountBadgeText: { fontSize: 8.5, fontWeight: '800', color: '#DC2626' },

  offerNoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginBottom: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#FDBA74',
  },
  offerNoteText: { fontSize: 10.5, color: '#475569', fontStyle: 'italic' },

  offerFooter: { marginTop: 1 },
  statusCol: { gap: 5 },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  acceptedText: { fontSize: 10.5, fontWeight: '700', color: '#059669' },
  declinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  declinedText: { fontSize: 10.5, fontWeight: '700', color: '#DC2626' },
  waitingBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  offerWaitingText: { fontSize: 10, color: '#D97706', fontStyle: 'italic', fontWeight: '500' },

  offerActionsRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  acceptBtn: {
    flex: 1.2,
    flexDirection: 'row',
    backgroundColor: '#059669',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  checkoutOfferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  checkoutOfferBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // SafePoint card - Compact
  safepointCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 9,
    minWidth: 200,
    maxWidth: 260,
  },
  safepointHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  safepointPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  safepointPillText: { fontSize: 10, fontWeight: '800', color: '#065F46' },
  safepointTimeText: { fontSize: 9, color: '#94A3B8' },
  safepointLoc: { fontSize: 11.5, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  safepointBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  safepointBookBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

