import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LISTING_CATEGORIES } from '../constants/editListingConstants';

interface EditListingCategorySectionProps {
  category: string;
  onChangeCategory: (category: string) => void;
  isApproved: boolean;
}

export const EditListingCategorySection: React.FC<EditListingCategorySectionProps> = memo(({
  category,
  onChangeCategory,
  isApproved,
}) => {
  const handleSelectCategory = (categoryId: string) => {
    if (isApproved && category !== categoryId) {
      Alert.alert(
        'Không thể đổi danh mục',
        'Tin đăng đã được duyệt không thể thay đổi danh mục để đảm bảo an toàn kiểm duyệt.'
      );
      return;
    }
    onChangeCategory(categoryId);
  };

  return (
    <>
      <View style={styles.labelWithBadgeRow}>
        <Text style={styles.inputLabel}>Danh mục sản phẩm</Text>
        {isApproved && (
          <View style={styles.fieldLockedBadge}>
            <Ionicons name="lock-closed" size={11} color="#64748B" />
            <Text style={styles.fieldLockedText}>Khóa sau khi duyệt</Text>
          </View>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={styles.categoryRow}>
          {LISTING_CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.categoryChip,
                category === c.id && styles.categoryChipActive,
                isApproved && category !== c.id && { opacity: 0.4 },
              ]}
              onPress={() => handleSelectCategory(c.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === c.id && styles.categoryChipTextActive,
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
});

const styles = StyleSheet.create({
  labelWithBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  fieldLockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLockedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
});
