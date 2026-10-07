import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ONBOARDING_STATIONS, StationItem } from '../constants/onboarding.constants';

interface OnboardingStationToggleProps {
  selectedStationId: string;
  onSelectStation: (station: StationItem) => void;
}

export const OnboardingStationToggle: React.FC<OnboardingStationToggleProps> = ({
  selectedStationId,
  onSelectStation,
}) => {
  return (
    <View style={styles.grid}>
      {ONBOARDING_STATIONS.map((station) => {
        const isSelected = station.id === selectedStationId;
        return (
          <TouchableOpacity
            key={station.id}
            style={[styles.chip, isSelected && styles.chipActive]}
            activeOpacity={0.8}
            onPress={() => onSelectStation(station)}
          >
            <Ionicons
              name={station.icon as any}
              size={14}
              color={isSelected ? '#FFFFFF' : '#64748B'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {station.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#F37021',
    borderColor: '#EA580C',
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default OnboardingStationToggle;
