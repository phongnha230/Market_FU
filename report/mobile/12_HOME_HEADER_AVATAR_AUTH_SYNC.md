# BÁO CÁO 12: ĐỒNG BỘ HIỂN THỊ AVATAR GÓC TRÊN TRANG CHỦ THEO TRẠNG THÁI ĐĂNG NHẬP

## 1. Vấn đề thực tế
Trước đây, thanh tiêu đề trang chủ ([`HomeHeader.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/components/common/HomeHeader.tsx)) sử dụng một đường dẫn ảnh Unsplash cố định làm giá trị mặc định cho `avatarUrl`:
- Khi người dùng **chưa đăng nhập (Khách / Guest)**: Vẫn hiển thị ảnh khuôn mặt một người lạ, gây hiểu nhầm rằng thiết bị đã đăng nhập tài khoản.
- Khi người dùng **đã đăng nhập**: Nếu tài khoản chưa cập nhật ảnh đại diện hoặc `avatarUrl` là rỗng thì dễ bị lỗi hiển thị ảnh trống.

---

## 2. Giải pháp kỹ thuật theo chuẩn `mobile/GEMINI.md`

Tái cấu trúc thành phần [`HomeHeader.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/components/common/HomeHeader.tsx) và màn hình [`HomeScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/home/screens/HomeScreen.tsx):

### A. Khi Chưa đăng nhập (`!isAuthenticated`)
- Hiển thị **Icon con người tối giản** (`Ionicons name="person"` size 18, màu `#64748B`) đặt trong khung tròn viền nét thanh lịch (`#CBD5E1`, nền `#F1F5F9`).
- Lời chào: **"Chào Bạn 👋"** thay vì "Chào Quân" hoặc "Chào Khách".
- Khi bấm vào icon: Điều hướng mượt mà sang trang Đăng nhập ([`LoginScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/auth/screens/LoginScreen.tsx)).

### B. Khi Đã đăng nhập (`isAuthenticated === true`)
- **Trường hợp đã có ảnh đại diện (`avatarUrl`)**: Tải và hiển thị ảnh đại diện thực tế từ hồ sơ sinh viên (`user.avatar` hoặc `user.avatarUrl`) bằng `expo-image` có hiệu ứng chuyển cảnh mượt mà `transition={200}`.
- **Trường hợp chưa có ảnh đại diện**: Hiển thị khung tròn màu thương hiệu FPT (`#EA580C`) với chữ cái đầu viết hoa của tên sinh viên (ví dụ: "Q", "D", "A").
- Lời chào: **"Chào [Tên Sinh Viên] 👋"** (ví dụ: "Chào Thùy Dương 👋", "Chào Minh Quân 👋").
- Khi bấm vào avatar: Điều hướng trực tiếp sang tab Hồ sơ cá nhân ([`ProfileScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/profile/screens/ProfileScreen.tsx)).

---

## 3. Đánh giá chất lượng & Type Safety
- **`react-doctor`**: Tiếp tục duy trì điểm số tuyệt đối **100 / 100 Great** trên **320 files** với **0 lỗi, 0 cảnh báo**.
- **TypeScript**: `npx tsc --noEmit` hoàn thành với **0 errors**.
