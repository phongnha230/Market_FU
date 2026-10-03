# BÁO CÁO 07: CHUẨN HÓA REUSABLE COMPONENTS & MEMO CÁC MÀN HÌNH CÀI ĐẶT

## 1. Vấn đề phát hiện
- **Các màn hình liên quan**:
  - `src/features/settings/screens/AboutScreen.tsx`
  - `src/features/settings/screens/AccountSettingsScreen.tsx`
  - `src/features/settings/screens/NotificationSettingsScreen.tsx`
  - `src/features/settings/screens/PrivacySettingsScreen.tsx`
- **Các cảnh báo `react-doctor` ghi nhận**:
  1. `react-doctor/no-duplicate-jsx-subtrees`: Cấu trúc cây JSX của thanh header (nút quay lại, tiêu đề, nút home) và các hàng danh sách chính sách/quy định bị lặp lại nhiều lần.
  2. `react-doctor/no-inline-prop-on-memo-component`: Component con đã được bọc `React.memo` nhưng cha lại truyền prop callback dạng inline arrow function `onPress={() => ...}`, khiến `memo` mất tác dụng và luôn render lại.

---

## 2. Giải pháp kỹ thuật

### A. Tối ưu `AboutScreen.tsx`
- Trích xuất component memoized [`HeaderActionBtn`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/settings/screens/AboutScreen.tsx):
  - Nhận icon name, màu sắc và hàm callback ổn định.
- Trích xuất danh sách chính sách bảo mật / điều khoản sử dụng thành mảng cấu trúc và render thông qua [`PolicyRowItem`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/settings/screens/AboutScreen.tsx), loại bỏ việc copy-paste 6 thẻ Card tương đồng.

### B. Tối ưu `AccountSettingsScreen.tsx`
- Trích xuất component [`HeaderNavButton`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/settings/screens/AccountSettingsScreen.tsx) cho thanh công cụ điều hướng.
- Nhóm các thao tác chuyển đổi tài khoản, xóa dữ liệu và sao lưu vào các hàm handler có bọc `useCallback`.

### C. Khắc phục Memo Props ở `NotificationSettingsScreen.tsx` & `PrivacySettingsScreen.tsx`
- Khởi tạo subcomponents [`HeaderNavBtn`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/settings/screens/NotificationSettingsScreen.tsx) và [`PrivacyHeaderNavBtn`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/settings/screens/PrivacySettingsScreen.tsx) bọc trong `React.memo`.
- Tại màn hình cha, toàn bộ callbacks truyền vào (`handleBack`, `handleResetDefault`, `handleSaveSettings`) đều được cố định bằng `useCallback`:
  ```tsx
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  ```
- Nhờ vậy, `React.memo` giữ nguyên tham chiếu giữa các lượt render khi người dùng chuyển đổi các công tắc switch.

---

## 3. Kết quả
- Loại bỏ hoàn toàn cảnh báo `no-duplicate-jsx-subtrees` và `no-inline-prop-on-memo-component`.
- Mã nguồn các màn hình cài đặt tinh gọn, đồng bộ phong cách thiết kế UI/UX trên toàn hệ thống.
