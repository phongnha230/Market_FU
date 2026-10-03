# BÁO CÁO 00: TỔNG QUAN TÍNH NĂNG VÀ TỐI ƯU HÓA MÃ NGUỒN FRONTEND WEB

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (fu-secondhand-frontend)  
**Phiên làm việc:** 04/10/2026  
**Công nghệ:** Next.js 14 (App Router), React 18, TypeScript Strict, Tailwind CSS, Lucide Icons, Zustand Stores.

---

## 1. Mục tiêu phiên làm việc
Trong phiên làm việc này, phân hệ **Frontend Web** đã được nâng cấp mạnh mẽ với 2 mục tiêu cốt lõi:
1. **Hoàn thiện các tính năng nghiệp vụ nâng cao**:
   - Modal Hủy đơn an toàn với chính sách hoàn tiền Escrow minh bạch theo vai trò Khách mua / Người bán (`OrderCancelModal`).
   - Modal Đẩy tin BUMP, Ghim VIP & Gia hạn bài đăng tích hợp ví FPT Coin (`BoostProductModal`).
   - Modal Sổ cái lịch sử biến động FPT Coin (`CoinHistoryModal`).
   - Modal Theo dõi danh sách Tố cáo vi phạm kèm phản hồi từ Admin BQT (`MyReportsModal`).
   - Gợi ý từ khóa tìm kiếm hot thời gian thực kết nối Redis ZSET (`HeroSearch`).
   - Quy trình tự rút đơn khiếu nại tranh chấp khi hai bên tự thương lượng (`dispute/page.tsx`).
2. **Tối ưu hóa kiến trúc mã nguồn (Clean Architecture & Performance)**:
   - Phân rã các trang quá lớn (monolithic components) như `create-post/page.tsx`, `profile/page.tsx`, `admin/kyc/page.tsx`, `checkout/page.tsx` thành các sub-components độc lập.
   - Chuẩn hóa Adapter Mappers ([adapters.ts](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/lib/adapters.ts)) để đồng bộ cấu trúc dữ liệu giữa Backend NestJS/Prisma và Frontend.
   - Loại bỏ triệt để lỗi TypeScript Type Mismatch, tăng cường Type Safety với interfaces chuẩn.

---

## 2. Bảng tổng hợp các tính năng & cải tiến Frontend trong phiên

| Mã báo cáo | Tính năng / Lỗi sửa | Thành phần chính | File mã nguồn triển khai |
| :--- | :--- | :--- | :--- |
| **Report 01** | Modal Hủy đơn an toàn & Tóm tắt hoàn cọc Escrow | `OrderCancelModal` | [OrderCancelModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/orders/OrderCancelModal.tsx)<br>[OrderCard.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/orders/OrderCard.tsx) |
| **Report 02** | Đẩy tin BUMP, Ghim VIP 24H & Gia hạn tin đăng | `BoostProductModal` | [BoostProductModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/orders/BoostProductModal.tsx)<br>[productService.ts](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/services/productService.ts) |
| **Report 03** | Sổ cái lịch sử FPT Coin & Quản lý số dư | `CoinHistoryModal` | [CoinHistoryModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/profile/CoinHistoryModal.tsx)<br>[profileService.ts](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/services/profileService.ts) |
| **Report 04** | Theo dõi tiến độ Tố cáo & Ghi chú từ Admin BQT | `MyReportsModal` | [MyReportsModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/modals/MyReportsModal.tsx)<br>[reportService.ts](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/services/reportService.ts) |
| **Report 05** | Từ khóa tìm kiếm Hot thời gian thực Redis ZSET | `HeroSearch` | [HeroSearch.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/HeroSearch.tsx) |
| **Report 06** | Luồng Tranh chấp & Tự rút đơn khiếu nại hòa giải | `DisputePage` | [dispute/page.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/app/orders/dispute/page.tsx)<br>[orderService.ts](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/services/orderService.ts) |
| **Report 07** | Tối ưu hóa mã nguồn & Tái cấu trúc module lớn | Architecture Refactoring | [create-post/](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/create-post/)<br>[ProfileLeftSidebar.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/profile/ProfileLeftSidebar.tsx)<br>[admin/kyc/](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/admin/kyc/) |

---

## 3. Mục lục danh mục báo cáo chi tiết

- [01. Modal Hủy Đơn An Toàn & Tóm Tắt Hoàn Cọc Escrow](./01_SAFE_ORDER_CANCELLATION_MODAL.md)
- [02. Đẩy Tin BUMP, Ghim VIP & Gia Hạn Tin Đăng (BoostProductModal)](./02_SELLER_PRODUCT_BOOST_AND_COIN_WALLET.md)
- [03. Sổ Cái Lịch Sử Biến Động FPT Coin (CoinHistoryModal)](./03_COIN_HISTORY_AND_WALLET_LEDGER.md)
- [04. Theo Dõi Danh Sách Tố Cáo Vi Phạm & Ghi Chú Admin (MyReportsModal)](./04_STUDENT_REPORT_HISTORY_AND_ADMIN_NOTES.md)
- [05. Từ Khóa Hot Thời Gian Thực Redis ZSET (HeroSearch)](./05_REDIS_REALTIME_TRENDING_SEARCHES.md)
- [06. Tranh Chấp Khiếu Nại & Tự Rút Đơn Hòa Giải (Dispute Flow)](./06_DISPUTE_RESOLUTION_AND_WITHDRAWAL.md)
- [07. Tối Ưu Hóa Mã Nguồn & Tái Cấu Trúc Module Lớn (Refactoring)](./07_CODE_OPTIMIZATION_AND_MODULAR_REFACTORING.md)
