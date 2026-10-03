# BÁO CÁO 09: ĐỒNG BỘ TÍNH NĂNG THIẾU GIỮA MOBILE VÀ BACKEND

## 1. Mục tiêu
Báo cáo này ghi nhận việc bổ sung và kết nối toàn bộ các logic nghiệp vụ mà Backend đã cung cấp nhưng phân hệ Mobile trước đây còn thiếu hoặc chỉ xử lý giả lập (mock), đưa mức độ tương thích tính năng giữa Mobile và Backend đạt **100%**.

---

## 2. Các tính năng đã được bổ sung & hoàn thiện

### A. Hệ thống Báo cáo vi phạm Sản phẩm & Người dùng (`POST /api/reports`)
- **Backend API**:
  - `POST /api/reports`: Nhận payload `{ targetType: 'PRODUCT' | 'USER', targetId: string, reason: string, details?: string }`.
  - `GET /api/reports/me`: Xem lịch sử khiếu nại và tiến độ giải quyết của BQT.
- **Mobile triển khai**:
  - **Service**: Tạo [`reportMobileService.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/services/reportMobileService.ts).
  - **Constants**: [`reportReasons.constants.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/report/constants/reportReasons.constants.ts) định nghĩa phân loại lý do lừa đảo, hàng cấm, thông tin sai lệch theo văn hóa FPT.
  - **Subcomponents**:
    - [`ReportReasonSelector.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/report/components/ReportReasonSelector.tsx): Bọc `React.memo`, radio chọn lý do.
    - [`ReportModal.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/report/components/ReportModal.tsx): BottomSheet modal với ô nhập chi tiết bằng chứng.
    - [`useReportModal.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/report/hooks/useReportModal.ts): Controller hook xử lý dispatch API.
  - **Tích hợp điểm chạm**:
    - [`ProductDetailHeader.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/product-detail/components/ProductDetailHeader.tsx) & [`ProductDetailScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/product-detail/screens/ProductDetailScreen.tsx): Báo cáo tin đăng có dấu hiệu gian lận.
    - [`PublicSellerProfileScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/screens/PublicSellerProfileScreen.tsx): Báo cáo người bán có hành vi quấy rối, bùng hẹn Safe-Point.

---

### B. Cổng Nạp Tiền & Xu qua VietQR Napas 24/7 (`/api/payments`)
- **Backend API**:
  - Webhook SePay/VietQR: `/api/webhooks/payments` tự động so khớp nội dung chuyển khoản và giải phóng số dư.
  - Tra cứu trạng thái thanh toán: `GET /api/payments/order/:orderCode/status`.
- **Mobile triển khai**:
  - **Service**: [`paymentMobileService.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/services/paymentMobileService.ts) sinh ảnh VietQR chuẩn Napas 24/7 với mã đơn `FUMKT NAP <userId> <timestamp>`.
  - **Constants**: [`depositPackages.constants.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/constants/depositPackages.constants.ts) định nghĩa các gói 20k (+20 Xu), 50k (+55 Xu), 100k (+120 Xu), 200k (+250 Xu).
  - **Components**:
    - [`DepositPackageSelector.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/components/DepositPackageSelector.tsx)
    - [`DepositQrView.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/components/DepositQrView.tsx): Hiển thị QR và nút 1 chạm sao chép số tài khoản & nội dung.
    - [`DepositCoinModal.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/components/DepositCoinModal.tsx): Luồng 2 bước (Chọn gói ➔ Quét mã QR ➔ Cộng Xu ngay).
  - **Tích hợp**: Nút "Nạp ví" trên [`CampusWalletCard.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/components/CampusWalletCard.tsx) và [`ProfileScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/screens/ProfileScreen.tsx).

---

### C. Đồng bộ Điểm danh Hàng ngày & Nhiệm vụ tuần (`/api/profile/check-in`)
- **Backend API**:
  - `GET /api/profile/check-in-status`: Kiểm tra streak chuỗi ngày và trạng thái điểm danh hôm nay.
  - `POST /api/profile/check-in`: Nhận 20 Xu điểm danh.
  - `POST /api/profile/claim-quest`: Nhận thưởng hoàn tất nhiệm vụ.
- **Mobile triển khai**:
  - Đã liên kết API thật trong [`profileMobileService.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/services/profileMobileService.ts).
  - Hook [`useVoucher.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/voucher/hooks/useVoucher.ts) tự động gọi backend kiểm tra streak khi mở màn hình Ví Voucher, đồng bộ số dư với `walletStore` khi nhận thưởng.

---

### D. Tự động Đăng ký Push Notification Device Token (`/api/notifications/fcm-token`)
- **Backend API**:
  - `POST /api/notifications/fcm-token` & `POST /api/notifications/device-token`.
- **Mobile triển khai**:
  - Trong [`App.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/App.tsx), hàm `registerForPushNotificationsAsync()` và `setupNotificationListeners()` được khởi động ngay khi app mở, xin quyền thông báo từ hệ điều hành và gửi Native FCM Token / Expo Token lên Backend để sẵn sàng nhận thông báo đơn hàng và tin nhắn thời gian thực.
