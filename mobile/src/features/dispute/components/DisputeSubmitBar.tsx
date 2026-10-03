import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DisputeSubmitBarProps {
  onSubmit: () => void;
}

export const DisputeSubmitBar: React.FC<DisputeSubmitBarProps> = ({ onSubmit }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.note}>
        Bằng việc gửi khiếu nại, bạn đồng ý tuân thủ phán quyết từ Trọng tài Sinh viên FPT.
      </Text>
      <TouchableOpacity
        style={styles.btn}
        activeOpacity={0.88}
        onPress={onSubmit}
      >
        <Text style={styles.btnText}>Gửi yêu cầu khiếu nại & hoàn tiền</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  note: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginBottom: 8 },
  btn: {
    backgroundColor: '#DC2626',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
});

export default DisputeSubmitBar;
