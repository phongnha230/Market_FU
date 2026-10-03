# BÁO CÁO 11: ĐIỀU HƯỚNG ĐỘNG THEO ROLE (ROLE-BASED DYNAMIC NAVIGATION)

## 1. Vấn đề thực tế trước khi tối ưu
Trước đây, thanh điều hướng dưới đáy màn hình ([`BottomTabNavigator.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/navigation/BottomTabNavigator.tsx)) hiển thị 5 tab cố định giống hệt nhau cho mọi đối tượng người dùng:
```text
[Chợ Campus]  -  [Tin nhắn]  -  [Đăng bán]  -  [Tin của tôi]  -  [Tài khoản]
```
- **Bất cập lớn**: Khi tài khoản là **Sinh viên / Người mua (`STUDENT`)**, sinh viên không phải người bán và chưa có quyền mở gian hàng. Khi họ bấm vào `[Đăng bán]` hoặc `[Tin của tôi]`, hệ thống bật popup cảnh báo: *"Chỉ dành cho Người Bán (Seller)..."*.
- Điều này vi phạm nguyên tắc công thái học của `mobile/GEMINI.md`: **Hiển thị những tính năng mà người dùng bị cấm truy cập gây khó chịu và giảm trải nghiệm người dùng.**

---

## 2. Giải pháp Điều hướng Động theo Role (Dynamic Navigation)

Tái cấu trúc [`BottomTabNavigator.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/navigation/BottomTabNavigator.tsx) tự động nhận diện `user?.role === 'SELLER'` để render đúng tập hợp màn hình phù hợp:

### A. Đối với Sinh viên Mua hàng (`STUDENT` / Khách chưa là Seller)
Thanh Tab Bar hiển thị 5 tab phục vụ mua sắm và sinh hoạt Campus:
1. **`Home` - Chợ Campus** (`storefront-outline`): Tìm kiếm đồ thanh lý, chọn cơ sở FPT, lọc ngành học.
2. **`Chat` - Tin nhắn** (`chatbubble-ellipses-outline`): Nhắn tin trao đổi và trả giá trực tiếp với người bán.
3. **`Orders` - Đơn mua 📦** (`bag-check-outline`): Theo dõi các đơn đã cọc tiền ký quỹ Escrow, lịch hẹn Safe-Point, khiếu nại Dispute.
4. **`Voucher` - Ưu đãi & Xu 🎁** (`gift-outline`): Ví voucher Canteen/Passio, điểm danh nhận Xu hàng ngày.
5. **`Profile` - Tài khoản 👤** (`person-outline`): Quản lý hồ sơ, thẻ KYC sinh viên, nút nộp hồ sơ Onboarding lên Người Bán.

### B. Đối với Người Bán chuyên nghiệp (`SELLER` / BQT)
Thanh Tab Bar hiển thị 5 tab phục vụ quản lý gian hàng và kho tin:
1. **`Home` - Chợ Campus** (`storefront-outline`): Khám phá thị trường.
2. **`Chat` - Tin nhắn** (`chatbubble-ellipses-outline`): Tiếp nhận hỏi mua và deal giá từ sinh viên.
3. **`PostItem` - Đăng bán ➕** (`add-circle-outline`): Form đăng bán đồ công nghệ, giáo trình với AI quét ảnh tự động.
4. **`MyListings` - Kênh bán 📋** (`file-tray-full-outline`): Quản lý kho tin, đẩy tin nổi bật (Boost), gia hạn (Renew), đánh dấu đã bán.
5. **`Profile` - Tài khoản 👤** (`person-outline`): Kênh Quản Lý Người Bán (Seller Hub), ví rút tiền về tài khoản ngân hàng.

---

## 3. Kết quả & Đánh giá chất lượng
- **Người mua (`STUDENT`)** không còn bị hiện các thông báo lỗi vô lý; có ngay tab `Đơn mua` và `Voucher & Xu` tiện dụng 100%.
- **Người bán (`SELLER`)** có đầy đủ công cụ quản trị gian hàng tiện lợi ngay trên ngón tay cái (Thumb-zone).
- **TypeScript**: `npx tsc --noEmit` hoàn tất với **0 errors**.
- **Chất lượng mã (`react-doctor`)**: Quét trên 320 files, giữ vững điểm tuyệt đối **100 / 100 Great**!
