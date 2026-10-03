import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ONBOARDING_CAMPUSES } from '../constants/campus.constants';

interface CampusSelectionGridProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CampusSelectionGrid: React.FC<CampusSelectionGridProps> = ({ selectedId, onSelect }) => {
  return (
    <View style={styles.grid}>
      {ONBOARDING_CAMPUSES.map((c) => {
        const active = selectedId === c.id;
        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.card, active && styles.cardActive]}
            activeOpacity={0.8}
            onPress={() => onSelect(c.id)}
          >
            <Text style={[styles.name, active && styles.nameActive]}>{c.name}</Text>
            <Text style={[styles.sub, active && styles.subActive]}>{c.sub}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  card: { width: '31%', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8, alignItems: 'center' },
  cardActive: { backgroundColor: '#FFF7ED', borderColor: '#F27024' },
  name: { fontSize: 11.5, fontWeight: '800', color: '#0F172A' },
  nameActive: { color: '#EA580C' },
  sub: { fontSize: 9.5, color: '#64748B', marginTop: 2, textAlign: 'center' },
  subActive: { color: '#C2410C' },
});

export default CampusSelectionGrid;
