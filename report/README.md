# 📑 BÁO CÁO TỔNG THỂ DỰ ÁN: KIỂM SOÁT DỮ LIỆU THẬT & ĐỒNG BỘ BACKEND - WEB - MOBILE

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (`FU Student Second-Hand Market`)  
**Thời gian cập nhật:** Tháng 10/2026  
**Mục tiêu rà soát:** Triệt tiêu hoàn toàn dữ liệu giả (fake/mock), loại bỏ các nhánh "báo thành công ảo" (fake success catch block), khắc phục nút bấm liệt, và kết nối đồng bộ 100% giữa API Backend với Web Frontend và Mobile App.

---

## 🗺️ CẤU TRÚC THƯ MỤC BÁO CÁO (`report/`)

Thư mục báo cáo được phân chia rõ ràng theo từng phân hệ trong hệ thống:

```
report/
├── README.md                                          <-- Bạn đang ở đây (Bản đồ tổng quan)
│
├── backend/                                           <-- Phân hệ Máy chủ & API RESTful / Socket
│   ├── 00_BACKEND_OVERVIEW_AND_ENDPOINTS.md           <-- Danh mục các endpoint API cốt lõi
│   ├── 01_DATA_INTEGRITY_AUDIT_AND_API_ALIGNMENT.md   <-- Kiểm toán tính toàn vẹn dữ liệu, quan hệ Prisma & Test Suites
│   ├── 02_ONE_WAY_BUYER_REVIEW_SYSTEM_AND_BLIND_REVIEW_CLEANUP.md <-- Chuẩn hóa đánh giá 1 chiều, bỏ Blind Review, kiểm soát đơn PayOS
│   └── backend_audit_report.md                        <-- Rà soát API endpoints chưa khai thác hết & hạn mức rate-limiting
│
├── frontend/                                          <-- Phân hệ Web Client (Next.js / React)
│   ├── 00_FRONTEND_OVERVIEW_AND_ARCHITECTURE.md       <-- Kiến trúc giao diện Web
│   ├── 01_SAFE_ORDER_CANCELLATION_MODAL.md            <-- Modal hủy đơn hoàn tiền Escrow
│   ├── 02_SELLER_PRODUCT_BOOST_AND_COIN_WALLET.md     <-- Tính năng Đẩy tin & Ví FPT Coin
│   ├── 03_COIN_HISTORY_AND_WALLET_LEDGER.md           <-- Lịch sử biến động Xu
│   ├── 04_STUDENT_REPORT_HISTORY_AND_ADMIN_NOTES.md   <-- Theo dõi tố cáo & phản hồi BQT
│   ├── 05_REDIS_REALTIME_TRENDING_SEARCHES.md         <-- Top từ khóa thịnh hành Redis
│   ├── 06_DISPUTE_RESOLUTION_AND_WITHDRAWAL.md        <-- Tự rút khiếu nại tranh chấp
│   ├── 07_CODE_OPTIMIZATION_AND_MODULAR_REFACTORING.md<-- Tối ưu Clean Code & Modular
│   ├── 08_REAL_DATA_ALIGNMENT_AND_DEAD_BUTTON_FIXES.md<-- Triệt tiêu dữ liệu ảo, đổi mật khẩu & KYC thật, sửa nút liệt
│   └── frontend_audit_report.md                       <-- Rà soát modal đổi mật khẩu, KYC, review & nút chức năng
│
└── mobile/                                            <-- Phân hệ Ứng dụng Di động (React Native / Expo)
    ├── 00_OVERVIEW_AND_METRICS.md                     <-- Chỉ số và hiệu năng ứng dụng di động
    ├── 01_BUG_FIXES_FLATLIST_PERFORMANCE.md           <-- Sửa bug giật lag danh sách
    ├── 02_AUTH_LOGIN_REGISTER_REFACTOR.md             <-- Chuẩn hóa luồng xác thực
    ├── 03_PROFILE_EDIT_MODAL_STATE_REFACTOR.md        <-- Quản lý state Modal hồ sơ
    ├── 04_PRODUCT_DETAIL_ACTIONS_REFACTOR.md          <-- Tách Controller chi tiết sản phẩm
    ├── 05_CHECKOUT_SCREEN_CONTROLLER.md               <-- Controller thanh toán Escrow
    ├── 06_POST_ITEM_EDIT_LISTING_OPTIMIZATION.md      <-- Tối ưu form đăng bán
    ├── 07_SETTINGS_SCREENS_MEMO_OPTIMIZATION.md       <-- Tối ưu bộ nhớ màn hình cài đặt
    ├── 08_TYPESCRIPT_TYPE_SAFETY_FIXES.md             <-- Sửa lỗi type an toàn TypeScript
    ├── 09_BACKEND_FEATURE_ALIGNMENT_REPORT.md         <-- Khảo sát đồng bộ tính năng
    ├── 10_GEMINI_MD_MOBILE_COMPLIANCE.md              <-- Tuân thủ tài liệu hướng dẫn kỹ thuật
    ├── 11_ROLE_BASED_DYNAMIC_NAVIGATION.md            <-- Phân quyền Buyer / Seller trên Navigation
    ├── 12_HOME_HEADER_AVATAR_AUTH_SYNC.md             <-- Đồng bộ Avatar và phiên đăng nhập
    ├── 13_ORDER_REALTIME_SHIPPING_AND_PROOF_PHOTO.md  <-- Theo dõi vận chuyển & ảnh bằng chứng
    ├── 14_WEB_PARITY_SYNC_REPORT.md                   <-- So khớp độ tương đồng Web - Mobile
    ├── 15_ELIMINATE_MOCK_FALLBACKS_AND_AI_VISION_WIRING.md <-- Xóa fallback ảo, nạp/rút tiền thật, nối AI Vision quét ảnh
    ├── 16_ANDROID_APK_CRASH_AND_CIRCULAR_DEPENDENCY_FIX.md <-- Sửa lỗi văng app (Circular Dependency useAuthStore) khi vào Trang chủ trên APK
    ├── 17_EAS_BUILD_ENVIRONMENT_VPS_CONNECTION_AND_EMPTY_FEED_FIX.md <-- Sửa lỗi Trang chủ rỗng do lệch môi trường EAS & kết nối VPS
    ├── 18_REALTIME_CHAT_GOOGLE_LOGIN_CHOOSER_AND_WHITE_NOTIFICATION_BANNER.md <-- Sửa chọn tài khoản Google, Realtime tin nhắn & Banner trắng
    ├── 19_ANDROID_3BUTTON_NAVIGATION_BAR_ADAPTATION_AND_FAVORITE_BADGE.md <-- Tương thích 3 phím ảo Android & Badge tab Đã lưu Realtime
    ├── 20_EAS_BUILD_MIGRATION_NEW_ACCOUNT_AND_KEYSTORE_SETUP.md <-- Đổi tài khoản EAS Build mới NhaSC, tạo Keystore & sửa slug
    └── mobile_optimization_and_audit_report.md        <-- Tối ưu hóa toàn bộ màn hình, dọn dẹp component rác & cuộn 60fps
```

---

## 📌 TÓM TẮT HẠNG MỤC THEO PHÂN HỆ

### 1. Phân hệ Backend (`report/backend/`)
- **Quản lý dữ liệu nghiêm ngặt**: Đảm bảo toàn bộ quan hệ trong MongoDB Prisma (`Report`, `User`, `Order`, `Review`) xử lý nhất quán khi có tài khoản hoặc dữ liệu bị xóa (chống crash 500 với orphan records).
- **Chuẩn hóa đánh giá 1 chiều (Buyer -> Seller)**: Bỏ cơ chế Blind Review 7 ngày, công khai đánh giá tức thì (`isPublic: true`) và cập nhật điểm tín nhiệm Seller ngay khi gửi.
- **Kiểm soát đơn hàng PayOS & Tồn kho**: Phân tích và thiết lập cơ chế tự hủy đơn PayOS treo quá hạn để giải phóng sản phẩm về chợ.
- **Chi tiết tại:**
  - [`01_DATA_INTEGRITY_AUDIT_AND_API_ALIGNMENT.md`](./backend/01_DATA_INTEGRITY_AUDIT_AND_API_ALIGNMENT.md)
  - [`02_ONE_WAY_BUYER_REVIEW_SYSTEM_AND_BLIND_REVIEW_CLEANUP.md`](./backend/02_ONE_WAY_BUYER_REVIEW_SYSTEM_AND_BLIND_REVIEW_CLEANUP.md)
  - [`backend_audit_report.md`](./backend/backend_audit_report.md)

### 2. Phân hệ Web Frontend (`report/frontend/`)
- **Triệt tiêu 3 lỗ hổng Fake nghiêm trọng**:
  1. *Đổi mật khẩu*: Buộc nhập mật khẩu cũ, gọi `POST /api/auth/change-password` thật, hiển thị lỗi chính xác từ server khi sai mật khẩu.
  2. *Xác thực KYC*: Loại bỏ ảnh thẻ mẫu Unsplash mặc định, bắt buộc upload ảnh thẻ sinh viên thật và không hiện thông báo chúc mừng ảo khi server từ chối.
  3. *Đánh giá sản phẩm*: Xóa bỏ đoạn code tự cộng Xu ảo ở local khi backend chưa xác nhận.
- **Kích hoạt các nút bấm bị liệt**:
  - Nút "Nhắn tin >" trên thẻ người bán (`SellerTrustCard`) tự động tạo hội thoại thật và mở khung chat.
  - Nút "Xem bài đăng gốc" trong mục Yêu thích trỏ chính xác vào ID sản phẩm.
  - Nút phóng to ảnh (`ProductGallery`) mở lightbox xem ảnh kích thước đầy đủ.
- **Chi tiết tại:**
  - [`08_REAL_DATA_ALIGNMENT_AND_DEAD_BUTTON_FIXES.md`](./frontend/08_REAL_DATA_ALIGNMENT_AND_DEAD_BUTTON_FIXES.md)
  - [`frontend_audit_report.md`](./frontend/frontend_audit_report.md)

### 3. Phân hệ Mobile App (`report/mobile/`)
- **Xóa bỏ toàn bộ cơ chế giả lập Offline**:
  - Xóa mã token giả mạo ngẫu nhiên `token_${Date.now()}` trong `userStore.ts`.
  - Xóa hành vi tự cộng số dư, tự duyệt nạp/rút tiền ảo trong `walletStore.ts`.
  - Xóa sinh mã voucher lậu `FUV-xxxx` trong `voucherStore.ts`.
  - Xóa nhánh catch block tự báo "Đăng tin thành công" khi bị backend chặn vượt hạn mức.
- **Kết nối AI Vision Thật**:
  - Loại bỏ hoàn toàn `AI_PRESETS` và `setTimeout` giả lập.
  - Nối trực tiếp luồng chụp ảnh sản phẩm với `POST /api/ai/vision-post` để Gemini AI phân tích hình ảnh, định giá và điền tự động 100% dữ liệu thực tế.
- **Tối ưu cuộn mượt 60fps & dọn dẹp component thừa**:
  - Áp dụng `React.memo` & `useCallback` cho mọi danh sách lớn (`HomeScreen`, `ProductListScreen`, `SearchScreen`).
  - Xóa sạch 6 component mồ côi trong `features/home/` và hợp nhất modal xác thực trùng lặp 480 dòng.
- **Chi tiết tại:**
  - [`15_ELIMINATE_MOCK_FALLBACKS_AND_AI_VISION_WIRING.md`](./mobile/15_ELIMINATE_MOCK_FALLBACKS_AND_AI_VISION_WIRING.md)
  - [`16_ANDROID_APK_CRASH_AND_CIRCULAR_DEPENDENCY_FIX.md`](./mobile/16_ANDROID_APK_CRASH_AND_CIRCULAR_DEPENDENCY_FIX.md)
  - [`17_EAS_BUILD_ENVIRONMENT_VPS_CONNECTION_AND_EMPTY_FEED_FIX.md`](./mobile/17_EAS_BUILD_ENVIRONMENT_VPS_CONNECTION_AND_EMPTY_FEED_FIX.md)
  - [`18_REALTIME_CHAT_GOOGLE_LOGIN_CHOOSER_AND_WHITE_NOTIFICATION_BANNER.md`](./mobile/18_REALTIME_CHAT_GOOGLE_LOGIN_CHOOSER_AND_WHITE_NOTIFICATION_BANNER.md)
  - [`19_ANDROID_3BUTTON_NAVIGATION_BAR_ADAPTATION_AND_FAVORITE_BADGE.md`](./mobile/19_ANDROID_3BUTTON_NAVIGATION_BAR_ADAPTATION_AND_FAVORITE_BADGE.md)
  - [`20_EAS_BUILD_MIGRATION_NEW_ACCOUNT_AND_KEYSTORE_SETUP.md`](./mobile/20_EAS_BUILD_MIGRATION_NEW_ACCOUNT_AND_KEYSTORE_SETUP.md)
  - [`mobile_optimization_and_audit_report.md`](./mobile/mobile_optimization_and_audit_report.md)

---

## 🎯 KẾT QUẢ KIỂM THỬ TỔNG THỂ

- **TypeScript Typecheck**:
  - `backend/`: **0 lỗi** (`tsc --noEmit` exit 0)
  - `frontend/`: **0 lỗi** (`tsc --noEmit` exit 0)
  - `mobile/`: **0 lỗi** (`tsc --noEmit` exit 0)
- **Nút bấm liệt / Form giả lập**: **0**
- **Dữ liệu giả / Báo thành công ảo**: **0**
- **Test Suites Backend**: **100% PASS**
