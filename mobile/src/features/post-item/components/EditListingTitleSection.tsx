import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditListingTitleSectionProps {
  title: string;
  onChangeTitle: (title: string) => void;
  isApproved: boolean;
}

export const EditListingTitleSection: React.FC<EditListingTitleSectionProps> = ({
  title,
  onChangeTitle,
  isApproved,
}) => {
  return (
    <>
      <View style={styles.labelWithBadgeRow}>
        <Text style={styles.inputLabel}>Tiêu đề sản phẩm *</Text>
        {isApproved && (
          <View style={styles.fieldLockedBadge}>
            <Ionicons name="lock-closed" size={11} color="#64748B" />
            <Text style={styles.fieldLockedText}>Khóa sau khi duyệt</Text>
          </View>
        )}
      </View>
      <View style={[styles.inputWrap, isApproved && styles.inputWrapDisabled]}>
        <TextInput
          style={[styles.textInput, isApproved && styles.textInputDisabled]}
          value={title}
          onChangeText={onChangeTitle}
          editable={!isApproved}
          placeholder="VD: Màn hình Dell 24 inch IPS..."
          placeholderTextColor="#94A3B8"
        />
      </View>
      {isApproved && (
        <Text style={styles.fieldLockedHint}>
          Tin đã duyệt không được đổi tiêu đề để chống tráo đổi hàng. Bạn có thể sửa giá, tình trạng, điểm hẹn, hashtag.
        </Text>
      )}
    </>
  );
};

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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  inputWrapDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  textInputDisabled: {
    color: '#64748B',
  },
  fieldLockedHint: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 15,
  },
});
