import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { resolveAvatarImage } from '../../../lib/imageResolver';
import { AiAssistantProductCard, SuggestedProductItem } from './AiAssistantProductCard';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text?: string;
  time: string;
  isTyping?: boolean;
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
  userAvatar?: string;
  onProductDetail: (product: SuggestedProductItem) => void;
  onContactSeller: (product: SuggestedProductItem) => void;
  onActionChip: (chipId: string) => void;
}

const renderInlineFormattedText = (raw: string, isUser = false) => {
  const parts = raw.split(/(\*{2}[^*]+?\*{2}|`[^`]+?`)/g);

  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <Text
          key={pIdx}
          style={[styles.aiBoldText, isUser && styles.userBoldText]}
        >
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <Text key={pIdx} style={styles.aiCodeText}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Text key={pIdx}>{part}</Text>;
  });
};

const FormattedAiText: React.FC<{
  text: string;
}> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <View style={styles.formattedTextContainer}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={lineIdx} style={styles.lineSpacer} />;
        }

        const bulletMatch = trimmed.match(/^(\*|-|•)\s+(.*)$/);
        const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

        if (bulletMatch) {
          return (
            <View key={lineIdx} style={styles.aiBulletRow}>
              <View style={styles.aiBulletDot} />
              <Text style={[styles.aiBubbleText, styles.aiBulletText]}>
                {renderInlineFormattedText(bulletMatch[2])}
              </Text>
            </View>
          );
        }

        if (numberMatch) {
          return (
            <View key={lineIdx} style={styles.aiBulletRow}>
              <View style={styles.aiNumberBadge}>
                <Text style={styles.aiNumberText}>{numberMatch[1]}</Text>
              </View>
              <Text style={[styles.aiBubbleText, styles.aiBulletText]}>
                {renderInlineFormattedText(numberMatch[2])}
              </Text>
            </View>
          );
        }

        return (
          <Text key={lineIdx} style={styles.aiBubbleText}>
            {renderInlineFormattedText(trimmed)}
          </Text>
        );
      })}
    </View>
  );
};

export const AiAssistantMessageItem: React.FC<AiAssistantMessageItemProps> = ({
  message,
  userName = 'Bạn',
  userAvatar,
  onProductDetail,
  onContactSeller,
  onActionChip,
}) => {
  const isAi = message.sender === 'ai';

  if (!isAi) {
    return (
      <View style={styles.userMsgRow}>
        <View style={styles.userMsgWrapper}>
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{message.text}</Text>
          </View>
          <View style={styles.userTimeRow}>
            <Text style={styles.timeText}>{message.time}</Text>
            <Ionicons name="checkmark-done" size={14} color="#10B981" style={{ marginLeft: 3 }} />
          </View>
        </View>
        <View style={styles.userSenderAvatar}>
          {userAvatar ? (
            <Image
              source={resolveAvatarImage(userAvatar)}
              style={styles.userAvatarImg}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.userAvatarFallback}>
              <Text style={styles.userAvatarFallbackText}>
                {(userName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
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
              <Ionicons name="shield-checkmark" size={13} color="#EA580C" style={{ marginRight: 4, flexShrink: 0 }} />
              <Text style={styles.campusRecommendHeaderText} numberOfLines={1}>{message.campusHeader}</Text>
            </View>
          )}

          {message.isTyping ? (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#EA580C" />
              <Text style={styles.typingText}>Cóc AI đang suy nghĩ & tìm kiếm...</Text>
            </View>
          ) : (
            message.text && <FormattedAiText text={message.text} />
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
  userMsgRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  userMsgWrapper: {
    alignItems: 'flex-end',
    flex: 1,
  },
  userSenderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  userAvatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  userBubble: {
    maxWidth: '85%',
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
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.2,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  typingText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  aiBubbleText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 19,
    marginBottom: 4,
  },
  formattedTextContainer: {
    marginBottom: 4,
  },
  lineSpacer: {
    height: 6,
  },
  aiBoldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  userBoldText: {
    color: '#FFFFFF',
  },
  aiCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#F1F5F9',
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '600',
  },
  aiBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 2,
  },
  aiBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
    marginTop: 6.5,
    marginRight: 8,
    flexShrink: 0,
  },
  aiBulletText: {
    flex: 1,
    marginBottom: 0,
  },
  aiNumberBadge: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 7,
    flexShrink: 0,
  },
  aiNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
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
