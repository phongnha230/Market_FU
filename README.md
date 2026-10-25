# 🎓 CAMPUS MARKETPLACE - HỆ THỐNG TRAO ĐỔI & THƯƠNG MẠI ĐIỆN TỬ SINH VIÊN

> **Tài liệu đặc tả kiến trúc kỹ thuật, quy chuẩn hệ thống & hướng dẫn vận hành toàn diện**

---

## 📑 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống tổng thể](#2-kiến-trúc-hệ-thống-tổng-thể)
3. [Ngăn xếp công nghệ (Tech Stack)](#3-ngăn-xếp-công-nghệ-tech-stack)
4. [Cấu trúc dự án &amp; Tổ chức mã nguồn](#4-cấu-trúc-dự-án--tổ-chức-mã-nguồn)
5. [Cơ chế Xác thực Thẻ Sinh viên &amp; Phân tầng Vai trò (RBAC &amp; KYC)](#5-cơ-chế-xác-thực-thẻ-sinh-viên--phân-tầng-vai-trò-rbac--kyc)
6. [Đặc tả Danh mục Sản phẩm Cốt lõi](#6-đặc-tả-danh-mục-sản-phẩm-cốt-lõi)
7. [Quy trình Đăng Bán Đồ (AI Quick Post &amp; Form Đăng Chuẩn)](#7-quy-trình-đăng-bán-đồ-ai-quick-post--form-đăng-chuẩn)
8. [Phân hệ Tìm kiếm Thông minh &amp; Lọc Đa Chiều (Meilisearch Engine &amp; Smart Search)](#8-phân-hệ-tìm-kiếm-thông-minh--lọc-đa-chiều-meilisearch-engine--smart-search)
9. [Phân hệ Tin nhắn Thời gian thực &amp; Phím tắt Mua Bán (P2P Chat)](#9-phân-hệ-tin-nhắn-thời-gian-thực--phím-tắt-mua-bán-p2p-chat)
10. [Cơ chế Đánh Giá 2 Chiều &amp; Hệ thống Phần Thưởng (Campus Coin &amp; Gamification)](#10-cơ-chế-đánh-giá-2-chiều--hệ-thống-phần-thưởng-campus-coin--gamification)
11. [Phân hệ Trợ lý Thông minh AI (Campus AI Assistant)](#11-phân-hệ-trợ-lý-thông-minh-ai-campus-ai-assistant)
12. [Hệ thống Trạm Safe-Handoff &amp; Điểm Gặp An Toàn](#12-hệ-thống-trạm-safe-handoff--điểm-gặp-an-toàn)
13. [Phương Thức Mua Hàng &amp; Thanh Toán Escrow (PayOS / VietQR / COD)](#13-phương-thức-mua-hàng--thanh-toán-escrow-payos--vietqr--cod)
14. [Quy trình Pass Đồ, Bao Test 24h-48h &amp; Đổi Trả / Khiếu Nại (Dispute)](#14-quy-trình-pass-đồ-bao-test-24h-48h--đổi-trả--khiếu-nại-dispute)
15. [Hệ thống Thông báo Đa Kênh Tích Hợp (Multi-Channel Notification Engine)](#15-hệ-thống-thông-báo-đa-kênh-tích-hợp-multi-channel-notification-engine)
16. [Hệ thống Tác vụ Tự động Ngầm (Automated Cron Services)](#16-hệ-thống-tác-vụ-tự-động-ngầm-automated-cron-services)
17. [Quy chuẩn kỹ thuật &amp; Tối ưu hóa hiệu năng](#17-quy-chuẩn-kỹ-thuật--tối-ưu-hóa-hiệu-năng)
18. [Lộ trình triển khai (Roadmap)](#18-lộ-trình-triển-khai-roadmap)
19. [Hướng dẫn cài đặt &amp; Khởi chạy](#19-hướng-dẫn-cài-đặt--khởi-chạy)

---

## 1. TỔNG QUAN DỰ ÁN

* **Tên dự án:** Campus Marketplace
* **Mô hình hoạt động:** Sàn thương mại điện tử P2P (Peer-to-Peer) nội bộ sinh viên kết hợp **Trợ lý AI thông minh (Gemini 1.5 Flash)**, **Tìm kiếm Meilisearch siêu tốc**, **Thông báo đa kênh (FCM / Web Push / Socket / Email)**, **Thanh toán Escrow giữ tiền đảm bảo (PayOS / VietQR Napas 247)**, **Trạm bàn giao an toàn Safe-Handoff Hubs**, và **Hệ thống Gamification thưởng Xu (Campus Coin)** dành cho sinh viên và cộng đồng trường.
* **Vấn đề giải quyết:**
  * Sinh viên có nhu cầu luân chuyển, thanh lý đồ gia dụng phòng trọ/KTX (tủ lạnh mini, quạt điện, ấm siêu tốc, bếp từ, bàn ghế, đệm), giáo trình, đồ công nghệ và xe cộ.
  * Các hội nhóm mạng xã hội thường gặp tình trạng lừa đảo cọc, hàng giấu lỗi, tin ảo không gỡ, spam quảng cáo.
  * Cung cấp giải pháp định danh sinh viên qua Thẻ Sinh viên (MSSV, Campus, CCCD), thanh toán PayOS/VietQR giữ tiền Escrow, mã QR Handshake bảo mật, ship COD đồng kiểm tra, chính sách bao test 24h-48h, tự động gỡ tin quá hạn sau 30 ngày, và đổi Xu lấy voucher tiện ích.

---

## 2. KIẾN TRÚC HỆ THỐNG TỔNG THỂ

Hệ thống tuân thủ nguyên tắc **Tách biệt giao diện và nghiệp vụ (Headless / Decoupled Architecture)**:

```text
                                  CAMPUS MARKETPLACE
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
 ┌───────────────┐                 ┌───────────────┐                 ┌───────────────┐
 │    WEB APP    │                 │   MOBILE APP  │                 │   ADMIN WEB   │
 │ Next.js 16/19 │                 │  React Native │                 │  Next.js 16   │
 │  (App Router) │                 │  Expo SDK 52  │                 │ (Admin Portal)│
 └───────┬───────┘                 └───────┬───────┘                 └───────┬───────┘
         │                                 │                                 │
         └────────────────┬────────────────┴────────────────┬────────────────┘
                          │                                 │
                          ▼                                 ▼
                 HTTPS / REST API                      WebSocket (Socket.io)
                          │                                 │
                          └────────────────┬────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │            BACKEND SERVER             │
                       │         Node.js + Express.js          │
                       │      (Clean Modular Monolith)         │
                       │   + Google Gemini 1.5 Flash AI Engine │
                       │   + Multi-Channel Notification Engine │
                       │     (Firebase FCM + Nodemailer SMTP)  │
                       │   + Webhooks (PayOS & GHTK/GHN)       │
                       │   + 3 Automated Node-Cron Services    │
                       └───────────────────┬───────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
  ┌──────────────┐                  ┌──────────────┐                  ┌─────────────┐
  │MongoDB Atlas │                  │ Redis 7      │                  │ Meilisearch │
  │ (Prisma ORM) │                  │(Cache/Geo/Z) │                  │(Search/Auto)│
  └──────────────┘                  └──────────────┘                  └─────────────┘
```

---

## 3. NGĂN XẾP CÔNG NGHỆ (TECH STACK)

### 🌐 Frontend Web & Admin Portal
* **Framework:** Next.js 16 (App Router, React 19, TypeScript strict).
* **Styling:** Tailwind CSS, Lucide React (Icons).
* **Quản lý dữ liệu:** TanStack Query v5 (Prefetching, Caching, Optimistic UI Updates).
* **Quản lý trạng thái:** Zustand (Global Store: Auth, Cart, Filters).
* **Real-time:** `socket.io-client`.

### 📱 Mobile App (iOS / Android)
* **Framework:** React Native / Expo (TypeScript, Expo SDK 52).
* **Điều hướng:** React Navigation v7 (Native Stack & Bottom Tabs).
* **Giao diện & Hiệu năng:** `@gorhom/bottom-sheet`, `expo-image` (multi-tier cache, blurhash), `expo-image-picker`, `react-native-reanimated`.
* **Bảo mật cục bộ:** Expo SecureStore (Keychain / Keystore token storage).
* **Push Notification:** Firebase Cloud Messaging (FCM).
* **Real-time:** `socket.io-client`.

### ⚙️ Backend Server & Infrastructure
* **Nền tảng:** Node.js, Express.js (Kiến trúc Modular Monolith Clean Architecture).
* **Cơ sở dữ liệu & ORM:** **MongoDB Atlas** với **Prisma ORM** (`@prisma/client`, `prisma/schema.prisma`).
* **Bộ nhớ đệm & Phân tán:** **Redis 7** (Cache-Aside, Rate Limiting, Redlock Distributed Lock, Redis ZSET trending, Redis Geospatial tìm trạm Safe-Handoff).
* **Tìm kiếm thông minh:** **Meilisearch Engine** (`/api/products/suggest`, fulltext search có chống gõ sai) + MongoDB regex fallback.
* **Thông báo đa kênh:** **Firebase Cloud Messaging (FCM Multicast)** + **Web Push VAPID** + **Socket.io Realtime** + **Nodemailer SMTP Email**.
* **Trí tuệ nhân tạo (AI):** **Google Gemini 1.5 Flash** (`@google/generative-ai`): Vision AI trích xuất thông tin ảnh tạo bài đăng & Chatbot tư vấn tìm đồ theo ngân sách/cơ sở.
* **Thanh toán & Escrow:** Cổng thanh toán **PayOS** (Web Checkout URL & Webhook HMAC) + **VietQR Napas 247** động.
* **Vận chuyển & Đối soát:** Webhook Receiver tiếp nhận tín hiệu từ GHTK / GHN (HMAC Signature Verification & Idempotency).
* **Lưu trữ tệp & media:** **Cloudflare R2 Object Storage** (qua `@aws-sdk/client-s3`) kết hợp thư viện `sharp` tối ưu nén ảnh WebP và xác thực Magic Bytes chống mã độc; bảo vệ thẻ sinh viên KYC qua Private Streaming Route (`/api/profile/kyc/card/:filename`).
* **Tác vụ ngầm định kỳ (Node-Cron):** 3 tác vụ ngầm tự động (`expire-products`, `escrow-auto-release`, `expire-pending-orders`).
* **Giao tiếp Realtime:** Socket.io Server v4 gắn trực tiếp HTTP Server, hỗ trợ xác thực JWT Handshake.

---

## 4. CẤU TRÚC DỰ ÁN & TỔ CHỨC MÃ NGUỒN

```text
fu-student-secondhand-market/
│
├── backend/                         # ⚙️ Express Backend (Modular Monolith)
│   ├── prisma/
│   │   └── schema.prisma            # Prisma MongoDB Data Models & Enums
│   ├── src/
│   │   ├── config/                  # database, env, mail, payos, prisma, redis, ai, meilisearch, webpush, firebase
│   │   ├── cron/                    # 3 Node-Cron Jobs: expire-products, escrow-auto-release, expire-pending-orders
│   │   ├── middlewares/             # auth, role, rateLimit, upload, error, logging, tracing
│   │   ├── modules/                 # Các module tính năng độc lập (Clean 3-Tier)
│   │   │   ├── auth/                # Đăng ký, Đăng nhập (Google/Phone/Email OTP), JWT dual token
│   │   │   ├── profile/             # Profile, KYC Thẻ SV, Seller Onboarding, Quests, Check-in, Withdrawals
│   │   │   ├── users/               # Leaderboard uy tín Redis ZSET, Admin quản trị user
│   │   │   ├── products/            # CRUD bài đăng, Lọc đa chiều, Meilisearch Suggest, Redis Trends, Boost/Pin
│   │   │   ├── categories/          # Danh mục hàng hóa, Seed danh mục
│   │   │   ├── chats/               # Chat 1-1, deal giá, điểm hẹn
│   │   │   ├── ai/                  # Gemini Vision scan ảnh điền bài & Chatbot tìm đồ trọ
│   │   │   ├── notifications/       # FCM Push Multicast, Web Push VAPID, In-app, Email dispatch
│   │   │   ├── orders/              # Đơn hàng Meetup/Ship COD, VietQR, QR Handshake, Logistics Webhook
│   │   │   ├── payments/            # PayOS Checkout & Webhook Receiver
│   │   │   ├── reviews/             # Đánh giá công khai tức thì, Tặng Xu Campus Coin & Điểm uy tín
│   │   │   ├── vouchers/            # Kho Voucher Căn tin/Passio, Đổi Xu, Quét mã sử dụng
│   │   │   ├── reports/             # Báo cáo vi phạm, Khiếu nại Dispute, Thẩm định KYC Admin
│   │   │   ├── safehandoff/         # Trạm giao dịch Safe-Handoff Hubs, Redis Geo tìm trạm gần nhất
│   │   │   └── presence/            # Trạng thái Online/Offline người dùng
│   │   ├── utils/                   # socket.ts, token.ts, helpers
│   │   ├── app.ts                   # Cấu hình Express app, CORS, Helmet, Routes
│   │   └── server.ts                # Server entrypoint khởi chạy HTTP, Socket.io, Cron, Meilisearch
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                        # 🌐 Next.js Web App & Admin Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── (main)/              # Trang chủ, Chi tiết tin, Chat, Profile, Orders, Vouchers, Notifications
│   │   │   ├── admin/               # Admin Dashboard, KYC Moderation, Posts, Reports, SafeHandoff, Vouchers
│   │   │   ├── checkout/            # Checkout đơn hàng PayOS / VietQR
│   │   │   ├── login/               # Đăng nhập, Đăng ký, Quên mật khẩu
│   │   │   └── create-post/         # Đăng bài đăng bán (AI Scan / Thủ công)
│   │   ├── components/              # admin/, auth/, chat/, orders/, ui/, vouchers/, notifications/
│   │   ├── services/                # Axios API services
│   │   ├── stores/                  # Zustand stores
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/                          # 📱 React Native Mobile App (Expo SDK 52)
    ├── src/
    │   ├── features/                # auth, home, post-item, product-detail, chat, order, review, dispute, voucher, notifications...
    │   ├── components/              # common/, ui/
    │   ├── navigation/              # Native Stack & Bottom Tabs
    │   ├── services/                # Axios client + Interceptors
    │   ├── stores/                  # Zustand stores
    │   └── types/
    ├── app.json
    └── package.json
```

---

## 5. CƠ CHẾ XÁC THỰC THẺ SINH VIÊN & PHÂN TẦNG VAI TRÒ (RBAC & KYC)

```text
               ┌──────────────────────────────────────────────────┐
               │              NGƯỜI DÙNG ĐĂNG KÝ                  │
               │   (Email FPT @fpt.edu.vn / Google SSO / SĐT)     │
               └────────────────────────┬─────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
       [CẤP 1: NGƯỜI MUA (BUYER)]                 [CẤP 2: NGƯỜI BÁN (SELLER)]
   (Tài khoản Sinh viên thông thường)         (Hoàn tất Onboarding & BQT phê duyệt)
                    │                                       │
     ┌──────────────┴──────────────┐                        │
     ▼                             ▼                        │
Mua hàng & Tương tác:         Đăng bán:                     │
- Xem & tìm kiếm sản phẩm     ⛔ BỊ CHẶN HOẶC GIỚI HẠN      │
- Đặt mua (Safe-point / COD)  (Yêu cầu xác thực tài khoản)  │
- Mở khiếu nại bao test 24-48h                              │
- Nộp Thẻ SV (Student KYC):                                 ▼
  Nhận Tích Xanh & nhận Xu                             Đăng bán & Kinh doanh:
                                                       - Đăng tin không giới hạn (AI Quick Post 3s)
                                                       - Tích xanh "Người Bán SV - MSSV: [Mã]"
                                                       - Mở Seller Dashboard & Rút tiền Escrow VietQR
                                                       - Bàn giao mã OTP 4 số tại Safe-Point Hub
```

### Phân tầng vai trò (`UserRole`):
1. **`UNVERIFIED`**: Tài khoản mới tạo, chưa xác thực email qua mã OTP.
2. **`BUYER`**: Sinh viên đã xác thực email; có quyền duyệt bài, chat, mặc cả, đặt mua đơn hàng, tích lũy Xu, mở khiếu nại đổi trả.
3. **`SELLER`**: Sinh viên hoàn tất hồ sơ Onboarding Người Bán (Thẻ SV, CCCD 2 mặt, thông tin ngân hàng); có quyền đăng tin bán hàng không giới hạn, quản lý kho đồ, rút tiền bán về tài khoản ngân hàng.
4. **`ADMIN`**: Ban Quản Trị toàn quyền kiểm duyệt tin đăng (`PENDING_APPROVAL`), thẩm định thẻ SV KYC, phân xử khiếu nại tranh chấp (Dispute), quản lý trạm Safe-Handoff và kho Voucher.

---

## 6. ĐẶC TẢ DANH MỤC SẢN PHẨM CỐT LÕI

Hệ thống phân loại theo enum chuẩn `ProductCategory`:
1. 🍳 **`DORM_ITEM` (Đồ gia dụng & Phòng trọ / KTX):** Tủ lạnh mini, quạt điện, ấm siêu tốc, bếp từ, nồi cơm điện, nệm ngủ, bàn ghế học tập, giá phơi đồ...
2. 📚 **`BOOKS` (Sách giáo trình & Kỹ năng):** Sách luyện thi IELTS, TOEIC, giáo trình chuyên ngành, tiểu thuyết, truyện tranh...
3. 💻 **`ELECTRONICS` (Đồ công nghệ & Phụ kiện):** Màn hình rời, bàn phím cơ, chuột không dây, tai nghe, củ cáp sạc, ổ cắm nối dài...
4. 🛵 **`VEHICLE` (Xe cộ & Di chuyển):** Xe đạp, xe máy, xe điện, mũ bảo hiểm...
5. 👕 **`CLOTHING` (Đồng phục & Đồ cá nhân):** Võ phục Vovinam, áo cam sự kiện, balo...
6. 📦 **`OTHER` (Đồ dùng khác):** Đồ thể thao, đồ trang trí phòng trọ, vật dụng cá nhân...

---

## 7. QUY TRÌNH ĐĂNG BÁN ĐỒ (AI QUICK POST & FORM ĐĂNG CHUẨN)

* **Cách 1: Đăng siêu tốc bằng AI Vision (3 giây):**
  - Chụp ảnh món đồ qua Camera hoặc tải ảnh lên.
  - Endpoint `POST /api/ai/vision-post` sử dụng **Gemini 1.5 Flash Vision** trích xuất: Tiêu đề, Danh mục phù hợp, Tình trạng đồ, Đề xuất mức giá pass hợp lý, Mô tả chi tiết gợi ý và Hashtags tìm kiếm.
  - Người bán kiểm tra lại và nhấn xác nhận đăng bài.
* **Cách 2: Đăng thủ công chi tiết:**
  - Điền đầy đủ thông tin: Tiêu đề, Giá, Danh mục, Tình trạng, Cơ sở Campus, Tùy chọn Ship COD / Hẹn gặp trực tiếp.
  - Tải lên tối đa nhiều ảnh WebP và video kiểm tra máy thực tế.
  - Bài đăng chuyển sang trạng thái `PENDING_APPROVAL` để BQT duyệt chống hàng cấm học đường. Khi được duyệt, hệ thống phát sóng Socket realtime `product:created` tới toàn bộ người dùng đang mở Web & App.

---

## 8. PHÂN HỆ TÌM KIẾM THÔNG MINH & LỌC ĐA CHIỀU (MEILISEARCH ENGINE & SMART SEARCH)

Để giải quyết bài toán hàng nghìn sinh viên tìm kiếm giáo trình, đồ phòng trọ theo từng Campus với độ trễ thấp nhất, hệ thống xây dựng kiến trúc tìm kiếm đa tầng kết hợp giữa **Meilisearch Engine** chuyên dụng và **MongoDB Fallback**:

```text
                           NGƯỜI DÙNG TÌM KIẾM SẢN PHẨM
                                        │
                                        ▼
                  GET /api/products/suggest hoặc GET /api/products
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              [MEILISEARCH ENGINE]           [MONGODB FALLBACK]
            (Sub-50ms Full-text search)      (Regex $regex / $in)
             - Chống gõ sai (Typo)           - Tự động kích hoạt khi
             - Tiếng Việt không dấu            Meilisearch offline
             - Xếp hạng độ liên quan         - Đảm bảo 100% Uptime
```

### 🔍 8.1 Cấu hình Index & Tối ưu tiếng Việt (`initMeilisearch`)
* **Chỉ mục:** `products` với Primary Key `id`.
* **Searchable Attributes:** `title`, `description`, `hashtags`, `categoryName`, `meetupLocation`.
* **Cơ chế Chống gõ sai (Typo Tolerance):**
  - Cho phép 1 ký tự sai đối với từ có độ dài từ 4 ký tự trở lên (ví dụ: `giao trinh` $\rightarrow$ `giáo trình`, `noi com` $\rightarrow$ `nồi cơm`).
  - Cho phép 2 ký tự sai đối với từ có từ 8 ký tự trở lên.
  - Tự động chuẩn hóa tiếng Việt có dấu và không dấu.
* **Quy tắc xếp hạng ưu tiên (Ranking Rules):** `words` (khớp nhiều từ nhất) $\rightarrow$ `typo` (ít lỗi sai nhất) $\rightarrow$ `proximity` (từ khóa đứng gần nhau) $\rightarrow$ `attribute` (khớp tiêu đề ưu tiên hơn mô tả) $\rightarrow$ `sort` $\rightarrow$ `exactness`.

### ⚡ 8.2 Gợi ý tức thì qua Autocomplete (`/api/products/suggest`)
* Endpoint `GET /api/products/suggest?q={query}&campus={campus}&limit=6`:
  - Phản hồi cực nhanh khi người dùng gõ từng ký tự vào thanh tìm kiếm trên Web & Mobile.
  - Trả về ngay 6 kết quả phù hợp nhất gồm: `id`, `title`, `price`, `imageUrl`, `categoryName`, `campus`, và 3 `hashtags` nổi bật.
  - Nếu Meilisearch chưa sẵn sàng, hệ thống tự động fallback truy vấn regex MongoDB không gây gián đoạn.

### 🎯 8.3 Bộ lọc đa chiều (Faceted Filters) & Sắp xếp chuyên biệt
* **Lọc theo cơ sở sinh viên (`campus`):** `HOL` (Hòa Lạc), `HCM` (TP. Hồ Chí Minh), `DAD` (Đà Nẵng), `QN` (Quy Nhơn), `CT` (Cần Thơ).
* **Lọc theo nhóm danh mục (`categoryId`, `categoryType`):** 6 nhóm danh mục chuẩn `ProductCategory`.
* **Lọc tình trạng đồ cũ (`condition`):** `NEW` (Mới 100%), `LIKE_NEW` (99%), `GOOD` (Tốt), `FAIR` (Dùng tạm).
* **Khoảng giá sinh viên (`minPrice`, `maxPrice`):** Phù hợp ngân sách từ 10.000 VNĐ đến hàng triệu VNĐ.
* **Sắp xếp linh hoạt (`sortBy`):** Mới nhất (`newest`), Giá rẻ nhất (`price_asc`), Giá cao nhất (`price_desc`), Xem nhiều nhất (`views`).

### 🔄 8.4 Đồng bộ chỉ mục Thời gian thực (Realtime Sync & Failover)
* **Đồng bộ khi duyệt bài (`syncProductToMeili`):** Ngay khi Admin duyệt tin đăng (`/api/products/admin/:id/approve`), bài đăng được đẩy ngay vào Meilisearch index kèm xóa cache Redis.
* **Cập nhật khi chỉnh sửa:** Tự động re-index lại document khi người bán chỉnh sửa giá hoặc thông tin.
* **Gỡ bỏ khi hết hạn / bán xong (`deleteProductFromMeili`):** Tự động xóa khỏi Meilisearch khi đơn hàng hoàn tất (`SOLD`) hoặc bài đăng quá hạn (`EXPIRED`).
* **Khả năng chịu lỗi cao (Fault Tolerance):** Toàn bộ hàm đồng bộ Meilisearch đều bọc `try/catch` an toàn, không bao giờ làm gián đoạn transaction cơ sở dữ liệu chính của hệ thống.

---

## 9. PHÂN HỆ TIN NHẮN THỜI GIAN THỰC & PHÍM TẮT MUA BÁN (P2P CHAT)

Khung chat tích hợp Socket.io chuyên biệt cho mua bán đồ cũ giữa sinh viên:
* **Ghim món đồ giao dịch:** Luôn hiển thị sản phẩm, hình ảnh và giá niêm yết trên đầu khung trò chuyện.
* **Phím tắt Mặc cả giá (`send_offer_price`):** Gửi đề xuất giá mới (chặn nếu mức trả lời $< 50\%$ giá niêm yết). Bên nhận có nút "Đồng ý" hoặc "Từ chối".
* **Phím tắt Hẹn điểm gặp (`send_meetup_location`):** Gợi ý các địa điểm hẹn an toàn tại Campus (Căn tin, KTX, Thư viện, Trạm Safe-Handoff).
* **Trạng thái gõ phím & Đã đọc:** `typing` / `stop_typing` (server phát `user_typing` / `user_stop_typing`), `message_read` (server phát `messages_marked_read`).
* **Kiểm tra trạng thái Presence:** `check_presence` truy vấn tức thì danh sách đối phương đang online/offline.

---

## 10. CƠ CHẾ ĐÁNH GIÁ 2 CHIỀU & HỆ THỐNG PHẦN THƯỞNG (CAMPUS COIN & GAMIFICATION)

Hệ thống Gamification vận hành 100% tự chủ trên sổ cái `CoinTransaction`:

### 🪙 10.1 Cơ chế Kiếm Xu (Earn Coins)
* **Điểm danh nhận Xu hàng ngày (`DailyCheckIn`):** Nhận ngay **+20 Xu** mỗi ngày (`POST /api/profile/check-in`).
* **Nhiệm vụ tuần & Thử thách (`Quest`):** Hoàn thành nhiệm vụ nhận thưởng Xu (`POST /api/profile/claim-quest`).
* **Đánh giá đơn hàng có tâm:** Đánh giá text/ảnh nhận **+100 Xu**; đính kèm video test đồ nhận **+200 Xu** và `+2` điểm uy tín.
* **Người bán uy tín:** Nhận đánh giá 5 sao nhận `+5` điểm uy tín.
* **Duyệt Thẻ Sinh Viên KYC thành công:** Nhận thưởng Xu chào mừng.

### 🛍️ 10.2 Công dụng Tiêu Xu (Spend Coins)
1. **Đẩy tin bài đăng (Bump Post) — 100 Xu:** Cập nhật `boostedAt` đưa bài lên đầu bảng tin (`POST /api/products/:id/boost`).
2. **Ghim tin nổi bật 24 giờ (Pin 24h) — 300 Xu:** Đặt `isPinned = true` hiển thị viền nổi bật ở đầu trang chủ.
3. **Khấu trừ tiền Đơn hàng Online:** Giảm trừ trực tiếp từ 10% đến 20% giá trị đơn hàng (1 Xu = 1 VNĐ).
4. **Mua Huy hiệu & Khung Avatar:** Đổi Xu lấy khung trang trí cá nhân `"TOP_SELLER"`, `"K18_VERIFIED"`.
5. **Đổi Voucher Căn tin / Passio:** Dùng Xu đổi voucher ăn uống, cà phê, sinh mã `voucherCode` quét dùng 1 lần tại quầy (`POST /api/vouchers/:id/redeem`).
6. **Rút tiền về tài khoản ngân hàng:** Sinh viên tạo yêu cầu rút tiền mặt về STK ngân hàng khi tích lũy số dư lớn (`POST /api/profile/withdrawals`).

---

## 11. PHÂN HỆ TRỢ LÝ THÔNG MINH AI (CAMPUS AI ASSISTANT)

* **Chatbot Tìm Đồ Phòng Trọ (`POST /api/ai/assistant-chat`):**
  - Sinh viên nhắn tin tự nhiên: *"Tìm giúp mình quạt điện hoặc nồi cơm mini giá dưới 300k ở Hòa Lạc"*.
  - Chatbot tự động phân tích ngôn ngữ tự nhiên, truy vấn danh mục và khoảng giá trong database, trả lời chi tiết kèm danh sách sản phẩm phù hợp.
  - Hỗ trợ cả khách vãng lai trải nghiệm thử lẫn người dùng đã đăng nhập.
* **Gemini Vision OCR Thẻ SV (`POST /api/reports/kyc/:id/ai-scan`):**
  - Hỗ trợ Ban Quản Trị chạy đối soát tự động thông tin MSSV, họ tên, cơ sở trên ảnh thẻ sinh viên theo yêu cầu on-demand.

---

## 12. HỆ THỐNG TRẠM SAFE-HANDOFF & ĐIỂM GẶP AN TOÀN

Nhằm giải quyết triệt để nguy cơ cướp giật hoặc địa điểm giao dịch khuất vắng:
* **Hệ thống trạm Safe-Handoff Hubs (`/api/safe-handoff`):** Các điểm giao dịch chính thức đặt tại khuôn viên trường (Sảnh KTX, Thư viện, Căn tin, Phòng dịch vụ sinh viên).
* **Trang bị an toàn:** Có camera an ninh giám sát HD, cán bộ hỗ trợ và khung giờ hoạt động minh bạch (`07:30 - 21:00`).
* **Định vị trạm gần nhất:** Sử dụng **Redis Geospatial** (`GET /api/safe-handoff/nearby`) để tính toán khoảng cách và chỉ dẫn sinh viên đến trạm gần nhất.

---

## 13. PHƯƠNG THỨC MUA HÀNG & THANH TOÁN ESCROW (PAYOS / VIETQR / COD)

Hỗ trợ 2 phương thức giao dịch đảm bảo nguyên tắc: **Đồng kiểm tra hàng trước khi tiền được chuyển cho người bán**:

```text
                                  LỰA CHỌN GIAO DỊCH
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
 [CÁCH 1: HẸN GẶP TẠI TRƯỜNG / SAFE-POINT]                     [CÁCH 2: SHIP COD TẬN NƠI (BÊN THỨ 3)]
 - Hẹn gặp tại trạm Safe-Handoff hoặc Căn tin                  - Shipper mang kiện hàng đến KTX / Nhà trọ
 - Cắm điện test đồ tận tay                                    - Người mua mở hộp đồng kiểm tra đồ
 - Thanh toán Escrow qua PayOS Web hoặc VietQR Napas           - Tiền giữ an toàn trong hệ thống Escrow
 - Người bán mở mã QR Handshake (HMAC token & OTP)             - Shipper giao thành công -> Kích hoạt 48h Bao test
 - Người mua quét xác nhận -> Hoàn tất đơn hàng                - Hết hạn bao test -> Tiền chuyển về ví người bán
```

---

## 14. QUY TRÌNH PASS ĐỒ, BAO TEST 24H-48H & ĐỔI TRẢ / KHIẾU NẠI (DISPUTE)

* **Thời hạn Bao test:**
  - Giao dịch gặp mặt trực tiếp (`MEETUP`): Bao test **24 giờ**.
  - Giao dịch Ship COD từ xa (`SHIP_COD`): Bao test **48 giờ** (tính từ thời điểm Webhook báo `DELIVERED`).
* **Cơ chế xác nhận & Tự động giải phóng Escrow:**
  - Nếu sản phẩm tốt: Người mua bấm **"Xác nhận đã nhận hàng"** (`POST /api/orders/:id/confirm-delivery`) $\rightarrow$ Hệ thống giải phóng tiền cọc ngay lập tức cho người bán.
  - Nếu người mua quên xác nhận: Cron Job `escrow-auto-release.cron.ts` tự động giải phóng tiền cho người bán khi hết hạn bảo hành mà không có khiếu nại.
* **Quy trình khiếu nại khi phát hiện hàng lỗi:**
  - Người mua tải lên video quay rõ lỗi kỹ thuật $\rightarrow$ Gửi yêu cầu khiếu nại (`POST /api/reports/disputes`).
  - Đơn hàng chuyển sang trạng thái `DISPUTED`, hệ thống đóng băng tiền Escrow.
  - BQT Admin phân xử:
    - Chấp thuận (`/approve`): Hoàn tiền 100% cho người mua.
    - Bác bỏ (`/reject`): Giải phóng tiền cho người bán nếu người mua vu khống hoặc làm rơi vỡ.

---

## 15. HỆ THỐNG THÔNG BÁO ĐA KÊNH TÍCH HỢP (MULTI-CHANNEL NOTIFICATION ENGINE)

Hệ thống thông báo được thiết kế theo kiến trúc **Bộ phát đa kênh tập trung (Centralized Multi-Channel Dispatcher)**, đảm bảo sinh viên nhận được thông tin giao dịch tức thì trên mọi thiết bị:

```text
            SỰ KIỆN KÍCH HOẠT (Đơn hàng, Chat, KYC, Escrow, Cron)
                                      │
                                      ▼
                       ┌──────────────────────────────┐
                       │  NotificationService Core    │
                       └──────────────┬───────────────┘
                                      │
        ┌───────────────┬─────────────┴───────────────┬───────────────┐
        ▼               ▼                             ▼               ▼
 [KÊNH 1: IN-APP] [KÊNH 2: SOCKET]             [KÊNH 3: PUSH]  [KÊNH 4: EMAIL]
  MongoDB Record   Socket.io Gateway           Firebase FCM     Nodemailer SMTP
  Lưu trữ lịch sử  Room user_{id}              & Web Push VAPID Template HTML
  (~3ms đồng bộ)   (Phát sóng <1ms)            (Nền ngầm)       (Xác thực & Escrow)
```

### 📡 15.1 Đặc tả 4 Kênh Thông Báo
1. **Kênh 1 — In-App Database (`Notification` trong MongoDB):**
   - Lưu trữ lịch sử thông báo người dùng với các trường: `title`, `body`, `type` (`CHAT`, `ORDER`, `KYC`, `SYSTEM`), `targetUrl`, `isRead`, `createdAt`.
   - Cho phép người dùng xem lại toàn bộ lịch sử thông báo, phân trang, và bấm trực tiếp vào `targetUrl` để chuyển hướng đến đúng trang giao dịch.
2. **Kênh 2 — Realtime WebSocket (Socket.io Gateway):**
   - Bắn trực tiếp event `new_notification` tới room cá nhân `user_${userId}` với độ trễ $< 1$ms.
   - Kích hoạt rung chuông thông báo và cập nhật số lượng unread badge ngay trên Navbar Web và Bottom Tab Mobile mà không cần reload trang.
3. **Kênh 3 — Push Notifications Đa Nền Tảng (Mobile FCM & Web Push VAPID):**
   - **Mobile App (Firebase Cloud Messaging - FCM Multicast):** Lưu token tại bảng `DeviceToken`. Hỗ trợ 1 tài khoản đăng nhập trên nhiều thiết bị (điện thoại, iPad) và bắn multicast đồng thời. Tự động nhận diện và xóa bỏ các token lỗi thời (`registration-token-not-registered`).
   - **Web Browser (Web Push API / VAPID):** Client đăng ký Service Worker qua Public Key lấy từ `GET /api/notifications/vapid-public-key`. Người dùng nhận thông báo desktop ngay cả khi trình duyệt đang thu nhỏ hoặc đóng tab.
4. **Kênh 4 — Email Giao Dịch Chuyên Biệt (Nodemailer SMTP):**
   - Gửi thư điện tử định dạng HTML chuyên nghiệp cho các nghiệp vụ pháp lý/giao dịch: Mã OTP đăng ký & quên mật khẩu, Kết quả thẩm định KYC Thẻ Sinh Viên, Thông báo giữ tiền Escrow, và Biên lai hoàn tất giao dịch.

### ⚡ 15.2 Kiến trúc Non-Blocking I/O & Ma trận Chống Spam
* **Phản hồi siêu tốc qua `setImmediate`:** Kênh In-App và WebSocket được xử lý đồng bộ (~3ms). Ngay sau đó, API trả kết quả thành công cho Client; toàn bộ việc kết nối SMTP handshake (mất 1-3s) và multicast FCM được giao cho luồng Worker nền xử lý bất đồng bộ.
* **Quy tắc phân luồng thông minh (Spam Filtering Matrix):**
  - Tin nhắn Chat P2P: Tuyệt đối **không** gửi Email để tránh làm tràn ngập hòm thư người dùng, chỉ kích hoạt Socket + FCM Push khi đối phương offline.
  - Thông báo Đơn hàng & KYC: Kích hoạt đồng thời cả 4 kênh (In-app, Socket, FCM, Email).

### 📋 15.3 Danh mục API Quản lý Thông báo
* `GET /api/notifications`: Lấy danh sách thông báo của tài khoản (hỗ trợ phân trang).
* `GET /api/notifications/unread-count`: Đếm nhanh số thông báo chưa đọc để hiển thị badge chuông.
* `PATCH /api/notifications/:id/read`: Đánh dấu 1 thông báo đã đọc.
* `PATCH /api/notifications/read-all`: Đánh dấu đã đọc toàn bộ thông báo.
* `POST /api/notifications/fcm-token` & `POST /api/notifications/device-token`: Đăng ký token thiết bị nhận push.
* `DELETE /api/notifications/fcm-token` & `DELETE /api/notifications/device-token`: Hủy đăng ký token khi người dùng Logout.
* `DELETE /api/notifications/:id`: Xóa một bản ghi thông báo.
* `DELETE /api/notifications`: Xóa sạch lịch sử thông báo cá nhân.
* `GET /api/notifications/vapid-public-key`: Cung cấp public key VAPID cho trình duyệt Web.

---

## 16. HỆ THỐNG TÁC VỤ TỰ ĐỘNG NGẦM (AUTOMATED CRON SERVICES)

Hệ thống duy trì 3 tác vụ ngầm tự động (Node-Cron Services) độc lập, hoạt động 24/7 để bảo đảm tính toàn vẹn của sàn TMĐT sinh viên:

```text
                        3 AUTOMATED CRON SERVICES (NODE-CRON)
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
 [expire-products.cron.ts]   [escrow-auto-release.cron.ts]  [expire-pending-orders.cron.ts]
   Chạy lúc 00:00:00 hàng ngày        Chạy mỗi 15 phút               Chạy mỗi 10 phút
   - Quét ngày 27: Nhắc gia hạn       - Quét đơn hết hạn bao test    - Quét đơn PENDING quá hạn
   - Quét ngày 30: Gỡ tin EXPIRED     - Tự giải ngân tiền Escrow     - Tự hủy đơn & hoàn kho đồ
```

1. **`expire-products.cron.ts` (00:00:00 hàng ngày):**
   - Quét các bài đăng còn 3 ngày là tròn 30 ngày (ngày thứ 27): Bắn thông báo In-app/Push/Email nhắc nhở người bán gia hạn tin nếu đồ chưa bán được.
   - Quét các bài đăng đạt mốc 30 ngày: Tự động chuyển trạng thái sang `EXPIRED`, gỡ bài khỏi Meilisearch và xóa cache Redis để làm sạch bảng tin sinh viên.
2. **`escrow-auto-release.cron.ts` (Mỗi 15 phút):**
   - Quét các đơn hàng đã bàn giao nhưng người mua quên bấm xác nhận:
     - Giao dịch trực tiếp (`MEETUP`): Quá 24 giờ bao test.
     - Giao dịch ship COD (`SHIP_COD`): Quá 48 giờ kể từ lúc shipper giao thành công (`DELIVERED`).
   - Nếu không có khiếu nại (Dispute), tự động giải ngân tiền Escrow sang ví người bán, gửi thông báo chúc mừng và tích điểm uy tín.
3. **`expire-pending-orders.cron.ts` (Mỗi 10 phút):**
   - Quét các đơn hàng ở trạng thái `PENDING` (chờ thanh toán PayOS / VietQR hoặc chờ người bán xác nhận) vượt quá thời gian cho phép (15 - 30 phút).
   - Tự động chuyển trạng thái sang `CANCELLED`, hoàn trả số lượng hàng về kho (`AVAILABLE`) để người khác có thể đặt mua.

---

## 17. QUY CHUẨN KỸ THUẬT & TỐI ƯU HÓA HIỆU NĂNG

* **Kiến trúc phân tầng Clean 3-Tier:** Tách biệt tuyệt đối giữa Controller, Service và Prisma Database Queries.
* **Bảo mật OWASP Top 10:** Mã hóa mật khẩu `bcryptjs` (salt 10), mã hóa JWT Access (15m) + Refresh (30d), Helmet chống XSS/Clickjacking, Rate limiter phân cấp chống tấn công Brute-force & DDoS.
* **Xác thực chữ ký HMAC cho Webhooks:** Bảo vệ 100% các endpoint Webhook từ PayOS, GHTK, GHN bằng Buffer `rawBody` và Signature verification.
* **Tối ưu hình ảnh:** Nén định dạng WebP bằng thư viện Sharp, hạn chế kích thước tệp và bảo vệ tài liệu nhạy cảm qua route stream bảo mật.

---

## 18. LỘ TRÌNH TRIỂN KHAI (ROADMAP)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: NỀN TẢNG CỐT LÕI (CORE MVP)                                  │
│ - Kết nối MongoDB Atlas (Prisma), Redis 7, Meilisearch, Gemini AI          │
│ - Auth Module: Đăng ký OTP Email FPT, Google SSO, Phone Auth, JWT Dual     │
│ - Profile & KYC: Xác thực thẻ SV, Onboarding Seller, Stream media bảo mật  │
│ - Products Module: CRUD bài đăng, Lọc đa chiều Campus, Danh mục chuẩn      │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: REALTIME, AI TRỢ LÝ & TRẠM SAFE-HANDOFF                       │
│ - Socket.io Server: Chat P2P, Mặc cả giá, Điểm hẹn, Typing, Presence       │
│ - Module AI: Gemini Vision tạo bài đăng 3s & Chatbot tìm đồ phòng trọ     │
│ - Safe-Handoff Module: Danh sách trạm an toàn & Redis Geo tìm trạm gần nhất│
│ - Multi-Channel Notifications: Push FCM + Web Push VAPID + Email Nodemailer│
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: GIAO DỊCH ESCROW, PAYOS, VOUCHERS & 3 CRON JOBS               │
│ - Module Giao dịch: Thanh toán PayOS Web URL + VietQR Napas 247            │
│ - Mã QR Handshake bảo mật HMAC-SHA256 kèm mã OTP 4 số dự phòng             │
│ - Module Ship COD & Webhooks Logistics (GHTK/GHN)                          │
│ - Module Khiếu nại (Dispute), Trọng tài BQT & Vận hành 3 Cron Jobs ngầm    │
│ - Kho Voucher Campus Coin, Nhiệm vụ tuần & Điểm danh nhận Xu hàng ngày     │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 19. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY

```bash
# 1. Cài đặt Backend
cd backend
npm install
npx prisma generate
npm run dev

# 2. Cài đặt Frontend Web
cd ../frontend
npm install
npm run dev

# 3. Cài đặt Mobile App
cd ../mobile
npm install
npx expo start
```
