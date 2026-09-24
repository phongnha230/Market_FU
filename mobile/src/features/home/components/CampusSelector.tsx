import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CampusSelectorProps {
  campuses: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const CampusSelector: React.FC<CampusSelectorProps> = ({
  campuses,
  selectedIndex,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {campuses.map((campus, index) => {
        const isActive = selectedIndex === index;
        return (
          <TouchableOpacity
            key={campus}
            style={[styles.tab, isActive && styles.activeTab]}
            activeOpacity={0.8}
            onPress={() => onSelect(index)}
          >
            {isActive && (
              <Ionicons name="location-sharp" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {campus}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#F27024',
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default CampusSelector;
