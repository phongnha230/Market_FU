# 🗺️ TỔNG HỢP CÁC FLOWS NGHIỆP VỤ HỆ THỐNG MARKETFU

### Hệ thống Sàn Thương Mại Điện Tử & Trao Đổi Đồ Cũ Sinh Viên Đại Học FPT (Web, Mobile & Backend Realtime)

> **Tài liệu đặc tả toàn diện luồng nghiệp vụ (Business Flows)**: Mô tả chi tiết tương tác giữa **Web Portal (Next.js)**, **Mobile App (React Native Expo)**, **Backend Gateway (Node.js/Express, Prisma, MongoDB Atlas)**, **Realtime Gateway (Socket.IO)**, **Hệ thống AI (Gemini 1.5 Flash)** và **Hạ tầng Thanh toán / Safe-Point**.

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
9. [Flow 8: Đánh giá Hai chiều &amp; Cơ chế Blind Review (Review &amp; Reputation Flow)](#flow-8-đánh-giá-hai-chiều--cơ-chế-blind-review)
10. [Flow 9: Gamification, Ví FPT Coin &amp; Đổi Voucher (Coin, Rewards &amp; Vouchers)](#flow-9-gamification-ví-fpt-coin--đổi-voucher)
11. [Flow 10: Báo cáo Vi phạm &amp; Xử lý Kỷ luật (Report &amp; Enforcement Flow)](#flow-10-báo-cáo-vi-phạm--xử-lý-kỷ-luật)
12. [Bảng Ma Trận Tổng Hợp Sự Kiện Socket.IO &amp; API Endpoints](#12-bảng-ma-trận-tổng-hợp-sự-kiện-socketio--api-endpoints)

---

## 1. TỔNG QUAN KIẾN TRÚC & CÁC TÁC NHÂN (ACTORS)

### 1.1. Các tác nhân chính trong hệ thống

* **Khách vãng lai (Guest):** Người dùng chưa đăng nhập; có quyền xem bài đăng, tìm kiếm, xem trang chi tiết.
* **Sinh viên Người Mua (Buyer):** Tài khoản sinh viên FPT đã xác thực email (`@fpt.edu.vn`); có quyền chat, trả giá, đặt mua hàng, mở khiếu nại, đánh giá.
* **Sinh viên Người Bán (Seller):** Sinh viên đã hoàn tất xác thực KYC Thẻ sinh viên (được duyệt); có quyền đăng bán đồ dùng, nhận yêu cầu mua, chấp thuận trả giá, bàn giao hàng.
* **Quản trị viên (Admin / Moderator):** Ban Quản Trị phụ trách duyệt bài đăng mới, duyệt KYC thẻ SV, xử lý khiếu nại tranh chấp, khóa tài khoản vi phạm.
* **Trợ lý AI (Google Gemini 1.5 Flash):** Hỗ trợ scan hình ảnh đồ cũ, nhận diện danh mục, phát hiện từ cấm/hàng cấm học đường, tư vấn tự động.
* **Cổng Thanh toán (VietQR / PayOS):** Xử lý giao dịch thanh toán chuyển khoản Napas247, giữ tiền đảm bảo (Escrow).
* **Cổng Realtime Gateway (Socket.IO & Firebase FCM):** Đồng bộ dữ liệu tức thời giữa Web và Mobile, bắn thông báo đẩy Push Notification.

### 1.2. Sơ đồ tương tác tổng quan

```mermaid
graph TD
    ClientWeb["🌐 Web Client (Next.js 16)"]
    ClientMobile["📱 Mobile App (Expo SDK 52)"]
  
    BackendGateway["⚡ Backend API Gateway (Port 5001)"]
    SocketIO["📡 Realtime Socket.IO Gateway"]
  
    Database[("🗄️ MongoDB Atlas (Prisma ORM)")]
    RedisCache[("⚡ Redis Cache & Rate Limiter")]
    MeiliEngine["🔍 Meilisearch Engine"]
    GeminiAI["🤖 Google Gemini AI Flash Vision"]
    Payment["💳 VietQR / PayOS Gateway"]
  
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

Hệ thống chỉ chấp nhận định danh sinh viên FPT thông qua email trường `@fpt.edu.vn` hoặc `@fe.edu.vn`.

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên FPT
    participant Client as Web / Mobile Client
    participant AuthAPI as Backend Auth Controller
    participant Redis as Redis Cache
    participant Mail as Dịch vụ Email (SMTP)
    participant DB as MongoDB (Prisma)

    SV->>Client: Nhập Email (@fpt.edu.vn), Mật khẩu, Họ tên, Campus
    Client->>AuthAPI: POST /api/auth/register (payload)
    AuthAPI->>AuthAPI: Validate định dạng Email FPT & độ mạnh mật khẩu
    AuthAPI->>Redis: Lưu thông tin tạm & Tạo OTP 6 chữ số (TTL 5 phút)
    AuthAPI->>Mail: Gửi email chứa mã OTP xác thực
    AuthAPI-->>Client: Trả về trạng thái "OTP_SENT"
  
    SV->>Client: Nhập mã OTP nhận từ email
    Client->>AuthAPI: POST /api/auth/verify-otp { email, otp }
    AuthAPI->>Redis: Kiểm tra khớp mã OTP & còn hạn không
    alt OTP sai hoặc hết hạn
        AuthAPI-->>Client: Báo lỗi "Mã OTP không hợp lệ hoặc đã hết hạn" (400)
    else OTP chính xác
        AuthAPI->>DB: Tạo bản ghi User (role: 'BUYER', isActive: true)
        AuthAPI->>DB: Tạo Profile (fullName, campus, campusCoins: 50, trustScore: 100)
        AuthAPI->>AuthAPI: Sinh cặp Dual JWT (Access Token 15m, Refresh Token 7d)
        AuthAPI-->>Client: Trả về User Profile + Tokens
        Client->>Client: Lưu Token vào Storage an toàn (AsyncStorage / LocalStorage)
    end
```

### 1.2. Luồng Nâng cấp Tài khoản Người Bán (KYC Thẻ Sinh Viên)

Sinh viên thông thường chỉ có quyền mua (`BUYER`). Để đăng bán, sinh viên cần xác minh Thẻ Sinh viên để BQT duyệt thành `SELLER`.

```mermaid
sequenceDiagram
    autonumber
    actor User as Sinh viên (BUYER)
    participant Client as Web / Mobile Client
    participant KYCAPI as Backend Profile/KYC API
    participant AI as Gemini OCR / Face Check
    participant DB as MongoDB Atlas
    actor Admin as Quản trị viên (BQT)

    User->>Client: Chọn "Nâng cấp Người Bán" -> Chụp 2 mặt Thẻ Sinh Viên + MSSV
    Client->>KYCAPI: POST /api/profile/kyc (Multipart Form-Data: ảnh thẻ, MSSV, khoa viện)
    KYCAPI->>AI: Phân tích ảnh thẻ, bóc tách chuỗi MSSV & họ tên đối chiếu
    KYCAPI->>DB: Lưu yêu cầu KYC (kycStatus: 'PENDING', studentId: 'SE17xxxx')
    KYCAPI-->>Client: Thông báo "Hồ sơ đang chờ Ban Quản Trị xét duyệt"
  
    Admin->>Client: Truy cập Cổng Quản trị (/admin/kyc)
    Client->>KYCAPI: GET /api/admin/kyc?status=PENDING
    KYCAPI-->>Client: Trả về danh sách hồ sơ kèm ảnh thẻ và điểm AI đối chiếu
  
    alt Admin bấm "Phê duyệt"
        Admin->>KYCAPI: PATCH /api/admin/kyc/:id/approve
        KYCAPI->>DB: Cập nhật User (role: 'SELLER', kycStatus: 'APPROVED')
        KYCAPI->>DB: Cộng thưởng +50 Xu kích hoạt gian hàng
        KYCAPI-->>Client: Bắn thông báo Realtime tới sinh viên: "Tài khoản Người bán đã được kích hoạt!"
    else Admin bấm "Từ chối"
        Admin->>KYCAPI: PATCH /api/admin/kyc/:id/reject { reason: 'Ảnh thẻ mờ, không rõ MSSV' }
        KYCAPI->>DB: Cập nhật kycStatus: 'REJECTED' kèm lý do
        KYCAPI-->>Client: Gửi thông báo lý do từ chối để sinh viên chụp lại
    end
```

---

## FLOW 2: ĐĂNG TIN, AI SCAN & QUY TRÌNH PHÊ DUYỆT BQT

### 2.1. Đăng tin mới & Kiểm duyệt an toàn trường học

Mọi tin đăng trên sàn đều phải tuân thủ nghiêm ngặt quy chế an toàn: cấm vũ khí, chất cấm, thiết bị gian lận thi cử, cảnh báo nguy cơ cháy nổ PCCC (bếp gas mini, ấm siêu tốc cũ trong KTX).

```mermaid
stateDiagram-v2
    [*] --> NhapThongTin: Người bán nhập bài đăng hoặc dùng AI Scan ảnh
    NhapThongTin --> KiemTraTuCam: Hệ thống kiểm duyệt nội dung (Profanity Filter)
  
    KiemTraTuCam --> TuChoiNgay: Chứa từ cấm / Vũ khí / Hàng cấm học đường (Reject 400)
    TuChoiNgay --> [*]
  
    KiemTraTuCam --> LuuBanGhi: Nội dung văn bản hợp lệ
  
    state PhanQuyen {
        LuuBanGhi --> CheckRole: Kiểm tra vai trò người đăng
        CheckRole --> AvailableTuDong: Người đăng là ADMIN
        CheckRole --> ChoAdminDuyet: Người bán là SELLER thông thường
    }
  
    ChoAdminDuyet --> TrangThaiPending: Trạng thái = 'PENDING_APPROVAL'
    TrangThaiPending --> AdminXemXet: Bài xuất hiện tại /admin/posts
  
    AdminXemXet --> AdminTuChoi: Admin bấm "Từ chối" kèm lý do
    AdminTuChoi --> ThongBaoSeller: Gửi notification cho Người bán
    ThongBaoSeller --> [*]
  
    AdminXemXet --> AdminDuyet: Admin bấm "Phê duyệt"
    AvailableTuDong --> ActiveOnMarket
    AdminDuyet --> ActiveOnMarket: Trạng thái = 'AVAILABLE'
  
    ActiveOnMarket --> DongBoMeili: Đồng bộ lên Meilisearch Engine
    ActiveOnMarket --> PhatSocket: Phát Realtime 'product:created' tới Web & Mobile
    PhatSocket --> [*]
```

### 2.2. Trình tự thực thi kỹ thuật khi Duyệt bài

1. **Khởi tạo bài đăng:** `POST /api/products` (Hỗ trợ tối đa 6 ảnh và 1 video review).
2. **AI Gemini Vision:** Tự động điền nhanh danh mục và nhận diện giá hợp lý:
   ```json
   {
     "suggestedTitle": "Màn hình Dell UltraSharp 24 inch U2419H",
     "category": "ELECTRONICS",
     "suggestedPrice": 2400000,
     "condition": "LIKE_NEW_99",
     "safetyTags": ["SAFE_TESTABLE"]
   }
   ```
3. **Phê duyệt BQT:** Admin duyệt tại `/admin/posts` qua endpoint `PATCH /api/products/admin/:id/approve`.
4. **Phát sóng Realtime:** Backend phát sự kiện `broadcastEvent('product:created', product)` tới kênh công khai `public_feed`.

---

## FLOW 3: ĐỒNG BỘ SẢN PHẨM REALTIME 2 CHIỀU WEB ⮂ MOBILE

### 3.1. Mô hình Đồng bộ Sự kiện Realtime (Two-Way Sync Architecture)

Mục tiêu: Đảm bảo khi có sản phẩm được đăng hoặc duyệt ở Web thì trên Mobile xuất hiện ngay lập tức, và ngược lại.

```mermaid
sequenceDiagram
    autonumber
    participant WebUser as Trình duyệt Web (Desktop/Laptop)
    participant MobileUser as Thiết bị Mobile (Android / iOS)
    participant Server as Backend Node.js Socket.IO Gateway
    participant DB as MongoDB Atlas

    Note over WebUser, MobileUser: Cả 2 nền tảng đều mở sẵn và duy trì kết nối WebSocket tới Server

    rect rgb(240, 248, 255)
    Note over WebUser, Server: [Chiều 1] Web đăng bài -> Mobile hiển thị tức thì
    WebUser->>Server: Gửi bài đăng mới qua REST API (POST /api/products)
    Server->>DB: Lưu sản phẩm (Nếu được duyệt ngay hoặc Admin phê duyệt)
    Server->>Server: Kích hoạt broadcastEvent('product:created', product)
    Server-->>WebUser: io.emit('product:created') (Cập nhật LatestPostsSection)
    Server-->>MobileUser: io.emit('product:created') (useHomeFeed nhận dữ liệu)
    MobileUser->>MobileUser: adaptBackendProductToMobile() -> addProductFromRemote()
    Note over MobileUser: ⚡ Màn hình Home Feed & Explore trên Mobile hiển thị món đồ ngay lập tức
    end

    rect rgb(255, 250, 240)
    Note over MobileUser, Server: [Chiều 2] Mobile đăng bài -> Web hiển thị tức thì
    MobileUser->>Server: Mobile đăng đồ (POST /api/products)
    Server->>DB: Lưu sản phẩm
    Server->>Server: Kích hoạt broadcastEvent('product:created', product)
    Server-->>MobileUser: Trả về kết quả thành công, cập nhật store local
    Server-->>WebUser: io.emit('product:created') truyền tới Web
    WebUser->>WebUser: adaptBackendProduct() -> Chèn lên đầu danh sách Live Posts
    Note over WebUser: ⚡ Trang chủ Web & Trang /posts tự chèn bài lên đầu không cần bấm F5
    end
```

### 3.2. Bảng xử lý State giữa các nền tảng

| Sự kiện Socket    | Xử lý trên Web (React / Zustand)                                                      | Xử lý trên Mobile (React Native / Zustand)                             |
| :------------------ | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `product:created` | Chèn bài mới vào`setLiveProducts([new, ...prev])` và cập nhật `productStore`. | Gọi`addProductFromRemote(adapted)` chèn vào đầu `storeProducts`. |
| `product:updated` | Tìm`id` và cập nhật partial fields (giá, trạng thái, đã bán).                | Gọi`updateProduct(id, partial)` đồng bộ hiển thị.                 |
| `product:deleted` | Loại bỏ item khỏi danh sách hiển thị bằng filter`id !== deletedId`.             | Gọi`deleteProduct(id)` xóa khỏi local list.                          |

## FLOW 4: TÌM KIẾM THÔNG MINH & BỘ LỌC ĐA CAMPUS (SEARCH & FILTER PIPELINE)

Hệ thống tìm kiếm trên MarketFU được thiết kế theo kiến trúc **đa tầng (Multi-tier Search Pipeline)**: kết hợp công nghệ tìm kiếm siêu tốc Meilisearch (chịu lỗi chính tả, không dấu tiếng Việt), bộ lọc đa cơ sở (Multi-Campus) và cơ chế tự động Fallback về cơ sở dữ liệu MongoDB Atlas.

### 4.1. Sơ đồ Tuần tự Pipeline Tìm kiếm (Search Sequence Flow)

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên tìm đồ
    participant Client as Web / Mobile Client
    participant Debounce as Debounce Controller (350ms)
    participant SearchAPI as Backend Product Service
    participant Analytics as Trending Analytics Service
    participant Meili as Meilisearch Engine
    participant DB as MongoDB Atlas (Prisma Fallback)

    SV->>Client: Nhập từ khóa tìm kiếm (Ví dụ: "laptop k18 #ktx")
    Client->>Debounce: Kích hoạt bộ đệm Debounce 350ms
    Note over Debounce: Ngăn chặn gửi request dồn dập sau mỗi phím gõ
    
    Debounce->>Client: Trích xuất chuỗi: Phân biệt Từ khóa thường & Hashtag
    
    alt Người dùng tìm kiếm nhanh (Autocomplete Suggestion)
        Client->>SearchAPI: GET /api/products/suggest?q=laptop&campus=HOL&limit=6
        SearchAPI->>Meili: Truy vấn nhanh top 6 gợi ý phù hợp nhất
        Meili-->>SearchAPI: Trả về 6 sản phẩm khớp nhất
        SearchAPI-->>Client: Hiển thị thanh thả xuống gợi ý sản phẩm tức thì
    else Người dùng thực hiện tìm kiếm toàn diện (Full Search)
        Client->>SearchAPI: GET /api/products?search=laptop&campus=HOL&category=ELECTRONICS
        SearchAPI->>Analytics: Ghi nhận từ khóa tìm kiếm vào bảng Top Trending
        
        SearchAPI->>Meili: Gửi truy vấn tìm kiếm thông minh (Typo Tolerance + Khử dấu TV)
        alt Meilisearch Engine hoạt động bình thường
            Meili-->>SearchAPI: Trả về danh sách productIds theo điểm số xếp hạng (Ranking Score)
            SearchAPI->>DB: Truy vấn thông tin chi tiết các productIds (status: 'AVAILABLE')
            SearchAPI->>SearchAPI: Sắp xếp kết quả theo đúng thứ tự Ranking của Meilisearch
        else Meilisearch tạm thời gián đoạn / Offline
            SearchAPI->>DB: Fallback trực tiếp MongoDB (Insensitive regex search)
            DB-->>SearchAPI: Trả về kết quả theo tiêu chuẩn khớp từ khóa & hashtag
        end
        
        SearchAPI->>SearchAPI: sanitizeProductSeller() bảo vệ thông tin cá nhân PII
        SearchAPI-->>Client: Trả về danh sách sản phẩm khớp + Phân trang (< 50ms)
        Client->>Client: Hiển thị danh sách sản phẩm lên giao diện tìm kiếm
    end
```

### 4.2. Bộ lọc 5 Cơ sở Campus & Trật tự Ưu tiên
Hệ thống sàn được phân chia theo 5 cơ sở đại học FPT trên toàn quốc:

| Mã Campus | Tên Cơ sở | Quy tắc Lọc dữ liệu |
| :---: | :--- | :--- |
| `HOL` | **Đại học FPT Hà Nội (Hòa Lạc)** | Lọc chính xác các bài đăng tại khuôn viên Hòa Lạc & KTX Dom A-H. |
| `HCM` | **Đại học FPT TP. Hồ Chí Minh** | Lọc các bài đăng tại cơ sở Quận 9, Khu Công nghệ cao & KTX. |
| `DAD` | **Đại học FPT Đà Nẵng** | Lọc các bài đăng tại Campus Ngũ Hành Sơn. |
| `QN` | **Đại học FPT Quy Nhơn** | Lọc các bài đăng tại Campus Trí tuệ Nhân tạo Quy Nhơn. |
| `CT` | **Đại học FPT Cần Thơ** | Lọc các bài đăng tại Campus Cần Thơ. |
| `ALL` / `TẤT CẢ` | **Toàn hệ thống (Toàn quốc)** | Không giới hạn cơ sở, ưu tiên bài có hỗ trợ Ship liên tỉnh hoặc hỗ trợ Ship COD. |

### 4.3. Các Tính năng Nổi bật của Phân hệ Tìm kiếm
1. **Chịu lỗi chính tả (Typo Tolerance):** Sinh viên gõ nhầm `"man hinh"` thành `"nam hinh"`, hoặc `"ipone"` thay vì `"iphone"`, hệ thống vẫn nhận diện chính xác sản phẩm cần tìm.
2. **Tìm kiếm Tiếng Việt không dấu:** Hệ thống tự động chuẩn hóa chữ có dấu và không dấu (VD: `"sach giao trinh"` tương đương `"sách giáo trình"`).
3. **Hashtags Học đường chuyên biệt:** Hỗ trợ tìm kiếm theo ngữ cảnh sinh hoạt sinh viên: `#ktx`, `#passdo`, `#vovinam`, `#k18`, `#cuoiky`.
4. **Phân tích Xu hướng Tìm kiếm (Hot Trending Keywords):** Tự động tổng hợp các từ khóa được tìm nhiều nhất trong 24 giờ qua để gợi ý trên thanh tìm kiếm Trang chủ.

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
    Socket-->>ClientB: Xác nhận kết nối phòng chat
  
    Buyer->>ClientB: Nhập đề xuất trả giá: "Pass lại em 200k được không anh?"
    ClientB->>Socket: emit('send_message', { conversationId, text, offerPrice: 200000 })
    Socket->>Socket: Lưu tin nhắn vào MongoDB & đánh dấu type: 'OFFER'
    Socket-->>ClientS: emit('receive_message', messageData)
    Socket-->>ClientS: Bắn thông báo Push FCM: "Có đề xuất giá mới 200.000đ"
  
    Seller->>ClientS: Mở phòng chat, xem đề xuất giá 200.000đ
    alt Người bán đồng ý giá
        Seller->>ClientS: Bấm "Chấp nhận mức giá"
        ClientS->>Socket: emit('accept_offer', { conversationId, offerPrice: 200000 })
        Socket-->>ClientB: emit('offer_accepted', { newPrice: 200000 })
        Note over Buyer, Seller: Giá sản phẩm trong đơn hàng được chốt ở mức 200.000đ
    else Người bán từ chối hoặc trả giá lại (Counter-Offer)
        Seller->>ClientS: Nhập giá đối ứng: 220.000đ
        ClientS->>Socket: emit('counter_offer', { conversationId, offerPrice: 220000 })
        Socket-->>ClientB: emit('receive_message', { text: "Giá đối ứng: 220.000đ" })
    end

    Note over Buyer, Seller: Thống nhất điểm hẹn Safe-Point trong trường
    Seller->>ClientS: Chọn điểm Safe-Point: "Trạm Safe-Point Sảnh Tòa Alpha"
    ClientS->>Socket: emit('send_safepoint', { location: 'Sảnh Alpha - Trạm Safe-Point số 1' })
    Socket-->>ClientB: Hiển thị bản đồ vị trí & ghim điểm hẹn
```

---

## FLOW 6: GIAO DỊCH AN TOÀN, BẢO CHỨNG ESCROW & BÀN GIAO HÀNG HÓA

Hệ thống hỗ trợ 2 hình thức giao dịch độc quyền cho sinh viên FPT:

1. **Giao dịch Gặp mặt trực tiếp (Meetup Handshake) tại Safe-Point:** Dùng mã OTP 4 số ngẫu nhiên.
2. **Giao dịch Giao hàng KTX / Ship COD:** Giữ tiền đảm bảo Escrow, bao test 24h - 48h.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Người Mua
    participant Gateway as Hệ thống Backend & Escrow
    actor Seller as Người Bán
    participant Bank as Cổng VietQR / PayOS

    Buyer->>Gateway: Tạo đơn hàng mua sản phẩm (POST /api/orders)
    Gateway->>Gateway: Trạng thái đơn: 'PENDING', sinh mã đơn: 'FU-ORD-xxxx'
  
    alt Thanh toán Chuyển khoản VietQR (Bảo chứng Escrow)
        Buyer->>Bank: Quét mã VietQR chuyển tiền vào tài khoản ký quỹ Escrow
        Bank->>Gateway: Webhook thông báo thanh toán thành công
        Gateway->>Gateway: Đổi trạng thái: 'ESCROW_HELD' (Tiền được sàn giữ an toàn)
        Gateway-->>Seller: Thông báo: "Người mua đã thanh toán, hãy chuẩn bị hàng!"
    else Thanh toán Tiền mặt khi gặp mặt (CASH)
        Gateway->>Gateway: Trạng thái: 'AWAITING_HANDSHAKE'
    end

    Note over Buyer, Seller: Hai bên gặp nhau tại Trạm Safe-Point (Sảnh Alpha/Beta)
    Seller->>Buyer: Đưa đồ dùng cho Người mua kiểm tra (Test máy, xem giáo trình)
  
    alt Người mua ưng ý và đồng ý nhận hàng
        Gateway->>Buyer: Sinh mã OTP Handshake 4 chữ số bí mật (VD: 8392)
        Buyer->>Seller: Đọc mã OTP 8392 cho Người bán
        Seller->>Gateway: Nhập mã OTP 8392 lên ứng dụng (POST /api/orders/:id/confirm-handshake)
        Gateway->>Gateway: Đối soát mã OTP khớp chính xác
      
        alt Đơn thanh toán VietQR Escrow
            Gateway->>Gateway: Bắt đầu kích hoạt thời hạn Bao test (Warranty Period: 24h)
            Note over Buyer: Người mua có 24h bao test máy tại phòng
            alt Hết 24h không có khiếu nại (Hoặc Buyer bấm Xác nhận sớm)
                Gateway->>Seller: Giải ngân tiền từ Escrow về Ví FPT Coin của Seller
                Gateway->>Gateway: Đổi trạng thái: 'COMPLETED'
            end
        else Đơn tiền mặt
            Buyer->>Seller: Giao tiền mặt trực tiếp
            Gateway->>Gateway: Đổi trạng thái: 'COMPLETED' ngay lập tức
        end
      
        Gateway-->>Buyer: Tặng +20 Xu FPT Coin điểm danh giao dịch thành công
        Gateway-->>Seller: Tặng +20 Xu FPT Coin
    else Người mua không ưng ý (Hàng không đúng mô tả)
        Buyer->>Gateway: Bấm "Hủy giao dịch tại Safe-Point"
        Gateway->>Gateway: Đổi trạng thái: 'CANCELLED'
        Gateway->>Bank: Tự động hoàn trả 100% tiền Escrow về tài khoản Buyer
        Gateway-->>Seller: Sản phẩm tự động mở lại trạng thái 'AVAILABLE' trên sàn
    end
```

---

## FLOW 7: KHIẾU NẠI, TRANH CHẤP & TRỌNG TÀI BQT

Khi mua hàng có bao test (Escrow 24h - 48h), nếu phát hiện sản phẩm bị lỗi ẩn hoặc gian dối, người mua có quyền mở tranh chấp.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Người Mua
    participant System as Hệ thống Backend & Dispute Service
    actor Admin as Trọng tài Ban Quản Trị (BQT)
    actor Seller as Người Bán

    Buyer->>System: Mở khiếu nại trong thời hạn 24h bao test (POST /api/disputes)
    Note over Buyer: Bắt buộc đính kèm: Lý do, Ảnh lỗi & Video clip bằng chứng
  
    System->>System: ĐÓNG BĂNG TIỀN ESCROW (Chặn tự động giải ngân cho Seller)
    System->>System: Đổi trạng thái đơn hàng: 'DISPUTED'
    System-->>Seller: Gửi thông báo: "Đơn hàng đang bị khiếu nại, vui lòng cung cấp phản hồi"
  
    Seller->>System: Gửi phản hồi đối chất kèm bằng chứng đóng gói / test máy
  
    Admin->>System: Truy cập Cổng Quản Trị Tranh Chấp (/admin/disputes)
    System-->>Admin: Hiển thị đầy đủ video hai bên, nhật ký chat và hợp đồng giao dịch
  
    alt Admin quyết định: NGƯỜI MUA ĐÚNG (Hàng lỗi, gian lận)
        Admin->>System: Phân xử "HOÀN TIỀN CHO BUYER"
        System->>Buyer: Hoàn 100% tiền Escrow về tài khoản ngân hàng Buyer
        System->>Seller: Trừ -20 điểm Uy tín (Reputation Score), cảnh cáo tài khoản
        System-->>Seller: Yêu cầu nhận lại hàng lỗi tại Safe-Point
    else Admin quyết định: NGƯỜI BÁN ĐÚNG (Buyer phá hỏng hoặc vu khống)
        Admin->>System: Phân xử "GIẢI NGÂN CHO SELLER"
        System->>Seller: Chuyển toàn bộ tiền từ Escrow vào ví của Seller
        System->>Buyer: Trừ điểm uy tín Buyer vì khiếu nại sai sự thật
    end
```

---

## FLOW 8: ĐÁNH GIÁ HAI CHIỀU & CƠ CHẾ BLIND REVIEW

Để ngăn chặn tình trạng "trả thù đánh giá" (Retaliatory Reviews), MarketFU triển khai cơ chế **Blind Review (Đánh giá ẩn danh hai chiều)**:

```mermaid
graph TD
    OrderDone["Đơn hàng hoàn tất (COMPLETED)"] --> PromptReview["Hệ thống nhắc nhở Buyer & Seller đánh giá 1-5 sao"]
  
    PromptReview --> BuyerSubmits["Buyer gửi Review (Rating + Nhận xét + Video test)"]
    PromptReview --> SellerSubmits["Seller gửi Review (Thái độ giao dịch của Buyer)"]
  
    BuyerSubmits --> ReviewPending["Lưu vào Database ở trạng thái: isPublic = false (Ẩn)"]
    SellerSubmits --> ReviewPending
  
    ReviewPending --> CheckBoth{"Cả hai bên đã hoàn tất đánh giá HOẶC đã hết hạn 7 ngày?"}
  
    CheckBoth -->|Chưa đủ| GiuBiMat["Giữ bí mật nội dung review, không bên nào xem được của bên kia"]
    CheckBoth -->|Đã đủ điều kiện| MoKhoaPublic["MỞ KHÓA CÔNG KHAI (Blind Reveal: isPublic = true)"]
  
    MoKhoaPublic --> UpdateReputation["Tính toán lại Điểm Uy Tín (Reputation Score) hồ sơ cá nhân"]
    MoKhoaPublic --> BonusCoin{"Review có đính kèm video test sản phẩm?"}
  
    BonusCoin -->|Có video test| CongXuBonus["Thưởng thêm +200 FPT Coin vào Ví người dùng"]
    BonusCoin -->|Không có video| CongXuStandard["Thưởng chuẩn +50 FPT Coin"]
```

---

## FLOW 9: GAMIFICATION, VÍ FPT COIN & ĐỔI VOUCHER

```mermaid
graph LR
    subgraph KiemXu ["🪙 CÁC KÊNH KIẾM FPT COIN"]
        A1["Điểm danh mỗi ngày: +10 Xu"]
        A2["Hoàn thành đơn hàng: +20 Xu"]
        A3["Review kèm video test: +200 Xu"]
        A4["Hoàn tất KYC Thẻ SV: +50 Xu"]
    end

    subgraph ViXu ["💰 VÍ CAMPUS COIN (Profile)"]
        B1["Số dư FPT Coin Khả dụng"]
    end

    subgraph TieuXu ["🎁 SỬ DỤNG FPT COIN"]
        C1["Đổi Voucher Căn tin FPT (5k, 10k, 20k)"]
        C2["Giảm giá trực tiếp khi thanh toán đơn hàng"]
        C3["Đẩy tin đăng lên đầu trang (Bump Post)"]
        C4["Ghim bài VIP lên mục Nổi bật 7 ngày (Pin Post)"]
        C5["Rút tiền mặt về Ngân hàng (1000 Xu = 10.000 VNĐ)"]
    end

    KiemXu --> B1
    B1 --> TieuXu
```

---

## FLOW 10: BÁO CÁO VI PHẠM & XỬ LÝ KỶ LUẬT

```mermaid
sequenceDiagram
    autonumber
    actor SV as Sinh viên phát hiện vi phạm
    participant Client as Web / Mobile
    participant Backend as Backend Reports Service
    actor Admin as Ban Quản Trị

    SV->>Client: Bấm "Báo cáo tin đăng / Người dùng"
    Client->>Backend: POST /api/reports { targetType, targetId, reason, evidenceUrls }
    Backend->>Backend: Lưu bản ghi Report (status: 'PENDING')
    Backend-->>SV: Báo "Cảm ơn bạn đã gửi báo cáo, BQT sẽ xử lý trong 2h"
  
    Admin->>Client: Truy cập /admin/reports
    Client->>Backend: GET /api/reports?status=PENDING
    Backend-->>Client: Hiển thị danh sách tố cáo kèm bài viết vi phạm
  
    Admin->>Backend: PATCH /api/admin/reports/:id/resolve { action: 'BAN_USER' | 'DELETE_POST' | 'WARN' }
  
    alt Xử lý gỡ bài đăng
        Backend->>Backend: Đổi status sản phẩm: 'HIDDEN' hoặc 'REJECTED'
        Backend->>Backend: Xóa bài khỏi Meilisearch Engine
        Backend->>Backend: Phát Socket 'product:deleted' gỡ khỏi Web & Mobile ngay lập tức
    else Xử lý cấm tài khoản
        Backend->>Backend: Đổi user.isActive = false, vô hiệu hóa Token JWT
        Backend->>Backend: Đưa MSSV vào danh sách đen (Blacklist) trường học
    end
```

---

## 12. BẢNG MA TRẬN TỔNG HỢP SỰ KIỆN SOCKET.IO & API ENDPOINTS

### 12.1. Danh mục API Endpoints Cốt Lõi

| Phân hệ            | Phương thức | Endpoint                              |      Quyền hạn      | Mô tả chức năng                                     |
| :------------------- | :------------: | :------------------------------------ | :--------------------: | :------------------------------------------------------ |
| **Auth**       |    `POST`    | `/api/auth/register`                |         Public         | Đăng ký tài khoản bằng email FPT                  |
|                      |    `POST`    | `/api/auth/verify-otp`              |         Public         | Xác thực mã OTP 6 số hoàn tất đăng ký          |
|                      |    `POST`    | `/api/auth/login`                   |         Public         | Đăng nhập nhận cặp Dual JWT Tokens                 |
|                      |    `POST`    | `/api/auth/google`                  |         Public         | Đăng nhập một chạm bằng Google SSO                |
| **Products**   |    `GET`    | `/api/products`                     |         Public         | Lấy danh sách sản phẩm (Lọc Campus, Danh mục)     |
|                      |    `POST`    | `/api/products`                     | `SELLER` / `ADMIN` | Đăng tin bán sản phẩm mới                         |
|                      |   `PATCH`   | `/api/products/:id`                 |       Chủ bài       | Chỉnh sửa nội dung bài đăng                       |
|                      |   `DELETE`   | `/api/products/:id`                 |  Chủ bài /`ADMIN`  | Xóa bài đăng khỏi sàn                             |
| **Moderation** |    `GET`    | `/api/products/admin/moderation`    |       `ADMIN`       | Lấy danh sách tin kiểm duyệt (`PENDING_APPROVAL`) |
|                      |   `PATCH`   | `/api/products/admin/:id/approve`   |       `ADMIN`       | Phê duyệt tin đăng & phát sóng Realtime           |
|                      |   `PATCH`   | `/api/products/admin/:id/reject`    |       `ADMIN`       | Từ chối tin đăng kèm lý do cụ thể               |
| **Chats**      |    `GET`    | `/api/chats/conversations`          |     Authenticated     | Lấy danh sách các cuộc trò chuyện                 |
|                      |    `POST`    | `/api/chats/messages`               |     Authenticated     | Gửi tin nhắn văn bản / ảnh / trả giá             |
| **Orders**     |    `POST`    | `/api/orders`                       |       `BUYER`       | Khởi tạo đơn hàng Meetup hoặc Ship COD            |
|                      |   `PATCH`   | `/api/orders/:id/confirm-handshake` |       `SELLER`       | Nhập mã OTP 4 số bàn giao đồ tại Safe-Point      |
|                      |    `POST`    | `/api/orders/:id/dispute`           |       `BUYER`       | Mở khiếu nại tranh chấp trong thời hạn bao test   |
| **Vouchers**   |    `POST`    | `/api/vouchers/daily-checkin`       |     Authenticated     | Điểm danh hằng ngày nhận FPT Coin                  |
|                      |    `POST`    | `/api/vouchers/redeem`              |     Authenticated     | Đổi FPT Coin lấy Voucher căn tin                    |

### 12.2. Danh mục Sự kiện Realtime Socket.IO

| Tên Sự kiện               |  Hướng truyền  |         Kênh / Room         | Payload chính                     | Ý nghĩa nghiệp vụ                                                             |
| :--------------------------- | :---------------: | :--------------------------: | :--------------------------------- | :-------------------------------------------------------------------------------- |
| `product:created`          | Server ➔ Clients | `public_feed` (Toàn sàn) | `{ product: ProductItem }`       | Sản phẩm mới được duyệt; Web & Mobile lập tức hiện tin mới lên đầu. |
| `product:updated`          | Server ➔ Clients | `public_feed` (Toàn sàn) | `{ product: ProductItem }`       | Sản phẩm đổi giá, đổi trạng thái hoặc đã bán.                        |
| `product:deleted`          | Server ➔ Clients | `public_feed` (Toàn sàn) | `{ productId: string }`          | Bài đăng bị xóa/gỡ; client tự động xóa khỏi danh sách.                |
| `join_conversation`        | Client ➔ Server |    `conversation_{id}`    | `{ conversationId: string }`     | Client tham gia phòng chat P2P riêng.                                           |
| `send_message`             | Client ➔ Server |    `conversation_{id}`    | `{ text, offerPrice, mediaUrl }` | Gửi tin nhắn hoặc đề xuất trả giá mới.                                   |
| `receive_message`          | Server ➔ Client |    `conversation_{id}`    | `{ message: MessageItem }`       | Người bên kia nhận tin nhắn tức thời kèm âm thanh.                       |
| `typing` / `stop_typing` | Client ➔ Server |    `conversation_{id}`    | `{ userId, conversationId }`     | Hiển thị trạng thái đang soạn tin nhắn.                                    |
| `order:status_updated`     | Server ➔ Client |      `user_{userId}`      | `{ orderId, status }`            | Cập nhật trạng thái đơn (Đã giữ tiền Escrow, Đã giao hàng).          |
| `notification:new`         | Server ➔ Client |      `user_{userId}`      | `{ title, body, targetUrl }`     | Bắn chuông thông báo In-app đỏ trên góc màn hình.                       |

---

> 📌 **Tài liệu được xây dựng chuẩn mực theo cấu trúc mã nguồn thực tế của dự án MarketFU (Web, Mobile App & Backend Gateway).**
> Mọi thay đổi về kiến trúc nghiệp vụ cần được cập nhật đồng bộ vào tài liệu này.
