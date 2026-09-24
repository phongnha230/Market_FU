import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PostItemHeaderProps {
  onGoBack?: () => void;
}

export const PostItemHeader: React.FC<PostItemHeaderProps> = ({ onGoBack }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.btn}
        onPress={onGoBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#0F172A" />
      </TouchableOpacity>

      <Text style={styles.title}>Đăng bán món đồ</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => Alert.alert('Hộp thư tin nhắn')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="mail-outline" size={22} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={onGoBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>
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
  btn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  actions: { flexDirection: 'row', alignItems: 'center' },
});

export default PostItemHeader;
