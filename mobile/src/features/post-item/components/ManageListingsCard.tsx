import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ListingItemData } from '../screens/ManageListingsScreen';

interface ManageListingsCardProps {
  item: ListingItemData;
  onEdit: (item: ListingItemData) => void;
  onBoost: (id: string, title: string) => void;
  onRenew: (id: string, title: string) => void;
  onToggleHide: (id: string, title: string, isCurrentlyHidden?: boolean) => void;
  onMarkSold: (id: string, title: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const ManageListingsCard: React.FC<ManageListingsCardProps> = ({
  item,
  onEdit,
  onBoost,
  onRenew,
  onToggleHide,
  onMarkSold,
  onDelete,
}) => {
  const isHidden = item.rawStatus === 'HIDDEN' || item.status === 'sold';

  return (
    <View style={styles.listingCard}>
      {/* Main Content Row */}
      <View style={styles.cardMainRow}>
        {/* Thumbnail Image with Tag */}
        <View style={styles.thumbWrapper}>
          <Image source={item.image} style={styles.thumbImage} contentFit="cover" />
          {item.tag && (
            <View
              style={[
                styles.thumbTag,
                { backgroundColor: item.tagColor || 'rgba(0,0,0,0.6)' },
              ]}
            >
              <Text style={[styles.thumbTagText, { color: item.tagTextColor || '#FFFFFF' }]}>
                {item.tag}
              </Text>
            </View>
          )}
        </View>

        {/* Info Column */}
        <View style={styles.cardInfoCol}>
          <View style={styles.priceTimeRow}>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <Text style={styles.itemTimeAgo}>{item.timeAgo}</Text>
          </View>

          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name={item.locationIcon}
              size={13}
              color="#C2410C"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {/* Stats & Badge Tags */}
          <View style={styles.tagsRow}>
            {item.unreadMessages !== undefined && item.unreadMessages > 0 && (
              <View style={styles.unreadMsgTag}>
                <Ionicons name="chatbubble" size={11} color="#C2410C" style={{ marginRight: 3 }} />
                <Text style={styles.unreadMsgText}>{item.unreadMessages} tin mới</Text>
              </View>
            )}

            {item.scheduledAppointments !== undefined && item.scheduledAppointments > 0 && (
              <View style={styles.scheduledTag}>
                <Ionicons name="calendar" size={11} color="#1E40AF" style={{ marginRight: 3 }} />
                <Text style={styles.scheduledTagText}>
                  {item.scheduledAppointments} người hẹn xem
                </Text>
              </View>
            )}

            <View style={styles.viewsTag}>
              <Ionicons name="eye-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
              <Text style={styles.viewsText}>{item.views} lượt xem</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons Row */}
      <View style={styles.cardActionsRow}>
        {/* Sửa tin (chỉ cho bài chưa bán) */}
        {item.status !== 'sold' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnBlue]}
            activeOpacity={0.75}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="pencil" size={13} color="#1E3A8A" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnBlueText}>Sửa tin</Text>
          </TouchableOpacity>
        )}

        {/* Đẩy tin (cho bài active) */}
        {item.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOrange]}
            activeOpacity={0.75}
            onPress={() => onBoost(item.id, item.title)}
          >
            <Ionicons name="rocket-outline" size={13} color="#C2410C" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnOrangeText}>Đẩy tin</Text>
          </TouchableOpacity>
        )}

        {/* Gia hạn 30 ngày (cho bài active) */}
        {item.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnGray]}
            activeOpacity={0.75}
            onPress={() => onRenew(item.id, item.title)}
          >
            <Ionicons name="refresh-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnGrayText}>Gia hạn</Text>
          </TouchableOpacity>
        )}

        {/* Tạm ẩn / Mở bán lại (chỉ cho bài chưa bán) */}
        {item.status !== 'sold' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnBlue]}
            activeOpacity={0.75}
            onPress={() => onToggleHide(item.id, item.title, isHidden)}
          >
            <Ionicons
              name={isHidden ? 'eye-outline' : 'eye-off-outline'}
              size={13}
              color="#1E3A8A"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.actionBtnBlueText}>
              {isHidden ? 'Hiện lại' : 'Tạm ẩn'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Trạng thái Đã giao dịch cho bài sold */}
        {item.status === 'sold' && (
          <View style={[styles.actionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Ionicons name="checkmark-done-circle" size={13} color="#059669" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#065F46' }}>Đã giao dịch</Text>
          </View>
        )}

        {/* Đã bán (cho active / scheduled) */}
        {item.status !== 'sold' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnGreen]}
            activeOpacity={0.75}
            onPress={() => onMarkSold(item.id, item.title)}
          >
            <Ionicons name="checkmark-circle-outline" size={13} color="#065F46" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnGreenText}>Đã bán</Text>
          </TouchableOpacity>
        )}

        {/* Xóa vĩnh viễn */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnRed]}
          activeOpacity={0.75}
          onPress={() => onDelete(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={13} color="#DC2626" style={{ marginRight: 4 }} />
          <Text style={styles.actionBtnRedText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  thumbTagText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  cardInfoCol: {
    flex: 1,
  },
  priceTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#9A3412',
  },
  itemTimeAgo: {
    fontSize: 11,
    color: '#64748B',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  unreadMsgTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  unreadMsgText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  scheduledTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  scheduledTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  viewsTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  actionBtn: {
    minWidth: 70,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  actionBtnBlue: {
    backgroundColor: '#EFF6FF',
  },
  actionBtnBlueText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  actionBtnOrange: {
    backgroundColor: '#FFF7ED',
  },
  actionBtnOrangeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C2410C',
  },
  actionBtnGreen: {
    backgroundColor: '#ECFDF5',
  },
  actionBtnGreenText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  actionBtnGray: {
    backgroundColor: '#F1F5F9',
  },
  actionBtnGrayText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  actionBtnRed: {
    backgroundColor: '#FEF2F2',
  },
  actionBtnRedText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
});
