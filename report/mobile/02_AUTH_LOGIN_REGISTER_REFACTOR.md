# BÁO CÁO 02: TÁI CẤU TRÚC MÀN HÌNH ĐĂNG NHẬP & ĐĂNG KÝ (AUTH)

## 1. Vấn đề phát hiện
- **File**: `src/features/auth/screens/LoginScreen.tsx`
- **Tình trạng ban đầu**:
  - Độ dài tệp: **1.104 dòng**.
  - Vi phạm quy tắc:
    - `react-doctor/no-giant-component` (Component quá khổ, vượt ngưỡng kích thước chuẩn).
    - `react-doctor/no-high-complexity-react-function` (Chứa hơn 20 state, hàm render lồng nhau quá nhiều nhánh điều kiện cho Login thường, Google OAuth, Đăng ký sinh viên, Quản trị viên, Chọn Campus, Xác thực OTP).
  - Khó bảo trì, dễ phát sinh lỗi chéo khi cập nhật logic đăng ký.

---

## 2. Giải pháp tái cấu trúc

### A. Tách Controller Hook riêng biệt
Tạo hook [`useLoginController.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/hooks/useLoginController.ts) quản lý toàn bộ:
- Quản lý tab hiển thị (`LOGIN` vs `REGISTER`).
- State biểu mẫu đăng nhập (`loginEmail`, `loginPassword`, `loginCampus`, `isSubmittingLogin`).
- Trạng thái OTP modal (`showOtpModal`, `otpEmail`, `otpCode`).
- Tích hợp điều hướng và thông báo lỗi.

### B. Phân rã giao diện thành các thành phần chuyên biệt
1. [`AuthTopBar.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/components/AuthTopBar.tsx): Thanh điều hướng trên cùng, nút quay lại, đổi ngôn ngữ.
2. [`AuthBrandHeader.tsx` & `AuthHeader.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/components/AuthHeader.tsx): Logo FPT Market, slogan, và tab chuyển đổi Đăng nhập / Đăng ký.
3. [`LoginQuickRoleSwitcher.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/components/LoginQuickRoleSwitcher.tsx): Thanh chọn nhanh vai trò người dùng (Sinh viên, Bán hàng, Admin).
4. [`LoginCampusSelector.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/components/LoginCampusSelector.tsx): Lựa chọn campus FPT (Hòa Lạc, HCM, Đà Nẵng, Quy Nhơn, Cần Thơ).
5. [`LoginForm.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/components/LoginForm.tsx): Biểu mẫu nhập email & mật khẩu đăng nhập.
6. [`RegisterForm.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/components/RegisterForm.tsx): Biểu mẫu đăng ký được phân rã tiếp thành 4 khối:
   - `RegisterGoogleAction`: Đăng ký nhanh qua tài khoản Google FPT (@fpt.edu.vn).
   - `RegisterStudentFields`: Nhập mã sinh viên, họ tên, số điện thoại, campus.
   - `RegisterPasswordSection`: Nhập mật khẩu và xác nhận mật khẩu.
   - `RegisterCaptchaAndSubmit`: Nút kích hoạt gửi mã OTP và hoàn tất đăng ký.
7. [`AuthFptGuaranteeCard.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/components/AuthFptGuaranteeCard.tsx): Khối thông tin cam kết bảo trợ và xác thực danh tính sinh viên FPT.
8. [`OtpVerificationModal.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/components/OtpVerificationModal.tsx): Hộp thoại nhập 6 số OTP xác minh email sinh viên.

---

## 3. Kết quả
- Tệp [`LoginScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/screens/LoginScreen.tsx) giảm từ **1.104 dòng xuống còn ~150 dòng**.
- Biến mất hoàn toàn cảnh báo `no-giant-component` và `no-high-complexity-react-function`.
- Tách rời hoàn toàn giao diện (Presentation) và logic xử lý nghiệp vụ (Container/Hook).
