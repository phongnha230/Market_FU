# 🎓 BÁO CÁO TỔNG KẾT ĐỒ ÁN DỰ ÁN: WEB & MOBILE APPLICATION

## ĐỀ TÀI: CAMPUS MARKETPLACE - SÀN THƯƠNG MẠI ĐIỆN TỬ & TRAO ĐỔI ĐỒ CŨ SINH VIÊN ĐẠI HỌC FPT

> **Hệ thống đa nền tảng (Web & Mobile App) tích hợp Trí tuệ nhân tạo Gemini 1.5 Flash AI, Chat Realtime Socket.io, Thanh toán Escrow PayOS/VietQR/COD, Trạm Safe-Handoff và Gamification Campus Coin**

---

### 📌 THÔNG TIN CHUNG DỰ ÁN

* **Tên dự án:** Campus Marketplace (FU Market)
* **Quy mô dự án:** Hệ thống Fullstack đa nền tảng (**Web Portal Next.js 16**, **Mobile App Android/iOS Expo SDK 52**, **Backend RESTful API & WebSocket Gateway Node.js/Express/Prisma**)
* **Mô hình hoạt động:** Sàn P2P nội bộ trường học (Student-to-Student Marketplace)
* **Số lượng thành viên:** **02 Lập trình viên (Nhóm 2 người)**
* **Tỉ lệ đóng góp công việc:** **50% - 50%** (Cân đối khối lượng công việc kỹ thuật chuyên sâu)

| STT | Thành viên | Vai trò phụ trách chính | Phân hệ đảm nhiệm |
| :---: | :--- | :--- | :--- |
| **1** | **Thành viên 1** *(Fullstack Web & Backend Core Lead)* | • Thiết kế Kiến trúc Backend & Database Schema<br>• Phát triển Web App & Admin Portal (Next.js 16)<br>• Tích hợp AI Gemini Vision & Escrow Payment Gateway | • Backend Core (Node.js/Express, Prisma ORM, Redis 7, Meilisearch)<br>• Web Frontend (Next.js, Tailwind CSS, TanStack Query)<br>• Xác thực KYC Thẻ Sinh Viên & Module Quản trị Admin |
| **2** | **Thành viên 2** *(Mobile Lead & Realtime Services)* | • Thiết kế & Phát triển Mobile App (React Native Expo)<br>• Hạ tầng Realtime Chat & Mặc cả giá P2P<br>• Thông báo đẩy Firebase FCM & UX/UI Mobile Optimization | • Mobile Frontend (React Native, Expo SDK 52, Reanimated)<br>• Realtime WebSocket Client/Server (Socket.io Gateway)<br>• Luồng Giao dịch QR Handshake & Đồng bộ tính năng Parity |

---

## 📑 MỤC LỤC BÁO CÁO

1. [Lý do chọn đề tài &amp; Bài toán thực tế](#1-lý-do-chọn-đề-tài--bài-toán-thực-tế)
2. [Bảng phân chia công việc chi tiết cho 2 thành viên (Work Breakdown Structure)](#2-bảng-phân-chia-công-việc-chi-tiết-cho-2-thành-viên)
3. [Kiến trúc hệ thống tổng thể &amp; Ngăn xếp công nghệ (Tech Stack)](#3-kiến-trúc-hệ-thống-tổng-thể--ngăn-xếp-công-nghệ)
4. [Mô hình dữ liệu &amp; Thiết kế cơ sở dữ liệu (Database Design)](#4-mô-hình-dữ-liệu--thiết-kế-cơ-sở-dữ-liệu)
5. [Đặc tả các phân hệ chức năng cốt lõi trên Web &amp; Mobile](#5-đặc-tả-các-phân-hệ-chức-năng-cốt-lõi-trên-web--mobile)
6. [Hạ tầng Realtime, Gemini AI &amp; Thông báo đa kênh](#6-hạ-tầng-realtime-gemini-ai--thông-báo-đa-kênh)
7. [Quy trình Giao dịch An toàn, Thanh toán Escrow &amp; Gamification](#7-quy-trình-giao-dịch-an-toàn-thanh-toán-escrow--gamification)
8. [Đảm bảo chất lượng phần mềm, Tối ưu hiệu năng &amp; Bảo mật (QA &amp; Security)](#8-đảm-bảo-chất-lượng-phần-mềm-tối-ưu-hiệu-năng--bảo-mật)
9. [Hướng dẫn cài đặt &amp; Khởi chạy hệ thống](#9-hướng-dẫn-cài-đặt--khởi-chạy-hệ-thống)
10. [Đánh giá kết quả &amp; Định hướng phát triển tương lai](#10-đánh-giá-kết-quả--định-hướng-phát-triển-tương-lai)

---

## 1. LÝ DO CHỌN ĐỀ TÀI & BÀI TOÁN THỰC TẾ

### 1.1. Bối cảnh thực tế tại các Campus Đại học FPT
* Hàng kỳ, sinh viên tại các cơ sở (Hòa Lạc, TP.HCM, Đà Nẵng, Cần Thơ, Quy Nhơn) có nhu cầu luân chuyển, thanh lý và mua sắm đồ cũ rất lớn: đồ gia dụng phòng trọ/KTX (tủ lạnh mini, quạt điện, bếp từ, đệm, bàn học), giáo trình chuyên ngành, đồ công nghệ và xe cộ di chuyển.
* **Những bất cập của các kênh truyền thống (Facebook Group, Chợ Tốt):**
  1. **Nạn lừa đảo đặt cọc (Scam cọc):** Người mua chuyển khoản trước rồi bị chặn liên lạc.
  2. **Hàng lỗi giấu nguồn gốc:** Không có cam kết bảo hành, bao test, khó giải quyết tranh chấp.
  3. **Tin rác, tin ảo:** Bài viết đã bán từ lâu nhưng không được gỡ bỏ, gây nhiễu loạn thông tin.
  4. **Thiếu an toàn về địa điểm:** Không có điểm giao dịch an toàn (Safe-Point) trong khuôn viên trường.

### 1.2. Mục tiêu và Giải pháp của Hệ thống
Campus Marketplace được xây dựng nhằm giải quyết triệt để các bài toán trên thông qua:
1. **Định danh sinh viên chính chủ:** Xác thực tài khoản qua Email FPT (`@fpt.edu.vn`) và Thẻ sinh viên KYC (kèm CCCD và STK ngân hàng khi bán hàng).
2. **Trợ lý AI thông minh (Google Gemini 1.5 Flash):** Hỗ trợ chụp ảnh đồ dùng và tự động trích xuất tên sản phẩm, danh mục, gợi ý giá bán thanh lý chuẩn chỉ trong 3 giây.
3. **Mô hình Giao dịch Kép linh hoạt:**
   - *Gặp mặt trực tiếp:* Xác thực giao dịch bằng mã **QR Handshake HMAC-SHA256 (kèm OTP 4 số)** tại các trạm an toàn **Safe-Handoff Hubs** trong trường.
   - *Giao hàng Ship COD:* Tích hợp Webhooks đối soát vận chuyển (GHTK/GHN), người mua nhận hàng đồng kiểm tra rồi mới thanh toán.
4. **Cơ chế Bao test 24h - 48h & Trọng tài BQT:** Tiền được giữ an toàn trong tài khoản trung gian (Escrow) qua PayOS / VietQR cho đến khi người mua xác nhận hoặc hết thời hạn bảo đảm.
5. **Hệ thống Gamification & Campus Coin:** Điểm danh nhận Xu hàng ngày (+20 Xu), làm nhiệm vụ tuần, thưởng Xu khi đánh giá đơn hàng kèm video test (+200 Xu), đổi voucher căn tin/Passio và đẩy tin bài (Bump/Pin).
6. **Vận hành 3 Cron Jobs tự động:** Dọn tin quá hạn 30 ngày, tự động giải ngân Escrow khi hết hạn bao test, và hủy đơn hàng quá hạn thanh toán.

---

## 2. BẢNG PHÂN CHIA CÔNG VIỆC CHI TIẾT CHO 2 THÀNH VIÊN

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHÂN CHIA TRÁCH NHIỆM DỰ ÁN (2 THÀNH VIÊN)                      │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ 👨‍💻 THÀNH VIÊN 1: FULLSTACK WEB & BACKEND   │ 📱 THÀNH VIÊN 2: MOBILE & REALTIME LEAD    │
│ (Trọng tâm: Nền tảng, Dữ liệu, Web, AI)    │ (Trọng tâm: Di động, WebSocket, Push FCM)  │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Thiết kế kiến trúc Modular Monolith     │ • Xây dựng Mobile App React Native Expo    │
│ • Thiết kế Prisma Schemas & MongoDB/Redis │ • Kiến trúc State Mobile (Zustand + Cache) │
│ • Dual Token JWT Auth & Google SSO OAuth  │ • Triển khai Socket.io Client & Gateway    │
│ • Module Bài đăng, Lọc Meilisearch/Filter │ • UI/UX Thumb Zone, Safe Area & Reanimated │
│ • Tích hợp Google Gemini 1.5 Flash Vision │ • Luồng Chat P2P & Mặc cả giá thời gian thực│
│ • Hệ thống Thanh toán VietQR & PayOS      │ • Cơ chế Quét/Tạo mã QR Handshake OTP      │
│ • Xây dựng Web App & Admin Portal Next.js │ • Tích hợp Firebase Cloud Messaging (FCM)  │
│ • Module Phê duyệt KYC & Trọng tài BQT    │ • Tối ưu React Doctor 100/100 & Parity Sync│
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

### 2.1. Ma trận phân công chi tiết theo Module & Feature

| Module hệ thống | Hạng mục công việc kỹ thuật | Phụ trách chính | Phụ trách phối hợp |
| :--- | :--- | :---: | :---: |
| **Hạ tầng Cơ sở dữ liệu** | Thiết kế Prisma Schema, MongoDB Atlas indexes, Redis cache key convention | **Thành viên 1** | Thành viên 2 |
| **Bảo mật & Xác thực** | JWT Access/Refresh Token, mã hóa bcryptjs, Rate limiter, Google OAuth, OTP Email | **Thành viên 1** | Thành viên 2 |
| **Xác thực Thẻ SV (KYC)** | Upload ảnh Sharp WebP, Private Media Streaming, Luồng duyệt KYC Admin | **Thành viên 1** | Thành viên 2 |
| **Ứng dụng Web (Frontend)** | Next.js 16 App Router, Tailwind CSS, TanStack Query, Responsive UI | **Thành viên 1** | — |
| **Cổng Quản trị (Admin Web)** | Dashboard thống kê, Duyệt thẻ SV, Quản lý báo cáo vi phạm & Tranh chấp | **Thành viên 1** | — |
| **Trí tuệ nhân tạo (AI)** | Tích hợp Google Gemini 1.5 Flash Vision (Scan ảnh) & Chatbot Function Calling | **Thành viên 1** | Thành viên 2 |
| **Thanh toán & Đơn hàng** | API Quản lý Order, Tạo PayOS & VietQR Napas, Webhooks đối soát COD | **Thành viên 1** | Thành viên 2 |
| **Ứng dụng Di động (Mobile)** | React Native Expo SDK 52, TypeScript, Navigation Native Stack & Bottom Tabs | **Thành viên 2** | — |
| **Giao diện & Trải nghiệm Mobile**| Thiết kế Thumb Zone, Safe Area Insets, Dynamic Tabs, `@gorhom/bottom-sheet` | **Thành viên 2** | — |
| **Hạ tầng Realtime Chat** | Socket.io Server Gateway, Room management, Chat 1-1, Gửi điểm hẹn Safe-Point | **Thành viên 2** | Thành viên 1 |
| **Mặc cả giá P2P** | Luồng đề xuất giá mới (`send_offer_price`), Chấp nhận/Từ chối giá | **Thành viên 2** | Thành viên 1 |
| **QR Handshake & Giao dịch** | Tạo mã QR động kèm mã hóa HMAC-SHA256, Quét camera xác thực giao dịch nhận hàng | **Thành viên 2** | Thành viên 1 |
| **Thông báo đa kênh** | Cấu hình Firebase Cloud Messaging (FCM Mobile) & Email thông báo Nodemailer | **Thành viên 2** | Thành viên 1 |
| **Đồng bộ Web-Mobile Parity** | Đồng bộ Modal Hủy đơn, Rút đơn khiếu nại, Đẩy tin Bump/Pin, Từ khóa Redis ZSET | **Thành viên 2** | Thành viên 1 |
| **Kiểm thử & Tối ưu hiệu năng** | Audit React Doctor 100/100, Fix Type safety `tsc`, Distributed Lock Redlock | **Cả 2 thành viên** | **Cả 2 thành viên** |

---

## 3. KIẾN TRÚC HỆ THỐNG TỔNG THỂ & NGĂN XẾP CÔNG NGHỆ

### 3.1. Sơ đồ kiến trúc tổng thể (System Architecture Diagram)

```mermaid
graph TB
    subgraph Clients["TẦNG ỨNG DỤNG NGƯỜI DÙNG (CLIENT APPS)"]
        Web["🌐 Web Client (Next.js 16)<br/>React 19, Tailwind CSS, TanStack Query"]
        Mobile["📱 Mobile App (React Native Expo)<br/>Expo SDK 52, TypeScript, Reanimated"]
        AdminWeb["👑 Admin Portal (Next.js 16)<br/>Dashboard Quản trị BQT & Kiểm duyệt"]
    end

    subgraph Gateway["TẦNG GIAO TIẾP & BẢO MẬT (GATEWAY & SECURITY)"]
        REST["REST API Endpoints (/api/*)<br/>Express Rate Limit, Helmet, Zod Validate"]
        SocketGateway["WebSocket Gateway<br/>Socket.io Server (JWT Handshake)"]
    end

    subgraph BackendCore["TẦNG NGHIỆP VỤ LÕI (MODULAR BACKEND SERVICES)"]
        AuthSvc["Auth & KYC Service<br/>(Dual Token, Bcrypt, Google SSO, Phone, OTP)"]
        PostSvc["Product Catalog Service<br/>(Meilisearch Suggest, Redis Trends, Categories)"]
        OrderSvc["Order & Escrow Service<br/>(COD, PayOS, VietQR, QR Handshake)"]
        ChatSvc["Chat & Bargain Service<br/>(P2P Negotiation, Safe-Points, Presence)"]
        AISvc["Gemini AI Engine<br/>(Vision 1.5 Flash, Chatbot, OCR Scan)"]
        GamifySvc["Gamification & Cron Service<br/>(Campus Coin, Vouchers, 3 Node-Cron Jobs)"]
    end

    subgraph StorageServices["TẦNG LƯU TRỮ & DỊCH VỤ NGOẠI VI"]
        Mongo[("🍃 MongoDB Atlas<br/>(Prisma ORM Models & Enums)")]
        Redis[("⚡ Redis 7 Cache & Lock<br/>(Geo SafeHandoff, Redlock, Rate Limit, ZSET)")]
        Meili["🔍 Meilisearch Engine<br/>(Autocomplete & Fulltext Typo-tolerant)"]
        FCM["🔥 Firebase Cloud Messaging<br/>(Push Notification Mobile)"]
        PayOS["💳 Cổng PayOS / VietQR<br/>(Thanh toán Escrow giữ tiền đảm bảo)"]
    end

    Web -->|HTTPS / REST| REST
    AdminWeb -->|HTTPS / REST| REST
    Mobile -->|HTTPS / REST| REST
    Web -.->|WSS / Socket.io| SocketGateway
    Mobile -.->|WSS / Socket.io| SocketGateway

    REST --> AuthSvc
    REST --> PostSvc
    REST --> OrderSvc
    REST --> AISvc
    REST --> GamifySvc
    SocketGateway --> ChatSvc

    AuthSvc --> Mongo
    PostSvc --> Mongo
    PostSvc --> Redis
    PostSvc --> Meili
    OrderSvc --> Mongo
    OrderSvc --> Redis
    OrderSvc --> PayOS
    ChatSvc --> Mongo
    ChatSvc --> SocketGateway
    GamifySvc --> Redis
    OrderSvc --> FCM
    ChatSvc --> FCM
```

### 3.2. Ngăn xếp công nghệ chi tiết (Full Tech Stack)

#### A. Frontend Web & Admin Portal
* **Framework:** Next.js 16 (App Router, Turbopack, React 19).
* **Ngôn ngữ:** TypeScript (`strict: true`).
* **Styling & Icons:** Tailwind CSS, Lucide React Icons.
* **Quản trị dữ liệu & Cache:** TanStack Query v5 (Prefetching, Optimistic Updates).
* **Quản lý trạng thái:** Zustand (Auth Store, Filter Store).
* **Giao tiếp thời gian thực:** `socket.io-client`.

#### B. Mobile Application (iOS & Android)
* **Framework:** React Native, Expo SDK 52 (Managed Workflow).
* **Ngôn ngữ:** TypeScript (Type-safe 100%).
* **Điều hướng:** React Navigation v7 (Native Stack Navigator & Bottom Tabs Navigator).
* **Hiệu năng & Trải nghiệm:**
  - `@gorhom/bottom-sheet` v4 (Modal trượt chuẩn native).
  - `expo-image` (Bộ nhớ đệm ảnh đa tầng, blurhash).
  - `react-native-reanimated` v3 (Hiệu ứng chuyển cảnh mượt mà 60fps).
* **Bảo mật lưu trữ:** `@react-native-async-storage/async-storage` kết hợp Expo SecureStore.
* **Push Notification & SSO:** Firebase Cloud Messaging (FCM) & Google Sign-In.

#### C. Backend Server & Dịch vụ Nền tảng
* **Nền tảng:** Node.js, Express.js (Kiến trúc Modular Monolith Clean Architecture).
* **ORM & Cơ sở dữ liệu:** **Prisma ORM** kết nối cơ sở dữ liệu **MongoDB Atlas**.
* **Bộ nhớ đệm & Phân tán:** **Redis 7** (Cache danh mục, Rate limiting, Redis ZSET trending, Redis Geospatial tìm trạm Safe-Handoff, Redlock).
* **Tìm kiếm:** **Meilisearch Engine** (`/api/products/suggest`, fulltext search có typo tolerance) + MongoDB regex fallback.
* **Trí tuệ nhân tạo (AI):** `@google/generative-ai` (Google Gemini 1.5 Flash Vision & Chatbot).
* **Thời gian thực:** Socket.io Server v4 gắn trực tiếp HTTP Server.
* **Lập lịch tác vụ (Cron Jobs):** `node-cron` vận hành **3 tác vụ ngầm tự động**:
  1. `expire-products.cron.ts`: Quét ngày 27 nhắc gia hạn, quét ngày 30 ẩn tin hết hạn.
  2. `escrow-auto-release.cron.ts`: Tự động giải ngân tiền Escrow khi hết hạn bao test mà không có khiếu nại.
  3. `expire-pending-orders.cron.ts`: Tự động hủy đơn hàng quá hạn thanh toán.
* **Lưu trữ & Xử lý media:** **Cloudflare R2 Object Storage** (thông qua `@aws-sdk/client-s3`) kết hợp thư viện `sharp` nén ảnh WebP, xác thực Magic Bytes chống mã độc; riêng ảnh thẻ sinh viên KYC được bảo mật qua Private Media Streaming Route (`/api/profile/kyc/card/:filename`).

---

## 4. MÔ HÌNH DỮ LIỆU & THIẾT KẾ CƠ SỞ DỮ LIỆU

Hệ thống được thiết kế theo mô hình thực thể quan hệ linh hoạt trên MongoDB Atlas thông qua Prisma Schema:

```text
┌──────────────┐         1:1         ┌───────────────────┐
│     User     │ ─────────────────── │      Profile      │
│  (Auth/Role) │                     │ (KYC/Coins/Score) │
└──────┬───────┘                     └───────────────────┘
       │ 1:N
       ├────────────────────────┬────────────────────────┬────────────────────────┐
       ▼                        ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Product    │         │    Order     │         │ Conversation │         │ UserVoucher  │
│ (Post/Price) │         │ (Escrow/COD) │         │(Chat/Members)│         │(Barcode/QR)  │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘         └──────────────┘
       │                        │                        │
       ▼ 1:N                    ▼ 1:N                    ▼ 1:N
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ ProductImage │         │    Review    │         │   Message    │
│    (WebP)    │         │(Instant Pub) │         │(Text/Offer/Loc)
└──────────────┘         └──────────────┘         └──────────────┘
```

### Các bảng dữ liệu trọng yếu:

1. **User & Profile:** Lưu trữ thông tin đăng nhập, vai trò (`UNVERIFIED`, `BUYER`, `SELLER`, `ADMIN`), trạng thái KYC sinh viên (`studentId`, `cardImageUrl`, `kycStatus: PENDING | APPROVED | REJECTED`), số dư **Campus Coins**, điểm uy tín **Reputation Score**, huy hiệu `avatarBadge`, embedded `kyc` và `bankAccount`.
2. **Product:** Lưu tiêu đề, mô tả, giá, danh mục (`DORM_ITEM`, `BOOKS`, `ELECTRONICS`, `VEHICLE`, `CLOTHING`, `OTHER`), tình trạng đồ (`NEW_100`, `LIKE_NEW_99`, `USED_GOOD`, `USED_FAIR`), cơ sở Campus (`HOL`, `HCM`, `DAD`, `CT`, `QN`), trạng thái bài (`PENDING_APPROVAL`, `AVAILABLE`, `RESERVED`, `SOLD`, `HIDDEN`, `EXPIRED`, `REJECTED`).
3. **Order:** Quản lý giao dịch, hình thức (`MEETUP` hoặc `SHIP_COD`), địa điểm hẹn Safe-Point, mã đối soát QR Handshake (HMAC token & OTP 4 số), thời hạn bao test (24h - 48h), trạng thái (`PENDING`, `PAID`, `SHIPPING`, `DELIVERED`, `COMPLETED`, `DISPUTED`, `CANCELLED`).
4. **Conversation & Message:** Lưu cuộc trò chuyện giữa người mua và người bán, các tin nhắn đa phương thức: văn bản (`TEXT`), hình ảnh (`IMAGE`), đề xuất mặc cả (`OFFER_PRICE`), điểm hẹn (`MEETUP_LOCATION`).
5. **Review:** Lưu trữ đánh giá minh bạch công khai tức thì (Instant Public Review) kèm số sao, nhận xét và link video test sản phẩm, tự động cập nhật điểm uy tín theo thời gian thực.
6. **Voucher & UserVoucher:** Quản lý kho voucher liên kết (Căn tin, Passio Coffee, 7-Eleven) và mã QR voucher đã đổi dùng một lần của sinh viên.
7. **SafeHandoffHub:** Lưu danh mục trạm giao dịch an toàn tại các Campus hỗ trợ truy vấn trạm gần nhất qua Redis Geospatial.
8. **DailyCheckIn & Quest:** Ghi nhận chuỗi ngày điểm danh (+20 Xu) và tiến độ nhận thưởng nhiệm vụ tuần.

---

## 5. ĐẶC TẢ CÁC PHÂN HỆ CHỨC NĂNG CỐT LÕI TRÊN WEB & MOBILE

| STT | Phân hệ chức năng | Chức năng trên Web (Next.js 16) | Chức năng trên Mobile (React Native) |
| :---: | :--- | :--- | :--- |
| **1** | **Xác thực & KYC Sinh viên** | • Đăng ký nhận OTP qua Email FPT.<br>• Google SSO OAuth 2.0 & Đăng nhập SĐT.<br>• Upload thẻ SV xem preview trực tiếp.<br>• Stream media bảo mật `/api/profile/kyc/card/:filename`. | • Đăng ký nhận OTP Email FPT.<br>• Google Sign-In Native.<br>• Chụp ảnh thẻ SV trực tiếp bằng Camera.<br>• Nhận diện Campus theo sinh viên. |
| **2** | **Đăng tin & AI Vision** | • Đăng tin bài bán hàng chi tiết.<br>• Nút "Tạo tin bằng AI Gemini 1.5": Tải ảnh lên và tự điền form trong 3s.<br>• Quản lý trạng thái duyệt bài BQT. | • Bottom-sheet Đăng nhanh tiện lợi.<br>• Chọn ảnh từ thư viện hoặc chụp camera.<br>• Nút "AI Scan Đồ Vật": Phân tích ảnh trực tiếp qua Gemini API trên máy. |
| **3** | **Khám phá & Bộ lọc sản phẩm** | • Thanh tìm kiếm Header với gợi ý autocomplete Meilisearch.<br>• Bộ lọc đa chiều: Campus, Danh mục, Khoảng giá, Tình trạng đồ.<br>• Bảng từ khóa Hot Trending Redis ZSET. | • Dải chip cuộn ngang từ khóa Hot Trends.<br>• Bộ lọc Drawer trượt nhanh theo Campus.<br>• Danh sách cuộn vô tận tối ưu FlatList memoization. |
| **4** | **Quản lý Tin & Đẩy bài (Seller)** | • Quản lý danh sách bài đang bán, đã bán.<br>• Modal Đẩy tin Bump (100 Xu), Ghim VIP (300 Xu), Gia hạn 30 ngày. | • Màn hình quản lý tin đăng mượt mà.<br>• Modal BoostProductModal tích hợp trừ Xu tự động và liên kết nạp VietQR. |
| **5** | **Giao dịch & Đơn hàng (Order)** | • Giỏ hàng & Thanh toán Checkout.<br>• Tạo link thanh toán PayOS Web URL / VietQR Napas.<br>• Hiển thị mã QR Handshake kèm OTP 4 số.<br>• Modal Hủy đơn hoàn Xu/Voucher tự động. | • Màn hình CheckoutScreen tính phí linh hoạt.<br>• Hiển thị mã QR Handshake kèm bộ đếm ngược.<br>• Camera quét mã QR người bán khi nhận hàng.<br>• Modal Hủy đơn phân theo vai trò. |
| **6** | **Tranh chấp & Khiếu nại (Dispute)**| • Mở khiếu nại trong thời hạn bao test 24h-48h.<br>• Tải video bằng chứng lỗi khui hộp.<br>• BQT Admin can thiệp đóng băng tiền cọc.<br>• Rút đơn khiếu nại nếu 2 bên hòa giải. | • Cảnh báo trực quan đơn hàng đang tranh chấp.<br>• Modal cho phép người mua rút đơn nhanh khi đã được đền bù. |
| **7** | **Trung tâm Cá nhân & Báo cáo** | • Quản lý hồ sơ cá nhân, đổi mật khẩu.<br>• Lịch sử các đơn tố cáo vi phạm.<br>• Điểm danh nhận Xu hàng ngày, làm nhiệm vụ tuần.<br>• Kho Voucher và yêu cầu rút tiền mặt về STK. | • Màn hình ProfileScreen chuẩn Thumb Zone.<br>• Điểm danh nhận Xu hàng ngày 1 chạm.<br>• Modal theo dõi trạng thái xử lý tố cáo từ Admin. |

---

## 6. HẠ TẦNG REALTIME, GEMINI AI & THÔNG BÁO ĐA KÊNH

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Người Mua (Sinh viên)
    participant ClientApp as Web / Mobile App
    participant SocketServer as Socket.io Server Gateway
    participant AIService as Gemini 1.5 Flash AI
    actor Seller as Người Bán (Sinh viên)

    Note over Buyer, Seller: LUỒNG 1: TRỢ LÝ AI QUÉT ẢNH TẠO BÀI ĐĂNG
    Seller->>ClientApp: Tải ảnh đồ cần thanh lý (Tủ lạnh, Sách, Quạt...)
    ClientApp->>AIService: POST /api/ai/vision-post (Buffer ảnh)
    AIService-->>ClientApp: Trả về JSON: Tiêu đề, Danh mục, Giá gợi ý, Tình trạng, Hashtags
    ClientApp-->>Seller: Tự động điền hoàn tất Form đăng bài trong 3 giây

    Note over Buyer, Seller: LUỒNG 2: REALTIME CHAT & MẶC CẢ GIÁ P2P
    Buyer->>SocketServer: emit('send_offer_price', { conversationId, offerPrice: 150000 })
    SocketServer->>Seller: emit('receive_message', savedMessage) (Loại OFFER_PRICE)
    Seller->>SocketServer: emit('send_meetup_location', { conversationId, meetupLocation: 'Trạm Safe-Handoff Sảnh Alpha' })
    SocketServer-->>Buyer: emit('receive_message', savedMessage) (Loại MEETUP_LOCATION)
    Buyer->>SocketServer: emit('typing', { conversationId })
    SocketServer-->>Seller: emit('user_typing', { userId, conversationId })
    Buyer->>SocketServer: emit('message_read', { conversationId })
    SocketServer-->>Seller: emit('messages_marked_read', { conversationId, readBy: buyerId })
```

### 6.1. Hạ tầng Chat thời gian thực & Mặc cả giá (Socket.io Gateway)
* **Kết nối bảo mật:** Xác thực Token JWT ngay tại bước bắt tay (Handshake).
* **Quản lý phòng chat:** Mỗi giao dịch là một Room `conversation_${id}`, tự động lưu tin nhắn vào MongoDB và cập nhật trạng thái "Đã xem".
* **Phím tắt Mặc cả giá (`send_offer_price`):** Người mua gửi đề xuất giá mới (chặn nếu mức trả lời $< 50\%$ giá gốc).
* **Gợi ý điểm hẹn Safe-Point (`send_meetup_location`):** Tích hợp sẵn danh sách các trạm an toàn tại trường (Sảnh Tòa Alpha, Căn tin, Thư viện, KTX).
* **Trạng thái Presence:** Hỗ trợ truy vấn trạng thái online/offline danh sách người dùng qua socket `check_presence` và REST `/api/presence`.

### 6.2. Ứng dụng Trí tuệ nhân tạo (Google Gemini 1.5 Flash)
* **Gemini 1.5 Flash Vision:** Phân tích ảnh món đồ cũ sinh viên trong 3 giây, điền đầy đủ tiêu đề, danh mục, tình trạng, đề xuất giá pass hợp lý.
* **Chatbot Tìm Đồ Phòng Trọ (`/api/ai/assistant-chat`):** Tư vấn sản phẩm tự nhiên theo ngôn ngữ sinh viên, lọc đúng ngân sách và campus.

### 6.3. Động cơ Thông báo Đa kênh (Multi-Channel Notification)
* **Mobile Push Notification (Firebase Cloud Messaging - FCM):** Gửi thông báo đẩy về máy người dùng khi có tin nhắn mới, đơn hàng mới, duyệt thẻ SV, cập nhật trạng thái đơn.
* **Web Push VAPID:** Cung cấp khóa VAPID cho trình duyệt web nhận thông báo ngay cả khi không mở tab.
* **Email giao dịch (Nodemailer SMTP):** Gửi mã xác thực OTP đăng ký tài khoản, biên lai thanh toán và cảnh báo bài đăng sắp hết hạn ngày 27.

---

## 7. QUY TRÌNH GIAO DỊCH AN TOÀN, THANH TOÁN ESCROW & GAMIFICATION

### 7.1. Giao dịch Trực tiếp tại Trường (Safe-Handoff & QR Handshake)
1. **Đặt đơn & Giữ cọc:** Người mua đặt hàng, chọn điểm hẹn trạm Safe-Handoff Hub. Tiền cọc được hệ thống tạm giữ an toàn trong tài khoản trung gian (Escrow qua PayOS hoặc VietQR Napas).
2. **Gặp mặt kiểm tra:** Hai bên gặp nhau tại trạm Safe-Handoff có camera an ninh giám sát. Người mua kiểm tra thực tế đồ dùng.
3. **Quét mã QR Handshake:**
   - Ứng dụng người bán hiển thị **mã QR động** (được mã hóa bằng thuật toán `HMAC-SHA256` kèm mã bí mật OTP 4 số dự phòng).
   - Người mua dùng camera trên ứng dụng quét mã QR (`POST /api/orders/:id/handshake`).
   - Hệ thống xác nhận giao dịch thành công $\rightarrow$ Kích hoạt 24h Bao test.

### 7.2. Giao dịch Giao hàng (Ship COD & Bao test 24h - 48h)
* Cho phép sinh viên giao hàng giữa các khu trọ xa trường qua bưu cục GHTK / GHN.
* Người mua nhận hàng, kiểm tra cùng Shipper rồi thanh toán tiền cho Shipper.
* Webhook đối soát vận chuyển kích hoạt thời hạn **Bao test 48 giờ**.
* Hết thời hạn bao test mà không có khiếu nại $\rightarrow$ Cron job `escrow-auto-release.cron.ts` tự động giải ngân tiền cho người bán.

### 7.3. Gamification: Campus Coin & Đánh giá công khai tức thì
* **Đánh giá công khai tức thì (Instant Public Review):** Đánh giá được công khai ngay lập tức (`isPublic = true`) ngay khi gửi sau khi hoàn tất đơn hàng, đồng thời cộng/trừ điểm uy tín (`reputationScore`) và thưởng Campus Coin trong cùng transaction. Người dùng có thể chủ động ẩn/hiện đánh giá trên trang cá nhân (`/api/reviews/:id/toggle-public`).
* **Tặng Xu thưởng (Campus Coin):**
  - Điểm danh mỗi ngày: **+20 Xu**.
  - Đánh giá text/ảnh: **+100 Xu**; đính kèm video test: **+200 Xu** và `+2` điểm uy tín.
  - Người bán nhận đánh giá 5 sao: **+5** điểm uy tín.
* **Tiện ích của Campus Coin:**
  - Đẩy bài lên đầu trang (Bump: 100 Xu) hoặc Ghim tin VIP 24h (Pin: 300 Xu).
  - Khấu trừ trực tiếp vào đơn hàng (1 Xu = 1 VNĐ, tối đa 10% - 20%).
  - Mua Khung avatar / Huy hiệu cá nhân (`TOP_SELLER`, `K18_VERIFIED`).
  - Đổi Voucher Căn tin, Passio Coffee, 7-Eleven (`/api/vouchers/:id/redeem`).
  - Rút tiền mặt về tài khoản ngân hàng (`/api/profile/withdrawals`).

---

## 8. ĐẢM BẢO CHẤT LƯỢNG PHẦN MỀM, TỐI ƯU HIỆU NĂNG & BẢO MẬT

### 8.1. Kiểm định chất lượng mã nguồn Mobile (React Doctor Audit: 100/100)
* **TypeScript Type Safety:** Đạt kết quả **0 lỗi** (`npx tsc --noEmit` đạt Exit Code 0).
* **React Doctor Audit:** Đạt điểm tuyệt đối **100 / 100 Great** (`0 issues`, `0 warnings`).
* **Kỹ thuật tối ưu hóa áp dụng trên Mobile:**
  - Khử hoàn toàn các hàm ẩn danh inline props trong `React.memo`.
  - Phân rã triệt để các màn hình phức tạp thành các Sub-components độc lập.
  - Sử dụng `useCallback` cho `renderItem` và `keyExtractor` trong FlatList giúp cuộn danh sách đạt 60fps mượt mà.
  - Bố cục giao diện tuân thủ nguyên tắc **Thumb Zone** và Safe Area Insets.

### 8.2. Bảo mật hệ thống & Chống Race Condition
* **Distributed Lock với Redis (Redlock):** Đảm bảo tại một thời điểm chỉ có 1 người mua duy nhất có thể đặt mua một món đồ độc bản, loại bỏ hoàn toàn nguy cơ Race Condition.
* **Xác thực chữ ký HMAC cho Webhooks:** Bảo vệ 100% các route Webhook từ PayOS, GHTK, GHN bằng Buffer `rawBody` và Signature verification.
* **Bảo vệ chống Brute-force:** Áp dụng Express Rate Limit phân cấp trên các đầu API nhạy cảm.
* **Bảo mật kép Dual Token:** Access Token (15 phút), Refresh Token (30 ngày) được lưu trữ an toàn trong `HttpOnly Secure Cookie` (Web) và `SecureStore` (Mobile).

---

## 9. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY HỆ THỐNG

### 9.1. Khởi chạy Backend Server
```bash
# Di chuyển vào thư mục backend và cài đặt dependencies
cd backend
npm install

# Khởi chạy Prisma & nạp dữ liệu mẫu
npx prisma generate
npx prisma db seed

# Chạy Backend ở chế độ Development (Port 5000)
npm run dev
```

### 9.2. Khởi chạy Ứng dụng Web (Frontend)
```bash
# Di chuyển vào thư mục frontend và cài đặt dependencies
cd ../frontend
npm install

# Khởi chạy Next.js Development Server (Port 3000)
npm run dev
```

### 9.3. Khởi chạy Ứng dụng Di động (Mobile App)
```bash
# Di chuyển vào thư mục mobile và cài đặt dependencies
cd ../mobile
npm install

# Khởi chạy Expo Metro Bundler
npx expo start
# Quét mã QR bằng ứng dụng Expo Go trên điện thoại Android/iOS
```

### 9.4. Bảng tài khoản thử nghiệm có sẵn trong hệ thống (Test Accounts)

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn & Trạng thái |
| :--- | :--- | :--- | :--- |
| **Người bán (Seller)** | `seller@fpt.edu.vn` | `Password123@` | ✅ Đã duyệt KYC thẻ SV, Huy hiệu TOP_SELLER, Có sẵn 1.000 Xu |
| **Người mua (Buyer)** | `buyer@fpt.edu.vn` | `Password123@` | ✅ Đã duyệt KYC thẻ SV, Có sẵn 500 Xu |
| **Sinh viên Demo K17** | `namntk17@fe.edu.vn` | `Password123@` | ✅ Đã duyệt KYC thẻ SV (MSSV: SE172819) |
| **Quản trị viên (Admin)** | `admin@fpt.edu.vn` | `AdminPassword123@` | 👑 Toàn quyền BQT hệ thống, duyệt KYC và xử lý tranh chấp |

---

## 10. ĐÁNH GIÁ KẾT QUẢ & ĐỊNH HƯỚNG PHÁT TRIỂN TƯƠNG LAI

### 10.1. Kết quả đạt được
1. **Hoàn thành 100% mục tiêu đồ án:** Xây dựng thành công hệ sinh thái hoàn chỉnh gồm **Web App Next.js 16**, **Mobile App Expo SDK 52** và **Backend Server Prisma MongoDB**.
2. **Giải quyết triệt để bài toán thực tế:** Cung cấp sân chơi mua bán đồ cũ an toàn, văn minh cho sinh viên Đại học FPT với cơ chế định danh thẻ SV, trạm an toàn Safe-Handoff và bảo đảm tiền cọc Escrow qua PayOS / VietQR.
3. **Ứng dụng công nghệ hiện đại:** Tích hợp thành công **Trí tuệ nhân tạo Gemini 1.5 Flash**, Realtime WebSocket Socket.io, Meilisearch Engine, Redis 7 distributed caching và đạt điểm kiểm định mã nguồn React Doctor tuyệt đối **100/100**.
4. **Phối hợp nhóm 2 người hiệu quả:** Phân chia công việc cân đối, độc lập về mặt phát triển nhưng đồng bộ cao về mặt tích hợp API và chuẩn dữ liệu.

### 10.2. Định hướng phát triển tương lai
* **Mở rộng AI Chatbot:** Tích hợp RAG (Retrieval-Augmented Generation) để chatbot tự động tư vấn, so sánh cấu hình máy tính cũ, giá thuê phòng trọ quanh các campus.
* **Mở rộng liên kết thanh toán:** Tích hợp thêm ví điện tử Apple Pay, Google Pay và VNPay.
* **Nhân rộng mô hình:** Mở rộng áp dụng cho toàn bộ khối giáo dục FPT Education (FPT Polytechnic, Swinburne Vietnam, Greenwich Vietnam).

---

*Báo cáo được hoàn thành vào tháng 10 năm 2026 bởi Nhóm phát triển Campus Marketplace.*
