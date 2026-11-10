import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';

interface HomeSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onAiPress?: () => void;
  onFilterPress?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  value,
  onChangeText,
  onAiPress,
  onFilterPress,
  onSubmitEditing,
  autoFocus = false,
  placeholder = 'Tìm kiếm Meilisearch, #hashtag...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={theme.colors.primary} style={styles.searchIcon} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.muted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onChangeText('')}
            style={{ marginRight: 6 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.text.muted} />
          </TouchableOpacity>
        )}
        {onAiPress && (
          <TouchableOpacity
            style={styles.aiButton}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            onPress={onAiPress}
          >
            <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
            <Text style={styles.aiButtonText}>Hỏi AI</Text>
          </TouchableOpacity>
        )}
      </View>

      {onFilterPress && (
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onFilterPress}
        >
          <Ionicons name="options-outline" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  aiButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.neutral.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default HomeSearchBar;
