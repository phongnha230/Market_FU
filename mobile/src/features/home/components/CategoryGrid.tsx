import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryItem } from '../types/home.types';
import { theme } from '../../../config/theme';

interface CategoryGridProps {
  categories: CategoryItem[];
  onCategoryPress?: (category: CategoryItem) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = React.memo(({
  categories,
  onCategoryPress,
}) => {
  return (
    <View style={styles.grid}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={styles.item}
          activeOpacity={0.75}
          onPress={() => onCategoryPress && onCategoryPress(cat)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={cat.icon as any} size={22} color={theme.colors.neutral.icon} />
          </View>
          <Text style={styles.title} numberOfLines={2}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  item: {
    alignItems: 'center',
    width: '18%',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.neutral.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 10.5,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
  },
});

export default CategoryGrid;
