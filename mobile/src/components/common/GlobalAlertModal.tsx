import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlertStore, AlertButton, AlertType } from '../../stores/alertStore';

export const GlobalAlertModal: React.FC = () => {
  const { visible, title, message, buttons, options, type, hideAlert } = useAlertStore();

  if (!visible) return null;

  const handleButtonPress = (btn: AlertButton) => {
    hideAlert();
    if (btn.onPress) {
      setTimeout(() => {
        btn.onPress?.();
      }, 100);
    }
  };

  const handleBackdropPress = () => {
    if (options?.cancelable !== false) {
      hideAlert();
      options?.onDismiss?.();
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Ionicons name="checkmark-circle" size={32} color="#059669" />
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Ionicons name="close-circle" size={32} color="#DC2626" />
          </View>
        );
      case 'warning':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <Ionicons name="alert-circle" size={32} color="#EA580C" />
          </View>
        );
      case 'confirm':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <Ionicons name="help-circle" size={32} color="#EA580C" />
          </View>
        );
      case 'info':
      default:
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Ionicons name="information-circle" size={32} color="#2563EB" />
          </View>
        );
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.card}>
              {/* Header Icon */}
              {renderIcon()}

              {/* Title & Message */}
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>

              {!!message && (
                <Text style={styles.message}>
                  {message}
                </Text>
              )}

              {/* Action Buttons */}
              <View style={[styles.buttonRow, buttons.length > 2 && styles.buttonCol]}>
                {buttons.map((btn, index) => {
                  const isCancel = btn.style === 'cancel' || (buttons.length === 2 && index === 0);
                  const isDestructive = btn.style === 'destructive';

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        isCancel ? styles.cancelButton : isDestructive ? styles.destructiveButton : styles.primaryButton,
                        buttons.length === 2 && { flex: 1 },
                      ]}
                      activeOpacity={0.82}
                      onPress={() => handleButtonPress(btn)}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isCancel ? styles.cancelButtonText : styles.primaryButtonText,
                        ]}
                        numberOfLines={1}
                      >
                        {btn.text || 'Xác nhận'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  message: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  buttonCol: {
    flexDirection: 'column',
  },
  button: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  destructiveButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#64748B',
  },
});

export default GlobalAlertModal;
