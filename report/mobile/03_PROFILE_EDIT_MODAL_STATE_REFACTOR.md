# BÁO CÁO 03: TỐI ƯU QUẢN LÝ STATE MODAL CHỈNH SỬA HỒ SƠ (PROFILE)

## 1. Vấn đề phát hiện
- **File**: `src/features/profile/components/EditProfileModal.tsx` & Hook liên quan.
- **Tình trạng ban đầu**:
  - Tồn tại **11 câu lệnh `useState` riêng lẻ**:
    - `name`, `phone`, `bio`, `avatar`, `campus`, `major`, `studentId`, `bankName`, `bankAccount`, `bankHolder`, `isSubmitting`.
  - Vi phạm quy tắc `no-high-complexity-react-function`.
  - Mỗi lần người dùng gõ vào 1 ô input, toàn bộ modal phải re-evaluate 11 state triggers.
  - Khối JSX chứa nhiều hàng nút lưu, nút hủy lặp lại cấu trúc lồng ghép.

---

## 2. Giải pháp kỹ thuật

### A. Tinh gọn State với Single Form Object trong Hook
Xây dựng hook [`useEditProfileForm.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/hooks/useEditProfileForm.ts):
- Gom 11 `useState` thành 1 đối tượng duy nhất `ProfileFormData`:
  ```typescript
  export interface ProfileFormData {
    name: string;
    phone: string;
    bio: string;
    avatar: string;
    campus: string;
    major: string;
    studentId: string;
    bankName: string;
    bankAccount: string;
    bankHolder: string;
  }
  ```
- Cung cấp phương thức cập nhật type-safe tổng quát:
  ```typescript
  const updateField = useCallback(<K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);
  ```
- Tách riêng trạng thái submit và tích hợp chọn ảnh từ thư viện thiết bị (`ImagePicker`).

### B. Trích xuất Subcomponents chuyên sâu
- [`EditProfileAvatarSection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/components/EditProfileAvatarSection.tsx): Hiển thị avatar tròn và nút camera đổi ảnh.
- [`EditProfileAcademicSection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/components/EditProfileAcademicSection.tsx): Thông tin học tập FPT (Mã sinh viên, Chuyên ngành, Cơ sở).
- [`EditProfileContactSection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/components/EditProfileContactSection.tsx): Thông tin liên lạc (Họ tên, SĐT, Tiểu sử).
- [`EditProfileBankSection.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/components/EditProfileBankSection.tsx): Thông tin ngân hàng nhận tiền thanh toán an toàn.
- `EditProfileHeader` và `EditProfileFooter`: Nút đóng modal, tiêu đề và nút lưu thay đổi.

---

## 3. Kết quả
- Loại bỏ hoàn toàn cảnh báo độ phức tạp cao (`no-high-complexity-react-function`).
- Thao tác gõ phím trên bàn phím mượt mà, phản hồi tức thì (không có hiện tượng khựng lag phím).
- Tránh re-render lan truyền sang các phần tử không liên quan trên màn hình Profile.
