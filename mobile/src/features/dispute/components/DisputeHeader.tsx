import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface DisputeHeaderProps {
  onGoBack?: () => void;
}

export const DisputeHeader: React.FC<DisputeHeaderProps> = ({ onGoBack }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.btn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => {
          if (onGoBack) {
            onGoBack();
          } else if (navigation && navigation.canGoBack()) {
            navigation.goBack();
          } else if (navigation) {
            navigation.navigate('MainTabs', { screen: 'Home' });
          }
        }}
      >
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </TouchableOpacity>

      <Text style={styles.title}>Khiếu Nại & Trả Hàng</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          style={styles.btn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => navigation && navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Ionicons name="home-outline" size={20} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hotlineBtn}
          onPress={() => Alert.alert('Hotline Trọng tài FPT', '1900 6600 (Nhánh 4 - Hỗ trợ SV)')}
        >
          <Ionicons name="headset-outline" size={13} color="#DC2626" style={{ marginRight: 3 }} />
          <Text style={styles.hotlineText}>Hotline</Text>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  btn: { padding: 4 },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  hotlineBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FEE2E2' },
  hotlineText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
});

export default DisputeHeader;
