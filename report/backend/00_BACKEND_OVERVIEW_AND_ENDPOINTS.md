# BÁO CÁO 00: TỔNG QUAN TÍNH NĂNG VÀ CÁC ĐIỂM CUỐI (API ENDPOINTS) BACKEND

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (fu-secondhand-backend)  
**Phiên làm việc:** 04/10/2026  
**Công nghệ:** Node.js, Express / NestJS, TypeScript, Prisma ORM, PostgreSQL, Redis ZSET, Socket.io, MeiliSearch.

---

## 1. Các dịch vụ Backend phục vụ phiên giao dịch

| Nhóm chức năng | Endpoint API | Phương thức | Mô tả hoạt động |
| :--- | :--- | :---: | :--- |
| **Hủy đơn an toàn** | `/api/orders/:id/cancel` | `PATCH` | Hủy đơn hàng kèm lý do theo vai trò, tự động hoàn trả 100% tiền cọc Escrow và FPT Coin về ví người dùng. |
| **Đẩy tin & Gia hạn** | `/api/products/:id/boost`<br>`/api/products/:id/renew` | `POST` | Xử lý gói BUMP (100 Xu), PIN_24H (300 Xu) và RENEW (30 ngày), trừ coin trong bảng Wallet/User. |
| **Lịch sử FPT Coin** | `/api/users/coins/history` | `GET` | Trả về danh sách biến động số dư (+/-), loại giao dịch, mã tham chiếu và timestamp. |
| **Theo dõi Tố cáo** | `/api/reports/me` | `GET` | Lấy danh sách các đơn tố cáo do sinh viên gửi kèm trạng thái và ghi chú/phản hồi từ Admin BQT. |
| **Rút đơn khiếu nại** | `/api/reports/disputes/:id/cancel` | `PATCH` | Cho phép người mua tự rút đơn khiếu nại sau khi hai bên đã tự hòa giải, đưa đơn hàng về lại luồng giao dịch an toàn. |
| **Xu hướng tìm kiếm** | `/api/products/trending/searches` | `GET` | Truy vấn Redis Sorted Set (`ZREVRANGE`) để lấy top từ khóa hot nhất theo thời gian thực. |
| **Socket Realtime** | `socket.ts` / Gateway | `WS` | Đồng bộ trạng thái đơn hàng, tin nhắn trao đổi và thông báo đẩy tức thì. |

---

## 2. Kết luận
Các endpoint backend hoạt động ổn định, có xác thực token JWT, kiểm tra quyền hạn (Role Guard) và xử lý ngoại lệ đồng nhất cho cả nền tảng Web Frontend và Mobile App.
