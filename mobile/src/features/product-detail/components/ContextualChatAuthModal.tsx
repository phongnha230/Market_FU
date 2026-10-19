import React from 'react';
import ContextualAuthModal, {
  ContextualAuthModalProps,
  ContextualProductInfo,
} from './ContextualAuthModal';

export interface ChatAuthProductInfo {
  title?: string;
  price?: string;
  location?: string;
  image?: any;
}

export interface ContextualChatAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: (method: 'google' | 'fap') => void;
  sellerName?: string;
  sellerCohort?: string;
  product?: ChatAuthProductInfo;
}

export const ContextualChatAuthModal: React.FC<ContextualChatAuthModalProps> = ({
  visible,
  onClose,
  onLoginSuccess,
  sellerName,
  sellerCohort,
  product,
}) => {
  const adaptedProduct: ContextualProductInfo | undefined = product
    ? {
        title: product.title,
        price: product.price,
        sellerLocation: product.location,
        image: product.image,
      }
    : undefined;

  return (
    <ContextualAuthModal
      visible={visible}
      onClose={onClose}
      onLoginSuccess={onLoginSuccess}
      mode="chat"
      sellerName={sellerName}
      sellerCohort={sellerCohort}
      product={adaptedProduct}
    />
  );
};

export default ContextualChatAuthModal;
