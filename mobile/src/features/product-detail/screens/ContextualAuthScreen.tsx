import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ContextualAuthModal, { ContextualProductInfo } from '../components/ContextualAuthModal';

export const ContextualAuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product: ContextualProductInfo | undefined = route.params?.product;

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSuccess = (method: 'google' | 'fap') => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ContextualAuthModal
        visible={true}
        onClose={handleClose}
        onLoginSuccess={handleSuccess}
        product={product}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ContextualAuthScreen;
