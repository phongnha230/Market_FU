import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHeader from '../components/HomeHeader';
import ProductCard from '../components/ProductCard';

const CAMPUSES = ['HÒA LẠC', 'TP.HCM', 'ĐÀ NẴNG', 'CẦN THƠ'];
const CATEGORIES = [
  { id: '1', name: 'Sách &\nGiáo trình', icon: 'book-outline', color: '#E8F5E9', iconColor: '#4CAF50', badge: 'MỚI' },
  { id: '2', name: 'Laptop &\nPhụ kiện', icon: 'laptop-outline', color: '#E3F2FD', iconColor: '#2196F3' },
  { id: '3', name: 'Đồ dùng\nKTX', icon: 'business-outline', color: '#FFF3E0', iconColor: '#FF9800' },
  { id: '4', name: 'Võ phục\nVovinam', icon: 'body-outline', color: '#FCE4EC', iconColor: '#E91E63' },
  { id: '5', name: 'Pass đồ\ngấp', icon: 'flash-outline', color: '#FFFDE7', iconColor: '#FBC02D', badge: 'GẤP' },
];

const PRODUCTS = [
  {
    id: '1',
    title: 'Màn hình Dell 24" UltraSharp',
    price: '1.450.000',
    location: 'Dom A Hola',
    seller: 'Hoàng Tú',
    sellerYear: 'K18 AI',
    image: 'https://picsum.photos/id/1/200/200',
    badge: '99% Fullbox',
  },
  {
    id: '2',
    title: 'Combo CSL201 + MAS291 kèm đế PE',
    price: '120.000',
    location: 'Thư viện Gamma',
    seller: 'Phương Linh',
    sellerYear: 'K17 MKT',
    image: 'https://picsum.photos/id/2/200/200',
    badge: 'Tặng note tóm tắt',
  },
  {
    id: '3',
    title: 'Bàn phím cơ FL Esport custom',
    price: '750.000',
    location: 'Sảnh Tòa Alpha',
    seller: 'Hải Nam',
    sellerYear: 'K17',
    image: 'https://picsum.photos/id/3/200/200',
    badge: 'Switch êm',
  },
  {
    id: '4',
    title: 'Nồi nấu lẩu mini KTX 1.5L',
    price: '220.000',
    location: 'Dom B KTX',
    seller: 'Quốc Bảo',
    sellerYear: 'K19',
    image: 'https://picsum.photos/id/4/200/200',
    badge: 'An toàn Dom',
  },
];

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <HomeHeader userName="Quân" campusName="Hòa Lạc" />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              placeholder="Tìm giáo trình, laptop, đồ KTX..."
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
            <TouchableOpacity>
              <MaterialCommunityIcons name="scan-helper" size={22} color="#F27024" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Campus Horizontal Tabs */}
        <View style={styles.campusTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.campusList}>
            {CAMPUSES.map((campus, index) => (
              <TouchableOpacity
                key={campus}
                style={[styles.campusTab, index === 0 && styles.activeCampusTab]}
              >
                <Ionicons name="location-sharp" size={12} color={index === 0 ? '#fff' : '#F27024'} style={{marginRight: 4}} />
                <Text style={[styles.campusTabText, index === 0 && styles.activeCampusTabText]}>
                  {campus}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Section */}
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={[styles.categoryIconBg, { backgroundColor: cat.color }]}>
                {cat.badge && (
                  <View style={[styles.catBadge, { backgroundColor: cat.badge === 'GẤP' ? '#FF5722' : '#4CAF50' }]}>
                    <Text style={styles.catBadgeText}>{cat.badge}</Text>
                  </View>
                )}
                <Ionicons name={cat.icon as any} size={28} color={cat.iconColor} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KYC Banner */}
        <TouchableOpacity style={styles.kycBanner}>
          <View style={styles.kycIconBg}>
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
          </View>
          <View style={styles.kycContent}>
            <View style={styles.kycTitleRow}>
              <View style={styles.kycTag}><Text style={styles.kycTagText}>FPT KYC PASS</Text></View>
              <Text style={styles.kycSubTitle}>Bảo trợ sinh viên</Text>
            </View>
            <Text style={styles.kycDesc}>
              Xác thực sinh viên để nhận huy hiệu tin cậy & giao dịch <Text style={{fontWeight: 'bold'}}>Safe-Handoff</Text> an toàn.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Main Feed Section */}
        <View style={styles.feedHeader}>
          <View>
            <Text style={styles.feedTitle}>Tin mới tại Hola</Text>
            <Text style={styles.feedSubTitle}>Trao đổi tận tay trong campus 5 phút</Text>
          </View>
          <TouchableOpacity><Text style={styles.seeAllText}>Xem hết ›</Text></TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
           {['TẤT CẢ', '⚡ GẦN BẠN (<500M)', '🏠 ĐỒ KTX', '💰 PASS RẺ'].map((chip, idx) => (
             <TouchableOpacity key={chip} style={[styles.chip, idx === 0 && styles.activeChip]}>
               <Text style={[styles.chipText, idx === 0 && styles.activeChipText]}>{chip}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </View>

        {/* Safe Handoff Point info */}
        <View style={styles.safePointBar}>
           <View style={styles.safePointIcon}>
             <Ionicons name="flash" size={20} color="#fff" />
           </View>
           <View style={{flex: 1, marginLeft: 12}}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.safePointTitle}>SAFE-HANDOFF POINT</Text>
                <View style={styles.openBadge}><Text style={styles.openBadgeText}>ĐANG MỞ</Text></View>
             </View>
             <Text style={styles.safePointDesc}>Bàn test sạc & đo điện Sảnh Alpha có bảo vệ trực</Text>
           </View>
           <Ionicons name="map-outline" size={24} color="#666" />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterBtn: {
    width: 46,
    height: 46,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  campusTabsContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  campusList: { paddingHorizontal: 16 },
  campusTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeCampusTab: { backgroundColor: '#F27024', borderColor: '#F27024' },
  campusTabText: { fontSize: 12, fontWeight: '700', color: '#666' },
  activeCampusTabText: { color: '#fff' },

  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 15,
  },
  categoryItem: { alignItems: 'center', width: '18%' },
  categoryIconBg: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  catBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    zIndex: 1,
  },
  catBadgeText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
  categoryName: { fontSize: 10, color: '#333', textAlign: 'center', fontWeight: '600' },

  kycBanner: {
    margin: 16,
    backgroundColor: '#F27024',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#F27024',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  kycIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  kycContent: { flex: 1, marginLeft: 15 },
  kycTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  kycTag: { backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  kycTagText: { color: '#F27024', fontSize: 10, fontWeight: 'bold' },
  kycSubTitle: { color: '#fff', fontSize: 12, fontWeight: '600' },
  kycDesc: { color: '#fff', fontSize: 11, lineHeight: 16, opacity: 0.9 },

  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  feedTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  feedSubTitle: { fontSize: 12, color: '#666', marginTop: 2 },
  seeAllText: { fontSize: 13, fontWeight: 'bold', color: '#E65100' },

  chipScroll: { paddingLeft: 16, marginVertical: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  activeChip: { backgroundColor: '#333' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#666' },
  activeChipText: { color: '#fff' },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },

  safePointBar: {
    margin: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  safePointIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safePointTitle: { fontSize: 12, fontWeight: 'bold', color: '#2D3436' },
  safePointDesc: { fontSize: 11, color: '#636E72', marginTop: 2 },
  openBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  openBadgeText: { fontSize: 8, color: '#065F46', fontWeight: 'bold' },
});

export default HomeScreen;
