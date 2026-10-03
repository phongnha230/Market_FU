import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthTopBarProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export const AuthTopBar: React.FC<AuthTopBarProps> = ({ onGoBack, onGoHome }) => {
  return (
    <View style={styles.topBackBar}>
      <TouchableOpacity
        style={styles.backBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={onGoBack}
      >
        <Ionicons name="arrow-back" size={24} color="#0F172A" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={onGoHome}
      >
        <Ionicons name="home-outline" size={22} color="#0F172A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
});
