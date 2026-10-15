import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SpecItem } from '../types/product-detail.types';

interface ProductSpecSectionProps {
  specs: SpecItem[];
  description: string;
}

export const ProductSpecSection: React.FC<ProductSpecSectionProps> = React.memo(({ specs, description }) => {
  return (
    <View style={styles.container}>
      {specs && specs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Thông số & Tình trạng chi tiết</Text>
          <View style={styles.grid}>
            {specs.map((item) => (
              <View key={item.label} style={styles.specBox}>
                <Text style={styles.specLabel}>{item.label}</Text>
                <Text style={styles.specValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={[styles.sectionTitle, specs && specs.length > 0 ? { marginTop: 14 } : null]}>
        Mô tả của người bán
      </Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 13.5, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  specBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specLabel: { fontSize: 9.5, fontWeight: '800', color: '#64748B', marginBottom: 3 },
  specValue: { fontSize: 11.5, fontWeight: '700', color: '#0F172A', lineHeight: 16 },
  description: { fontSize: 12.5, color: '#334155', lineHeight: 19 },
});

export default ProductSpecSection;
