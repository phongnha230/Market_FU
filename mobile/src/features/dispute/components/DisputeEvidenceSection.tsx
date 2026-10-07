import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ListRenderItem } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { EvidenceItem } from '../types/dispute.types';

interface EvidenceThumbnailProps {
  item: EvidenceItem;
  onRemove: (id: string) => void;
}

const EvidenceThumbnail: React.FC<EvidenceThumbnailProps> = React.memo(({ item, onRemove }) => {
  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  return (
    <View style={styles.thumbBox}>
      <Image source={item.source} style={styles.image} contentFit="cover" />
      {item.isVideo && (
        <View style={styles.videoBadge}>
          <Ionicons name="play" size={10} color="#FFFFFF" style={styles.playIcon} />
          <Text style={styles.videoText}>{item.duration}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.removeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={handleRemove}
      >
        <Ionicons name="close" size={12} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
});

interface DisputeEvidenceSectionProps {
  evidenceList: EvidenceItem[];
  onRemoveEvidence: (id: string) => void;
  onAddEvidence?: () => void;
}

export const DisputeEvidenceSection: React.FC<DisputeEvidenceSectionProps> = ({
  evidenceList,
  onRemoveEvidence,
  onAddEvidence,
}) => {
  const handleAddPress = useCallback(() => {
    if (onAddEvidence) {
      onAddEvidence();
    } else {
      Alert.alert('Thêm bằng chứng', 'Tải lên video unbox hoặc ảnh chụp lỗi');
    }
  }, [onAddEvidence]);

  const renderHeader = useCallback(() => (
    <TouchableOpacity
      style={styles.addBtn}
      activeOpacity={0.8}
      onPress={handleAddPress}
    >
      <Ionicons name="camera" size={22} color="#F27024" />
      <Text style={styles.addText}>Thêm tệp</Text>
    </TouchableOpacity>
  ), [handleAddPress]);

  const renderItem: ListRenderItem<EvidenceItem> = useCallback(
    ({ item }) => <EvidenceThumbnail item={item} onRemove={onRemoveEvidence} />,
    [onRemoveEvidence]
  );

  const keyExtractor = useCallback((item: EvidenceItem) => item.id, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bằng chứng hình ảnh / video ({evidenceList.length})</Text>
      <FlatList<EvidenceItem>
        horizontal
        showsHorizontalScrollIndicator={false}
        data={evidenceList}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        contentContainerStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 14, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#F27024', backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  addText: { fontSize: 10, fontWeight: '700', color: '#F27024', marginTop: 2 },
  thumbBox: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', marginRight: 10, position: 'relative' },
  image: { width: '100%', height: '100%' },
  videoBadge: { position: 'absolute', bottom: 4, left: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  playIcon: { marginRight: 2 },
  videoText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },
  removeBtn: { position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
});

export default DisputeEvidenceSection;
