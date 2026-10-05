import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../stores/useAuthStore';
import { authMobileService } from '../../../services/authMobileService';

import { useNavigation } from '@react-navigation/native';

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

const DEFAULT_PRODUCT: ChatAuthProductInfo = {
  title: 'Sản phẩm trao đổi',
  price: 'Liên hệ',
  location: 'Khuôn viên FPT',
};

export const ContextualChatAuthModal: React.FC<ContextualChatAuthModalProps> = ({
  visible,
  onClose,
  onLoginSuccess,
  sellerName = 'Người bán FPT',
  sellerCohort = 'Sinh viên FPT',
  product = DEFAULT_PRODUCT,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { setAuth } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      const res = await authMobileService.loginWithGoogle(
        'student@fpt.edu.vn',
        'HOL'
      );
      if (res.user && res.token) {
        setAuth(res.user, res.token);
        if (onLoginSuccess) {
          onLoginSuccess('google');
        } else {
          onClose();
        }
        return;
      }
    } catch {
      // Chuyển hướng sang màn hình đăng nhập chính thức
      onClose();
      navigation.navigate('Login');
    }
  };

  const handleFapLogin = () => {
    onClose();
    navigation.navigate('Login');
  };

  const displayTitle = product.title || DEFAULT_PRODUCT.title!;
  const displayPrice = product.price || DEFAULT_PRODUCT.price!;
  const displayLocation = product.location || DEFAULT_PRODUCT.location!;
  const displayImage = product.image || DEFAULT_PRODUCT.image;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}
        >
          {/* Top Tag Row & Close Button */}
          <View style={styles.topStatusRow}>
            <View style={styles.securityTagRow}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.securityTagText}>
                TRÒ CHUYỆN BẢO MẬT 5CAMPUS
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.7}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Seller & Icon Header */}
          <View style={styles.sellerHeaderRow}>
            {/* Chat Icon with Verified Badge */}
            <View style={styles.chatIconBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={26} color="#0F172A" />
              <View style={styles.verifiedCheckBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#059669" />
              </View>
            </View>

            {/* Title & Verified Info */}
            <View style={styles.sellerTextCol}>
              <Text style={styles.chatHeadingTitle}>
                Đăng nhập để chat với Người bán{'\n'}
                <Text style={styles.sellerHighlightName}>({sellerName} - {sellerCohort})</Text>
              </Text>
              <View style={styles.fptVerifiedBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color="#059669"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.fptVerifiedText}>FPT STUDENT VERIFIED</Text>
              </View>
            </View>
          </View>

          {/* Subtitle Description */}
          <Text style={styles.sheetDescription}>
            Hệ thống tin nhắn 5Campus kết nối trực tiếp sinh viên nội bộ và hỗ trợ gửi vị trí trạm <Text style={styles.boldText}>Safe-Handoff</Text> an toàn. Vui lòng đăng nhập để trao đổi đồ.
          </Text>

          {/* Product Preview Card */}
          <View style={styles.productCard}>
            <Image
              source={displayImage}
              style={styles.productThumb}
              contentFit="cover"
            />
            <View style={styles.productInfoCol}>
              <View style={styles.productTitleRow}>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {displayTitle}
                </Text>
                <Text style={styles.productPrice}>{displayPrice}</Text>
              </View>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color="#64748B"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {displayLocation}
                </Text>
              </View>
            </View>
          </View>

          {/* CTA 1: Google SSO (@fpt.edu.vn) */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.88}
            onPress={handleGoogleLogin}
          >
            <View style={styles.googleIconCircle}>
              <Text style={styles.googleGLetter}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>
              Đăng nhập với FPT Mail (@fpt.edu.vn)
            </Text>
          </TouchableOpacity>

          {/* CTA 2: FAP / MSSV */}
          <TouchableOpacity
            style={styles.fapBtn}
            activeOpacity={0.85}
            onPress={handleFapLogin}
          >
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={19}
              color="#1E40AF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.fapBtnText}>Dùng MSSV & Mật khẩu FAP</Text>
          </TouchableOpacity>

          {/* AI Safety Banner */}
          <View style={styles.aiSafetyBox}>
            <MaterialCommunityIcons
              name="robot-happy-outline"
              size={20}
              color="#059669"
              style={{ marginRight: 8, marginTop: 1 }}
            />
            <Text style={styles.aiSafetyText}>
              Tin nhắn trong sàn được bảo chứng và có <Text style={styles.boldAiText}>Trợ lý AI</Text> phát hiện cảnh báo link lừa đảo ngoài campus.
            </Text>
          </View>

          {/* Link Button: Để sau, xem tiếp sản phẩm */}
          <TouchableOpacity
            style={styles.laterLinkBtn}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.laterLinkText}>Để sau, xem tiếp sản phẩm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ContextualChatAuthModal;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  // Top Status Row
  topStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  securityTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  securityTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Seller Header Row
  sellerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  chatIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sellerTextCol: {
    flex: 1,
  },
  chatHeadingTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 4,
  },
  sellerHighlightName: {
    color: '#0F172A',
    fontWeight: '800',
  },
  fptVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fptVerifiedText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.2,
  },

  // Description
  sheetDescription: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },

  // Product Card
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
  },
  productThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  productInfoCol: {
    flex: 1,
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 11.5,
    color: '#64748B',
  },

  // Google SSO Button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9A3412',
    borderRadius: 14,
    height: 48,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#9A3412',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  googleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleGLetter: {
    fontSize: 13,
    fontWeight: '900',
    color: '#9A3412',
  },
  googleBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // FAP Button
  fapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    height: 48,
    marginBottom: 12,
  },
  fapBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },

  // AI Safety Box
  aiSafetyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    padding: 12,
    marginBottom: 12,
  },
  aiSafetyText: {
    flex: 1,
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16.5,
  },
  boldAiText: {
    fontWeight: '800',
    color: '#047857',
  },

  // Later Link
  laterLinkBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  laterLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
