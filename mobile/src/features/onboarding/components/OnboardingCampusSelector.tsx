import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ONBOARDING_CAMPUSES, CampusItem } from '../constants/onboarding.constants';

interface OnboardingCampusSelectorProps {
  selectedCampusId: string;
  onSelectCampus: (campus: CampusItem) => void;
}

export const OnboardingCampusSelector: React.FC<OnboardingCampusSelectorProps> = ({
  selectedCampusId,
  onSelectCampus,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollList}
    >
      {ONBOARDING_CAMPUSES.map((campus) => {
        const isSelected = campus.id === selectedCampusId;
        return (
          <TouchableOpacity
            key={campus.id}
            style={[styles.pill, isSelected && styles.pillActive]}
            activeOpacity={0.8}
            onPress={() => onSelectCampus(campus)}
          >
            <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
              <Ionicons
                name={isSelected ? 'checkmark' : 'location-sharp'}
                size={13}
                color={isSelected ? '#FFFFFF' : '#64748B'}
              />
            </View>
            <View>
              <Text style={[styles.name, isSelected && styles.nameActive]}>
                {campus.name}
              </Text>
              <Text style={[styles.subName, isSelected && styles.subNameActive]}>
                {campus.subName}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollList: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
    paddingRight: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pillActive: {
    backgroundColor: '#F37021',
    borderColor: '#EA580C',
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 15,
  },
  nameActive: {
    color: '#FFFFFF',
  },
  subName: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 12,
  },
  subNameActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default OnboardingCampusSelector;
