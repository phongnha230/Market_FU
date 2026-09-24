import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PostImageItem } from '../types/post-item.types';

interface PostImageSectionProps {
  images: PostImageItem[];
  onRemoveImage: (id: string) => void;
  onAddImage?: () => void;
}

export const PostImageSection: React.FC<PostImageSectionProps> = ({
  images,
  onRemoveImage,
  onAddImage,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Hình ảnh thực tế ({images.length}/6)</Text>
        <Text style={styles.hint}>Tối thiểu 1 ảnh</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={onAddImage || (() => Alert.alert('Chọn ảnh', 'Mở thư viện ảnh của thiết bị'))}
        >
          <Ionicons name="camera" size={26} color="#F27024" />
          <Text style={styles.uploadText}>Thêm ảnh</Text>
          <Text style={styles.uploadSub}>Tự động scan AI</Text>
        </TouchableOpacity>

        {images.map((img) => (
          <View key={img.id} style={styles.imageCard}>
            <Image source={img.source} style={styles.image} contentFit="cover" />
            {img.isCover && (
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>Ảnh bìa</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.removeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => onRemoveImage(img.id)}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 14, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13.5, fontWeight: '800', color: '#0F172A' },
  hint: { fontSize: 11, color: '#64748B' },
  imageRow: { flexDirection: 'row' },
  uploadBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F27024',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  uploadText: { fontSize: 11, fontWeight: '700', color: '#F27024', marginTop: 4 },
  uploadSub: { fontSize: 8.5, color: '#EA580C', fontWeight: '500' },
  imageCard: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', marginRight: 10, position: 'relative' },
  image: { width: '100%', height: '100%' },
  coverBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: '#059669', paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4 },
  coverBadgeText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '800' },
  removeBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(15, 23, 42, 0.7)', alignItems: 'center', justifyContent: 'center' },
});

export default PostImageSection;
