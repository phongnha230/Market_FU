# BÁO CÁO 06: TỐI ƯU MÀN HÌNH CHỈNH SỬA TIN ĐĂNG (EDIT LISTING)

## 1. Vấn đề phát hiện
- **File**: `src/features/post-item/screens/EditListingScreen.tsx`
- **Tình trạng ban đầu**:
  - Dài **527 dòng**.
  - Vi phạm quy tắc:
    - `react-doctor/no-high-complexity-react-function`.
    - `react-doctor/only-export-components` (Khai báo mảng `CATEGORIES` và `CONDITIONS` bên trong file component và export ra ngoài).
    - Quản lý 8 state độc lập (`title`, `priceStr`, `category`, `condition`, `safePoint`, `status`, `allowNegotiate`, `hashtags`).
    - Logic kiểm duyệt chống gian lận lồng ghép: Nếu tin đăng đã được duyệt (`AVAILABLE`, `RESERVED`, `SOLD`), KHÔNG cho sửa Tiêu đề, Danh mục, Cơ sở để ngăn chặn hành vi tráo đổi đồ (Bait-and-switch fraud).

---

## 2. Giải pháp kỹ thuật

### A. Tách Hằng số Nghiệp vụ
Tạo file [`editListingConstants.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/constants/editListingConstants.ts):
- Khai báo danh mục `LISTING_CATEGORIES` và các mức độ tình trạng `LISTING_CONDITIONS` kèm kiểu dữ liệu `CategoryOption`, `ConditionOption`.
- Loại bỏ hoàn toàn lỗi vi phạm `react-doctor/only-export-components`.

### B. Tách Controller Hook Tinh gọn
Tạo hook [`useEditListingController.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/hooks/useEditListingController.ts):
- Đưa các hàm thuần túy (pure functions) ra ngoài scope của hook để giữ cyclomatic complexity ở mức thấp nhất:
  - `checkIsApproved(status)`: Kiểm tra trạng thái đã phê duyệt.
  - `getInitialFormData(product)`: Khởi tạo giá trị ban đầu.
  - `validateForm(title, priceStr)`: Xác thực tiêu đề và giá trị số tiền hợp lệ.
  - `confirmDeleteListing(onConfirm)`: Hộp thoại xác nhận xóa bài viết.
- Quản lý form tập trung qua một state object `EditListingFormData` duy nhất.

### C. Phân rã Giao diện thành 8 Subcomponents
1. [`EditListingHeader.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingHeader.tsx): Nút back, tiêu đề màn hình, icon xóa tin đăng.
2. [`EditListingTitleSection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingTitleSection.tsx): Ô nhập tiêu đề và badge cảnh báo khóa trường khi tin đã duyệt.
3. [`EditListingPriceSection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingPriceSection.tsx): Ô nhập giá bán bằng số.
4. [`EditListingCategorySection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingCategorySection.tsx): Danh sách chọn danh mục cuộn ngang.
5. [`EditListingConditionSection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingConditionSection.tsx): Hộp chọn radio tình trạng sản phẩm.
6. [`EditListingSafePointSection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingSafePointSection.tsx): Điểm hẹn bàn giao an toàn tại cơ sở.
7. [`EditListingNegotiateSwitch.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingNegotiateSwitch.tsx): Nút gạt cho phép người mua trả giá hay không.
8. [`EditListingBottomBar.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingBottomBar.tsx): Thanh công cụ lưu thay đổi và hủy thao tác.

---

## 3. Kết quả
- Tệp [`EditListingScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/screens/EditListingScreen.tsx) từ 527 dòng rút gọn còn **~120 dòng code**.
- Xóa sạch 3 cảnh báo cuối cùng trong toàn bộ dự án, đưa codebase chạm mốc **100 / 100 Great**.
