# BÁO CÁO 03: SỔ CÁI LỊCH SỬ BIẾN ĐỘNG FPT COIN (COIN HISTORY MODAL)

## 1. Bối cảnh & Vấn đề tồn tại
Người dùng (cả người mua và người bán) tích lũy và tiêu thụ FPT Coin qua nhiều hoạt động: nạp ví qua VietQR, điểm danh hàng ngày, hoàn thành nhiệm vụ sinh viên, đẩy tin đăng, hoàn cọc Escrow khi hủy đơn. Tuy nhiên, trước đây:
- Người dùng chỉ thấy một con số duy nhất là "Số dư ví FPT Coin".
- Không có trang hoặc modal nào hiển thị lịch sử biến động (+/-), thời gian và lý do chi tiết của từng giao dịch.
- Tạo cảm giác thiếu an tâm về mặt số dư tài khoản của sinh viên.

---

## 2. Giải pháp kỹ thuật đã triển khai

### A. Xây dựng Component `CoinHistoryModal.tsx`
Tệp: [frontend/src/components/profile/CoinHistoryModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/profile/CoinHistoryModal.tsx)

1. **Card tóm tắt số dư FPT Coin**:
   - Hiển thị nổi bật số dư Xu hiện tại với huy hiệu vàng kim.
   - Nút tắt *"Nạp thêm"* liên kết trực tiếp tới luồng thanh toán VietQR.
2. **Bộ lọc biến động linh hoạt (Filter Tabs)**:
   - `Tất cả`: Xem toàn bộ luồng tiền.
   - `Cộng Xu (+)`: Lọc các khoản nạp ví, thưởng nhiệm vụ, hoàn cọc Escrow.
   - `Trừ Xu (-)`: Lọc các khoản phí đẩy tin BUMP, ghim VIP hoặc đổi voucher.
3. **Danh sách giao dịch chi tiết**:
   - Từng dòng hiển thị:
     - Icon phân loại giao dịch (màu xanh lá cho dòng tiền vào, màu đỏ/cam cho dòng tiền ra).
     - Mô tả giao dịch (VD: *"Đẩy tin tức thì BUMP: Màn hình Dell U2419H"*).
     - Mã tham chiếu giao dịch nội bộ.
     - Thời gian định dạng chuẩn tiếng Việt (Giờ, Ngày/Tháng/Năm).
     - Số lượng biến động định dạng nổi bật (`+100 Xu` hoặc `-100 Xu`).
4. **Kết nối API & Tích hợp**:
   - Gọi API thông qua `profileService.getCoinHistory()`.
   - Được gắn vào thanh điều hướng bên trái [ProfileLeftSidebar.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/profile/ProfileLeftSidebar.tsx) tại trang cá nhân sinh viên (`/profile`).

---

## 3. Trích đoạn mã nguồn tiêu biểu

```tsx
// frontend/src/components/profile/CoinHistoryModal.tsx
interface CoinTransaction {
  id: string;
  type: 'TOPUP' | 'BOOST_BUMP' | 'BOOST_PIN' | 'ESCROW_REFUND' | 'MISSION_REWARD';
  amount: number;
  description: string;
  createdAt: string;
}

export const CoinHistoryModal: React.FC<CoinHistoryModalProps> = ({
  isOpen,
  onClose,
  balance,
  transactions,
}) => {
  // Lọc theo tab active ('ALL' | 'PLUS' | 'MINUS')
  const filtered = transactions.filter((tx) => {
    if (tab === 'PLUS') return tx.amount > 0;
    if (tab === 'MINUS') return tx.amount < 0;
    return true;
  });
  // ...
};
```

---

## 4. Kết quả đạt được
- Giúp sinh viên kiểm soát minh bạch 100% dòng tiền FPT Coin.
- Tăng tính chuyên nghiệp và độ tin cậy của nền tảng kinh tế chia sẻ trong trường đại học.
