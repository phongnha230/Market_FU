# 🗺️ TỔNG HỢP CÁC FLOWS NGHIỆP VỤ HỆ THỐNG MARKETFU

### Hệ thống Sàn Thương Mại Điện Tử & Trao Đổi Đồ Cũ Sinh Viên Đại Học FPT (Web, Mobile & Backend Realtime)

> **Tài liệu đặc tả toàn diện luồng nghiệp vụ (Business Flows)**: Mô tả chi tiết tương tác giữa **Web Portal (Next.js 16)**, **Mobile App (React Native Expo SDK 52)**, **Backend Gateway (Node.js/Express, Prisma ORM, MongoDB Atlas)**, **Realtime Gateway (Socket.IO)**, **Hệ thống AI (Gemini 1.5 Flash)**, **Cổng thanh toán PayOS / VietQR** và **Trạm an toàn Safe-Handoff Hubs**.

---

## 📑 MỤC LỤC TỔNG QUAN CÁC FLOWS

1. [Tổng quan Kiến trúc &amp; Các Tác nhân (Actors)](#1-tổng-quan-kiến-trúc--các-tác-nhân-actors)
2. [Flow 1: Xác thực, Phân quyền &amp; Định danh KYC Sinh viên (Auth &amp; KYC Flow)](#flow-1-xác-thực-phân-quyền--định-danh-kyc-sinh-viên)
3. [Flow 2: Đăng tin, AI Scan &amp; Quy trình Phê duyệt BQT (Post Creation &amp; Admin Moderation)](#flow-2-đăng-tin-ai-scan--quy-trình-phê-duyệt-bqt)
4. [Flow 3: Đồng bộ Sản phẩm Realtime 2 chiều Web ⮂ Mobile (Two-Way Realtime Sync)](#flow-3-đồng-bộ-sản-phẩm-realtime-2-chiều-web--mobile)
5. [Flow 4: Tìm kiếm Thông minh &amp; Bộ lọc Đa Campus (Search &amp; Multi-Campus Filtering)](#flow-4-tìm-kiếm-thông-minh--bộ-lọc-đa-campus)
6. [Flow 5: Trò chuyện P2P, Mặc cả Trả giá &amp; Hẹn điểm Safe-Point (Chat &amp; Negotiation)](#flow-5-trò-chuyện-p2p-mặc-cả-trả-giá--hẹn-điểm-safe-point)
7. [Flow 6: Giao dịch An toàn, Bảo chứng Escrow &amp; Bàn giao Hàng hóa (Escrow &amp; Handshake)](#flow-6-giao-dịch-an-toàn-bảo-chứng-escrow--bàn-giao-hàng-hóa)
8. [Flow 7: Khiếu nại, Tranh chấp &amp; Trọng tài BQT (Dispute &amp; Arbitration)](#flow-7-khiếu-nại-tranh-chấp--trọng-tài-bqt)
9. [Flow 8: Đánh giá Công Khai Tức Thì &amp; Điểm Uy Tín (Review &amp; Reputation Flow)](#flow-8-đánh-giá-công-khai-tức-thì--điểm-uy-tín)
10. [Flow 9: Gamification, Ví Campus Coin &amp; Đổi Voucher (Coin, Rewards &amp; Vouchers)](#flow-9-gamification-ví-campus-coin--đổi-voucher)
11. [Flow 10: Báo cáo Vi phạm &amp; Trạm An Toàn Safe-Handoff (Report &amp; Safe-Handoff Hubs)](#flow-10-báo-cáo-vi-phạm--trạm-an-toàn-safe-handoff)
12. [Flow 11: Hệ Thống Thông Báo Thời Gian Thực &amp; Đa Kênh Trên Web (Realtime Web Notifications)](#flow-11-hệ-thống-thông-báo-thời-gian-thực--đa-kênh-trên-web)
13. [Bảng Ma Trận Tổng Hợp Sự Kiện Socket.IO &amp; API Endpoints](#13-bảng-ma-trận-tổng-hợp-sự-kiện-socketio--api-endpoints)

---

## 1. TỔNG QUAN KIẾN TRÚC & CÁC TÁC NHÂN (ACTORS)

### 1.1. Các tác nhân chính trong hệ thống

* **Khách vãng lai (Guest):** Người dùng chưa đăng nhập; có quyền xem bài đăng, tìm kiếm, xem trang chi tiết và chat thử với trợ lý AI.
* **Sinh viên Người Mua (`BUYER`):** Tài khoản sinh viên FPT đã xác thực email (`@fpt.edu.vn`); có quyền chat, mặc cả giá, hẹn điểm gặp, đặt mua hàng, mở khiếu nại, đánh giá và đổi voucher.
* **Sinh viên Người Bán (`SELLER`):** Sinh viên đã hoàn tất hồ sơ Onboarding (Thẻ SV, CCCD 2 mặt, STK ngân hàng); có quyền đăng bán đồ dùng, nhận đơn hàng, chấp thuận trả giá, bàn giao hàng qua mã QR Handshake và rút tiền về ngân hàng.
* **Ban Quản Trị (`ADMIN`):** Quản trị viên phụ trách duyệt bài đăng mới (`PENDING_APPROVAL`), thẩm định KYC thẻ SV & Onboarding Người Bán, phân xử khiếu nại tranh chấp (Dispute), quản lý trạm Safe-Handoff, kho Voucher và xử lý vi phạm.
* **Trợ lý AI (Google Gemini 1.5 Flash):** Hỗ trợ scan hình ảnh đồ cũ tự điền form trong 3s, chatbot tư vấn tìm đồ theo ngân sách/campus và đối soát OCR thẻ sinh viên on-demand.
* **Cổng Thanh toán (PayOS & VietQR Napas 247):** Cung cấp link thanh toán PayOS cho Web và VietQR động cho Mobile/Meetup, bảo chứng giữ tiền Escrow.
* **Cổng Realtime Gateway (Socket.IO & Firebase FCM):** Đồng bộ dữ liệu tức thời giữa Web và Mobile, bắn thông báo đẩy Push Notification và theo dõi trạng thái Presence.

### 1.2. Sơ đồ tương tác tổng quan

```mermaid
graph TD
    ClientWeb["🌐 Web Client (Next.js 16)"]
    ClientMobile["📱 Mobile App (Expo SDK 52)"]
  
    BackendGateway["⚡ Backend API Gateway (Port 5000)"]
    SocketIO["📡 Realtime Socket.IO Gateway"]
  
    Database[("🗄️ MongoDB Atlas (Prisma ORM)")]
    RedisCache[("⚡ Redis 7 (Cache, Geo, ZSET, Lock)")]
    MeiliEngine["🔍 Meilisearch Engine"]
    GeminiAI["🤖 Google Gemini 1.5 Flash Vision"]
    Payment["💳 PayOS / VietQR Napas Gateway"]
  
    ClientWeb <-->|REST API / HTTPS| BackendGateway
    ClientMobile <-->|REST API / HTTPS| BackendGateway
  
    ClientWeb <-->|WebSocket wss://| SocketIO
    ClientMobile <-->|WebSocket wss://| SocketIO
  
    BackendGateway <--> SocketIO
    BackendGateway <--> Database
    BackendGateway <--> RedisCache
    BackendGateway <--> MeiliEngine
    BackendGateway <--> GeminiAI
    BackendGateway <--> Payment
```

---

## FLOW 1: XÁC THỰC, PHÂN QUYỀN & ĐỊNH DANH KYC SINH VIÊN

### 1.1. Luồng Đăng ký & Xác thực OTP Email FPT

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên FPT
    participant Client as Web / Mobile Client
    participant AuthAPI as Backend Auth Controller
    participant Redis as Redis Cache
    participant Mail as Dịch vụ Email (Nodemailer SMTP)
    participant DB as MongoDB Atlas (Prisma)

    SV->>Client: Nhập Email (@fpt.edu.vn / @fe.edu.vn), Mật khẩu, Họ tên, Campus
    Client->>AuthAPI: POST /api/auth/register (payload)
    AuthAPI->>AuthAPI: Validate định dạng Email FPT & độ mạnh mật khẩu (Zod)
    AuthAPI->>Redis: Lưu thông tin tạm & Tạo OTP 6 chữ số (TTL 5 phút)
    AuthAPI->>Mail: Gửi email chứa mã OTP xác thực
    AuthAPI-->>Client: Trả về trạng thái "OTP_SENT"
  
    SV->>Client: Nhập mã OTP nhận từ email
    Client->>AuthAPI: POST /api/auth/verify-register-otp { email, otp }
    AuthAPI->>Redis: Kiểm tra khớp mã OTP & thời hạn hiệu lực
    alt OTP sai hoặc hết hạn
        AuthAPI-->>Client: Báo lỗi "Mã OTP không hợp lệ hoặc đã hết hạn" (400)
    else OTP chính xác
        AuthAPI->>DB: Tạo bản ghi User (role: 'BUYER', isActive: true)
        AuthAPI->>DB: Tạo bản ghi Profile (fullName, campus, campusCoins: 0, reputationScore: 100)
        AuthAPI->>AuthAPI: Sinh cặp Dual JWT (Access Token 15m, Refresh Token 30d)
        AuthAPI-->>Client: Trả về User Profile + Tokens
        Client->>Client: Lưu Token vào Storage an toàn (SecureStore / HttpOnly Cookie)
    end
```

### 1.2. Luồng Nâng cấp Tài khoản Người Bán (KYC Thẻ Sinh Viên & Seller Onboarding)

Sinh viên thông thường chỉ có quyền mua (`BUYER`). Để đăng bán, sinh viên thực hiện Onboarding Người Bán:

```mermaid
sequenceDiagram
    autonumber
    actor User as Sinh viên (BUYER)
    participant Client as Web / Mobile Client
    participant ProfileAPI as Backend Profile Controller
    participant DB as MongoDB Atlas (Prisma)
    actor Admin as Quản trị viên (BQT)

    User->>Client: Chọn "Trở thành Người Bán" -> Nhập Họ tên, SĐT, STK Ngân hàng + Upload Thẻ SV / CCCD
    Client->>ProfileAPI: POST /api/profile/seller-onboarding (Multipart: cardImage, CCCD, bankAccount)
    ProfileAPI->>ProfileAPI: Nén WebP an toàn & Lưu vào thư mục lưu trữ riêng tư
    ProfileAPI->>DB: Cập nhật Profile (embedded kyc, bankAccount, status: 'PENDING', type: 'SELLER')
    ProfileAPI->>DB: Tạo bản ghi KycVerification
    ProfileAPI-->>Client: Thông báo "Hồ sơ đã gửi, BQT sẽ xét duyệt trong 24h"
  
    Admin->>Client: Truy cập /admin/kyc
    Client->>ProfileAPI: GET /api/reports/kyc/verifications?status=PENDING
    ProfileAPI-->>Client: Trả về danh sách hồ sơ kèm link ảnh bảo mật (/api/profile/kyc/card/:filename)
  
    opt Admin muốn chạy AI đối soát tự động
        Admin->>ProfileAPI: POST /api/reports/kyc/:id/ai-scan
        ProfileAPI->>ProfileAPI: Gọi Gemini Vision OCR trích xuất MSSV, họ tên, chấm điểm aiMatchScore
    end
  
    alt Admin bấm "Phê duyệt"
        Admin->>ProfileAPI: PATCH /api/reports/kyc/:id/approve
        ProfileAPI->>DB: Cập nhật User (role: 'SELLER'), kyc.status = 'APPROVED'
        ProfileAPI->>DB: Thưởng Xu chào mừng & Ghi nhận CoinTransaction
        ProfileAPI-->>Client: Phát Realtime Socket 'kyc_status_updated' tới sinh viên
    else Admin bấm "Từ chối"
        Admin->>ProfileAPI: PATCH /api/reports/kyc/:id/reject { reason: 'Ảnh mờ không rõ MSSV' }
        ProfileAPI->>DB: Cập nhật kyc.status = 'REJECTED' kèm lý do
        ProfileAPI-->>Client: Phát Realtime Socket thông báo để sinh viên nộp lại
    end
```

---

## FLOW 2: ĐĂNG TIN, AI SCAN & QUY TRÌNH PHÊ DUYỆT BQT

### 2.1. Đăng tin mới & Kiểm duyệt an toàn

```mermaid
stateDiagram-v2
    [*] --> NhapThongTin: Người bán tạo bài đăng (Form chi tiết hoặc AI Vision 3s)
    NhapThongTin --> KiemTraTuCam: Hệ thống kiểm duyệt nội dung & validate DTO
  
    KiemTraTuCam --> TuChoiNgay: Chứa từ cấm / Hàng cấm học đường (Reject 400)
    TuChoiNgay --> [*]
  
    KiemTraTuCam --> LuuBanGhi: Nội dung hợp lệ
  
    state PhanQuyen {
        LuuBanGhi --> CheckRole: Kiểm tra vai trò người đăng
        CheckRole --> AvailableTuDong: Người đăng là ADMIN
        CheckRole --> ChoAdminDuyet: Người bán là SELLER thông thường
    }
  
    ChoAdminDuyet --> TrangThaiPending: Trạng thái = 'PENDING_APPROVAL'
    TrangThaiPending --> AdminXemXet: Bài xuất hiện tại /admin/moderation
  
    AdminXemXet --> AdminTuChoi: Admin bấm "Từ chối" kèm lý do
    AdminTuChoi --> ThongBaoSeller: Gửi notification cho Người bán
    ThongBaoSeller --> NguoiBanKhangCao: Người bán có thể gửi đơn kháng cáo (POST /:id/appeal)
    NguoiBanKhangCao --> AdminXemXet
  
    AdminXemXet --> AdminDuyet: Admin bấm "Phê duyệt"
    AvailableTuDong --> ActiveOnMarket
    AdminDuyet --> ActiveOnMarket: Trạng thái = 'AVAILABLE'
  
    ActiveOnMarket --> DongBoMeili: Đồng bộ lên Meilisearch Engine
    ActiveOnMarket --> PhatSocket: Phát Realtime broadcast 'product:created' tới Web & Mobile
    ActiveOnMarket --> ThongBaoSellerDuyet: Gửi Push FCM, In-App & Email cho Người Bán
    ThongBaoSellerDuyet --> [*]
    PhatSocket --> [*]
```

---

## FLOW 3: ĐỒNG BỘ SẢN PHẨM REALTIME 2 CHIỀU WEB ⮂ MOBILE

### 3.1. Mô hình Đồng bộ Sự kiện Realtime

```mermaid
sequenceDiagram
    autonumber
    participant WebUser as Trình duyệt Web (Desktop/Laptop)
    participant MobileUser as Thiết bị Mobile (Android / iOS)
    participant Server as Backend Socket.IO Gateway
    participant DB as MongoDB Atlas (Prisma)

    Note over WebUser, MobileUser: Cả 2 nền tảng đều mở sẵn và duy trì kết nối WebSocket vào room public_feed

    rect rgb(240, 248, 255)
    Note over WebUser, Server: [Chiều 1] Admin phê duyệt tin (hoặc Admin đăng bài) -> Realtime đẩy lên Feed Web & Mobile
    Server->>DB: Cập nhật sản phẩm (status: 'AVAILABLE', approvedAt: new Date())
    Server->>Server: syncProductToMeili(product) & Xóa cache Redis
    Server->>Server: broadcastEvent('product:created', sanitizeProductSeller(product))
    Server-->>WebUser: io.emit('product:created') -> Cập nhật Live Posts trên Web
    Server-->>MobileUser: io.emit('product:created') -> useHomeFeed nhận dữ liệu
    MobileUser->>MobileUser: adaptBackendProductToMobile() -> chèn lên đầu Feed
    Server-->>WebUser: Bắn Socket new_notification + FCM Push + Email thông báo cho Người bán
    end

    rect rgb(255, 250, 240)
    Note over MobileUser, Server: [Chiều 2] Mobile cập nhật trạng thái/giá -> Web cập nhật tức thì
    MobileUser->>Server: Đổi trạng thái tin / giá (PATCH /api/products/:id)
    Server->>DB: Cập nhật sản phẩm
    Server->>Server: broadcastEvent('product:updated', sanitizeProductSeller(updated))
    Server-->>MobileUser: Cập nhật store mobile
    Server-->>WebUser: io.emit('product:updated') -> Web tự động re-render không cần F5
    end
```

---

## FLOW 4: TÌM KIẾM THÔNG MINH & BỘ LỌC ĐA CAMPUS

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên tìm đồ
    participant Client as Web / Mobile Client
    participant Debounce as Debounce Controller (350ms)
    participant SearchAPI as Backend Product Service
    participant Redis as Redis ZSET Trending
    participant Meili as Meilisearch Engine
    participant DB as MongoDB Atlas (Prisma Fallback)

    SV->>Client: Nhập từ khóa tìm kiếm (Ví dụ: "quạt senko #ktx")
    Client->>Debounce: Kích hoạt bộ đệm Debounce 350ms
    
    alt Autocomplete Suggestion (Tìm kiếm nhanh)
        Client->>SearchAPI: GET /api/products/suggest?q=quat&campus=HOL&limit=6
        SearchAPI->>Meili: Gợi ý top 6 sản phẩm phù hợp nhất
        Meili-->>SearchAPI: Trả về kết quả
        SearchAPI-->>Client: Hiển thị danh sách gợi ý xổ xuống
    else Full Search (Tìm kiếm toàn diện)
        Client->>SearchAPI: GET /api/products?search=quat&campus=HOL&categoryType=DORM_ITEM
        SearchAPI->>Redis: Tăng điểm từ khóa tìm kiếm trong ZSET Trending (ZINCRBY)
        
        SearchAPI->>Meili: Gửi truy vấn tìm kiếm thông minh (Typo Tolerance)
        alt Meilisearch hoạt động bình thường
            Meili-->>SearchAPI: Trả về danh sách productIds theo điểm số Ranking
            SearchAPI->>DB: Truy vấn chi tiết sản phẩm theo IDs (status: 'AVAILABLE')
        else Meilisearch gián đoạn / Timeout
            SearchAPI->>DB: Fallback tìm kiếm bằng Prisma MongoDB regex
        end
        
        SearchAPI->>SearchAPI: sanitizeProductSeller() bảo vệ dữ liệu PII
        SearchAPI-->>Client: Trả về danh sách sản phẩm + Phân trang Skip-Limit
    end
```

---

## FLOW 5: TRÒ CHUYỆN P2P, MẶC CẢ TRẢ GIÁ & HẸN ĐIỂM SAFE-POINT

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Người Mua (Buyer)
    participant ClientB as App Mobile / Web (Buyer)
    participant Socket as Socket.IO Server Gateway
    participant ClientS as App Mobile / Web (Seller)
    actor Seller as Người Bán (Seller)

    Buyer->>ClientB: Bấm "Chat với người bán" tại trang chi tiết sản phẩm
    ClientB->>Socket: emit('join_conversation', { conversationId })
    Socket-->>ClientB: emit('joined_conversation', { conversationId })
  
    Buyer->>ClientB: Nhập đề xuất mặc cả: 200.000đ
    ClientB->>Socket: emit('send_offer_price', { conversationId, offerPrice: 200000 })
    Socket->>Socket: Kiểm tra giá đề xuất >= 50% giá gốc & Lưu Message (type: 'OFFER_PRICE')
    Socket-->>ClientS: emit('receive_message', savedMessage)
    Socket-->>ClientS: emitToUser(sellerId, 'new_message_notification', payload)
  
    Seller->>ClientS: Nhấn đề xuất địa điểm hẹn gặp tại Campus
    ClientS->>Socket: emit('send_meetup_location', { conversationId, meetupLocation: 'Trạm Safe-Handoff Sảnh Alpha' })
    Socket->>Socket: Lưu Message (type: 'MEETUP_LOCATION')
    Socket-->>ClientB: emit('receive_message', savedMessage)
  
    Buyer->>ClientB: Đang soạn tin nhắn...
    ClientB->>Socket: emit('typing', { conversationId })
    Socket-->>ClientS: emit('user_typing', { userId, conversationId })
  
    Buyer->>ClientB: Đọc tin nhắn đối phương
    ClientB->>Socket: emit('message_read', { conversationId })
    Socket-->>ClientS: emit('messages_marked_read', { conversationId, readBy: buyerId })
```

---

## FLOW 6: GIAO DỊCH AN TOÀN, BẢO CHỨNG ESCROW & BÀN GIAO HÀNG HÓA

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Người Mua
    participant Gateway as Backend API & Escrow Service
    actor Seller as Người Bán
    participant PayOS as Cổng PayOS / VietQR Napas

    Buyer->>Gateway: POST /api/orders (orderType: 'MEETUP' hoặc 'SHIP_COD', coinsUsed)
    Gateway->>Gateway: Trừ Xu giảm giá (tối đa 10-20%), sinh orderCode: 'FU-ORD-xxxx'
    
    alt Thanh toán PayOS Web URL (Trực tuyến)
        Gateway->>PayOS: Tạo link thanh toán PayOS
        PayOS-->>Gateway: Trả checkoutUrl & payosOrderCode
        Gateway-->>Buyer: Trả link chuyển hướng thanh toán
        Buyer->>PayOS: Hoàn tất thanh toán trên Web
        PayOS->>Gateway: POST /api/webhooks/payments (HMAC Verification)
        Gateway->>Gateway: Cập nhật order.status = 'PAID', isPaid = true
    else Hẹn gặp trực tiếp VietQR / Tiền mặt
        Gateway-->>Buyer: Sinh mã VietQR Napas 247 động
    end

    Note over Buyer, Seller: Hai bên gặp nhau tại Trạm Safe-Handoff (Sảnh Alpha/Beta/KTX)
    Seller->>Buyer: Đưa đồ dùng cho Người mua kiểm tra thực tế
  
    alt Người mua ưng ý nhận đồ
        Seller->>Gateway: Mở mã QR Handshake (HMAC token) kèm OTP 4 số hiển thị bên dưới
        Buyer->>Gateway: Quét mã QR gửi request POST /api/orders/:id/handshake
        Gateway->>Gateway: Verify token HMAC & OTP khớp 100%
        Gateway->>Gateway: Cập nhật order.status = 'COMPLETED', product.status = 'SOLD'
        Gateway->>Gateway: Kích hoạt thời hạn Bao test (24h)
        Gateway-->>Buyer: emitToUser(buyerId, 'order_completed', payload)
        Gateway-->>Seller: emitToUser(sellerId, 'order_completed', payload)
      
        Note over Buyer: Người mua test đồ tại phòng trọ/KTX
        alt Người mua bấm "Xác nhận nhận hàng an toàn" sớm
            Buyer->>Gateway: POST /api/orders/:id/confirm-delivery
            Gateway->>Gateway: Giải phóng tiền Escrow ngay lập tức cho Người bán
        else Hết 24h không có khiếu nại
            Note over Gateway: Cron escrow-auto-release tự động giải phóng tiền cho Seller
        end
    else Người mua không ưng ý (Hàng lỗi, sai mô tả)
        Buyer->>Gateway: POST /api/orders/:id/cancel
        Gateway->>Gateway: Hủy đơn, hoàn lại Xu/Voucher đã khấu trừ
        Gateway-->>Seller: Sản phẩm tự động mở lại 'AVAILABLE'
    end
```

---

## FLOW 7: KHIẾU NẠI, TRANH CHẤP & TRỌNG TÀI BQT

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Người Mua
    participant Upload as Upload Media Service
    participant DisputeAPI as Dispute & Reports Service
    actor Admin as Ban Quản Trị (Trọng tài)
    actor Seller as Người Bán

    Buyer->>Upload: POST /api/reports/upload-evidence (Video clip quay rõ lỗi kỹ thuật)
    Upload-->>Buyer: Trả về link video bằng chứng
    
    Buyer->>DisputeAPI: POST /api/reports/disputes (orderId, reason, proofVideoUrl)
    DisputeAPI->>DisputeAPI: ĐÓNG BĂNG TIỀN ESCROW, cập nhật order.status = 'DISPUTED'
    DisputeAPI-->>Seller: emitToUser(sellerId, 'order_disputed', payload)
  
    Admin->>DisputeAPI: GET /api/reports/disputes (Xem chi tiết khiếu nại)
    DisputeAPI-->>Admin: Trả về video bằng chứng, nhật ký chat và thông tin đơn hàng
  
    alt Admin quyết định: NGƯỜI MUA ĐÚNG (Hàng lỗi, gian lận)
        Admin->>DisputeAPI: PATCH /api/reports/disputes/:id/approve
        DisputeAPI->>DisputeAPI: Hoàn trả 100% tiền Escrow cho Người mua
        DisputeAPI->>DisputeAPI: Trừ điểm uy tín Seller, gửi thông báo cảnh cáo
    else Admin quyết định: NGƯỜI BÁN ĐÚNG (Buyer làm hỏng / khiếu nại sai)
        Admin->>DisputeAPI: PATCH /api/reports/disputes/:id/reject
        DisputeAPI->>DisputeAPI: Giải phóng tiền Escrow cho Người bán
        DisputeAPI->>DisputeAPI: Trừ điểm uy tín Buyer vì khiếu nại gian dối
    else Hai bên tự thỏa thuận xong
        Buyer->>DisputeAPI: PATCH /api/reports/disputes/:id/cancel
        DisputeAPI->>DisputeAPI: Hủy khiếu nại, tiếp tục luồng hoàn tất đơn hàng
    end
```

---

## FLOW 8: ĐÁNH GIÁ CÔNG KHAI TỨC THÌ & ĐIỂM UY TÍN

Cơ chế đánh giá trên sàn là **Đánh giá Công Khai Tức Thì (Instant Public Review)**: Khi người mua gửi đánh giá, bài đánh giá được công khai ngay lập tức trên trang cá nhân của người bán, điểm uy tín và Xu thưởng được cộng ngay:

```mermaid
graph TD
    OrderDone["Đơn hàng hoàn tất (COMPLETED)"] --> PromptReview["Hệ thống kích hoạt quyền đánh giá 1-5 sao"]
  
    PromptReview --> BuyerSubmits["Buyer gửi Review (Rating + Nhận xét + Video/Ảnh test máy)"]
  
    BuyerSubmits --> ReviewActive["Lưu vào Database: isPublic = true, revealedAt = now() (Công khai ngay lập tức)"]
  
    ReviewActive --> UpdateReputation["Cộng/trừ Reputation Score tức thì cho Người Bán (+5 khi 5 sao)"]
    ReviewActive --> BonusCoin{"Review có đính kèm video test?"}
  
    BonusCoin -->|Có video test| CongXuBonus["Thưởng +200 Campus Coins vào Ví (Ghi CoinTransaction)"]
    BonusCoin -->|Chỉ có text/ảnh| CongXuStandard["Thưởng +100 Campus Coins vào Ví"]

    ReviewActive --> NotifySeller["Phát Socket review_revealed & Bắn Push FCM thông báo cho Người Bán"]
    NotifySeller --> ManageDisplay["Người bán có quyền toggle ẩn/hiện đánh giá trên trang cá nhân"]
```

---

## FLOW 9: GAMIFICATION, VÍ CAMPUS COIN & ĐỔI VOUCHER

```mermaid
graph LR
    subgraph KiemXu ["🪙 CÁC KÊNH KIẾM CAMPUS COIN"]
        A1["Điểm danh mỗi ngày: +20 Xu (DailyCheckIn)"]
        A2["Đánh giá kèm video test: +200 Xu (Review)"]
        A3["Đánh giá thường: +100 Xu"]
        A4["Hoàn thành Nhiệm vụ tuần (QuestClaim)"]
        A5["Duyệt Thẻ Sinh Viên KYC thành công"]
    end

    subgraph ViXu ["💰 VÍ CAMPUS COIN (Profile)"]
        B1["Số dư Campus Coins Khả dụng (Sổ cái CoinTransaction)"]
    end

    subgraph TieuXu ["🎁 SỬ DỤNG CAMPUS COIN"]
        C1["Đổi Voucher Căn tin / Passio / 7-Eleven (/api/vouchers/:id/redeem)"]
        C2["Khấu trừ tiền khi đặt đơn hàng (Giảm tối đa 10% - 20%)"]
        C3["Đẩy tin lên đầu trang (Bump Post: -100 Xu)"]
        C4["Ghim tin nổi bật 24h (Pin to Top: -300 Xu)"]
        C5["Mua Huy hiệu Profile: TOP_SELLER, K18_VERIFIED"]
        C6["Rút tiền mặt về tài khoản ngân hàng (/api/profile/withdrawals)"]
    end

    KiemXu --> B1
    B1 --> TieuXu
```

---

## FLOW 10: BÁO CÁO VI PHẠM & TRẠM AN TOÀN SAFE-HANDOFF

### 10.1. Tố cáo tài khoản & tin đăng vi phạm

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên phát hiện vi phạm
    participant Client as Web / Mobile
    participant Backend as Reports Service
    actor Admin as Ban Quản Trị

    SV->>Client: Bấm "Tố cáo tin đăng / Người dùng"
    Client->>Backend: POST /api/reports { targetType, targetId, reason, details }
    Backend->>Backend: Lưu bản ghi Report (status: 'PENDING')
    Backend-->>SV: Thông báo "Báo cáo của bạn đã được tiếp nhận"
  
    Admin->>Client: Truy cập /admin/reports
    Client->>Backend: GET /api/reports?status=PENDING
    Backend-->>Client: Hiển thị danh sách tố cáo
  
    Admin->>Backend: PATCH /api/reports/:id/resolve { action: 'BAN_USER' | 'HIDE_PRODUCT' | 'DISMISS' }
  
    alt Xử lý gỡ bài đăng
        Backend->>Backend: Đổi product.status = 'HIDDEN', xóa khỏi Meilisearch
        Backend->>Backend: broadcastEvent('product:updated', product)
    else Xử lý cấm tài khoản
        Backend->>Backend: Đổi user.isActive = false, vô hiệu hóa JWT tokenVersion
    end
```

### 10.2. Tìm trạm Safe-Handoff gần nhất

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên
    participant Client as Web / Mobile Client
    participant HubAPI as Safe-Handoff Service
    participant Redis as Redis Geospatial (GEOSEARCH)

    SV->>Client: Mở bản đồ trạm an toàn Campus
    Client->>HubAPI: GET /api/safe-handoff/nearby?longitude=105.52&latitude=21.01&radiusKm=2
    HubAPI->>Redis: GEOSEARCH safe_handoff_hubs FROMLONLAT ... BYRADIUS
    Redis-->>HubAPI: Trả về danh sách hub IDs kèm khoảng cách chính xác theo mét
    HubAPI->>HubAPI: Lấy chi tiết thông tin trạm (camera, cán bộ hỗ trợ, giờ mở cửa)
    HubAPI-->>Client: Hiển thị trạm Safe-Handoff gần nhất kèm chỉ đường
```

---

## FLOW 11: HỆ THỐNG THÔNG BÁO THỜI GIAN THỰC & ĐA KÊNH TRÊN WEB

Hệ thống thông báo của sàn MarketFU Web kết hợp **4 kênh phân phối (Multi-channel Delivery Architecture)**:
* **Kênh A (In-App Database):** Lưu bản ghi thông báo vào MongoDB Atlas (`Notification` model) với trạng thái `isRead: false`, dùng để hiển thị trên Bell Icon, Badge đỏ và Dropdown lịch sử.
* **Kênh B (Realtime WebSocket Socket.IO):** Bắn tức thời (< 1ms) vào room `user_{userId}`. Khi người dùng đang mở tab Web, icon chuông lập tức nhảy số đỏ, pop Toast nổi và phát chuông âm thanh Web Audio API (`playNotificationChime`).
* **Kênh C (Web Push W3C / VAPID):** Gửi thông báo đẩy chuẩn Native OS (Desktop Banner Windows/macOS) qua Service Worker (`firebase-messaging-sw.js`), tiếp cận được cả khi người dùng thu nhỏ trình duyệt hoặc đang mở tab khác.
* **Kênh D (Email HTML Nodemailer SMTP):** Gửi email cho các biến cố giao dịch quan trọng (`ORDER`, thanh toán Escrow, duyệt `KYC`). Riêng tin nhắn `CHAT` được cách ly hoàn toàn, không gửi email để tránh spam.

### 11.1. Luồng Khởi tạo, Đăng ký Web Push VAPID & Kết nối Socket.IO

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên trên Trình duyệt Web
    participant WebUI as Web Client (Next.js 16)
    participant SW as Service Worker (Browser Push)
    participant SocketGW as Realtime Socket.IO Gateway
    participant NotifAPI as Backend Notification Controller
    participant DB as MongoDB Atlas (Prisma)

    SV->>WebUI: Đăng nhập thành công vào Web MarketFU
    WebUI->>SocketGW: Kết nối WebSocket (wss://) kèm JWT Access Token
    SocketGW->>SocketGW: Xác thực JWT & Auto-join room "user_{userId}"
    SocketGW-->>WebUI: Kết nối thành công (connected: true)

    WebUI->>NotifAPI: GET /api/notifications/unread-count
    NotifAPI->>DB: Đếm số bản ghi { userId, isRead: false }
    DB-->>NotifAPI: unreadCount: 3
    NotifAPI-->>WebUI: Trả về unreadCount (Hiển thị Badge đỏ trên biểu tượng Chuông)

    opt Đăng ký Web Push Desktop (Lần đầu truy cập hoặc bật thông báo)
        WebUI->>SV: Xin quyền thông báo: Notification.requestPermission()
        SV-->>WebUI: Bấm "Cho phép" (permission = 'granted')
        WebUI->>NotifAPI: GET /api/notifications/vapid-public-key
        NotifAPI-->>WebUI: Trả về vapidPublicKey
        WebUI->>SW: Đăng ký Service Worker (/firebase-messaging-sw.js)
        SW-->>WebUI: ServiceWorkerRegistration sẵn sàng
        WebUI->>SW: registration.pushManager.subscribe({ applicationServerKey })
        SW-->>WebUI: Sinh PushSubscription (endpoint, keys: p256dh, auth)
        WebUI->>NotifAPI: POST /api/notifications/device-token { token: JSON.stringify(sub), deviceType: 'WEB' }
        NotifAPI->>DB: Lưu / Cập nhật DeviceToken (upsert token)
        NotifAPI-->>WebUI: Đăng ký Web Push thành công (200 OK)
    end
```

### 11.2. Luồng Bắn Thông Báo Realtime & Điều Phối Đa Kênh Khi Có Sự Kiện

```mermaid
sequenceDiagram
    autonumber
    participant EventSource as Nghiệp vụ nguồn (Order / Chat / KYC)
    participant NotifService as Backend NotificationService
    participant DB as MongoDB Atlas (Prisma)
    participant SocketGW as Realtime Socket.IO Gateway
    participant WebUI as Web Client (Đang mở tab)
    participant WebPush as Web Push VAPID Service
    participant MailService as Email Service (Nodemailer SMTP)
    actor SV as Sinh viên nhận thông báo

    Note over EventSource,NotifService: Phát sinh sự kiện: Đơn hàng mới / Tin nhắn / Phê duyệt KYC
    EventSource->>NotifService: sendNotification({ userId, title, body, type, targetUrl, email })
    
    rect rgb(240, 248, 255)
        Note over NotifService,DB: [Kênh A] Lưu In-App Database (~3ms)
        NotifService->>DB: prisma.notification.create({ userId, title, body, type, isRead: false })
        DB-->>NotifService: Bản ghi notification mới (id, createdAt, ...)
    end

    rect rgb(245, 255, 245)
        Note over NotifService,WebUI: [Kênh B] Phát Realtime WebSocket (<1ms)
        NotifService->>SocketGW: emitToUser(userId, 'new_notification', notification)
        SocketGW->>WebUI: Bắn sự kiện 'new_notification' tới room "user_{userId}"
        WebUI->>WebUI: Zustand Store cập nhật: Thêm item vào đầu list & unreadCount + 1
        WebUI->>WebUI: Phát âm thanh Web Audio API (playNotificationChime)
        WebUI->>WebUI: Hiển thị Toast Popup nổi góc màn hình
    end

    rect rgb(255, 250, 240)
        Note over NotifService,WebPush: [Kênh C & D] Non-blocking Worker (setImmediate)
        NotifService->>DB: Lấy danh sách DeviceToken của user (deviceType: 'WEB')
        DB-->>NotifService: webTokens (JSON subscriptions)
        
        opt Nếu user có đăng ký Web Push
            NotifService->>WebPush: webpush.sendNotification(subscription, payload)
            WebPush->>SV: Đẩy Native Desktop Banner (Dù tab đang ẩn/thu nhỏ)
        end
        
        opt Nếu có cấu hình Email & Type != 'CHAT'
            NotifService->>MailService: sendMail({ to, subject, html })
            MailService->>SV: Gửi Email thông báo chính thức vào hộp thư FPT
        end
    end
```

### 11.3. Luồng Tương tác của Người Dùng trên Web: Xem, Đọc Thông Báo & Điều Hướng

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên
    participant WebUI as Web Client (Navbar / Dropdown)
    participant NotifStore as Zustand Notification Store
    participant NotifAPI as Backend Notification Controller
    participant DB as MongoDB Atlas (Prisma)

    SV->>WebUI: Click vào icon Chuông trên Navbar
    WebUI->>NotifAPI: GET /api/notifications?page=1&limit=20
    NotifAPI->>DB: prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    DB-->>NotifAPI: Danh sách thông báo
    NotifAPI-->>WebUI: Trả về mảng notifications
    WebUI->>WebUI: Mở NotificationDropdown (Tab: Tất cả / Đơn hàng / Tin nhắn / KYC)

    alt Sinh viên click vào 1 thông báo cụ thể
        SV->>WebUI: Click item thông báo (Ví dụ: "Đơn hàng #ORD-88231 đã được xác nhận")
        WebUI->>NotifAPI: PATCH /api/notifications/:id/read
        NotifAPI->>DB: prisma.notification.update({ where: { id }, data: { isRead: true } })
        DB-->>NotifAPI: Cập nhật thành công
        NotifAPI-->>WebUI: Trả về notification đã đọc
        WebUI->>NotifStore: Giảm unreadCount (-1), đổi trạng thái item isRead: true
        WebUI->>WebUI: Next.js Router điều hướng tức thì tới targetUrl (/orders/ORD-88231)
    else Sinh viên bấm "Đánh dấu tất cả đã đọc"
        SV->>WebUI: Bấm "Đánh dấu tất cả đã đọc" (Mark all as read)
        WebUI->>NotifAPI: PATCH /api/notifications/read-all
        NotifAPI->>DB: prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
        DB-->>NotifAPI: Số lượng bản ghi cập nhật
        NotifAPI-->>WebUI: { success: true, count: N }
        WebUI->>NotifStore: Đặt unreadCount = 0, toàn bộ items isRead: true
    else Sinh viên xóa 1 thông báo
        SV->>WebUI: Bấm icon thùng rác xóa thông báo
        WebUI->>NotifAPI: DELETE /api/notifications/:id
        NotifAPI->>DB: prisma.notification.delete({ where: { id, userId } })
        DB-->>NotifAPI: Xóa thành công
        NotifAPI-->>WebUI: { success: true }
        WebUI->>NotifStore: Lọc bỏ item khỏi danh sách hiển thị
    end
```

---

## 13. BẢNG MA TRẬN TỔNG HỢP SỰ KIỆN SOCKET.IO & API ENDPOINTS

### 12.1. Danh mục API Endpoints Cốt Lõi (Khớp 100% Codebase)

| Phân hệ | Phương thức | Endpoint | Quyền hạn | Mô tả chức năng |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Đăng ký tài khoản bằng email FPT |
| | `POST` | `/api/auth/send-register-otp` | Public | Gửi mã OTP xác thực email đăng ký |
| | `POST` | `/api/auth/verify-register-otp` | Public | Xác thực mã OTP 6 số kích hoạt tài khoản |
| | `POST` | `/api/auth/login` | Public | Đăng nhập nhận cặp Dual JWT Tokens |
| | `POST` | `/api/auth/google` | Public | Đăng nhập nhanh Google SSO |
| | `POST` | `/api/auth/refresh-token` | Public | Cấp lại Access Token mới qua Refresh Token cookie |
| | `POST` | `/api/auth/logout` | Public | Đăng xuất và hủy phiên làm việc |
| | `PATCH` | `/api/auth/change-password` | Authenticated | Đổi mật khẩu tài khoản |
| **Profile** | `GET` | `/api/profile` hoặc `/me` | Authenticated | Lấy hồ sơ cá nhân, số dư Xu, tích xanh |
| | `GET` | `/api/profile/public/:userId` | Public | Xem hồ sơ công khai người bán khác |
| | `PATCH` | `/api/profile/me` | Authenticated | Cập nhật thông tin cá nhân |
| | `POST` | `/api/profile/kyc` | Authenticated | Upload thẻ SV xác thực danh tính |
| | `GET` | `/api/profile/kyc/card/:filename` | Authenticated | Stream ảnh thẻ SV bảo mật (Private Media Streaming) |
| | `POST` | `/api/profile/seller-onboarding` | Authenticated | Nộp hồ sơ Onboarding Người Bán (Thẻ SV, CCCD, STK) |
| | `POST` | `/api/profile/badges/buy` | Authenticated | Mua khung avatar / huy hiệu bằng Xu |
| | `POST` | `/api/profile/withdrawals` | Authenticated | Tạo yêu cầu rút tiền về tài khoản ngân hàng |
| | `GET` | `/api/profile/quests` | Authenticated | Xem danh mục nhiệm vụ tuần |
| | `POST` | `/api/profile/claim-quest` | Authenticated | Nhận thưởng Xu từ nhiệm vụ |
| | `POST` | `/api/profile/check-in` | Authenticated | Điểm danh nhận Xu hàng ngày (+20 Xu) |
| **Products** | `GET` | `/api/products` | Public | Lấy danh sách sản phẩm (Lọc Campus, Danh mục, Giá) |
| | `GET` | `/api/products/suggest` | Public | Gợi ý tìm kiếm autocomplete qua Meilisearch |
| | `GET` | `/api/products/trending/searches` | Public | Top từ khóa hot nhất sàn (Redis ZSET) |
| | `GET` | `/api/products/:id` | Public/Optional | Chi tiết bài đăng + tăng lượt xem |
| | `POST` | `/api/products` | `SELLER`/`ADMIN` | Đăng tin bán sản phẩm mới |
| | `PATCH` | `/api/products/:id` | Chủ bài | Chỉnh sửa nội dung tin đăng |
| | `PATCH` | `/api/products/:id/status` | Chủ bài | Chuyển trạng thái tin (`AVAILABLE`, `RESERVED`, `SOLD`, `HIDDEN`) |
| | `POST` | `/api/products/:id/appeal` | Chủ bài | Gửi kháng cáo khi tin bị BQT từ chối |
| | `PUT` | `/api/products/:id/favorite` | Authenticated | Thêm bài đăng vào danh sách yêu thích (Idempotent) |
| | `DELETE` | `/api/products/:id/favorite` | Authenticated | Bỏ thích bài đăng |
| | `POST` | `/api/products/:id/renew` | Chủ bài | Gia hạn bài đăng thêm 30 ngày |
| | `POST` | `/api/products/:id/boost` | Chủ bài | Đẩy tin (Bump: -100 Xu) hoặc Ghim 24h (Pin: -300 Xu) |
| **Admin Posts** | `GET` | `/api/products/admin/moderation` | `ADMIN` | Xem danh sách tin chờ duyệt (`PENDING_APPROVAL`) |
| | `PATCH` | `/api/products/admin/:id/approve` | `ADMIN` | Phê duyệt tin đăng & phát sóng Realtime |
| | `PATCH` | `/api/products/admin/:id/reject` | `ADMIN` | Từ chối tin đăng kèm lý do cụ thể |
| **Chats** | `GET` | `/api/chats/conversations` | Authenticated | Lấy danh sách cuộc trò chuyện |
| | `POST` | `/api/chats/conversations` | Authenticated | Tạo hoặc mở cuộc trò chuyện theo sản phẩm |
| | `GET` | `/api/chats/conversations/:id/messages` | Authenticated | Lấy lịch sử tin nhắn |
| | `POST` | `/api/chats/conversations/:id/messages` | Authenticated | Gửi tin nhắn qua REST (kèm ảnh) |
| | `PATCH` | `/api/chats/conversations/:id/read` | Authenticated | Đánh dấu đã đọc toàn bộ hội thoại |
| **AI Module** | `POST` | `/api/ai/vision-post` | Authenticated | Quét ảnh tự động điền form bài đăng trong 3s |
| | `POST` | `/api/ai/assistant-chat` | Public/Optional | Chatbot tư vấn tìm đồ phòng trọ theo giá & campus |
| **Categories** | `GET` | `/api/categories` | Public | Danh sách danh mục hàng hóa trên sàn |
| | `GET` | `/api/categories/:slug` | Public | Chi tiết danh mục theo slug |
| | `POST` | `/api/categories/seed` | `ADMIN` | Seed danh mục mặc định chuẩn FU |
| | `POST`/`PATCH`/`DELETE` | `/api/categories/:id` | `ADMIN` | Thêm, sửa, xóa danh mục |
| **Orders** | `POST` | `/api/orders` | Authenticated | Tạo đơn hàng mới (`MEETUP` hoặc `SHIP_COD`) |
| | `GET` | `/api/orders` | Authenticated | Danh sách đơn mua / đơn bán |
| | `GET` | `/api/orders/shipping/estimate` | Authenticated | Dự toán cước phí vận chuyển |
| | `GET` | `/api/orders/seller/analytics` | `SELLER` | Thống kê doanh thu & đơn hàng của người bán |
| | `GET` | `/api/orders/:id` | Authenticated | Chi tiết đơn hàng và tiến trình Escrow |
| | `GET` | `/api/orders/:id/tracking` | Authenticated | Lịch sử timeline hành trình đơn hàng |
| | `POST` | `/api/orders/:id/confirm-order` | `SELLER` | Người bán chấp thuận đơn hàng |
| | `POST` | `/api/orders/:id/seller-confirm-handoff` | `SELLER` | Người bán xác nhận đã bàn giao hàng trực tiếp |
| | `PATCH` | `/api/orders/:id/shipping` | `SELLER` | Cập nhật mã vận đơn & giao hàng COD (`SHIPPING`) |
| | `POST` | `/api/orders/:id/handshake` | Authenticated | Quét mã QR Handshake (HMAC token & OTP 4 số) |
| | `POST` | `/api/orders/:id/confirm-delivery` | Authenticated | Người mua xác nhận nhận hàng an toàn -> Giải phóng Escrow |
| | `POST` | `/api/orders/:id/cancel` | Authenticated | Hủy đơn và hoàn trả Xu/Voucher |
| | `POST` | `/api/orders/:id/dispute` | Authenticated | Mở khiếu nại tranh chấp trực tiếp từ chi tiết đơn hàng |
| **Payments** | `GET` | `/api/payments/order/:orderCode/status` | Authenticated | Tra cứu trạng thái thanh toán theo mã đơn hàng |
| **Webhooks** | `POST` | `/api/webhooks/payments` | Public (HMAC) | Webhook PayOS đối soát thanh toán cọc Escrow |
| | `POST` | `/api/webhooks/shipping` | Public (HMAC) | Webhook GHTK cập nhật trạng thái vận chuyển COD |
| | `POST` | `/api/webhooks/ghn` | Public (HMAC) | Webhook GHN cập nhật trạng thái vận chuyển COD |
| **Reviews** | `POST` | `/api/reviews` | Authenticated | Đánh giá công khai tức thì + tặng Xu |
| | `POST` | `/api/reviews/:id/toggle-public` | Authenticated | Ẩn/hiện bài đánh giá trên trang cá nhân |
| | `GET` | `/api/reviews/user/:userId` | Public | Xem danh sách đánh giá công khai của người dùng |
| **Vouchers** | `GET` | `/api/vouchers` | Public | Danh sách Voucher đang có trên sàn |
| | `POST` | `/api/vouchers/:id/redeem` | Authenticated | Đổi Xu lấy Voucher ưu đãi (sinh voucherCode) |
| | `GET` | `/api/vouchers/me` | Authenticated | Kho Voucher cá nhân |
| | `POST` | `/api/vouchers/use` | Authenticated | Quét mã sử dụng tại quầy đối tác |
| **Disputes & Reports** | `POST` | `/api/reports/upload-evidence` | Authenticated | Upload video / ảnh bằng chứng khiếu nại |
| | `POST` | `/api/reports/disputes` | Authenticated | Mở khiếu nại tranh chấp trong thời hạn bao test |
| | `GET` | `/api/reports/disputes` | `ADMIN` | Admin xem danh sách khiếu nại |
| | `PATCH` | `/api/reports/disputes/:id/approve` | `ADMIN` | Phê duyệt khiếu nại -> Hoàn tiền cho Buyer |
| | `PATCH` | `/api/reports/disputes/:id/reject` | `ADMIN` | Bác bỏ khiếu nại -> Giải phóng tiền cho Seller |
| | `PATCH` | `/api/reports/disputes/:id/cancel` | Authenticated | Người mua tự rút khiếu nại khi đã hòa giải |
| | `POST` | `/api/reports` | Authenticated | Tố cáo tin đăng / người dùng lừa đảo |
| | `GET` | `/api/reports/me` | Authenticated | Xem danh sách các đơn tố cáo của chính mình |
| | `GET` | `/api/reports/analytics/semesters` | `ADMIN` | Thống kê doanh số theo học kỳ & campus |
| | `GET` | `/api/reports/kyc/verifications` | `ADMIN` | Danh sách hồ sơ KYC chờ thẩm định |
| | `POST` | `/api/reports/kyc/:id/ai-scan` | `ADMIN` | Quét AI OCR thẻ SV on-demand |
| | `PATCH` | `/api/reports/kyc/:id/approve` | `ADMIN` | Phê duyệt thẻ SV -> Cấp tích xanh & thưởng Xu |
| **Safe-Handoff** | `GET` | `/api/safe-handoff` | Public | Danh sách trạm giao dịch an toàn |
| | `GET` | `/api/safe-handoff/nearby` | Public | Tìm trạm Safe-Handoff gần nhất (Redis Geo) |
| | `GET` | `/api/safe-handoff/transactions` | `ADMIN` | Danh sách các cuộc hẹn giao dịch tại trạm |
| | `PATCH` | `/api/safe-handoff/:id/toggle` | `ADMIN` | Bật/tắt hoạt động của trạm an toàn |
| **Notifications** | `GET` | `/api/notifications` | Authenticated | Danh sách thông báo cá nhân |
| | `GET` | `/api/notifications/unread-count` | Authenticated | Số lượng thông báo chưa đọc |
| | `PATCH` | `/api/notifications/:id/read` | Authenticated | Đánh dấu một thông báo đã đọc |
| | `PATCH` | `/api/notifications/read-all` | Authenticated | Đánh dấu tất cả thông báo đã đọc |
| | `POST` | `/api/notifications/fcm-token` | Authenticated | Đăng ký Device Token cho Push FCM |
| | `GET` | `/api/notifications/vapid-public-key` | Public | Lấy VAPID Key cho Web Push Notification |
| **Users & Leaderboard** | `GET` | `/api/users/leaderboard/reputation` | Public | BXH sinh viên uy tín nhất (Redis ZSET) |
| | `GET` | `/api/users/:id` | Public | Xem thông tin người dùng công khai |
| | `PATCH` | `/api/users/:id/status` | `ADMIN` | Khóa / mở khóa tài khoản người dùng |
| **Presence** | `GET` | `/api/presence/:userId` | Public/Auth | Lấy trạng thái online/offline của người dùng |
| | `POST` | `/api/presence/batch` | Public/Auth | Kiểm tra trạng thái nhiều người dùng cùng lúc |

---

### 12.2. Danh mục Sự kiện Realtime Socket.IO (Khớp 100% Codebase)

| Tên Sự kiện | Hướng truyền | Kênh / Room | Payload chính | Ý nghĩa nghiệp vụ |
| :--- | :---: | :---: | :--- | :--- |
| `product:created` | Server ➔ Clients | `public_feed` (Toàn sàn) | `{ product: ProductItem }` | Tin mới được BQT duyệt; Web & Mobile cập nhật ngay lên đầu feed |
| `product:updated` | Server ➔ Clients | `public_feed` (Toàn sàn) | `{ product: ProductItem }` | Sản phẩm đổi giá, đổi trạng thái hoặc đã bán |
| `join_conversation` | Client ➔ Server | — | `{ conversationId }` | Tham gia phòng hội thoại P2P |
| `leave_conversation` | Client ➔ Server | — | `{ conversationId }` | Rời phòng hội thoại |
| `joined_conversation` | Server ➔ Client | Socket riêng | `{ conversationId }` | Xác nhận đã tham gia phòng chat |
| `send_message` | Client ➔ Server | `conversation_{id}` | `{ text, messageType, mediaUrl }` | Gửi tin nhắn văn bản hoặc ảnh |
| `send_offer_price` | Client ➔ Server | `conversation_{id}` | `{ conversationId, offerPrice }` | Gửi đề xuất mặc cả giá |
| `send_meetup_location` | Client ➔ Server | `conversation_{id}` | `{ conversationId, meetupLocation }`| Gửi gợi ý điểm hẹn an toàn |
| `receive_message` | Server ➔ Client | `conversation_{id}` | `{ message: MessageItem }` | Nhận tin nhắn mới tức thời trong phòng chat |
| `new_message_notification` | Server ➔ Client | `user_{recipientId}` | `{ conversationId, message, sender }`| Báo tin nhắn mới cho người nhận ngoài phòng chat |
| `typing` / `stop_typing` | Client ➔ Server | `conversation_{id}` | `{ conversationId }` | Báo trạng thái người dùng đang soạn tin |
| `user_typing` | Server ➔ Client | `conversation_{id}` | `{ userId, conversationId }` | Hiển thị chấm ba chấm người bên kia đang gõ |
| `user_stop_typing` | Server ➔ Client | `conversation_{id}` | `{ userId, conversationId }` | Ẩn trạng thái đang gõ |
| `message_read` | Client ➔ Server | `conversation_{id}` | `{ conversationId }` | Đánh dấu đã xem toàn bộ tin trong hội thoại |
| `messages_marked_read` | Server ➔ Client | `conversation_{id}` | `{ conversationId, readBy }` | Cập nhật dấu tích đã đọc cho đối phương |
| `check_presence` | Client ➔ Server | — | `{ userIds: string[] }` (Callback) | Truy vấn tức thì trạng thái online/offline qua Redis |
| `new_notification` | Server ➔ Client | `user_{userId}` | `{ notification: NotificationItem }` | Chuông thông báo đỏ in-app |
| `new_order_received` | Server ➔ Client | `user_{sellerId}` | `{ orderId, orderCode, product }` | Báo người bán có đơn hàng mới được đặt |
| `order_completed` | Server ➔ Client | `user_{buyerId}`, `user_{sellerId}` | `{ orderId, orderCode, status }` | Báo giao dịch hoàn tất sau khi quét Handshake |
| `order_confirmed` | Server ➔ Client | `user_{buyerId}`, `user_{sellerId}` | `{ orderId, orderCode }` | Báo người bán đã chấp thuận đơn hàng |
| `order_cancelled` | Server ➔ Client | `user_{targetId}` | `{ orderId, orderCode }` | Báo đơn hàng đã bị hủy và hoàn trả tiền |
| `order_disputed` | Server ➔ Client | `user_{buyerId}`, `user_{sellerId}` | `{ orderId, orderCode }` | Báo đơn hàng phát sinh khiếu nại tranh chấp |
| `kyc_status_updated` | Server ➔ Client | `user_{userId}` | `{ status: 'APPROVED'/'REJECTED', type }` | Thông báo kết quả BQT duyệt Thẻ SV / Onboarding |
| `profile:coins_updated` | Server ➔ Client | `user_{userId}` | `{ campusCoins, reward }` | Cập nhật số dư Xu tức thì trên Header |
| `withdrawal_updated` | Server ➔ Client | `user_{userId}` | `{ withdrawalId, status }` | Báo trạng thái duyệt lệnh rút tiền mặt |
| `review_revealed` | Server ➔ Client | `user_{reviewerId}`, `user_{revieweeId}` | `{ orderId, orderCode }` | Báo khi có đánh giá mới được gửi và công khai |
