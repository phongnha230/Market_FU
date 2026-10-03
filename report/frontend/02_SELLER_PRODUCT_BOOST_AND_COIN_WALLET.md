# BÁO CÁO 02: ĐẨY TIN BUMP, GHIM VIP & GIA HẠN TIN ĐĂNG (BOOST PRODUCT MODAL)

## 1. Bối cảnh & Vấn đề tồn tại
Người bán (`SELLER`) trong khuôn viên trường đại học có nhu cầu thanh lý đồ dùng nhanh chóng trước kỳ thi hoặc khi chuyển phòng trọ / chuyển cơ sở. Tuy nhiên, trước đây:
- Tin đăng sau vài ngày bị trôi xuống dưới danh sách và giảm tương tác.
- Tin đăng sau 30 ngày bị đóng tự động mà người bán không có cơ chế chủ động gia hạn thời hạn mở bán.
- Hệ thống FPT Coin chưa có điểm tiêu thụ thực tế (utility) để khuyến khích sinh viên đóng góp cho nền tảng.

---

## 2. Giải pháp kỹ thuật đã triển khai

### A. Xây dựng Component `BoostProductModal.tsx`
Tệp: [frontend/src/components/orders/BoostProductModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/orders/BoostProductModal.tsx)

1. **Thiết kế 3 gói dịch vụ đa dạng**:
   - **Gói 1: Đẩy tin tức thì (BUMP)**:
     - Giá: `-100 FPT Xu`
     - Tác dụng: Đưa bài đăng lên đầu trang chủ và danh mục ngay lập tức.
   - **Gói 2: Ghim tin VIP 24 Giờ (PIN_24H)**:
     - Giá: `-300 FPT Xu`
     - Tác dụng: Ghim vị trí nổi bật kèm huy hiệu "HOT" trong suốt 24 giờ.
   - **Gói 3: Gia hạn bài đăng 30 ngày (RENEW)**:
     - Giá: `Miễn phí` (`0 Xu`)
     - Tác dụng: Kéo dài thời gian hiển thị thêm 30 ngày kể từ thời điểm thao tác.
2. **Tích hợp đồng bộ Ví FPT Coin thời gian thực**:
   - Lấy số dư `user.coins` trực tiếp từ [userStore.ts](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/stores/userStore.ts).
   - Kiểm tra tính khả chi (`isAffordable`):
     - Nếu đủ Xu: Kích hoạt nút bấm xác nhận với hiệu ứng gradient cam FPT.
     - Nếu thiếu Xu: Vô hiệu hóa nút bấm và hiển thị thẻ cảnh báo màu vàng: *"Bạn cần thêm X Xu để kích hoạt gói này"*, kèm nút bấm chuyển hướng ngay sang luồng nạp tiền VietQR.
3. **Kết nối API & Quản lý State**:
   - Gọi `productService.boostProduct(productId, plan)` hoặc `productService.renewProduct(productId)`.
   - Trừ số dư Xu trong store ngay lập tức sau khi giao dịch thành công.

---

## 3. Trích đoạn mã nguồn tiêu biểu

```tsx
// frontend/src/components/orders/BoostProductModal.tsx
const PLANS: BoostPlan[] = [
  {
    id: 'BUMP',
    title: 'Đẩy tin tức thì (BUMP)',
    badge: 'Phổ biến',
    badgeColor: 'text-amber-600 bg-amber-50',
    cost: 100,
    description: 'Đưa sản phẩm lên Top 1 trang chủ & danh mục ngay lập tức. Tiếp cận hàng nghìn sinh viên đang online.',
    icon: Flame,
  },
  {
    id: 'PIN_24H',
    title: 'Ghim tin VIP 24H (PIN)',
    badge: 'Hiệu quả cao',
    badgeColor: 'text-purple-600 bg-purple-50',
    cost: 300,
    description: 'Ghim cố định ở dải banner ưu tiên trong 24 giờ kèm huy hiệu "HOT". Tăng 300% lượt xem và hỏi mua.',
    icon: Pin,
  },
  {
    id: 'RENEW',
    title: 'Gia hạn thêm 30 ngày',
    badge: 'Miễn phí',
    badgeColor: 'text-emerald-600 bg-emerald-50',
    cost: 0,
    description: 'Gia hạn thời gian mở bán thêm 30 ngày kể từ hôm nay, tránh tin bị đóng tự động do quá hạn.',
    icon: RotateCw,
  },
];
```

---

## 4. Kết quả đạt được
- Cung cấp cho sinh viên công cụ bán hàng chuyên nghiệp tương tự các sàn TMĐT lớn.
- Tạo vòng tuần hoàn giá trị cho FPT Coin (nạp tiền / tích lũy coin $\rightarrow$ đẩy tin / ghim VIP).
