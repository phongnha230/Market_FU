import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          <Ionicons name="person" size={17} color="#FFFFFF" />
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9A3412',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  warehouseTextCol: {
    flex: 1,
  },
  warehouseTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  warehouseSub: {
    fontSize: 12,
    color: '#64748B',
  },
  postNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9A3412',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#9A3412',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  postNewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
