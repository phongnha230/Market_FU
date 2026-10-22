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
│   └── 01_DATA_INTEGRITY_AUDIT_AND_API_ALIGNMENT.md   <-- Kiểm toán tính toàn vẹn dữ liệu, quan hệ Prisma & Test Suites
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
│   └── 08_REAL_DATA_ALIGNMENT_AND_DEAD_BUTTON_FIXES.md<-- [MỚI] Triệt tiêu dữ liệu ảo, đổi mật khẩu & KYC thật, sửa nút liệt
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
    ├── 17_EAS_BUILD_ENVIRONMENT_VPS_CONNECTION_AND_EMPTY_FEED_FIX.md <-- Sửa lỗi Trang chủ rỗng (không tải được sản phẩm) do lệch môi trường EAS & kết nối VPS
    └── 18_REALTIME_CHAT_GOOGLE_LOGIN_CHOOSER_AND_WHITE_NOTIFICATION_BANNER.md <-- [MỚI] Sửa chọn tài khoản Google, Realtime tin nhắn trong phòng chat & In-App Banner trắng sang trọng
```

---

## 📌 TÓM TẮT HẠNG MỤC THEO PHÂN HỆ

### 1. Phân hệ Backend (`report/backend/`)
- **Quản lý dữ liệu nghiêm ngặt**: Đảm bảo toàn bộ quan hệ trong MongoDB Prisma (`Report`, `User`, `Order`, `Review`) xử lý nhất quán khi có tài khoản hoặc dữ liệu bị xóa (chống crash 500 với orphan records).
- **Kiểm soát phân quyền & hạn mức**: Giới hạn đăng tin tối đa 3 tin/tháng đối với người dùng thông thường (`BUYER`); chỉ tài khoản Người Bán đã xác thực (`SELLER`) mới được đăng tin không giới hạn.
- **Bảo mật & Rate Limiter**: Kiểm soát chặt chẽ các API Gemini Vision, Chatbot và giao dịch tiền/xu, ngăn chặn gian lận số dư qua client.
- **Chi tiết tại:** [`report/backend/01_DATA_INTEGRITY_AUDIT_AND_API_ALIGNMENT.md`](./backend/01_DATA_INTEGRITY_AUDIT_AND_API_ALIGNMENT.md)

### 2. Phân hệ Web Frontend (`report/frontend/`)
- **Triệt tiêu 3 lỗ hổng Fake nghiêm trọng**:
  1. *Đổi mật khẩu*: Buộc nhập mật khẩu cũ, gọi `POST /api/auth/change-password` thật, hiển thị lỗi chính xác từ server khi sai mật khẩu.
  2. *Xác thực KYC*: Loại bỏ ảnh thẻ mẫu Unsplash mặc định, bắt buộc upload ảnh thẻ sinh viên thật và không hiện thông báo chúc mừng ảo khi server từ chối.
  3. *Đánh giá sản phẩm*: Xóa bỏ đoạn code tự cộng Xu ảo ở local khi backend chưa xác nhận.
- **Kích hoạt các nút bấm bị liệt**:
  - Nút "Nhắn tin >" trên thẻ người bán (`SellerTrustCard`) tự động tạo hội thoại thật và mở khung chat.
  - Nút "Xem bài đăng gốc" trong mục Yêu thích trỏ chính xác vào ID sản phẩm.
  - Nút phóng to ảnh (`ProductGallery`) mở lightbox xem ảnh kích thước đầy đủ.
- **Chi tiết tại:** [`report/frontend/08_REAL_DATA_ALIGNMENT_AND_DEAD_BUTTON_FIXES.md`](./frontend/08_REAL_DATA_ALIGNMENT_AND_DEAD_BUTTON_FIXES.md)

### 3. Phân hệ Mobile App (`report/mobile/`)
- **Xóa bỏ toàn bộ cơ chế giả lập Offline**:
  - Xóa mã token giả mạo ngẫu nhiên `token_${Date.now()}` trong `userStore.ts`.
  - Xóa hành vi tự cộng số dư, tự duyệt nạp/rút tiền ảo trong `walletStore.ts`.
  - Xóa sinh mã voucher lậu `FUV-xxxx` trong `voucherStore.ts`.
  - Xóa nhánh catch block tự báo "Đăng tin thành công" khi bị backend chặn vượt hạn mức.
- **Kết nối AI Vision Thật**:
  - Loại bỏ hoàn toàn `AI_PRESETS` và `setTimeout` giả lập.
  - Nối trực tiếp luồng chụp ảnh sản phẩm với `POST /api/ai/vision-post` để Gemini AI phân tích hình ảnh, định giá và điền tự động 100% dữ liệu thực tế.
- **Chi tiết tại:** [`report/mobile/15_ELIMINATE_MOCK_FALLBACKS_AND_AI_VISION_WIRING.md`](./mobile/15_ELIMINATE_MOCK_FALLBACKS_AND_AI_VISION_WIRING.md)
- **Sửa crash APK khi vào Home**: Khử vòng lặp phụ thuộc `useAuthStore` <-> `apiClient` trên máy ảo JS Hermes của Android. Chi tiết: [`report/mobile/16_ANDROID_APK_CRASH_AND_CIRCULAR_DEPENDENCY_FIX.md`](./mobile/16_ANDROID_APK_CRASH_AND_CIRCULAR_DEPENDENCY_FIX.md)
- **Khắc phục lỗi không tải được sản phẩm trên APK Build**: Đồng bộ biến môi trường EAS VPS `https://api.jintdp.dpdns.org/api`. Chi tiết: [`report/mobile/17_EAS_BUILD_ENVIRONMENT_VPS_CONNECTION_AND_EMPTY_FEED_FIX.md`](./mobile/17_EAS_BUILD_ENVIRONMENT_VPS_CONNECTION_AND_EMPTY_FEED_FIX.md)
- **Chọn tài khoản Google, Chat Realtime & Banner Trắng**: Bật Account Chooser Google, tự động sync auth token socket phòng chat, thiết kế in-app notification banner nền trắng có logo & avatar. Chi tiết: [`report/mobile/18_REALTIME_CHAT_GOOGLE_LOGIN_CHOOSER_AND_WHITE_NOTIFICATION_BANNER.md`](./mobile/18_REALTIME_CHAT_GOOGLE_LOGIN_CHOOSER_AND_WHITE_NOTIFICATION_BANNER.md)

---

## 🎯 KẾT QUẢ KIỂM THỬ TỔNG THỂ

- **TypeScript Typecheck**:
  - `backend/`: **0 lỗi** (`tsc --noEmit` exit 0)
  - `frontend/`: **0 lỗi** (`tsc --noEmit` exit 0)
  - `mobile/`: **0 lỗi** (`tsc --noEmit` exit 0)
- **Nút bấm liệt / Form giả lập**: **0**
- **Dữ liệu giả / Báo thành công ảo**: **0**
- **Test Suites Backend**: **100% PASS**
