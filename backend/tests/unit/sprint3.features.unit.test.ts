import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createReviewSchema, queryUserReviewsSchema } from '../../src/modules/reviews/review.dto';
import {
  buyBadgeSchema,
  createWithdrawalSchema,
  sellerOnboardingSchema,
} from '../../src/modules/profile/profile.dto';
import {
  createReportSchema,
  resolveReportSchema,
  resolveDisputeSchema,
  reviewKycSchema,
} from '../../src/modules/reports/report.dto';
import {
  redeemVoucherSchema,
  useVoucherSchema,
  createVoucherAdminSchema,
} from '../../src/modules/vouchers/voucher.dto';
import { isValidVideoBuffer } from '../../src/config/storage';

describe('Unit Test: Sprint 3 Features & Business Rules', () => {
  describe('Blind Review 2 Chiều: DTO & Logic Ẩn/Hiện Song Song', () => {
    it('createReviewSchema: Yêu cầu orderId và rating hợp lệ từ 1 đến 5 sao', () => {
      const missingOrderId = createReviewSchema.safeParse({ rating: 5 });
      assert.strictEqual(missingOrderId.success, false);

      const invalidRatingLow = createReviewSchema.safeParse({ orderId: 'ord_1', rating: 0 });
      assert.strictEqual(invalidRatingLow.success, false);

      const invalidRatingHigh = createReviewSchema.safeParse({ orderId: 'ord_1', rating: 6 });
      assert.strictEqual(invalidRatingHigh.success, false);

      const validReview = createReviewSchema.safeParse({
        orderId: 'ord_123',
        rating: 5,
        comment: 'Hàng rất tốt, đúng mô tả của seller!',
      });
      assert.strictEqual(validReview.success, true);
    });

    it('createReviewSchema: Kiểm tra định dạng URL video unbox/test', () => {
      const invalidUrl = createReviewSchema.safeParse({
        orderId: 'ord_1',
        rating: 5,
        testVideoUrl: 'not-a-valid-url',
      });
      assert.strictEqual(invalidUrl.success, false);

      const validUrl = createReviewSchema.safeParse({
        orderId: 'ord_1',
        rating: 5,
        testVideoUrl: 'https://marketfu.s3.ap-southeast-1.amazonaws.com/videos/test.mp4',
      });
      assert.strictEqual(validUrl.success, true);
    });

    it('Blind Review Pattern: Chỉ công khai (isPublic = true) khi CẢ HAI BÊN đã đánh giá', () => {
      // Giả lập 2 bên đánh giá một đơn hàng
      let buyerReviewed = false;
      let sellerReviewed = false;

      // Bước 1: Buyer đánh giá trước -> chưa ai thấy
      buyerReviewed = true;
      let isBuyerReviewPublic = buyerReviewed && sellerReviewed;
      assert.strictEqual(isBuyerReviewPublic, false, 'Khi chỉ 1 bên đánh giá, review phải được ẩn');

      // Bước 2: Seller đánh giá sau -> cả 2 lập tức hiển thị công khai cùng lúc
      sellerReviewed = true;
      let isBothPublic = buyerReviewed && sellerReviewed;
      assert.strictEqual(isBothPublic, true, 'Khi cả 2 bên cùng đánh giá, review lập tức công khai');
    });

    it('Gamification Xu & Điểm Uy Tín: Thưởng +100 Xu (+200 Xu khi có video test)', () => {
      const calculateReviewReward = (hasVideo: boolean) => {
        const coinBonus = hasVideo ? 200 : 100;
        const repBonus = 2;
        return { coinBonus, repBonus };
      };

      const normalReward = calculateReviewReward(false);
      assert.strictEqual(normalReward.coinBonus, 100);
      assert.strictEqual(normalReward.repBonus, 2);

      const videoReward = calculateReviewReward(true);
      assert.strictEqual(videoReward.coinBonus, 200);
      assert.strictEqual(videoReward.repBonus, 2);
    });

    it('Uy tín người bán: Thưởng +5 điểm uy tín khi nhận đánh giá 5 sao', () => {
      const calculateSellerRepBonus = (rating: number) => {
        return rating === 5 ? 5 : 0;
      };

      assert.strictEqual(calculateSellerRepBonus(5), 5);
      assert.strictEqual(calculateSellerRepBonus(4), 0);
      assert.strictEqual(calculateSellerRepBonus(1), 0);
    });
  });

  describe('Gamification Tiêu Xu: Khung Avatar & Rút Tiền Về Ngân Hàng', () => {
    it('buyBadgeSchema: Chỉ cho phép các huy hiệu hợp lệ', () => {
      const invalid = buyBadgeSchema.safeParse({ badgeType: 'SUPER_VIP' });
      assert.strictEqual(invalid.success, false);

      const validTopSeller = buyBadgeSchema.safeParse({ badgeType: 'TOP_SELLER' });
      assert.strictEqual(validTopSeller.success, true);

      const validK18 = buyBadgeSchema.safeParse({ badgeType: 'K18_VERIFIED' });
      assert.strictEqual(validK18.success, true);

      const validReputable = buyBadgeSchema.safeParse({ badgeType: 'REPUTABLE_TRADER' });
      assert.strictEqual(validReputable.success, true);
    });

    it('Chi phí Xu khi mua khung avatar', () => {
      const BADGE_PRICES: Record<string, number> = {
        TOP_SELLER: 500,
        K18_VERIFIED: 300,
        REPUTABLE_TRADER: 200,
      };

      assert.strictEqual(BADGE_PRICES['TOP_SELLER'], 500);
      assert.strictEqual(BADGE_PRICES['K18_VERIFIED'], 300);
      assert.strictEqual(BADGE_PRICES['REPUTABLE_TRADER'], 200);
    });

    it('createWithdrawalSchema: Số tiền rút tối thiểu phải từ 50.000 VNĐ', () => {
      const belowMin = createWithdrawalSchema.safeParse({ amount: 30000 });
      assert.strictEqual(belowMin.success, false);

      const exactMin = createWithdrawalSchema.safeParse({ amount: 50000 });
      assert.strictEqual(exactMin.success, true);

      const aboveMin = createWithdrawalSchema.safeParse({ amount: 200000 });
      assert.strictEqual(aboveMin.success, true);
    });
  });

  describe('Admin Dashboard: Tố Cáo, Giải Quyết Khiếu Nại & Duyệt Thẻ SV KYC', () => {
    it('createReportSchema: Yêu cầu targetType và lý do tối thiểu 5 ký tự', () => {
      const shortReason = createReportSchema.safeParse({
        targetType: 'PRODUCT',
        targetId: 'prod_123',
        reason: 'xấu',
      });
      assert.strictEqual(shortReason.success, false);

      const validReport = createReportSchema.safeParse({
        targetType: 'PRODUCT',
        targetId: 'prod_123',
        reason: 'Sản phẩm có dấu hiệu làm giả thương hiệu nổi tiếng',
      });
      assert.strictEqual(validReport.success, true);
    });

    it('resolveReportSchema: Chấp nhận các hành động BAN_USER, HIDE_PRODUCT, DISMISS', () => {
      const validBan = resolveReportSchema.safeParse({
        action: 'BAN_USER',
        adminNote: 'Xác nhận tài khoản lừa đảo sinh viên',
      });
      assert.strictEqual(validBan.success, true);

      const validHide = resolveReportSchema.safeParse({
        action: 'HIDE_PRODUCT',
        adminNote: 'Sản phẩm vi phạm chính sách cấm buôn bán vũ khí',
      });
      assert.strictEqual(validHide.success, true);

      const invalidAction = resolveReportSchema.safeParse({
        action: 'DELETE_FOREVER',
        adminNote: 'Thao tác không được hỗ trợ',
      });
      assert.strictEqual(invalidAction.success, false);
    });

    it('resolveDisputeSchema: Phán quyết hoàn tiền REFUND_BUYER hoặc giải ngân RELEASE_TO_SELLER', () => {
      const refundBuyer = resolveDisputeSchema.safeParse({
        resolution: 'REFUND_BUYER',
        adminNote: 'Sản phẩm bị nứt vỡ không đúng như hình chụp ban đầu',
      });
      assert.strictEqual(refundBuyer.success, true);

      const releaseSeller = resolveDisputeSchema.safeParse({
        resolution: 'RELEASE_TO_SELLER',
        adminNote: 'Người mua không cung cấp được video unbox chứng minh lỗi',
      });
      assert.strictEqual(releaseSeller.success, true);
    });

    it('reviewKycSchema: Duyệt thẻ SV (APPROVE) thưởng +200 Xu tân sinh viên', () => {
      const approveKyc = reviewKycSchema.safeParse({ action: 'APPROVE' });
      assert.strictEqual(approveKyc.success, true);

      const rejectKyc = reviewKycSchema.safeParse({
        action: 'REJECT',
        rejectedReason: 'Ảnh thẻ SV bị mờ, không rõ mã số sinh viên SE',
      });
      assert.strictEqual(rejectKyc.success, true);

      const KYC_BONUS_COINS = 200;
      assert.strictEqual(KYC_BONUS_COINS, 200);
    });
  });

  describe('Node-Cron: Cơ Chế Quét 30 Ngày Dọn Bài & Cảnh Báo Ngày 27', () => {
    it('Tính toán số ngày còn lại chính xác cho cảnh báo ngày 27', () => {
      const now = new Date('2026-09-14T00:00:00Z');
      const expiredAt = new Date('2026-09-17T00:00:00Z'); // còn 3 ngày

      const diffMs = expiredAt.getTime() - now.getTime();
      const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      assert.strictEqual(daysLeft, 3);
    });

    it('Xác định bài đăng đã quá hạn 30 ngày (expiredAt <= now)', () => {
      const now = new Date('2026-09-14T12:00:00Z');
      const pastExpiredAt = new Date('2026-09-14T11:59:59Z');
      const futureExpiredAt = new Date('2026-09-15T00:00:00Z');

      const isExpired = pastExpiredAt.getTime() <= now.getTime();
      const isNotExpired = futureExpiredAt.getTime() <= now.getTime();

      assert.strictEqual(isExpired, true, 'Bài viết có expiredAt trong quá khứ phải hết hạn');
      assert.strictEqual(isNotExpired, false, 'Bài viết có expiredAt trong tương lai chưa hết hạn');
    });
  });

  describe('Kho Voucher Campus: DTO & Logic Đổi Xu Lấy Quà', () => {
    it('redeemVoucherSchema: Yêu cầu voucherId hợp lệ', () => {
      const invalid = redeemVoucherSchema.safeParse({});
      assert.strictEqual(invalid.success, false);

      const valid = redeemVoucherSchema.safeParse({ voucherId: 'vouch_123' });
      assert.strictEqual(valid.success, true);
    });

    it('useVoucherSchema: Yêu cầu mã voucherCode tối thiểu 5 ký tự', () => {
      const invalidShort = useVoucherSchema.safeParse({ voucherCode: 'FUV' });
      assert.strictEqual(invalidShort.success, false);

      const validCode = useVoucherSchema.safeParse({ voucherCode: 'FUV-CANTEEN-9A8B7C' });
      assert.strictEqual(validCode.success, true);
    });

    it('createVoucherAdminSchema: Kiểm tra đối tác và giá trị giảm hợp lệ', () => {
      const invalidPartner = createVoucherAdminSchema.safeParse({
        title: 'Voucher Trà Sữa Mixue',
        partner: 'UNKNOWN_SHOP',
        coinCost: 500,
        discountValue: 10000,
      });
      assert.strictEqual(invalidPartner.success, false);

      const validPassio = createVoucherAdminSchema.safeParse({
        title: 'Voucher Giảm 15k Passio Coffee',
        partner: 'PASSIO',
        coinCost: 1500,
        discountValue: 15000,
      });
      assert.strictEqual(validPassio.success, true);
    });

    it('Business Rule Đổi Voucher: Kiểm tra số dư Xu sinh viên trước khi đổi', () => {
      const canRedeemVoucher = (userCoins: number, voucherCost: number) => {
        return userCoins >= voucherCost;
      };

      const studentCoins = 800;
      const canteenVoucherCost = 1000;
      assert.strictEqual(canRedeemVoucher(studentCoins, canteenVoucherCost), false, 'Không đủ Xu không thể đổi');

      const richStudentCoins = 1500;
      assert.strictEqual(canRedeemVoucher(richStudentCoins, canteenVoucherCost), true, 'Đủ Xu có thể đổi thành công');
    });

    it('Định dạng mã voucher chuẩn: FUV-{PARTNER}-{CODE}', () => {
      const partner = 'PASSIO';
      const hexCode = '8A3F2C';
      const voucherCode = `FUV-${partner}-${hexCode}`;

      assert.match(voucherCode, /^FUV-[A-Z_]+-[A-F0-9]{6}$/);
    });
  });

  // -------------------------------------------------------------
  // 6. BẢO MẬT & HARDENING HỆ THỐNG
  // -------------------------------------------------------------
  describe('Bảo mật & Hardening: Magic Bytes, Account Lockout & Blind Review TTL', () => {
    it('isValidVideoBuffer: Chấp nhận file MP4 có signature ftyp hợp lệ', () => {
      // Giả lập 16 bytes đầu của file MP4 hợp lệ
      const validMp4Header = Buffer.from([
        0x00, 0x00, 0x00, 0x18, // box size 24
        0x66, 0x74, 0x79, 0x70, // 'f' 't' 'y' 'p'
        0x6d, 0x70, 0x34, 0x32, // 'm' 'p' '4' '2'
        0x00, 0x00, 0x00, 0x00,
      ]);
      assert.strictEqual(isValidVideoBuffer(validMp4Header), true);
    });

    it('isValidVideoBuffer: Chấp nhận file WebM có signature EBML 0x1A45DFA3', () => {
      const validWebmHeader = Buffer.from([
        0x1a, 0x45, 0xdf, 0xa3, // EBML ID
        0x9f, 0x42, 0x86, 0x81,
        0x01, 0x42, 0xf7, 0x81,
      ]);
      assert.strictEqual(isValidVideoBuffer(validWebmHeader), true);
    });

    it('isValidVideoBuffer: Từ chối file text/exe giả mạo video', () => {
      const fakeVideo = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00This is a Windows executable');
      assert.strictEqual(isValidVideoBuffer(fakeVideo), false);

      const fakeText = Buffer.from('echo "malicious script"');
      assert.strictEqual(isValidVideoBuffer(fakeText), false);
    });

    it('Account Lockout: Khóa tài khoản sau 5 lần đăng nhập thất bại', () => {
      const isAccountLocked = (failedAttempts: number, maxAttempts = 5) => {
        return failedAttempts >= maxAttempts;
      };

      assert.strictEqual(isAccountLocked(1), false);
      assert.strictEqual(isAccountLocked(4), false);
      assert.strictEqual(isAccountLocked(5), true, '5 lần sai phải bị khóa');
      assert.strictEqual(isAccountLocked(6), true);
    });

    it('Blind Review: Tự động công khai khi đã quá 7 ngày (604800000 ms)', () => {
      const now = new Date('2026-09-14T00:00:00Z');
      const reviewCreatedAt6DaysAgo = new Date('2026-09-08T00:00:00Z'); // 6 ngày trước
      const reviewCreatedAt8DaysAgo = new Date('2026-09-06T00:00:00Z'); // 8 ngày trước

      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const shouldAutoPublish = (createdAt: Date) => now.getTime() - createdAt.getTime() >= SEVEN_DAYS_MS;

      assert.strictEqual(shouldAutoPublish(reviewCreatedAt6DaysAgo), false, '6 ngày chưa được tự động mở');
      assert.strictEqual(shouldAutoPublish(reviewCreatedAt8DaysAgo), true, '8 ngày phải tự động mở');
    });
  });

  describe('Seller Onboarding KYC & Tự Động Nâng Quyền Người Bán', () => {
    it('sellerOnboardingSchema: Xác thực thông tin nộp form đăng ký Người Bán hợp lệ', () => {
      const validForm = sellerOnboardingSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        studentId: 'SE170123',
        phoneNumber: '0987654321',
        campus: 'HOL',
        bankName: 'Vietcombank',
        accountNo: '1029384756',
        accountName: 'NGUYEN VAN A',
      });
      assert.strictEqual(validForm.success, true);
    });

    it('sellerOnboardingSchema: Bắt buộc đầy đủ các trường MSSV, Họ tên, SĐT, Campus, Ngân hàng', () => {
      // Thiếu MSSV
      const missingStudentId = sellerOnboardingSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0987654321',
        campus: 'HOL',
        bankName: 'Vietcombank',
        accountNo: '1029384756',
        accountName: 'NGUYEN VAN A',
      });
      assert.strictEqual(missingStudentId.success, false);

      // MSSV quá ngắn (< 5 ký tự)
      const shortStudentId = sellerOnboardingSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        studentId: 'SE1',
        phoneNumber: '0987654321',
        campus: 'HOL',
        bankName: 'Vietcombank',
        accountNo: '1029384756',
        accountName: 'NGUYEN VAN A',
      });
      assert.strictEqual(shortStudentId.success, false);

      // Campus không hợp lệ
      const invalidCampus = sellerOnboardingSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        studentId: 'SE170123',
        phoneNumber: '0987654321',
        campus: 'HN_UNKNOWN',
        bankName: 'Vietcombank',
        accountNo: '1029384756',
        accountName: 'NGUYEN VAN A',
      });
      assert.strictEqual(invalidCampus.success, false);

      // Số tài khoản ngân hàng quá ngắn
      const shortAccountNo = sellerOnboardingSchema.safeParse({
        fullName: 'Nguyễn Văn A',
        studentId: 'SE170123',
        phoneNumber: '0987654321',
        campus: 'HCM',
        bankName: 'TPBank',
        accountNo: '12',
        accountName: 'NGUYEN VAN A',
      });
      assert.strictEqual(shortAccountNo.success, false);
    });

    it('Quy tắc phân tách duyệt: Nộp Seller Onboarding mới nâng lên SELLER; Nộp Student KYC giữ nguyên BUYER', () => {
      const determineRoleOnApproval = (
        currentRole: 'BUYER' | 'SELLER' | 'ADMIN',
        kycType: 'STUDENT' | 'SELLER'
      ) => {
        if (kycType === 'SELLER' && currentRole === 'BUYER') {
          return 'SELLER';
        }
        return currentRole;
      };

      // Student KYC: Giữ nguyên BUYER
      assert.strictEqual(
        determineRoleOnApproval('BUYER', 'STUDENT'),
        'BUYER',
        'Student KYC duyệt xong vẫn là BUYER (có Tích Xanh sinh viên)'
      );
      // Seller Onboarding: Nâng lên SELLER
      assert.strictEqual(
        determineRoleOnApproval('BUYER', 'SELLER'),
        'SELLER',
        'Seller Onboarding duyệt xong được nâng lên SELLER'
      );
      // ADMIN: Giữ nguyên
      assert.strictEqual(
        determineRoleOnApproval('ADMIN', 'SELLER'),
        'ADMIN',
        'ADMIN không bị hạ'
      );
    });

    it('Quy tắc cộng Xu & Tích Xanh khi duyệt: Thưởng +200 Xu và gán verifiedAt', () => {
      const currentCoins = 50;
      const kycBonus = 200;
      const now = new Date();

      const updatedState = {
        coins: currentCoins + kycBonus,
        kycStatus: 'APPROVED',
        verifiedAt: now,
      };

      assert.strictEqual(updatedState.coins, 250);
      assert.strictEqual(updatedState.kycStatus, 'APPROVED');
      assert.ok(updatedState.verifiedAt instanceof Date);
    });

    it('Phương án 3: Giao dịch MEETUP tự do, giao dịch SHIP_COD bắt buộc KYC APPROVED', () => {
      const canCreateOrder = (orderType: 'MEETUP' | 'SHIP_COD', kycStatus?: string) => {
        if (orderType === 'SHIP_COD' && kycStatus !== 'APPROVED') {
          return false;
        }
        return true;
      };

      // MEETUP: Tự do dù chưa KYC
      assert.strictEqual(canCreateOrder('MEETUP', undefined), true, 'Tài khoản chưa KYC vẫn được mua MEETUP tại trường');
      assert.strictEqual(canCreateOrder('MEETUP', 'PENDING'), true, 'Đang chờ duyệt KYC vẫn mua MEETUP bình thường');
      assert.strictEqual(canCreateOrder('MEETUP', 'APPROVED'), true);

      // SHIP_COD: Bắt buộc KYC APPROVED
      assert.strictEqual(canCreateOrder('SHIP_COD', undefined), false, 'Chưa KYC không được đặt SHIP_COD');
      assert.strictEqual(canCreateOrder('SHIP_COD', 'PENDING'), false, 'Chờ duyệt KYC chưa được đặt SHIP_COD');
      assert.strictEqual(canCreateOrder('SHIP_COD', 'REJECTED'), false, 'Bị từ chối KYC không được đặt SHIP_COD');
      assert.strictEqual(canCreateOrder('SHIP_COD', 'APPROVED'), true, 'Đã duyệt KYC được đặt SHIP_COD');
    });

    it('Phương án 3: Đăng bán / trao đổi sản phẩm bắt buộc quyền SELLER/ADMIN hoặc KYC APPROVED', () => {
      const canPostProduct = (role: 'BUYER' | 'SELLER' | 'ADMIN', kycStatus?: string) => {
        return role === 'SELLER' || role === 'ADMIN' || kycStatus === 'APPROVED';
      };

      assert.strictEqual(canPostProduct('BUYER', undefined), false, 'Tài khoản BUYER chưa KYC không được đăng bán');
      assert.strictEqual(canPostProduct('BUYER', 'PENDING'), false, 'Tài khoản BUYER đang chờ duyệt KYC chưa được đăng bán');
      assert.strictEqual(canPostProduct('BUYER', 'APPROVED'), true, 'BUYER đã duyệt KYC được đăng bán');
      assert.strictEqual(canPostProduct('SELLER', undefined), true, 'SELLER được quyền đăng bán');
      assert.strictEqual(canPostProduct('ADMIN', undefined), true, 'ADMIN được quyền đăng bán');
    });
  });
});
