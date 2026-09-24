import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { EvidenceItem } from '../types/dispute.types';

interface DisputeEvidenceSectionProps {
  evidenceList: EvidenceItem[];
  onRemoveEvidence: (id: string) => void;
}

export const DisputeEvidenceSection: React.FC<DisputeEvidenceSectionProps> = ({
  evidenceList,
  onRemoveEvidence,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bằng chứng hình ảnh / video ({evidenceList.length})</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Thêm bằng chứng', 'Tải lên video unbox hoặc ảnh chụp lỗi')}
        >
          <Ionicons name="camera" size={22} color="#F27024" />
          <Text style={styles.addText}>Thêm tệp</Text>
        </TouchableOpacity>

        {evidenceList.map((item) => (
          <View key={item.id} style={styles.thumbBox}>
            <Image source={item.source} style={styles.image} contentFit="cover" />
            {item.isVideo && (
              <View style={styles.videoBadge}>
                <Ionicons name="play" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
                <Text style={styles.videoText}>{item.duration}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.removeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => onRemoveEvidence(item.id)}
            >
              <Ionicons name="close" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 14, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  row: { flexDirection: 'row' },
  addBtn: { width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#F27024', backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  addText: { fontSize: 10, fontWeight: '700', color: '#F27024', marginTop: 2 },
  thumbBox: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', marginRight: 10, position: 'relative' },
  image: { width: '100%', height: '100%' },
  videoBadge: { position: 'absolute', bottom: 4, left: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  videoText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },
  removeBtn: { position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
});

export default DisputeEvidenceSection;
