import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return (
    <View style={[styles.badge, { width: size + 10, height: size + 10, borderRadius: (size + 10) / 2 }]}>
      <Ionicons name="logo-google" size={size} color="#EA4335" />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});
