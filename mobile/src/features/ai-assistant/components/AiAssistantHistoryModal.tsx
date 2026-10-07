import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AiSessionItem } from '../../../services/aiMobileService';

interface AiAssistantHistoryModalProps {
  visible: boolean;
  sessions: AiSessionItem[];
  currentSessionId?: string | null;
  loading: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export const AiAssistantHistoryModal: React.FC<AiAssistantHistoryModalProps> = ({
  visible,
  sessions,
  currentSessionId,
  loading,
  onClose,
  onSelectSession,
  onNewChat,
}) => {
  const renderItem = ({ item }: { item: AiSessionItem }) => {
    const isActive = item.id === currentSessionId;
    const formattedDate = item.updatedAt
      ? new Date(item.updatedAt).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <TouchableOpacity
        style={[styles.sessionCard, isActive && styles.sessionCardActive]}
        activeOpacity={0.75}
        onPress={() => onSelectSession(item.id)}
      >
        <View style={styles.sessionHeaderRow}>
          <View style={styles.sessionTitleWrapper}>
            <Ionicons
              name={isActive ? 'chatbubble-ellipses' : 'chatbubble-outline'}
              size={16}
              color={isActive ? '#EA580C' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.sessionTitleText, isActive && styles.sessionTitleTextActive]}
              numberOfLines={1}
            >
              {item.title || 'Hội thoại tư vấn Market'}
            </Text>
          </View>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Đang mở</Text>
            </View>
          )}
        </View>

        <View style={styles.sessionFooterRow}>
          <Text style={styles.sessionTimeText}>{formattedDate}</Text>
          {item.campus && (
            <View style={styles.campusTag}>
              <Text style={styles.campusTagText}>{item.campus}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="time" size={20} color="#EA580C" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Lịch sử trò chuyện</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* New Chat Action */}
          <TouchableOpacity
            style={styles.newChatBtn}
            activeOpacity={0.85}
            onPress={onNewChat}
          >
            <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.newChatBtnText}>+ Cuộc trò chuyện mới</Text>
          </TouchableOpacity>

          {/* Content List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#EA580C" />
              <Text style={styles.loadingText}>Đang tải lịch sử phiên chat...</Text>
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Chưa có lịch sử trò chuyện</Text>
              <Text style={styles.emptySub}>
                Các cuộc hội thoại định giá và tìm đồ sẽ được lưu tự động tại đây.
              </Text>
            </View>
          ) : (
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '55%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 14,
    marginBottom: 12,
  },
  newChatBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
    gap: 10,
  },
  sessionCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  sessionCardActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sessionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  sessionTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  sessionTitleTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sessionFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  campusTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  campusTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
});
