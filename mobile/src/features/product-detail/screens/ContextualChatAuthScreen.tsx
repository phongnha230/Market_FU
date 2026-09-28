import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ContextualChatAuthModal, { ChatAuthProductInfo } from '../components/ContextualChatAuthModal';

export const ContextualChatAuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product: ChatAuthProductInfo | undefined = route.params?.product;
  const sellerName: string | undefined = route.params?.sellerName;
  const sellerCohort: string | undefined = route.params?.sellerCohort;

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSuccess = (method: 'google' | 'fap') => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ContextualChatAuthModal
        visible={true}
        onClose={handleClose}
        onLoginSuccess={handleSuccess}
        sellerName={sellerName}
        sellerCohort={sellerCohort}
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

export default ContextualChatAuthScreen;
