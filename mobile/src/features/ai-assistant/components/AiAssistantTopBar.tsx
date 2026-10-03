import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AiAssistantTopBarProps {
  insetsTop: number;
  currentCampus?: string;
  onBack: () => void;
  onHome: () => void;
  onNotification: () => void;
  onProfile: () => void;
  onResetChat: () => void;
  onOpenFilters: () => void;
}

export const AiAssistantTopBar: React.FC<AiAssistantTopBarProps> = ({
  insetsTop,
  currentCampus,
  onBack,
  onHome,
  onNotification,
  onProfile,
  onResetChat,
  onOpenFilters,
}) => {
  return (
    <>
      {/* 1. TOP STATUS BAR: Campus Location + Bell + Avatar */}
      <View style={[styles.topNavBar, { paddingTop: Math.max(insetsTop, 10) }]}>
        <View style={styles.topLeftRow}>
          <TouchableOpacity
            style={styles.bellBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.campusLocationChip} activeOpacity={0.8}>
            <Ionicons name="location-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
            <Text style={styles.campusLocationText}>FPT {currentCampus || 'Hòa Lạc'}</Text>
            <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.topRightIcons}>
          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.8}
            onPress={onHome}
          >
            <Ionicons name="home-outline" size={20} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.8}
            onPress={onNotification}
          >
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userAvatarBtn}
            activeOpacity={0.8}
            onPress={onProfile}
          >
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. AI ASSISTANT HEADER: Avatar + Name + Sync + Tools */}
      <View style={styles.aiHeaderBar}>
        <View style={styles.aiProfileRow}>
          <View style={styles.aiAvatarWrapper}>
            <MaterialCommunityIcons name="robot" size={22} color="#EA580C" />
            <View style={styles.aiPulseGreenDot} />
          </View>

          <View style={styles.aiNameCol}>
            <View style={styles.aiTitleTagRow}>
              <Text style={styles.aiTitle}>Trợ lý AI Campus</Text>
              <View style={styles.gptBadge}>
                <Text style={styles.gptBadgeText}>GPT-4o</Text>
              </View>
            </View>
            <Text style={styles.aiStatusSub}>🟢 Online 24/7 • 5Campus Sync</Text>
          </View>
        </View>

        <View style={styles.aiToolBtns}>
          <TouchableOpacity style={styles.toolIconBtn} activeOpacity={0.7} onPress={onResetChat}>
            <Ionicons name="reload" size={18} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolIconBtn}
            activeOpacity={0.7}
            onPress={onOpenFilters}
          >
            <Ionicons name="options-outline" size={18} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  topLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  campusLocationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  campusLocationText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 5,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  userAvatarBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9A3412',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  aiProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiPulseGreenDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  aiNameCol: {
    justifyContent: 'center',
  },
  aiTitleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  gptBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  gptBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  aiStatusSub: {
    fontSize: 10.5,
    color: '#059669',
    marginTop: 1,
    fontWeight: '600',
  },
  aiToolBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
