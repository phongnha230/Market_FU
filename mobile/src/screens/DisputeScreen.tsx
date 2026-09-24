import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ───────────────────────────────────────────────────────────────────────────────
// Types & Mock Data
// ───────────────────────────────────────────────────────────────────────────────

type DisputeType = 'refund_full' | 'keep_discount' | null;

interface EvidenceItem {
  id: string;
  label: string;
  source: any;
  isVideo?: boolean;
  duration?: string;
}

const DISPUTE_REASONS = [
  { id: 'wrong_item', label: 'Lỗi kỹ thuật / Không lên nguồn', icon: '⚡' },
  { id: 'wrong_spec',  label: 'Sai thông số kỹ thuật đã đăng IPS/FHD', icon: '📊' },
  { id: 'wrong_box',  label: 'Nút và đa bàn vận chuyển', icon: '📦' },
];

const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'img1',
    label: 'Ảnh 1',
    source: require('../../assets/products/monitor-dell-24.jpg'),
  },
  {
    id: 'img2',
    label: 'Ảnh 2',
    source: require('../../assets/products/keyboard-akko.jpg'),
  },
  {
    id: 'vid1',
    label: 'Video Màn',
    source: require('../../assets/products/headphones-sony.jpg'),
    isVideo: true,
    duration: '0:44',
  },
];

// ───────────────────────────────────────────────────────────────────────────────
// Sub-component: Countdown Timer Display
// ───────────────────────────────────────────────────────────────────────────────
const CountdownTimer: React.FC = () => (
  <View style={styles.countdownRow}>
    <View style={styles.countdownBlock}>
      <Text style={styles.countdownNum}>38</Text>
      <Text style={styles.countdownUnit}>Giờ</Text>
    </View>
    <Text style={styles.countdownColon}>:</Text>
    <View style={styles.countdownBlock}>
      <Text style={styles.countdownNum}>14</Text>
      <Text style={styles.countdownUnit}>Phút</Text>
    </View>
    <Text style={styles.countdownColon}>:</Text>
    <View style={styles.countdownBlock}>
      <Text style={styles.countdownNum}>35</Text>
      <Text style={styles.countdownUnit}>Giây</Text>
    </View>
  </View>
);

// ───────────────────────────────────────────────────────────────────────────────
// Main Component: DisputeScreen
// ───────────────────────────────────────────────────────────────────────────────
interface DisputeScreenProps {
  onGoBack?: () => void;
}

const DisputeScreen: React.FC<DisputeScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const [disputeType, setDisputeType] = useState<DisputeType>('refund_full');
  const [selectedReasons, setSelectedReasons] = useState<string[]>(['wrong_item', 'wrong_spec']);
  const [description, setDescription] = useState(
    'Mình nhận tại Safe-Point Sảnh Alpha lúc 14:20 chiều nay, Khi mang về phòng KTX Dom B cắm thử cú sạc GaN 65W Baseus và cây Tyroc C-it làm hỏng pin nguồn đỡ...'
  );
  const [removedEvidence, setRemovedEvidence] = useState<string[]>([]);

  const toggleReason = (id: string) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    Alert.alert(
      '✅ Đã gửi khiếu nại!',
      'FPT Escrow đã nhận yêu cầu. Bạn sẽ nhận được phản hồi trong vòng 24 giờ.',
      [{ text: 'OK', onPress: onGoBack }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* ═══════════════════════════════════════════════════════════
          1. TOP HEADER BAR
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={onGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khiếu Nại & Trả Hàng...</Text>
        <TouchableOpacity style={styles.hotlineBtn} activeOpacity={0.8}>
          <Ionicons name="headset-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
          <Text style={styles.hotlineText}>Hotline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="information-circle-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Case Number Row */}
      <View style={styles.caseRow}>
        <Text style={styles.caseLabel}>MÃ HỒ SƠ TRANH CHẤP</Text>
        <View style={styles.caseRight}>
          <Text style={styles.caseCode}>#GRD-BS382-HCM</Text>
          <View style={styles.safevfptBadge}>
            <Text style={styles.safevfptText}>Bảo vệ{'\n'}aVFPT</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ═══════════════════════════════════════════════════════════
            2. ESCROW COUNTDOWN BANNER
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.escrowBanner}>
          <View style={styles.escrowBannerTopRow}>
            <View style={styles.escrowIconCircle}>
              <MaterialCommunityIcons name="lock-check" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.escrowBannerTitle}>ĐÃ ĐỒNG BÁO GIAO DỊCH</Text>
            <Text style={styles.escrowBannerSub}>đang bảo lãnh</Text>
          </View>
          <View style={styles.escrowAmountRow}>
            <Text style={styles.escrowAmount}>1.225.000đ</Text>
            <View style={styles.escrowLogoBadge}>
              <Text style={styles.escrowLogoText}>ESCROW</Text>
            </View>
          </View>
          <View style={styles.escrowTimerRow}>
            <View style={styles.escrowTimerLeft}>
              <Text style={styles.escrowTimerLabel}>Hạn chót bên bán phản{'\n'}hồi</Text>
              <CountdownTimer />
            </View>
            <View style={styles.escrowTimerRight}>
              <Text style={styles.escrowTimerLabel}>Quá hạn, hệ thống tự động{'\n'}hoàn tiền 100%</Text>
              <View style={styles.fptPayRow}>
                <MaterialCommunityIcons name="cash-fast" size={16} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.fptPayText}>Pay</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. ORDER PRODUCT CARD
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.orderCard}>
          <Text style={styles.needQuote}>Cần giải quyết: Liên campus HCM - HL</Text>
          <View style={styles.productRow}>
            <Image
              source={require('../../assets/products/monitor-dell-24.jpg')}
              style={styles.productThumb}
              contentFit="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                Màn hình phẳng di động 15.6"...
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>1.225.000đ</Text>
                <Text style={styles.productOldPrice}> 1.450.000đ</Text>
              </View>
            </View>
          </View>
          <View style={styles.partiesRow}>
            <View style={styles.partyBox}>
              <Ionicons name="person-circle-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.partyLabel}>Người bán</Text>
              <Text style={styles.partyName}>Nguyễn Văn An (...</Text>
            </View>
            <View style={styles.partyBox}>
              <Ionicons name="person-circle-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.partyLabel}>Người khiếu nại...</Text>
              <Text style={styles.partyName}>Lê Minh Quân (K...</Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. TRANSACTION TIMELINE (4 bước)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Tiến trình xử lý minh bạch</Text>
          <TouchableOpacity>
            <Text style={styles.timelineLink}>Quy chuẩn Escrow FPT</Text>
          </TouchableOpacity>

          <View style={styles.timelineRow}>
            {/* Step 1 */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineCircle, styles.timelineCircleDone]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.timelineLabel}>1. Gửi phiếu</Text>
            </View>
            <View style={styles.timelineConnector} />
            {/* Step 2 */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineCircle, styles.timelineCircleActive]}>
                <Text style={styles.timelineStepNum}>2</Text>
              </View>
              <Text style={styles.timelineLabel}>2. Phán hồi 24h</Text>
            </View>
            <View style={styles.timelineConnector} />
            {/* Step 3 */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineCircle, styles.timelineCircleInactive]}>
                <Text style={[styles.timelineStepNum, { color: '#94A3B8' }]}>3</Text>
              </View>
              <Text style={[styles.timelineLabel, { color: '#94A3B8' }]}>3. Safe-{'\n'}Point</Text>
            </View>
            <View style={[styles.timelineConnector, { backgroundColor: '#E2E8F0' }]} />
            {/* Step 4 */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineCircle, styles.timelineCircleInactive]}>
                <Text style={[styles.timelineStepNum, { color: '#94A3B8' }]}>4</Text>
              </View>
              <Text style={[styles.timelineLabel, { color: '#94A3B8' }]}>4. Hoàn{'\n'}tiền 100%</Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            5. AI PHÂN TÍCH TỰ ĐỘNG
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.aiAnalysisCard}>
          <View style={styles.aiScoreRow}>
            <View style={styles.aiScoreCircle}>
              <Text style={styles.aiScoreNum}>94%</Text>
            </View>
            <View style={styles.aiScoreTextBox}>
              <Text style={styles.aiScoreTitle}>
                AI Thẩm định tự động: <Text style={{ color: '#EA580C', fontWeight: '800' }}>Hợp lệ cao</Text>
              </Text>
              <Text style={styles.aiScoreDesc}>
                Video unbox & khớp mã Serial đủ phẩm tại Safe-Point Sảnh Alpha được người nhận lập tức{' '}
                <Text style={{ fontWeight: '700', color: '#1E3A8A' }}>đến lh...</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            6. CHỌN GIẢI PHÁP YÊU CẦU
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionNum}>1</Text>
            <Text style={styles.sectionTitle}>Chọn giải pháp yêu cầu</Text>
            <View style={styles.mandatoryBadge}>
              <Text style={styles.mandatoryText}>Bắt buộc</Text>
            </View>
          </View>

          {/* Option 1: Trả hàng & Hoàn tiền 100% */}
          <TouchableOpacity
            style={[
              styles.solutionOption,
              disputeType === 'refund_full' && styles.solutionOptionActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setDisputeType('refund_full')}
          >
            <View style={[styles.radioCircle, disputeType === 'refund_full' && styles.radioCircleActive]}>
              {disputeType === 'refund_full' && (
                <View style={styles.radioInner} />
              )}
            </View>
            <View style={styles.solutionTextBox}>
              <Text style={styles.solutionTitle}>
                Trả hàng & Hoàn tiền 100%{' '}
                <Text style={{ color: '#EA580C', fontWeight: '800' }}>1.225.000đ</Text>
              </Text>
              <Text style={styles.solutionSub}>
                Trả cố hàng về cố safe-Point gần nhất để được hoàn tiền miễn phí
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Giữ hàng & Yêu cầu bồi hoàn */}
          <TouchableOpacity
            style={[
              styles.solutionOption,
              { marginTop: 10 },
              disputeType === 'keep_discount' && styles.solutionOptionActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setDisputeType('keep_discount')}
          >
            <View style={[styles.radioCircle, disputeType === 'keep_discount' && styles.radioCircleActive]}>
              {disputeType === 'keep_discount' && (
                <View style={styles.radioInner} />
              )}
            </View>
            <View style={styles.solutionTextBox}>
              <Text style={styles.solutionTitle}>Giữ hàng & Yêu cầu bồi hoàn sửa chữa</Text>
              <Text style={styles.solutionSub}>
                300.000đ — Người bán chịu toàn bộ chi phí thay/sửa da công nghệ
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            7. LÝ DO KHIẾU NẠI THỰC TẾ
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionNum}>2</Text>
            <Text style={styles.sectionTitle}>Lý do khiếu nại thực tế</Text>
            <Text style={styles.multiSelectHint}>Chọn 1 hoặc nhiều</Text>
          </View>

          {DISPUTE_REASONS.map((reason) => {
            const isSelected = selectedReasons.includes(reason.id);
            return (
              <TouchableOpacity
                key={reason.id}
                style={[styles.reasonRow, isSelected && styles.reasonRowActive]}
                activeOpacity={0.7}
                onPress={() => toggleReason(reason.id)}
              >
                <Text style={styles.reasonEmoji}>{reason.icon}</Text>
                <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelActive]}>
                  {reason.label}
                </Text>
                <View style={[styles.squareCheck, isSelected && styles.squareCheckActive]}>
                  {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ═══════════════════════════════════════════════════════════
            8. BẰNG CHỨNG XÁC THỰC (3 tệp đã chọn)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionNum}>3</Text>
            <Text style={styles.sectionTitle}>Bằng chứng xác thực (3 tệp đã chọn)</Text>
            <View style={styles.autoSaveBadge}>
              <Text style={styles.autoSaveText}>Đã quét{'\n'}xác minh</Text>
            </View>
          </View>

          <View style={styles.evidenceScroll}>
            {EVIDENCE_ITEMS.filter((e) => !removedEvidence.includes(e.id)).map((item) => (
              <View key={item.id} style={styles.evidenceItem}>
                <Image source={item.source} style={styles.evidenceImage} contentFit="cover" />
                {item.isVideo && (
                  <View style={styles.videoOverlay}>
                    <View style={styles.playBtn}>
                      <Ionicons name="play" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.videoDuration}>{item.duration}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeEvidenceBtn}
                  onPress={() => setRemovedEvidence((prev) => [...prev, item.id])}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close" size={11} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.evidenceLabel}>{item.label}</Text>
              </View>
            ))}

            {/* Add more button */}
            <TouchableOpacity
              style={styles.addEvidenceBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Thêm bằng chứng', 'Chụp ảnh unbox hoặc quay video để tăng tỉ lệ thắng kiện')}
            >
              <Ionicons name="add" size={20} color="#EA580C" />
              <Text style={styles.addEvidenceText}>+ Thêm clip{'\n'}unbox hoặc ảnh chụp chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            9. MÔ TẢ CHI TIẾT LỖI PHÁT SINH
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionNum}>4</Text>
            <Text style={styles.sectionTitle}>Mô tả chi tiết lỗi phát sinh</Text>
            <Text style={styles.charCount}>284/500 lv</Text>
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            10. ĐIỂM GỬI TRẢ SAFE-POINT (MIỄN PHÍ 100%)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionNum}>5</Text>
            <Text style={styles.sectionTitle}>Điểm gửi trả Safe-Point (Miễn phí 100%)</Text>
          </View>
          <View style={styles.fptHlBadge}>
            <Text style={styles.fptHlText}>FPT Hà{'\n'}Lạc</Text>
          </View>

          {/* Safe-Point Option 1 */}
          <View style={styles.safePointOption}>
            <View style={styles.safePointLeft}>
              <View style={styles.safePointIconBox}>
                <Ionicons name="location" size={16} color="#EA580C" />
              </View>
              <View style={styles.safePointTextBox}>
                <View style={styles.safePointTitleRow}>
                  <Text style={styles.safePointName}>Tram Sảnh 1 Tòa Thư Viện</Text>
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayText}>Mở tới{'\n'}21:00</Text>
                  </View>
                </View>
                <Text style={styles.safePointDesc}>
                  Đại học FPT Hola Lạc, HLC Campus
                </Text>
              </View>
            </View>
          </View>

          {/* Safe-Point Option 2 (muted) */}
          <View style={[styles.safePointOption, { opacity: 0.5, marginTop: 8 }]}>
            <View style={styles.safePointLeft}>
              <View style={[styles.safePointIconBox, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="location-outline" size={16} color="#94A3B8" />
              </View>
              <View style={styles.safePointTextBox}>
                <Text style={styles.safePointName}>
                  Nhận viên Safe-Point đồng giải bao bì xếp & Hoàn tại TP.HCM miễn phí cho bạn
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Escrow Protection Note */}
        <View style={styles.escrowProtectionNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#059669" style={{ marginRight: 6 }} />
          <Text style={styles.escrowProtectionText}>
            Giao dịch này được bảo chứng theo Quy chế Chợ Sinh viên 5Campus FPT. Nếu bên bán vi phạm thì hãy bấm Hotline để được hỗ trợ khẩn cấp.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          11. BOTTOM ACTION BAR
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.messageSellerBtn}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Tin nhắn người bán', 'Mở cuộc hội thoại với người bán')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1E293B" style={{ marginRight: 6 }} />
          <Text style={styles.messageSellerText}>Nhắn tin người bán</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitDisputeBtn}
          activeOpacity={0.88}
          onPress={handleSubmit}
        >
          <MaterialCommunityIcons name="gavel" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.submitDisputeText}>Gửi khiếu nại & Hoàn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DisputeScreen;

// ───────────────────────────────────────────────────────────────────────────────
// STYLES
// ───────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  hotlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  hotlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  headerIconBtn: {
    padding: 4,
  },

  // Case Row
  caseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  caseLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  caseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  caseCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  safevfptBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  safevfptText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3730A3',
    textAlign: 'center',
  },

  // Scroll
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 10,
  },

  // 2. Escrow Banner
  escrowBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 2,
  },
  escrowBannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  escrowIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: 0.3,
  },
  escrowBannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
    textAlign: 'right',
  },
  escrowAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  escrowAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  escrowLogoBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  escrowLogoText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  escrowTimerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  escrowTimerLeft: {
    flex: 1,
  },
  escrowTimerRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  escrowTimerLabel: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
    marginBottom: 8,
  },
  fptPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fptPayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
  },

  // Countdown
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  countdownBlock: {
    backgroundColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 36,
  },
  countdownNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F97316',
  },
  countdownUnit: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  countdownColon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#64748B',
    marginHorizontal: 1,
  },

  // 3. Order Card
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  needQuote: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 10,
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  productOldPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  partiesRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  partyBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  partyLabel: {
    fontSize: 10,
    color: '#64748B',
    marginRight: 2,
  },
  partyName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },

  // 4. Timeline
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  timelineLink: {
    fontSize: 11,
    color: '#3B82F6',
    textDecorationLine: 'underline',
    marginBottom: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  timelineCircleDone: {
    backgroundColor: '#10B981',
  },
  timelineCircleActive: {
    backgroundColor: '#EA580C',
  },
  timelineCircleInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  timelineStepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 14,
  },
  timelineConnector: {
    height: 2,
    flex: 0.5,
    backgroundColor: '#10B981',
    marginTop: 13,
  },

  // 5. AI Analysis
  aiAnalysisCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  aiScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiScoreCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DBEAFE',
    borderWidth: 3,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiScoreNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  aiScoreTextBox: {
    flex: 1,
  },
  aiScoreTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  aiScoreDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: '#475569',
  },

  // 6 / 7 / 8 / 9 / 10. Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  sectionNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EA580C',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  mandatoryBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mandatoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  multiSelectHint: {
    fontSize: 10,
    color: '#64748B',
  },
  charCount: {
    fontSize: 10,
    color: '#94A3B8',
  },
  autoSaveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  autoSaveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
  },

  // Solution Options
  solutionOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  solutionOptionActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleActive: {
    borderColor: '#EA580C',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EA580C',
  },
  solutionTextBox: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  solutionSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // Reason rows
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 10,
  },
  reasonRowActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  reasonEmoji: {
    fontSize: 16,
  },
  reasonLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  reasonLabelActive: {
    color: '#9A3412',
    fontWeight: '600',
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

  // Evidence
  evidenceScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  evidenceItem: {
    width: 78,
    height: 78,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  videoDuration: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  removeEvidenceBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15,23,42,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceLabel: {
    position: 'absolute',
    bottom: 4,
    left: 5,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addEvidenceBtn: {
    width: 78,
    height: 78,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderStyle: 'dashed',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  addEvidenceText: {
    fontSize: 9.5,
    color: '#EA580C',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 13,
  },

  // Description
  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 80,
  },
  descriptionText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
  },

  // Safe-Point
  fptHlBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fptHlText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3730A3',
    textAlign: 'center',
  },
  safePointOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  safePointLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  safePointIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safePointTextBox: {
    flex: 1,
  },
  safePointTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  safePointName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  safePointDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  todayBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  todayText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Escrow Protection Note
  escrowProtectionNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginTop: -4,
  },
  escrowProtectionText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    flex: 1,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 8 },
    }),
  },
  messageSellerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  messageSellerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  submitDisputeBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EA580C',
    ...Platform.select({
      ios: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  submitDisputeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
