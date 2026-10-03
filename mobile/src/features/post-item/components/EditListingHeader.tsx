import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditListingHeaderProps {
  onBack: () => void;
  onDelete: () => void;
}

export const EditListingHeader: React.FC<EditListingHeaderProps> = ({
  onBack,
  onDelete,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chỉnh Sửa Tin Đăng</Text>
      <TouchableOpacity
        style={styles.deleteHeaderBtn}
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16.5, fontWeight: '800', color: '#0F172A' },
  deleteHeaderBtn: { padding: 4 },
});
