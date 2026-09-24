import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostCategory, PostCondition } from '../types/post-item.types';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from '../constants/post-item.constants';

interface PostCategoryConditionSectionProps {
  selectedCategory: PostCategory;
  onSelectCategory: (cat: PostCategory) => void;
  selectedCondition: PostCondition;
  onSelectCondition: (cond: PostCondition) => void;
}

export const PostCategoryConditionSection: React.FC<PostCategoryConditionSectionProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Category */}
      <Text style={styles.label}>Danh mục sản phẩm</Text>
      <View style={styles.categoryGrid}>
        {CATEGORY_OPTIONS.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catCard, active && styles.catCardActive]}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(cat.id)}
            >
              <Ionicons name={cat.icon as any} size={18} color={active ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.catText, active && styles.catTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Condition */}
      <Text style={[styles.label, { marginTop: 14 }]}>Tình trạng món đồ</Text>
      <View style={styles.conditionRow}>
        {CONDITION_OPTIONS.map((cond) => {
          const active = selectedCondition === cond.id;
          return (
            <TouchableOpacity
              key={cond.id}
              style={[styles.condCard, active && styles.condCardActive]}
              activeOpacity={0.8}
              onPress={() => onSelectCondition(cond.id)}
            >
              <Text style={[styles.condLabel, active && styles.condLabelActive]}>{cond.label}</Text>
              <Text style={[styles.condSub, active && styles.condSubActive]}>{cond.sub}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: { width: '48%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  catCardActive: { backgroundColor: '#F27024', borderColor: '#F27024' },
  catText: { fontSize: 11.5, fontWeight: '700', color: '#334155', marginLeft: 8 },
  catTextActive: { color: '#FFFFFF' },
  conditionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  condCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 10, marginHorizontal: 3, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  condCardActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  condLabel: { fontSize: 11, fontWeight: '800', color: '#334155', textAlign: 'center' },
  condLabelActive: { color: '#1D4ED8' },
  condSub: { fontSize: 8.5, color: '#64748B', marginTop: 2, textAlign: 'center' },
  condSubActive: { color: '#2563EB' },
});

export default PostCategoryConditionSection;
