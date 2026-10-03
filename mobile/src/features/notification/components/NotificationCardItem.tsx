import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from '../types/notification.types';

interface NotificationCardItemProps {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}

export const NotificationCardItem: React.FC<NotificationCardItemProps> = React.memo(({ item, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity
      style={[styles.itemCard, item.unread && styles.itemCardUnread]}
      activeOpacity={0.75}
      onPress={handlePress}
    >
      {/* Icon */}
      <View style={[styles.itemIconBox, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={22} color={item.iconColor} />
      </View>

      {/* Text Info */}
      <View style={styles.itemContent}>
        <View style={styles.itemHeaderRow}>
          <Text style={[styles.itemTitle, item.unread && styles.itemTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.itemBody} numberOfLines={3}>
          {item.body}
        </Text>
        <View style={styles.itemFooterRow}>
          <Text style={styles.itemTime}>{item.time}</Text>
          {item.targetScreen && (
            <View style={styles.actionArrowRow}>
              <Text style={styles.actionArrowText}>Xem chi tiết</Text>
              <Ionicons name="chevron-forward" size={13} color="#EA580C" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemCardUnread: {
    backgroundColor: '#FFFBF7',
    borderColor: '#FFEDD5',
  },
  itemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    marginLeft: 6,
  },
  itemBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 8,
  },
  itemFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTime: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  actionArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionArrowText: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
    marginRight: 2,
  },
});

export default NotificationCardItem;
