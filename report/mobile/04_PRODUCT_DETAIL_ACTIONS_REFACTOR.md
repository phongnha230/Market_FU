# BÁO CÁO 04: TÁI CẤU TRÚC ACTION GUARDS MÀN HÌNH CHI TIẾT SẢN PHẨM

## 1. Vấn đề phát hiện
- **File**: `src/features/product-detail/screens/ProductDetailScreen.tsx`
- **Tình trạng ban đầu**:
  - Vi phạm quy tắc `no-high-complexity-react-function`.
  - Màn hình chứa đồng thời:
    - Xử lý xác thực người dùng (Auth Guard) khi bấm nút Mua ngay, Trả giá (Make Offer), Nhắn tin (Chat).
    - Hiển thị các Modal điều kiện (`ContextualAuthModal`, `ContextualChatAuthModal`, `MakeOfferModal`).
    - Logic chuyển đổi Campus demo (`DemoCampusSwitcherBar`).
    - Xử lý chia sẻ tin đăng (`Share.share`), lưu sản phẩm yêu thích (Favorites).
    - Điều hướng sang trang Checkout với đầy đủ tham số.
  - Hàm component chính vượt quá ngưỡng kiểm soát luồng điều khiển (cyclomatic complexity > 15).

---

## 2. Giải pháp kỹ thuật

### A. Tạo Hook Action Guards chuyên biệt
Tạo hook [`useProductDetailActions.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/product-detail/hooks/useProductDetailActions.ts):
- Đóng gói toàn bộ logic kiểm tra đăng nhập trước khi thực hiện hành động:
  - `handleBuyNow`: Kiểm tra xem người dùng đã đăng nhập chưa; nếu chưa hiện Modal yêu cầu đăng nhập mua hàng; nếu đã đăng nhập thì điều hướng sang `Checkout`.
  - `handleChat`: Kiểm tra đăng nhập và điều hướng sang kênh hội thoại (`ChatDetail`).
  - `handleMakeOffer`: Kiểm tra đăng nhập và mở modal đề xuất giá.
  - `handleShare`: Gọi API chia sẻ gốc của hệ điều hành iOS/Android.
- Quản lý trạng thái mở/đóng của các modal liên quan.

### B. Trích xuất Component Giao diện
- Trích xuất thanh chọn Campus thử nghiệm thành component [`DemoCampusSwitcherBar`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/product-detail/screens/ProductDetailScreen.tsx).
- Giữ màn hình [`ProductDetailScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/product-detail/screens/ProductDetailScreen.tsx) đóng vai trò bố cục chính (Layout & Presentation), kết nối gọn gàng:
  - `ProductGallery`: Thư viện ảnh sản phẩm.
  - `ProductInfoCard`: Tên, giá, thời gian đăng, campus tag.
  - `ProductSellerSafePoint`: Thông tin người bán, điểm hẹn Safe-Point.
  - `ProductSpecSection`: Thông số kỹ thuật chi tiết.
  - `ProductBottomBar`: Thanh cố định dưới chân trang chứa nút Mua ngay, Trả giá, Chat.

---

## 3. Kết quả
- Loại bỏ hoàn toàn cảnh báo `no-high-complexity-react-function` trên màn hình chi tiết sản phẩm.
- Tăng độ tách bạch giữa luồng kiểm tra nghiệp vụ bảo mật và luồng hiển thị giao diện.
- Tránh lỗi race-condition khi người dùng bấm liên tục nút Mua ngay.
