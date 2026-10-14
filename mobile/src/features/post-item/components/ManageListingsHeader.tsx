import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useUserStore } from '../../../stores/userStore';
import { resolveAvatarImage } from '../../../lib/imageResolver';

interface ManageListingsHeaderProps {
  insetsTop: number;
  currentCampus?: string;
  onBack: () => void;
  onProfile: () => void;
  onPostNew: () => void;
}

export const ManageListingsHeader: React.FC<ManageListingsHeaderProps> = ({
  insetsTop,
  currentCampus,
  onBack,
  onProfile,
  onPostNew,
}) => {
  const { user, isAuthenticated } = useUserStore();
  const avatarUrl = user?.avatar || user?.avatarUrl;
  const userName = user?.name || 'Bạn';

  return (
    <>
      {/* 1. TOP BAR: Back Arrow + Đăng Bán + Avatar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insetsTop, 10) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Đăng Bán</Text>

        <TouchableOpacity
          style={styles.avatarBtn}
          activeOpacity={0.8}
          onPress={onProfile}
        >
          {isAuthenticated && avatarUrl ? (
            <Image
              source={resolveAvatarImage(avatarUrl)}
              style={styles.avatarImg}
              contentFit="cover"
              transition={200}
            />
          ) : isAuthenticated && userName ? (
            <View style={styles.avatarInitialBox}>
              <Text style={styles.avatarInitialText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <Ionicons name="person" size={17} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* 2. KHO HÀNG CỦA TÔI & NÚT ĐĂNG TIN */}
      <View style={styles.warehouseRow}>
        <View style={styles.warehouseTextCol}>
          <Text style={styles.warehouseTitle}>Kho hàng của tôi</Text>
          <Text style={styles.warehouseSub}>
            Cập nhật lúc 11:20 • FPT {currentCampus || 'Hòa Lạc'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.postNewBtn}
          activeOpacity={0.88}
          onPress={onPostNew}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.postNewBtnText}>Đăng tin</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F27024',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitialBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F27024',
  },
  avatarInitialText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  warehouseTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  warehouseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  warehouseSub: {
    fontSize: 12,
    color: '#64748B',
  },
  postNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F27024',
    paddingHorizontal: 15,
    paddingVertical: 8.5,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#F27024',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  postNewBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
