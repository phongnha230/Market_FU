import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CoinQuestItem } from '../types/voucher.types';

interface MissionItemCardProps {
  quest: CoinQuestItem;
  onAction?: (quest: CoinQuestItem) => void;
}

export const MissionItemCard: React.FC<MissionItemCardProps> = ({ quest, onAction }) => {
  const isDone = quest.actionType === 'claimed' || quest.isCompleted;

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: quest.iconBg }]}>
        <Ionicons name={quest.iconName as any} size={20} color={quest.iconColor} />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{quest.title}</Text>
          <View style={styles.rewardTag}>
            <Text style={styles.rewardText}>+{quest.coins} Xu</Text>
          </View>
        </View>
        <Text style={styles.subtitle} numberOfLines={2}>
          {quest.description}
        </Text>
        <Text style={styles.statusText}>{quest.statusText}</Text>
      </View>

      <View style={styles.actionCol}>
        {isDone ? (
          <View style={styles.doneBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#15803D" />
            <Text style={styles.doneText}>Đã nhận</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              quest.actionType === 'claim' ? styles.btnClaim : styles.btnAction,
            ]}
            activeOpacity={0.8}
            onPress={() => onAction && onAction(quest)}
          >
            <Text style={styles.actionBtnText}>{quest.actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  rewardTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 2,
  },
  statusText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 3,
  },
  actionCol: {
    alignItems: 'flex-end',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 3,
  },
  doneText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  btnClaim: {
    backgroundColor: '#10B981',
  },
  btnAction: {
    backgroundColor: '#EA580C',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default MissionItemCard;
