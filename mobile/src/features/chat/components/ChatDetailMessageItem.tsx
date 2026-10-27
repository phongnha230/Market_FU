import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MessageItem {
  id: string;
  sender: 'me' | 'partner';
  type: 'text' | 'offer' | 'safepoint' | 'image' | 'order';
  text?: string;
  imageUrl?: string;
  time: string;
  offerData?: {
    originalPrice: number;
    offeredPrice: number;
    status: 'pending' | 'accepted' | 'declined' | 'expired' | 'unavailable' | 'cancelled';
  };
  safePointData?: {
    location: string;
    timeSlot: string;
  };
  orderData?: {
    orderCode: string;
    totalAmount?: number | string;
    orderType?: string;
  };
}

interface ChatOfferBubbleProps {
  item: MessageItem;
  isMe: boolean;
  isBuyer: boolean;
  onAcceptOffer: (msgId: string) => void;
  onRejectOffer?: (msgId: string) => void;
  onCheckoutOffer?: (offeredPrice: number) => void;
}

const ChatOfferBubble: React.FC<ChatOfferBubbleProps> = ({
  item,
  isMe,
  isBuyer,
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
          ) : offerData.status === 'cancelled' ? (
            <View style={[styles.declinedBadge, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
              <Ionicons name="refresh-circle" size={12} color="#475569" />
              <Text style={[styles.declinedText, { color: '#475569' }]}>
                Đơn đã hủy • Mặt hàng quay về giá gốc
              </Text>
            </View>
          ) : offerData.status === 'accepted' ? (
            <View style={styles.statusCol}>
              <View style={styles.acceptedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.acceptedText}>Đã chốt mức giá này (Ưu đãi 30p)</Text>
              </View>
              {isBuyer ? (
                onCheckoutOffer && (
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
                )
              ) : (
                <View style={styles.sellerWaitingBadge}>
                  <Ionicons name="hourglass-outline" size={11} color="#B45309" style={{ marginRight: 4 }} />
                  <Text style={styles.sellerWaitingText}>
                    Đang chờ người mua đặt đơn & thanh toán Escrow...
                  </Text>
                </View>
              )}
            </View>
          ) : offerData.status === 'declined' ? (
            <View style={styles.declinedBadge}>
              <Ionicons name="close-circle" size={12} color="#DC2626" />
              <Text style={styles.declinedText}>Đã từ chối mức giá đề xuất</Text>
            </View>
          ) : isMe ? (
            <View style={styles.waitingBadge}>
              <Text style={styles.offerWaitingText}>⏳ Đang chờ đối tác phản hồi...</Text>
            </View>
          ) : !isBuyer ? (
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
          ) : (
            <View style={styles.waitingBadge}>
              <Text style={styles.offerWaitingText}>⏳ Đang chờ người bán phản hồi...</Text>
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
  onMessageAction?: (item: MessageItem) => void;
}

const isImmutableOfferOrOrderText = (text?: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    text.includes('[OFFER_ACCEPTED]') ||
    text.includes('[OFFER_REJECTED]') ||
    text.startsWith('[ORDER_CREATED]') ||
    text.startsWith('[ORDER_CANCELLED]') ||
    text.startsWith('[ORDER_SHIPPING_CONFIRMED]') ||
    text.startsWith('[APPOINTMENT_CONFIRMED]') ||
    lower.startsWith('đề xuất giá') ||
    lower.includes('đồng ý chốt mức giá') ||
    lower.includes('từ chối đề xuất')
  );
};

const ChatTextBubble: React.FC<ChatTextBubbleProps> = ({ item, isMe, onMessageAction }) => {
  const canModify = isMe && !isImmutableOfferOrOrderText(item.text) && Boolean(onMessageAction);
  const cleanText = (item.text || '')
    .replace(/^\[OFFER_ACCEPTED\]\s*/i, '')
    .replace(/^\[OFFER_REJECTED\]\s*/i, '');

  return (
    <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {canModify && (
          <TouchableOpacity
            onPress={() => onMessageAction?.(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={13} color="#64748B" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={canModify ? 0.85 : 1}
          onLongPress={canModify ? () => onMessageAction?.(item) : undefined}
          style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
        >
          <Text style={[styles.bubbleText, isMe ? styles.myBubbleText : styles.theirBubbleText]}>
            {cleanText}
          </Text>
          <Text style={[styles.bubbleTime, isMe ? styles.myBubbleTime : styles.theirBubbleTime]}>
            {item.time}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface ChatImageBubbleProps {
  item: MessageItem;
  isMe: boolean;
  onMessageAction?: (item: MessageItem) => void;
}

const ChatImageBubble: React.FC<ChatImageBubbleProps> = ({ item, isMe, onMessageAction }) => {
  const canModify = isMe && Boolean(onMessageAction);
  return (
    <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {canModify && (
          <TouchableOpacity
            onPress={() => onMessageAction?.(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <Ionicons name="trash-outline" size={13} color="#DC2626" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={canModify ? 0.85 : 1}
          onLongPress={canModify ? () => onMessageAction?.(item) : undefined}
          style={[styles.imageBubble, isMe ? styles.myImageBubble : styles.theirImageBubble]}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.chatMediaImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={28} color="#94A3B8" />
            </View>
          )}
          {item.text && item.text !== 'Đã gửi một ảnh' && (
            <Text style={[styles.imageCaptionText, isMe ? styles.myBubbleText : styles.theirBubbleText]}>
              {item.text}
            </Text>
          )}
          <Text style={[styles.bubbleTime, isMe ? styles.myBubbleTime : styles.theirBubbleTime, { marginTop: 4 }]}>
            {item.time}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface ChatOrderTicketBubbleProps {
  item: MessageItem;
  isMe: boolean;
  onViewOrder?: (orderCode?: string) => void;
}

const ChatOrderTicketBubble: React.FC<ChatOrderTicketBubbleProps> = ({ item, isMe, onViewOrder }) => {
  const text = item.text || '';
  const orderCodeMatch = text.match(/#(ORD-[A-Za-z0-9_-]+)/i);
  const orderCode = item.orderData?.orderCode || (orderCodeMatch ? orderCodeMatch[1] : '');
  const cleanText = text.replace(/^\[ORDER_CREATED\]\s*/i, '');
  const isCod = text.includes('Ship COD') || text.includes('tiền mặt') || item.orderData?.orderType === 'SHIP_COD';

  return (
    <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
      <View style={styles.orderTicketCard}>
        {/* Header Tag + Time */}
        <View style={styles.orderHeaderRow}>
          <View style={[styles.orderTicketPill, isCod && { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Ionicons name={isCod ? 'cube-outline' : 'shield-checkmark'} size={11} color={isCod ? '#2563EB' : '#059669'} />
            <Text style={[styles.orderTicketPillText, isCod && { color: '#2563EB' }]}>
              {isCod ? 'Đơn Hàng COD (Thu Hộ)' : 'Đơn Hàng Escrow'}
            </Text>
          </View>
          <Text style={styles.orderTimeText}>{item.time}</Text>
        </View>

        {/* Order Main Title */}
        <View style={styles.orderTitleRow}>
          <Ionicons name={isCod ? 'cube' : 'bag-check'} size={18} color={isCod ? '#2563EB' : '#EA580C'} style={{ marginRight: 6 }} />
          <Text style={styles.orderMainTitle}>
            {isCod ? 'Đã Tạo Đơn Giao Hàng (COD)' : 'Đã Đặt Mua Thành Công!'}
          </Text>
        </View>

        {/* Order Description / Details */}
        <View style={styles.orderContentBox}>
          <Text style={styles.orderBodyText}>{cleanText}</Text>
          <View style={styles.escrowNoticeRow}>
            <Ionicons name={isCod ? 'information-circle' : 'lock-closed'} size={12} color="#0284C7" style={{ marginRight: 4 }} />
            <Text style={styles.escrowNoticeText}>
              {isCod
                ? 'Thanh toán tiền mặt cho bưu tá khi nhận và đồng kiểm hàng 48h tại sảnh KTX.'
                : 'Tiền cọc được sàn FPT giữ bảo chứng, chỉ thanh toán khi hai bên quét mã bàn giao.'}
            </Text>
          </View>
        </View>

        {/* Action Button: View Order Detail */}
        {onViewOrder && (
          <TouchableOpacity
            style={styles.viewOrderBtn}
            activeOpacity={0.85}
            onPress={() => onViewOrder(orderCode)}
          >
            <Ionicons name="receipt-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.viewOrderBtnText}>Xem chi tiết đơn hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface ChatOrderCancelledBubbleProps {
  item: MessageItem;
}

const ChatOrderCancelledBubble: React.FC<ChatOrderCancelledBubbleProps> = ({ item }) => {
  const text = item.text || '';
  const orderCodeMatch = text.match(/#(ORD-[A-Za-z0-9_-]+)/i);
  const orderCode = orderCodeMatch ? orderCodeMatch[1] : '';
  const cleanText = text.replace(/^\[ORDER_CANCELLED\]\s*/i, '');

  return (
    <View style={[styles.msgWrapper, { alignSelf: 'center', width: '92%', maxWidth: 360 }]}>
      <View style={styles.orderCancelledCard}>
        {/* Header Tag + Time */}
        <View style={styles.orderHeaderRow}>
          <View style={styles.orderCancelledPill}>
            <Ionicons name="close-circle" size={11} color="#DC2626" />
            <Text style={styles.orderCancelledPillText}>Đơn Hàng Đã Hủy</Text>
          </View>
          <Text style={styles.orderTimeText}>{item.time}</Text>
        </View>

        {/* Order Cancelled Title */}
        <View style={styles.orderTitleRow}>
          <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={[styles.orderMainTitle, { color: '#991B1B' }]}>
            {orderCode ? `Đơn hàng #${orderCode} đã bị hủy` : 'Đơn hàng đã bị hủy'}
          </Text>
        </View>

        {/* Body */}
        <View style={styles.orderCancelledContentBox}>
          <Text style={styles.orderCancelledBodyText}>{cleanText}</Text>
          <View style={styles.orderCancelledNoticeRow}>
            <Ionicons name="information-circle" size={11} color="#DC2626" style={{ marginRight: 4 }} />
            <Text style={styles.orderCancelledNoticeText}>
              Tiền cọc Escrow/xu đã được hoàn trả, món đồ được mở lại trạng thái Đang bán.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

interface ChatDetailMessageItemProps {
  item: MessageItem;
  isBuyer: boolean;
  onAcceptOffer: (msgId: string) => void;
  onRejectOffer?: (msgId: string) => void;
  onBookSafePoint: (safePointLocation?: string) => void;
  onCheckoutOffer?: (offeredPrice: number) => void;
  onViewOrder?: (orderCode?: string) => void;
  onMessageAction?: (item: MessageItem) => void;
}

export const ChatDetailMessageItem: React.FC<ChatDetailMessageItemProps> = ({
  item,
  isBuyer,
  onAcceptOffer,
  onRejectOffer,
  onBookSafePoint,
  onCheckoutOffer,
  onViewOrder,
  onMessageAction,
}) => {
  const isMe = item.sender === 'me';

  if (item.type === 'order' || (item.text && item.text.startsWith('[ORDER_CREATED]'))) {
    return <ChatOrderTicketBubble item={item} isMe={isMe} onViewOrder={onViewOrder} />;
  }

  if (item.text && item.text.startsWith('[ORDER_CANCELLED]')) {
    return <ChatOrderCancelledBubble item={item} />;
  }

  if (item.type === 'offer' && item.offerData) {
    return (
      <ChatOfferBubble
        item={item}
        isMe={isMe}
        isBuyer={isBuyer}
        onAcceptOffer={onAcceptOffer}
        onRejectOffer={onRejectOffer}
        onCheckoutOffer={onCheckoutOffer}
      />
    );
  }

  if (item.type === 'safepoint' && item.safePointData) {
    return <ChatSafePointBubble item={item} isMe={isMe} onBookSafePoint={onBookSafePoint} />;
  }

  if (item.type === 'image') {
    return <ChatImageBubble item={item} isMe={isMe} onMessageAction={onMessageAction} />;
  }

  return <ChatTextBubble item={item} isMe={isMe} onMessageAction={onMessageAction} />;
};

const styles = StyleSheet.create({
  msgWrapper: { marginVertical: 3, maxWidth: '82%' },
  myMsgWrapper: { alignSelf: 'flex-end' },
  theirMsgWrapper: { alignSelf: 'flex-start' },

  // Image bubble
  imageBubble: { borderRadius: 14, padding: 4, overflow: 'hidden' },
  myImageBubble: { backgroundColor: '#EA580C', borderBottomRightRadius: 3 },
  theirImageBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 3,
  },
  chatMediaImage: {
    width: 220,
    height: 160,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  imagePlaceholder: {
    width: 220,
    height: 160,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCaptionText: { fontSize: 12.5, lineHeight: 17, paddingHorizontal: 4, paddingTop: 4 },

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

  // Seller Waiting Badge
  sellerWaitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sellerWaitingText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#B45309',
  },

  // Order Ticket Card - Polished Escrow design
  orderTicketCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    borderRadius: 14,
    padding: 10,
    minWidth: 230,
    maxWidth: 290,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderTicketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  orderTicketPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  orderTimeText: {
    fontSize: 9,
    color: '#94A3B8',
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderMainTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  orderBodyText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 5,
  },
  escrowNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 5,
    borderRadius: 5,
    marginTop: 2,
  },
  escrowNoticeText: {
    fontSize: 9.5,
    color: '#0369A1',
    lineHeight: 13,
    flex: 1,
  },
  viewOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  viewOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  orderCancelledCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 10,
    width: '100%',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  orderCancelledPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  orderCancelledPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  orderCancelledContentBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  orderCancelledBodyText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#7F1D1D',
    fontWeight: '500',
    marginBottom: 5,
  },
  orderCancelledNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 5,
    borderRadius: 5,
    marginTop: 2,
    borderWidth: 0.5,
    borderColor: '#FECACA',
  },
  orderCancelledNoticeText: {
    fontSize: 9.5,
    color: '#B91C1C',
    lineHeight: 13,
    flex: 1,
  },
});

