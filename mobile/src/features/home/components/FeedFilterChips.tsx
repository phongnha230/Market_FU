import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FeedFilterChipsProps {
  filters: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const FeedFilterChips: React.FC<FeedFilterChipsProps> = ({
  filters,
  selectedIndex,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((chip, index) => {
        const isActive = selectedIndex === index;
        return (
          <TouchableOpacity
            key={chip}
            style={[styles.chip, isActive && styles.activeChip]}
            activeOpacity={0.8}
            onPress={() => onSelect(index)}
          >
            <Text style={[styles.chipText, isActive && styles.activeChipText]}>
              {chip}
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
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#475569',
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
});

export default FeedFilterChips;
