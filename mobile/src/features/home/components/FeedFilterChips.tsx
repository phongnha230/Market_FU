import React, { useCallback } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const isActive = selectedIndex === index;
      return (
        <TouchableOpacity
          style={[styles.chip, isActive && styles.activeChip]}
          activeOpacity={0.8}
          onPress={() => onSelect(index)}
        >
          <Text style={[styles.chipText, isActive && styles.activeChipText]}>
            {item}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedIndex, onSelect]
  );

  return (
    <FlatList
      horizontal
      data={filters}
      keyExtractor={(item) => item}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
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
