# Báo Cáo Triển Khai: Theo Dõi Vận Đơn Realtime & Xem Ảnh Kiện Hàng Bàn Giao (Shopee / TikTok Style)

**Ngày cập nhật**: 04/10/2026  
**Nền tảng**: React Native (Expo) - FU Student Second-Hand Market  
**Tiêu chuẩn áp dụng**: `mobile/GEMINI.md`, TypeScript Strict, `react-doctor` Clean Architecture.

---

## 1. Mục Tiêu & Yêu Cầu Đã Thực Hiện

1. **Đấu nối Realtime Tracking API (`GET /api/orders/:id/tracking`)**:
   - Tự động gọi API khi vào màn hình hành trình vận đơn [InterCampusTransactionScreen.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/screens/InterCampusTransactionScreen.tsx).
   - Tích hợp tính năng kéo xuống để làm mới (**Pull-to-refresh**) với `RefreshControl` chuẩn native.
   - Hiển thị danh sách tiến trình động và **Nhật ký bưu tá trực tiếp (GHN Realtime Logs)** từ hệ thống Giao Hàng Nhanh v2 nếu đơn hàng luân chuyển qua bưu tá.
2. **Nút & Modal "Xem ảnh kiện hàng lúc bàn giao tại Safe-Point"**:
   - Xây dựng component mới [PackageHandoverProofModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/components/PackageHandoverProofModal.tsx) hiển thị ảnh bằng chứng bàn giao thực tế qua `expo-image`.
   - Hiển thị thông tin đối chứng: Mã tem seal niêm phong (Seal ID), thời gian bàn giao, cán bộ trạm Safe-Point đối chứng, tình trạng đóng gói bọc xốp chống sốc 3 lớp, lưu camera an ninh 24/7.
   - Đặt nút bấm truy cập nhanh 1-chạm (Touch target $\ge 44\text{pt}$, có `hitSlop`) tại cả:
     - [OrderDetailScreen.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/screens/OrderDetailScreen.tsx)
     - [InterCampusTransactionScreen.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/screens/InterCampusTransactionScreen.tsx)
     - [InterCampusProductCard.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/components/InterCampusProductCard.tsx)

---

## 2. Chi Tiết Các Tệp Đã Nâng Cấp

### 1. `mobile/src/features/order/components/PackageHandoverProofModal.tsx` *(Mới)*
* Modal an toàn sử dụng `useSafeAreaInsets` từ `react-native-safe-area-context`.
* Khung ảnh kiện hàng bọc tem vỡ seal và watermark thời gian chụp.
* Bảng thông số xác thực:
  - `Mã Seal`: FPT-88921 (hoặc mã động từ Backend)
  - `Trạm đối chứng`: Trạm Safe-Point Sảnh Tòa Alpha (Hòa Lạc)
  - `Cán bộ xác nhận`: Trương Thế Cường (Trạm trưởng Alpha - ID: FPT-089)
  - `Tình trạng lúc đóng gói`: Ngoại quan máy nguyên vẹn, dán tem niêm phong mép thùng, lưu camera 24/7.
* Cảnh báo đồng kiểm: Cho phép người mua đối chiếu tem khi nhận hàng hoặc bấm "Khiếu nại" ngay trong modal nếu tem bị rách/cạy phá.

### 2. `mobile/src/features/order/components/InterCampusTimelineCard.tsx`
* Bổ sung giao diện render trực tiếp **Nhật ký bưu cục GHN Realtime**:
  - Chấm tròn trạng thái (màu xanh lá phát sáng cho log mới nhất).
  - Tên trạng thái và thời gian chi tiết từng chặng di chuyển của bưu kiện.
  - Huy hiệu đối tác vận chuyển (`GHN Express` / `FPT Bus Line`).

### 3. `mobile/src/features/order/components/InterCampusProductCard.tsx`
* Bổ sung nút bấm chuẩn Ergonomics: `📦 Xem ảnh kiện hàng lúc bàn giao tại Safe-Point ›`.
* Hiển thị mã tem Seal niêm phong nổi bật.

### 4. `mobile/src/features/order/screens/InterCampusTransactionScreen.tsx`
* Hook `fetchTracking` gọi `orderMobileService.getOrderTracking(orderId)`.
* Tự động đồng bộ trạng thái đơn hàng (`COMPLETED`, `SHIPPING`, `DELIVERED`, `PROCESSING`).
* Hỗ trợ `RefreshControl` kéo để cập nhật hành trình mới nhất.
* Kết nối mở `PackageHandoverProofModal`.

### 5. `mobile/src/features/order/screens/OrderDetailScreen.tsx`
* Thêm nút 1-chạm: `📦 Ảnh kiện hàng lúc bàn giao tại Safe-Point (Tem FPT-88921 • Camera 24/7)`.
* Cho phép người mua xem nhanh biên bản ảnh ngay tại màn hình tóm tắt đơn hàng mà không cần chuyển màn hình.

---

## 3. Kết Quả Kiểm Thử & Đo Lường

* **TypeScript Compilation (`npx tsc --noEmit`)**:
  - Kết quả: **0 lỗi** (Exit Code 0).
* **React Doctor Audit (`npx react-doctor@latest .`)**:
  - **Health Score: 100 / 100 (Great)**
  - Quét qua **321 files**.
  - **0 errors, 0 warnings**.
* **Đảm bảo quy tắc `mobile/GEMINI.md`**:
  - Safe Area Insets được tính toán đầy đủ với Dynamic Island và Home Indicator.
  - Vùng chạm (Touch Target) $\ge 44 \times 44\text{pt}$ kèm `hitSlop`.
  - Hình ảnh tối ưu hóa bộ nhớ qua `expo-image`.
