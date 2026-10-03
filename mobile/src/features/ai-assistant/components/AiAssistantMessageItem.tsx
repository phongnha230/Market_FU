import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AiAssistantProductCard, SuggestedProductItem } from './AiAssistantProductCard';

export interface ChatMessage {
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

interface AiAssistantMessageItemProps {
  message: ChatMessage;
  userName?: string;
  onProductDetail: (product: SuggestedProductItem) => void;
  onContactSeller: (product: SuggestedProductItem) => void;
  onActionChip: (chipId: string) => void;
}

export const AiAssistantMessageItem: React.FC<AiAssistantMessageItemProps> = ({
  message,
  userName = 'Quân',
  onProductDetail,
  onContactSeller,
  onActionChip,
}) => {
  const isAi = message.sender === 'ai';

  if (!isAi) {
    return (
      <View style={styles.userMsgWrapper}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{message.text}</Text>
        </View>
        <View style={styles.userTimeRow}>
          <Text style={styles.timeText}>{message.time}</Text>
          <Ionicons name="checkmark-done" size={14} color="#10B981" style={{ marginLeft: 3 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiMsgRow}>
      <View style={styles.aiSenderAvatar}>
        <Ionicons name="globe-outline" size={14} color="#FFFFFF" />
      </View>

      <View style={styles.aiBubbleCol}>
        <View style={styles.aiBubble}>
          {message.campusHeader && (
            <View style={styles.campusRecommendHeader}>
              <Ionicons name="shield-checkmark" size={13} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={styles.campusRecommendHeaderText}>{message.campusHeader}</Text>
            </View>
          )}

          {message.text && (
            <Text style={styles.aiBubbleText}>
              {message.id === 'm1' ? (
                <>
                  Chào <Text style={styles.boldOrangeText}>{userName}</Text>! Tôi là trợ lý chuyên sâu FPT 5Campus Marketplace. Tôi có thể hỗ trợ bạn thẩm định giá đồ dùng học tập, đối soát tài khoản MSSV chính quy, hoặc kết nối giao dịch trực tiếp ngay tại ký túc xá. Bạn cần hỗ trợ gì hôm nay?
                </>
              ) : (
                message.text
              )}
            </Text>
          )}

          {message.suggestedProducts && message.suggestedProducts.length > 0 && (
            <View style={styles.suggestedProductsContainer}>
              {message.suggestedProducts.map((p) => (
                <AiAssistantProductCard
                  key={p.id}
                  product={p}
                  onDetail={onProductDetail}
                  onChatSeller={onContactSeller}
                />
              ))}
            </View>
          )}

          {message.safetyTip && (
            <View style={styles.safetyTipCard}>
              <View style={styles.safetyTipHeader}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#EA580C" style={{ marginRight: 5 }} />
                <Text style={styles.safetyTipTitle}>{message.safetyTip.title}</Text>
              </View>
              <Text style={styles.safetyTipDesc}>
                Bạn nên hẹn người bán tại <Text style={styles.boldText}>{message.safetyTip.safePoint}</Text>. Khu vực này được trang bị sẵn ổ cắm điện 220V và cáp chuyển HDMI/Type-C để test cổng hiển thị trước khi chuyển khoản.
              </Text>
            </View>
          )}
        </View>

        {message.actionChips && (
          <View style={styles.actionChipsRow}>
            {message.actionChips.map((chip) => (
              <TouchableOpacity
                key={chip.id}
                style={styles.actionChipBtn}
                activeOpacity={0.75}
                onPress={() => onActionChip(chip.id)}
              >
                <Ionicons name={chip.icon as any} size={13} color={chip.color} style={{ marginRight: 4 }} />
                <Text style={[styles.actionChipText, { color: chip.color }]}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.aiTimeText}>{message.time} • AI Bot Campus</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  suggestedProductsContainer: {
    gap: 10,
    marginTop: 6,
    marginBottom: 8,
  },
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
});
