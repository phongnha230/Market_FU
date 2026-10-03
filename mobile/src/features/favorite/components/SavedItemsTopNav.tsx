import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SavedItemsTopNavProps {
  currentCampus: string;
  topInset: number;
  onBack: () => void;
  onHome: () => void;
  onNotification: () => void;
  onProfile: () => void;
}

export const SavedItemsTopNav: React.FC<SavedItemsTopNavProps> = React.memo(({
  currentCampus,
  topInset,
  onBack,
  onHome,
  onNotification,
  onProfile,
}) => {
  return (
    <View style={[styles.topNavBar, { paddingTop: Math.max(topInset, 10) }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          style={styles.bellBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.campusChip} activeOpacity={0.8}>
          <Ionicons name="location-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.campusChipText}>FPT {currentCampus || 'Hòa Lạc'}</Text>
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
          style={styles.avatarBtn}
          activeOpacity={0.8}
          onPress={onProfile}
        >
          <Ionicons name="person" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  campusChipText: {
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
  avatarBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9A3412',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
