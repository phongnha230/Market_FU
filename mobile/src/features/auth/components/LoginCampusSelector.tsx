import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ListRenderItemInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CampusType } from '../../../stores/useCampusStore';

export interface CampusChipItem {
  id: string;
  name: string;
  shortLabel: string;
  storeValue: CampusType;
}

interface LoginCampusSelectorProps {
  selectedCampusId: string;
  onSelectCampus: (item: CampusChipItem) => void;
  campusList: CampusChipItem[];
  currentCampus: CampusChipItem;
}

export const LoginCampusSelector: React.FC<LoginCampusSelectorProps> = ({
  selectedCampusId,
  onSelectCampus,
  campusList,
  currentCampus,
}) => {
  const renderItem = useCallback(
    ({ item: c }: ListRenderItemInfo<CampusChipItem>) => {
      const isSelected = c.id === selectedCampusId;
      return (
        <TouchableOpacity
          style={[styles.campusChip, isSelected && styles.campusChipActive]}
          activeOpacity={0.8}
          onPress={() => onSelectCampus(c)}
        >
          <View
            style={[
              styles.chipDot,
              isSelected ? styles.chipDotActive : styles.chipDotInactive,
            ]}
          />
          <Text
            style={[
              styles.campusChipText,
              isSelected && styles.campusChipTextActive,
            ]}
          >
            {c.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedCampusId, onSelectCampus]
  );

  return (
    <View style={styles.campusSection}>
      <View style={styles.campusHeaderRow}>
        <View style={styles.campusLeftRow}>
          <Ionicons name="location-outline" size={15} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.campusLabel}>Cơ sở FPT:</Text>
        </View>
        <Text style={styles.campusCurrentBadge}>{currentCampus.shortLabel}</Text>
      </View>

      <FlatList
        horizontal
        data={campusList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.campusChipsScroll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  campusSection: {
    marginBottom: 16,
  },
  campusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  campusLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  campusCurrentBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  campusChipsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  campusChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  chipDotActive: {
    backgroundColor: '#EA580C',
  },
  chipDotInactive: {
    backgroundColor: '#94A3B8',
  },
  campusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  campusChipTextActive: {
    fontWeight: '700',
    color: '#EA580C',
  },
});
