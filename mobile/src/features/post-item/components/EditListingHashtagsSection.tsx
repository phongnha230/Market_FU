import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditListingHashtagsSectionProps {
  hashtags: string[];
  onChangeHashtags: (tags: string[]) => void;
}

const QUICK_SUGGESTIONS = ['giare', 'moi99', 'k18', 'k19', 'passnhanh', 'fixnhe', 'vovinam', 'ktx', 'freeship'];

interface SuggestionChipProps {
  sug: string;
  onPress: (sug: string) => void;
}

const SuggestionChip: React.FC<SuggestionChipProps> = React.memo(({ sug, onPress }) => {
  const handlePress = useCallback(() => onPress(sug), [sug, onPress]);
  return (
    <TouchableOpacity
      style={styles.quickSuggestChip}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.quickSuggestChipText}>+#{sug}</Text>
    </TouchableOpacity>
  );
});

interface HashtagChipProps {
  tag: string;
  onRemove: (tag: string) => void;
}

const HashtagChip: React.FC<HashtagChipProps> = React.memo(({ tag, onRemove }) => {
  const handleRemove = useCallback(() => onRemove(tag), [tag, onRemove]);
  return (
    <View style={styles.hashtagChip}>
      <Text style={styles.hashtagChipText}>#{tag}</Text>
      <TouchableOpacity
        onPress={handleRemove}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={styles.hashtagRemoveBtn}
      >
        <Ionicons name="close-circle" size={15} color="#EA580C" />
      </TouchableOpacity>
    </View>
  );
});

const HashtagLabelHeader: React.FC<{ count: number }> = React.memo(({ count }) => (
  <View style={styles.labelWithBadgeRow}>
    <Text style={styles.inputLabel}>Thẻ Hashtag tìm kiếm ({count}/8)</Text>
    <Text style={styles.hashtagSubHint}>Meilisearch</Text>
  </View>
));

const HashtagInputField: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}> = React.memo(({ value, onChangeText, onSubmit }) => (
  <View style={styles.hashtagInputRow}>
    <View style={styles.hashtagInputWrap}>
      <Text style={styles.hashPrefix}>#</Text>
      <TextInput
        style={styles.hashtagTextInput}
        value={value}
        onChangeText={onChangeText}
        placeholder="Nhập hashtag (vd: banphim, k18, giare)..."
        placeholderTextColor="#94A3B8"
        onSubmitEditing={onSubmit}
        returnKeyType="done"
      />
    </View>
    <TouchableOpacity
      style={[styles.addHashBtn, !value.trim() && styles.addHashBtnDisabled]}
      onPress={onSubmit}
      disabled={!value.trim()}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={18} color="#FFFFFF" />
      <Text style={styles.addHashBtnText}>Thêm</Text>
    </TouchableOpacity>
  </View>
));

export const EditListingHashtagsSection: React.FC<EditListingHashtagsSectionProps> = React.memo(({
  hashtags,
  onChangeHashtags,
}) => {
  const [hashtagInput, setHashtagInput] = useState('');
  const hashtagSet = useMemo(() => new Set(hashtags), [hashtags]);

  const handleAddHashtag = useCallback((tagToAdd?: string) => {
    const rawTag = (tagToAdd !== undefined ? tagToAdd : hashtagInput)
      .replace(/^#+/, '')
      .replace(/[,\s]/g, '')
      .trim()
      .toLowerCase();

    if (!rawTag) return;
    if (hashtags.length >= 8) {
      Alert.alert('Giới hạn hashtag', 'Mỗi bài đăng có tối đa 8 hashtag để tối ưu tìm kiếm Meilisearch.');
      return;
    }
    if (!hashtagSet.has(rawTag)) {
      onChangeHashtags([...hashtags, rawTag]);
    }
    setHashtagInput('');
  }, [hashtagInput, hashtags, hashtagSet, onChangeHashtags]);

  const handleRemoveHashtag = useCallback((tagToRemove: string) => {
    onChangeHashtags(hashtags.filter((t) => t !== tagToRemove));
  }, [hashtags, onChangeHashtags]);

  const availableSuggestions = useMemo(
    () => QUICK_SUGGESTIONS.filter((s) => !hashtagSet.has(s)),
    [hashtagSet]
  );

  const renderSuggestionItem = useCallback(({ item }: { item: string }) => (
    <SuggestionChip sug={item} onPress={handleAddHashtag} />
  ), [handleAddHashtag]);

  const keyExtractor = useCallback((item: string) => item, []);

  return (
    <View>
      <HashtagLabelHeader count={hashtags.length} />
      <HashtagInputField
        value={hashtagInput}
        onChangeText={setHashtagInput}
        onSubmit={handleAddHashtag}
      />

      {hashtags.length > 0 && (
        <View style={styles.hashtagTagsWrap}>
          {hashtags.map((tag) => (
            <HashtagChip key={tag} tag={tag} onRemove={handleRemoveHashtag} />
          ))}
        </View>
      )}

      {/* Gợi ý nhanh */}
      <View style={styles.quickSuggestRow}>
        <Text style={styles.quickSuggestLabel}>Gợi ý:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickSuggestScroll}
          data={availableSuggestions}
          keyExtractor={keyExtractor}
          renderItem={renderSuggestionItem}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  labelWithBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  hashtagSubHint: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
  },
  hashtagInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  hashtagInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  hashPrefix: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
    marginRight: 4,
  },
  hashtagTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  addHashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  addHashBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  addHashBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hashtagTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  hashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  hashtagChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  hashtagRemoveBtn: {
    padding: 1,
  },
  quickSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  quickSuggestLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  quickSuggestScroll: {
    gap: 6,
  },
  quickSuggestChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickSuggestChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
});
