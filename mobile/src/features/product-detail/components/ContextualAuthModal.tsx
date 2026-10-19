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

export interface ContextualProductInfo {
  title?: string;
  price?: string;
  sellerName?: string;
  sellerLocation?: string;
  image?: any;
}

export interface ContextualAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: (method: 'google' | 'fap') => void;
  product?: ContextualProductInfo;
  mode?: 'order' | 'chat';
  sellerName?: string;
  sellerCohort?: string;
}

const DEFAULT_PRODUCT: ContextualProductInfo = {
  title: 'Sản phẩm chợ FPT',
  price: 'Liên hệ',
  sellerName: 'Người bán FPT',
  sellerLocation: 'Cơ sở FPT',
};

export const ContextualAuthModal: React.FC<ContextualAuthModalProps> = ({
  visible,
  onClose,
  onLoginSuccess,
  product = DEFAULT_PRODUCT,
  mode = 'order',
  sellerName,
  sellerCohort,
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
  const sellerText = `${product.sellerName || DEFAULT_PRODUCT.sellerName} (${product.sellerLocation || DEFAULT_PRODUCT.sellerLocation})`;
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
        {/* Backdrop clickable */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Bottom Sheet Container */}
        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}
        >
          {mode === 'chat' ? (
            <>
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
                <View style={styles.chatIconBox}>
                  <Ionicons name="chatbubble-ellipses-outline" size={26} color="#0F172A" />
                  <View style={styles.verifiedCheckBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#059669" />
                  </View>
                </View>

                <View style={styles.sellerTextCol}>
                  <Text style={styles.chatHeadingTitle}>
                    Đăng nhập để chat với Người bán{'\n'}
                    <Text style={styles.sellerHighlightName}>({sellerName || product.sellerName || 'Người bán FPT'} - {sellerCohort || 'Sinh viên FPT'})</Text>
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
            </>
          ) : (
            <>
              {/* Top Handle Bar */}
              <View style={styles.handleBar} />

              {/* Heading Title */}
              <Text style={styles.sheetTitle}>
                Tiếp tục đặt hàng với Bảo hộ{'\n'}Escrow
              </Text>

              {/* Context Subtitle */}
              <Text style={styles.sheetSubtitle}>
                Để bảo vệ tiền cọc 100% trong quỹ tạm giữ và xác thực nhận đồ an toàn tại campus, bạn vui lòng đăng nhập bằng tài khoản sinh viên FPT.
              </Text>
            </>
          )}

          {/* Product Summary Card */}
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
              <View style={styles.sellerRow}>
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={14}
                  color="#64748B"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.sellerText} numberOfLines={1}>
                  {sellerText}
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Button 1: Google SSO */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.88}
            onPress={handleGoogleLogin}
          >
            <View style={styles.googleIconCircle}>
              <Text style={styles.googleGLetter}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>
              Đăng nhập nhanh qua Google (@fpt.edu.vn)
            </Text>
          </TouchableOpacity>

          {/* CTA Button 2: FAP / MSSV */}
          <TouchableOpacity
            style={styles.fapBtn}
            activeOpacity={0.85}
            onPress={handleFapLogin}
          >
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={20}
              color="#1E40AF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.fapBtnText}>
              Đăng nhập tài khoản FAP / MSSV
            </Text>
          </TouchableOpacity>

          {/* Campus Member Benefits Box */}
          <View style={styles.perksBox}>
            <View style={styles.perksHeaderRow}>
              <Ionicons
                name="star"
                size={14}
                color="#059669"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.perksHeaderTitle}>
                Đặc quyền đăng nhập thành viên Campus:
              </Text>
            </View>

            <View style={styles.perkItemRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#059669"
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text style={styles.perkItemText}>
                Tặng Voucher Chào Tân SV (Giảm 15k ship liên KTX)
              </Text>
            </View>

            <View style={[styles.perkItemRow, { marginTop: 6 }]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#059669"
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text style={styles.perkItemText}>
                Tích lũy Trust Score & FPT Campus Coins mỗi đơn
              </Text>
            </View>
          </View>

          {/* Link Button: Tiếp tục xem đồ khác (Khách) */}
          <TouchableOpacity
            style={styles.guestLinkBtn}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.guestLinkText}>Tiếp tục xem đồ khác (Khách)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ContextualAuthModal;

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
    paddingTop: 12,
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
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },

  // Product Preview Card
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
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
    color: '#EA580C',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerText: {
    flex: 1,
    fontSize: 11.5,
    color: '#64748B',
  },

  // Google SSO Button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 14,
    height: 48,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
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
    color: '#EA580C',
  },
  googleBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // FAP / MSSV Button
  fapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    height: 48,
    marginBottom: 14,
  },
  fapBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },

  // Perks Box
  perksBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 12,
    marginBottom: 14,
  },
  perksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  perksHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  perkItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  perkItemText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },

  // Chat Mode Styles
  topStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  securityTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  securityTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 1,
  },
  sellerTextCol: {
    flex: 1,
  },
  chatHeadingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 3,
  },
  sellerHighlightName: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 13,
  },
  fptVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fptVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  sheetDescription: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },

  // Guest Link
  guestLinkBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  guestLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
