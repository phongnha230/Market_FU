import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TITLE_SUGGESTIONS } from '../constants/post-item.constants';

interface PostTitleSectionProps {
  title: string;
  onChangeTitle: (text: string) => void;
  onApplySuggestion: (text: string) => void;
}

export const PostTitleSection: React.FC<PostTitleSectionProps> = ({
  title,
  onChangeTitle,
  onApplySuggestion,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên món đồ / Tiêu đề tin</Text>
      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Ví dụ: Bàn phím cơ Akko, Sách MAS291..."
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
        <Text style={styles.hint}>Gợi ý nhanh:</Text>
        {TITLE_SUGGESTIONS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => onApplySuggestion(tag)}
          >
            <Text style={styles.chipText}>+ {tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  hint: { fontSize: 11, color: '#64748B', marginRight: 6, fontWeight: '500' },
  chip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  chipText: { fontSize: 10.5, fontWeight: '700', color: '#2563EB' },
});

export default PostTitleSection;
