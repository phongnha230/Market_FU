import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface VoucherHeaderProps {
  onGoBack?: () => void;
}

export const VoucherHeader: React.FC<VoucherHeaderProps> = ({ onGoBack }) => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.btn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={handleBack}
      >
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </TouchableOpacity>

      <Text style={styles.title}>Kho Voucher & Đổi Thưởng</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <TouchableOpacity
          style={styles.btn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => navigation && navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Ionicons name="home-outline" size={20} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => Alert.alert('Lịch sử', 'Xem lịch sử dùng voucher')}
        >
          <Ionicons name="receipt-outline" size={20} color="#0F172A" />
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
});

export default VoucherHeader;
