import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PostItemScreenProps {
  onGoBack?: () => void;
  onSubmitSuccess?: () => void;
}

export const PostItemScreen: React.FC<PostItemScreenProps> = ({
  onGoBack,
  onSubmitSuccess,
}) => {
  const insets = useSafeAreaInsets();

  // Form States
  const [title, setTitle] = useState('Bàn phím cơ Akko 3087 v2 Silent Switch');
  const [price, setPrice] = useState('520.000');
  const [selectedCategory, setSelectedCategory] = useState<'it' | 'book' | 'dom' | 'vovinam'>('it');
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'good' | 'free'>('new');
  const [allowNegotiate, setAllowNegotiate] = useState(true);
  const [freeForK20, setFreeForK20] = useState(false);
  const [selectedSafePoint, setSelectedSafePoint] = useState(
    'Trạm Sảnh Alpha (Bàn test đồ SV 04 - Có ổ c...'
  );
  const [campusShipEnabled, setCampusShipEnabled] = useState(true);

  // Danh sách ảnh mẫu từ assets
  const [images, setImages] = useState([
    {
      id: '1',
      source: require('../../assets/products/keyboard-akko.jpg'),
      isCover: true,
      isHd: true,
    },
    {
      id: '2',
      source: require('../../assets/products/books-mas291.jpg'),
      isCover: false,
      isHd: false,
    },
  ]);

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleApplySuggestion = (text: string) => {
    setTitle((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSubmit = () => {
    Alert.alert(
      '🎉 Đăng tin thành công!',
      'Món đồ của bạn đã được FPT Bot duyệt tự động và xuất hiện tại Hola Campus Marketplace.',
      [
        {
          text: 'Về trang chủ',
          onPress: () => {
            if (onSubmitSuccess) onSubmitSuccess();
            else if (onGoBack) onGoBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* ═══════════════════════════════════════════════════════════════════════
          1. HEADER BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={onGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Post Item</Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => Alert.alert('Hộp thư tin nhắn')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="mail-outline" size={22} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={onGoBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>

          {/* User Avatar Circle */}
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═════════════════════════════════════════════════════════════════════
            2. SUB-HEADER: SPEED POST & CAMPUS PASS BADGE
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.subHeaderRow}>
          <View style={styles.speedBadge}>
            <View style={styles.orangeDot} />
            <Text style={styles.speedBadgeText}>Tạo tin siêu tốc 1 phút</Text>
          </View>

          <View style={styles.campusPassBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={styles.campusPassText}>Campus Pass K17-K20</Text>
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            3. HÌNH ẢNH THỰC TẾ & FPT BOT
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Hình ảnh thực tế <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <View style={styles.imageCountBadge}>
            <Text style={styles.imageCountText}>{images.length}/5 ảnh</Text>
          </View>
        </View>

        {/* Danh sách ảnh */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageUploadScroll}
        >
          {/* Nút Chụp / Tải */}
          <TouchableOpacity
            style={styles.uploadBox}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Tải ảnh', 'Chọn chụp ảnh mới hoặc tải từ thư viện')}
          >
            <View style={styles.uploadTopDot} />
            <View style={styles.cameraIconCircle}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <View style={styles.plusOverlay}>
                <Ionicons name="add" size={10} color="#EA580C" />
              </View>
            </View>
            <Text style={styles.uploadBoxText}>Chụp / Tải</Text>
          </TouchableOpacity>

          {/* Các ảnh đã có */}
          {images.map((img) => (
            <View key={img.id} style={styles.imageItemWrapper}>
              <Image source={img.source} style={styles.uploadedImage} contentFit="cover" />

              {/* Badge Ảnh bìa */}
              {img.isCover && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>☆ Ảnh bìa</Text>
                </View>
              )}

              {/* Badge HD */}
              {img.isHd && (
                <View style={styles.hdBadge}>
                  <Text style={styles.hdBadgeText}>HD</Text>
                </View>
              )}

              {/* Nút xóa ảnh */}
              <TouchableOpacity
                style={styles.deleteImageBtn}
                onPress={() => handleRemoveImage(img.id)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* FPT Bot AI Banner */}
        <View style={styles.fptBotBanner}>
          <Ionicons name="sparkles" size={18} color="#F97316" style={{ marginRight: 8 }} />
          <Text style={styles.fptBotBannerText}>
            <Text style={{ fontWeight: '700', color: '#1E1B4B' }}>FPT Bot: </Text>
            Chụp rõ tem bảo hành FPT hoặc màn hình sáng để duyệt tự động chỉ sau 30 giây!
          </Text>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            4. CARD: TIÊU ĐỀ MÓN ĐỒ & DANH MỤC & ĐỘ MỚI
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardSectionTitle}>
            Tiêu đề món đồ <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>

          {/* Input Box tiêu đề */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Nhập tên món đồ bạn muốn pass..."
              placeholderTextColor="#94A3B8"
            />
            {title.length > 0 && (
              <TouchableOpacity onPress={() => setTitle('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Chips Gợi ý */}
          <View style={styles.suggestionSection}>
            <View style={styles.suggestionRow}>
              <Text style={styles.suggestionLabel}>GỢI Ý:</Text>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleApplySuggestion('[Giáo trình kỳ 3]')}
              >
                <Text style={styles.suggestionChipText}>+ [Giáo trình kỳ 3]</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleApplySuggestion('[Phụ kiện IT]')}
              >
                <Text style={styles.suggestionChipText}>+ [Phụ kiện IT]</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.suggestionRow, { marginTop: 6 }]}>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleApplySuggestion('[Đồ dùng Dom B]')}
              >
                <Text style={styles.suggestionChipText}>+ [Đồ dùng Dom B]</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Danh mục Campus */}
          <Text style={styles.cardSubTitle}>Danh mục Campus</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'it' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('it')}
            >
              <Text style={styles.categoryEmoji}>💻</Text>
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'it' && styles.categoryChipTextActive,
                ]}
              >
                Thiết bị IT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryChip,
                styles.categoryChipBlue,
                selectedCategory === 'book' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('book')}
            >
              <Text style={styles.categoryEmoji}>📚</Text>
              <Text
                style={[
                  styles.categoryChipText,
                  styles.categoryChipBlueText,
                  selectedCategory === 'book' && styles.categoryChipTextActive,
                ]}
              >
                Giáo trình & Slide
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryChip,
                styles.categoryChipBlue,
                selectedCategory === 'dom' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('dom')}
            >
              <Text style={styles.categoryEmoji}>🛏️</Text>
              <Text
                style={[
                  styles.categoryChipText,
                  styles.categoryChipBlueText,
                  selectedCategory === 'dom' && styles.categoryChipTextActive,
                ]}
              >
                Đồ dùng KTX
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Độ mới / Tình trạng */}
          <Text style={styles.cardSubTitle}>Độ mới / Tình trạng</Text>
          <View style={styles.conditionSegmentContainer}>
            {/* Tab 1: Mới 99% */}
            <TouchableOpacity
              style={[
                styles.conditionTab,
                selectedCondition === 'new' && styles.conditionTabActive,
              ]}
              onPress={() => setSelectedCondition('new')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.conditionTitle,
                  selectedCondition === 'new' && { color: '#EA580C', fontWeight: '800' },
                ]}
              >
                Mới 99%
              </Text>
              <Text
                style={[
                  styles.conditionSub,
                  selectedCondition === 'new' && { color: '#C2410C' },
                ]}
              >
                Lượt ít dùng
              </Text>
            </TouchableOpacity>

            {/* Tab 2: Dùng tốt */}
            <TouchableOpacity
              style={[
                styles.conditionTab,
                selectedCondition === 'good' && styles.conditionTabActive,
              ]}
              onPress={() => setSelectedCondition('good')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.conditionTitle,
                  selectedCondition === 'good' && { color: '#1E293B', fontWeight: '800' },
                ]}
              >
                Dùng tốt
              </Text>
              <Text style={styles.conditionSub}>85% - 90%</Text>
            </TouchableOpacity>

            {/* Tab 3: Cũ / Tặng */}
            <TouchableOpacity
              style={[
                styles.conditionTab,
                selectedCondition === 'free' && styles.conditionTabActive,
              ]}
              onPress={() => setSelectedCondition('free')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.conditionTitle,
                  selectedCondition === 'free' && { color: '#1E293B', fontWeight: '800' },
                ]}
              >
                Cũ / Tặng
              </Text>
              <Text style={[styles.conditionSub, { color: '#059669', fontWeight: '700' }]}>
                0đ Sinh Viên
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            5. CARD: ĐỊNH GIÁ BÁN & GỢI Ý GIÁ AI
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.cardContainer}>
          <View style={styles.priceHeaderRow}>
            <Text style={styles.cardSectionTitle}>Định giá bán</Text>
            <View style={styles.studentPayBadge}>
              <Text style={styles.studentPayText}>Ví FPT Student Pay</Text>
            </View>
          </View>

          {/* Input Giá bán lớn */}
          <View style={styles.priceInputBox}>
            <TextInput
              style={styles.priceTextInput}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.currencyLabel}>VNĐ</Text>
            {price.length > 0 && (
              <TouchableOpacity onPress={() => setPrice('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle-outline" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Checkbox 1: Cho phép thương lượng */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.7}
            onPress={() => setAllowNegotiate(!allowNegotiate)}
          >
            <View style={styles.checkboxLabelGroup}>
              <Ionicons name="pricetag-outline" size={17} color="#475569" style={{ marginRight: 8 }} />
              <Text style={styles.checkboxLabelText}>Cho phép thương lượng giá nhẹ</Text>
            </View>
            <View style={[styles.squareCheck, allowNegotiate && styles.squareCheckActive]}>
              {allowNegotiate && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>

          {/* Checkbox 2: Tặng 0đ hỗ trợ K20 */}
          <TouchableOpacity
            style={[styles.checkboxRow, { marginTop: 10 }]}
            activeOpacity={0.7}
            onPress={() => {
              setFreeForK20(!freeForK20);
              if (!freeForK20) setPrice('0');
            }}
          >
            <View style={styles.checkboxLabelGroup}>
              <MaterialCommunityIcons
                name="hand-heart-outline"
                size={18}
                color="#10B981"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.checkboxLabelText}>Tặng 0đ hỗ trợ tân sinh viên K20</Text>
            </View>
            <View style={[styles.squareCheck, freeForK20 && styles.squareCheckActive]}>
              {freeForK20 && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>

          {/* FPT Marketplace AI Price Recommendation Box */}
          <View style={styles.aiPriceBox}>
            <View style={styles.aiIconCircle}>
              <Ionicons name="trending-up" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.aiPriceTextBox}>
              <Text style={styles.aiPriceTitle}>FPT Marketplace AI:</Text>
              <Text style={styles.aiPriceDesc}>
                Giá thị trường cùng model tại Hola Campus:{' '}
                <Text style={{ fontWeight: '800', color: '#7C2D12' }}>480.000đ - 550.000đ</Text>.
                Mức giá này khớp nhanh trong ngày!
              </Text>
            </View>
          </View>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            6. CARD: ĐỊA ĐIỂM BÀN GIAO & SAFE-POINT & CAMPUSSHIP
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.cardContainer}>
          <View style={styles.locationHeaderRow}>
            <View style={styles.locationTitleLeft}>
              <Ionicons name="location-outline" size={20} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={styles.cardSectionTitle}>Địa điểm bàn giao</Text>
            </View>
            <TouchableOpacity
              style={styles.changeCampusBtn}
              onPress={() => Alert.alert('Chọn Campus', 'Hòa Lạc | TP.HCM | Đà Nẵng | Quy Nhơn | Cần Thơ')}
            >
              <Text style={styles.changeCampusBtnText}>Đổi Campus ⇄</Text>
            </TouchableOpacity>
          </View>

          {/* Hola Campus Box */}
          <View style={styles.campusSelectedBox}>
            <View style={styles.campusIconBox}>
              <Ionicons name="business" size={20} color="#C2410C" />
            </View>
            <View style={styles.campusInfoBox}>
              <Text style={styles.campusName}>Hola Campus (Hà Nội)</Text>
              <Text style={styles.campusAddress} numberOfLines={1}>
                Khu Công Nghệ Cao Hòa Lạ...
              </Text>
            </View>
            <View style={styles.campusStudentBadge}>
              <Text style={styles.campusStudentBadgeText}>5.8k SV</Text>
            </View>
          </View>

          {/* Điểm hẹn Safe-Point an toàn */}
          <View style={styles.safePointHeader}>
            <Text style={styles.safePointTitle}>Điểm hẹn Safe-Point an toàn</Text>
            <View style={styles.camera247Badge}>
              <Ionicons name="videocam-outline" size={13} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.camera247Text}>Camera 24/7</Text>
            </View>
          </View>

          {/* Dropdown Safe-Point */}
          <TouchableOpacity
            style={styles.safePointDropdown}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                'Chọn Điểm Hẹn Safe-Point',
                '1. Trạm Sảnh Alpha (Bàn test đồ SV 04 - Có ổ cắm)\n2. Trạm Sảnh Beta (Bảo vệ KTX Dom A)\n3. Quán Cóc Teahouse Hòa Lạc'
              )
            }
          >
            <Text style={styles.safePointSelectedText} numberOfLines={1}>
              {selectedSafePoint}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>

          {/* Box CampusShip nội bộ FPT */}
          <TouchableOpacity
            style={styles.campusShipBox}
            activeOpacity={0.85}
            onPress={() => setCampusShipEnabled(!campusShipEnabled)}
          >
            <View style={styles.shipIconCircle}>
              <MaterialCommunityIcons name="truck-delivery" size={20} color="#059669" />
            </View>
            <View style={styles.shipTextBox}>
              <Text style={styles.shipTitle}>CampusShip nội bộ FPT</Text>
              <Text style={styles.shipSub}>Hỗ trợ gửi đồ qua bảo vệ KTX / Trạm ship</Text>
            </View>
            <View style={[styles.squareCheck, campusShipEnabled && styles.squareCheckActive]}>
              {campusShipEnabled && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            7. ESCROW PROTECTION GUARANTEE NOTE
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.escrowNoteRow}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#059669" style={{ marginRight: 6 }} />
          <Text style={styles.escrowNoteText}>
            Bảo vệ giao dịch an toàn 100% bằng Escrow FPT Pay
          </Text>
        </View>

        {/* Spacer for bottom bar */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. FIXED BOTTOM ACTION BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {/* Hàng phí giao dịch sinh viên */}
        <View style={styles.feeInfoRow}>
          <View style={styles.feeLeftGroup}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#059669" style={{ marginRight: 5 }} />
            <Text style={styles.feeTitle}>Phí giao dịch sinh viên:</Text>
          </View>
          <View style={styles.feeRightGroup}>
            <Text style={styles.feeFreeText}>0đ Miễn phí</Text>
            <Text style={styles.feeOldPrice}> 15.000đ</Text>
          </View>
        </View>

        {/* Nút Đăng tin ngay (Duyệt siêu tốc) */}
        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.88}
          onPress={handleSubmit}
        >
          <Ionicons name="flash" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.submitButtonText}>Đăng tin ngay (Duyệt siêu tốc)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostItemScreen;

// ───────────────────────────────────────────────────────────────────────────────
// STYLES PIXEL-PERFECT THEO MOCKUP
// ───────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // 1. Header Bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  headerIconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginLeft: 14,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9A3412',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll Content
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  // 2. Sub-Header Row
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    marginRight: 6,
  },
  speedBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  campusPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  campusPassText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
  },

  // 3. Hình ảnh thực tế
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  imageCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  imageCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  imageUploadScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 10,
  },
  uploadBox: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  uploadTopDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  cameraIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F27024',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  plusOverlay: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  imageItemWrapper: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  hdBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hdBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  deleteImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FPT Bot Banner
  fptBotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  fptBotBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#3730A3',
  },

  // 4. Card Containers
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  cardSubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 8,
  },

  // Input Box tiêu đề
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },

  // Gợi ý
  suggestionSection: {
    marginTop: 10,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 2,
  },
  suggestionChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  suggestionChipText: {
    fontSize: 11.5,
    color: '#1E3A8A',
    fontWeight: '600',
  },

  // Categories
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#EA580C',
  },
  categoryChipBlue: {
    backgroundColor: '#E0F2FE',
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryChipBlueText: {
    color: '#0369A1',
  },

  // Condition 3 tabs
  conditionSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  conditionTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  conditionTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  conditionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  conditionSub: {
    fontSize: 11,
    color: '#64748B',
  },

  // 5. Định giá bán
  priceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  studentPayBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  studentPayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  priceTextInput: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7C2D12',
    minWidth: 110,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7C2D12',
    flex: 1,
    marginLeft: 8,
  },

  // Checkbox row
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  checkboxLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxLabelText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  squareCheck: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  squareCheckActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },

  // AI Price Recommendation
  aiPriceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  aiIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  aiPriceTextBox: {
    flex: 1,
  },
  aiPriceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 2,
  },
  aiPriceDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: '#9A3412',
  },

  // 6. Địa điểm bàn giao
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeCampusBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  changeCampusBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  campusSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    marginTop: 4,
    marginBottom: 12,
  },
  campusIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  campusInfoBox: {
    flex: 1,
  },
  campusName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  campusAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  campusStudentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  campusStudentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },

  // Safe-point
  safePointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 8,
  },
  safePointTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  camera247Badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  camera247Text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  safePointDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  safePointSelectedText: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },

  // CampusShip
  campusShipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  shipIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  shipTextBox: {
    flex: 1,
  },
  shipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  shipSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // 7. Escrow Guarantee Note
  escrowNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginTop: -2,
    marginBottom: 6,
  },
  escrowNoteText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // 8. Bottom Action Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  feeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feeLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeTitle: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  feeRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeFreeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  feeOldPrice: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    height: 48,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
