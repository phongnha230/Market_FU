import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryItem } from '../types/home.types';

interface CategoryGridProps {
  categories: CategoryItem[];
  onCategoryPress?: (category: CategoryItem) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryPress,
}) => {
  return (
    <View style={styles.grid}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={styles.item}
          activeOpacity={0.8}
          onPress={() => onCategoryPress && onCategoryPress(cat)}
        >
          <View style={[styles.iconCircle, { backgroundColor: cat.color }]}>
            {cat.badge && (
              <View style={[styles.badge, { backgroundColor: cat.badgeColor }]}>
                <Text style={styles.badgeText}>{cat.badge}</Text>
              </View>
            )}
            <Ionicons name={cat.icon as any} size={24} color={cat.iconColor} />
          </View>
          <Text style={styles.title}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  item: {
    alignItems: 'center',
    width: '18%',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    zIndex: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 13,
  },
});

export default CategoryGrid;
