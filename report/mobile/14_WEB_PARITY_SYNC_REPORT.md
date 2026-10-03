# BÁO CÁO ĐỒNG BỘ TÍNH NĂNG WEB VÀO MOBILE (PARITY SYNC)
**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (fu-secondhand-mobile)  
**Ngày thực hiện:** 04/10/2026  
**Chất lượng mã nguồn:**  
- **TypeScript:** 0 lỗi (`npx tsc --noEmit` đạt Exit Code 0)
- **React Doctor Audit:** **100 / 100 Great** (`0 issues`, `0 warnings`)
- **Nguyên tắc mobile/GEMINI.md:** Tuân thủ 100% Safe Area Insets, touch targets $\ge 44\text{pt}$, hitSlop, expo-image, Thumb Zone layout, phân quyền đúng Role.

---

## I. TỔNG QUAN CÁC TÍNH NĂNG ĐỒNG BỘ ĐÃ TRIỂN KHAI

| STT | Tính năng đồng bộ từ Web | Vai trò (Role) | Component / Màn hình trên Mobile | Trạng thái |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Modal Hủy đơn hàng an toàn (OrderCancelModal)** | Khách mua (`BUYER`) / Người bán (`SELLER`) | `src/features/order/components/OrderCancelModal.tsx` gắn trên `OrderDetailScreen.tsx` | Hoàn tất |
| 2 | **Rút đơn khiếu nại tranh chấp (WithdrawDisputeModal)** | Khách mua (`BUYER`) | `src/features/order/components/WithdrawDisputeModal.tsx` & `OrderActionButtons.tsx` | Hoàn tất |
| 3 | **Đẩy tin BUMP, Ghim VIP & Gia hạn bài (BoostProductModal)** | Người bán (`SELLER`) | `src/features/seller/components/BoostProductModal.tsx` gắn trên `ManageListingsScreen.tsx` | Hoàn tất |
| 4 | **Theo dõi danh sách Tố cáo vi phạm (MyReportsModal)** | Sinh viên / Toàn bộ user | `src/features/report/components/MyReportsModal.tsx` gắn trên `ProfileScreen.tsx` | Hoàn tất |
| 5 | **Từ khóa hot thời gian thực Redis ZSET (TrendingSearchesBanner)** | Mọi người dùng / Khách ghé thăm | `src/features/home/components/TrendingSearchesBanner.tsx` gắn trên `HomeScreen.tsx` | Hoàn tất |

---

## II. CHI TIẾT TỪNG TÍNH NĂNG & PHÂN QUYỀN (ROLE-BASED)

### 1. Modal Hủy Đơn An Toàn (`OrderCancelModal.tsx`)
- **Vị trí**: Gắn trong màn hình chi tiết đơn hàng [OrderDetailScreen.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/screens/OrderDetailScreen.tsx).
- **Phân vai trò (Role Tailoring)**:
  - **Khách mua (Buyer)**: Các lý do như *"Thay đổi nhu cầu sử dụng"*, *"Tìm thấy sản phẩm khác phù hợp hơn"*, *"Người bán không phản hồi / hẹn sai Safe-Point"*, *"Lý do cá nhân khác"*.
  - **Người bán (Seller)**: Các lý do như *"Sản phẩm đã bán trên kênh khác"*, *"Hàng bị lỗi / thất lạc trong ký túc xá"*, *"Không thể gặp người mua tại Safe-Point đã chọn"*, *"Lý do cá nhân khác"*.
- **Chính sách hoàn tiền tự động**:
  - Tóm tắt minh bạch tiền cọc Escrow đã thanh toán và FPT Coin đã dùng.
  - Hiển thị thông báo hoàn trả 100% về Ví Campus ngay khi hủy hợp lệ.
  - Tự động gọi API `orderMobileService.cancelOrder(orderId, reason)`.

### 2. Rút Đơn Khiếu Nại Tranh Chấp (`WithdrawDisputeModal.tsx`)
- **Vị trí**: Nút nổi bật trong khung cảnh báo tranh chấp tại [OrderActionButtons.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/components/OrderActionButtons.tsx) khi đơn hàng ở trạng thái `DISPUTED`.
- **Vai trò**: Dành cho Khách mua khi 2 bên đã tự trao đổi và hòa giải thành công.
- **Tính năng**:
  - Chọn lý do rút đơn: *"Người bán đã đổi trả / bù hàng thỏa đáng"*, *"Hai bên đã tự thỏa thuận thành công"*, *"Tôi bấm nhầm khiếu nại"*, *"Lý do hòa giải khác"*.
  - Kết nối API `PATCH /api/reports/disputes/:id/cancel` qua `reportMobileService.cancelDispute()`.
  - Khôi phục trạng thái đơn hàng về lại `ESCROW_PAID` để tiếp tục luồng hoàn tất giao dịch.

### 3. Đẩy Tin BUMP, Ghim VIP & Gia hạn Bài (`BoostProductModal.tsx`)
- **Vị trí**: Nút *"Đẩy tin"* trên từng thẻ bài đăng trong [ManageListingsScreen.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/screens/ManageListingsScreen.tsx).
- **Vai trò**: Dành riêng cho Người bán (`SELLER`).
- **3 Gói dịch vụ linh hoạt**:
  1. **Đẩy tin tức thì (BUMP)**: `-100 Xu`, đưa bài lên Top 1 trang chủ & danh mục ngay lập tức.
  2. **Ghim tin VIP 24H (PIN)**: `-300 Xu`, ghim cố định ở vị trí hàng đầu với badge "HOT".
  3. **Gia hạn bài (RENEW)**: `Miễn phí` (`0 Xu`), gia hạn thời gian tồn tại của tin đăng thêm 30 ngày.
- **Tích hợp Ví FPT Coin**:
  - Hiển thị trực tiếp số dư Xu hiện tại từ `useUserStore`.
  - Tự động kiểm tra số dư: nếu thiếu Xu sẽ báo cụ thể số Xu cần nạp thêm và có nút *"Nạp Xu"* chuyển hướng thẳng tới màn hình Nạp Tiền VietQR.
  - Khấu trừ Xu tức thì vào trạng thái Store khi kích hoạt thành công.

### 4. Lịch Sử Tố Cáo Vi Phạm (`MyReportsModal.tsx`)
- **Vị trí**: Thẻ dịch vụ *"Lịch sử tố cáo vi phạm"* trong Trung tâm hỗ trợ tại [ProfileScreen.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/screens/ProfileScreen.tsx).
- **Vai trò**: Dành cho mọi sinh viên (`ALL USERS`).
- **Tính năng**:
  - Lấy dữ liệu từ `GET /api/reports/me` qua `reportMobileService.getMyReports()`.
  - Hiển thị trạng thái xử lý theo mã màu chuẩn: `CHỜ TIẾP NHẬN` (Vàng), `ĐANG THẨM TRA` (Xanh dương), `ĐÃ XỬ LÝ VI PHẠM` (Xanh lá), `TỪ CHỐI / ĐÓNG` (Xám).
  - Khung **Ghi chú & Phản hồi từ BQT Admin**: Giúp sinh viên nắm rõ quyết định kỷ luật/xử lý của ban quản trị đối với tài khoản bị tố cáo.
  - Hỗ trợ vuốt xuống kéo làm mới (Pull-to-refresh).

### 5. Từ Khóa Hot Thời Gian Thực Redis ZSET (`TrendingSearchesBanner.tsx`)
- **Vị trí**: Dải chip xu hướng ngay dưới thanh tìm kiếm tại [HomeScreen.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/home/screens/HomeScreen.tsx).
- **Vai trò**: Dành cho tất cả khách hàng và sinh viên.
- **Tính năng**:
  - Tự động gọi API `GET /api/products/trending/searches` từ Redis ZSET qua `productMobileService.getTrendingSearches(8)`.
  - Hiển thị các chip từ khóa cuộn ngang với hiệu ứng badge Top 3 (màu cam FPT kèm icon `trending-up`).
  - Chạm 1 chạm vào từ khóa sẽ tự động điền vào ô tìm kiếm và lọc danh sách sản phẩm tức thì.
  - Có danh sách fallback an toàn các đồ dùng sinh viên phổ biến trong trường hợp offline/kết nối chậm.

---

## III. TỐI ƯU KIẾN TRÚC & CHỈ SỐ REACT DOCTOR (100/100)

Trong quá trình đồng bộ, toàn bộ mã nguồn đã được rà soát và tái cấu trúc triệt để theo tiêu chuẩn khắt khe nhất:
1. **Khử Inline Props trên React.memo**: Chuyển các hàm xử lý thành `useCallback` với danh sách phụ thuộc chuẩn xác, loại bỏ nguy cơ re-render không cần thiết.
2. **Khử FlatList renderItem Inline**: Chuyển `renderItem` và `keyExtractor` thành `useCallback` riêng biệt, trích xuất `KeywordItem` để tối đa hóa hiệu năng danh sách ảo.
3. **Phân rã thành phần kích thước lớn**:
   - `OrderDetailScreen.tsx`: Tách `OrderDetailModals.tsx` và `PackageProofRow.tsx`.
   - `OrderActionButtons.tsx`: Tách `CancelledBanner`, `DisputedBanner`, `PrimaryActionButton`, `SubActionButtons`.
   - `BoostProductModal.tsx`: Tách `BoostHeader`, `ProductInfoCard`, `CoinBalanceRow`, `BoostPlansList`, `BoostActionButtons`.
4. **Kết quả kiểm tra tự động**:
   - **`npx tsc --noEmit`**: Mã nguồn TypeScript 100% hợp lệ, không có bất kỳ type error nào.
   - **`npx react-doctor@latest .`**: **100 / 100 Great — No issues found!**
