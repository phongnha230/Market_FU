import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ListRenderItemInfo } from 'react-native';

interface AiAssistantQuickPromptsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export const AiAssistantQuickPrompts: React.FC<AiAssistantQuickPromptsProps> = ({
  prompts,
  onSelectPrompt,
}) => {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<string>) => (
      <TouchableOpacity
        style={styles.quickPromptChip}
        activeOpacity={0.75}
        onPress={() => onSelectPrompt(item)}
      >
        <Text style={styles.quickPromptText}>{item}</Text>
      </TouchableOpacity>
    ),
    [onSelectPrompt]
  );

  return (
    <View style={styles.quickPromptsContainer}>
      <FlatList
        horizontal
        data={prompts}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickPromptsScroll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  quickPromptsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickPromptText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
});
