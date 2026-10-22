import React from 'react';
import { Image, StyleSheet, ImageStyle } from 'react-native';

export const GoogleIcon: React.FC<{ size?: number; style?: ImageStyle }> = ({
  size = 20,
  style,
}) => {
  return (
    <Image
      source={require('../../../../assets/images/google_logo.png')}
      style={[styles.icon, { width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
});

