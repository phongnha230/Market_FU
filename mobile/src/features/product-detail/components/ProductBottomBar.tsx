import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductBottomBarProps {
  isSameCampus: boolean;
  onChat: () => void;
  onMakeOffer: () => void;
  onBuyNow: () => void;
  isOwnProduct?: boolean;
  onManageOwnProduct?: () => void;
}

export const ProductBottomBar: React.FC<ProductBottomBarProps> = ({
  isSameCampus,
  onChat,
  onMakeOffer,
  onBuyNow,
  isOwnProduct,
  onManageOwnProduct,
}) => {
  return (
    <View style={styles.container}>
      {isOwnProduct ? (
        // SELLER XEM BÀI CỦA CHÍNH MÌNH: Không được mua chính đồ mình tạo ra
        <View style={styles.ownProductRow}>
          <TouchableOpacity
            style={styles.manageOwnBtn}
            activeOpacity={0.88}
            onPress={onManageOwnProduct}
          >
            <Ionicons name="create-outline" size={19} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.manageOwnBtnText}>Bài đăng của bạn • Chỉnh sửa & Quản lý</Text>
          </TouchableOpacity>
        </View>
      ) : isSameCampus ? (
        // CÙNG CAMPUS: Nút Nhắn tin + Nút Trả giá
        <View style={styles.sameCampusRow}>
          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.85}
            onPress={onChat}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.chatButtonText}>Nhắn tin với người bán</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.offerButton}
            activeOpacity={0.88}
            onPress={onMakeOffer}
          >
            <Ionicons name="pricetag" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.offerButtonText}>Trả giá</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // KHÁC CAMPUS: Nút Mua ngay vào trang thanh toán
        <View style={styles.diffCampusContainer}>
          <View style={styles.diffCampusNotice}>
            <Ionicons name="airplane-outline" size={14} color="#7C3AED" />
            <Text style={styles.diffCampusNoticeText}>Khác cơ sở: Bàn giao FPT Bus & Ký quỹ Escrow</Text>
          </View>
          <TouchableOpacity
            style={styles.buyNowFullBtn}
            activeOpacity={0.88}
            onPress={onBuyNow}
          >
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.buyNowFullText}>Mua ngay (Vào thanh toán)</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    boxShadow: '0 -3px 6px rgba(0, 0, 0, 0.05)',
  },
  sameCampusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatButton: {
    flex: 1.2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '800',
  },
  offerButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
  },
  offerButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  diffCampusContainer: {
    width: '100%',
  },
  diffCampusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  diffCampusNoticeText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '700',
  },
  buyNowFullBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
  },
  buyNowFullText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  ownProductRow: {
    width: '100%',
  },
  manageOwnBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(15, 23, 42, 0.25)',
  },
  manageOwnBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});

export default ProductBottomBar;
