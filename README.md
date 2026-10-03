# 🎓 CAMPUS MARKETPLACE - HỆ THỐNG TRAO ĐỔI & THƯƠNG MẠI ĐIỆN TỬ SINH VIÊN
> **Tài liệu đặc tả kiến trúc kỹ thuật, quy chuẩn hệ thống & lộ trình phát triển toàn diện**

---

## 📑 MỤC LỤC
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống tổng thể](#2-kiến-trúc-hệ-thống-tổng-thể)
3. [Ngăn xếp công nghệ (Tech Stack)](#3-ngăn-xếp-công-nghệ-tech-stack)
4. [Cấu trúc dự án & Tổ chức mã nguồn](#4-cấu-trúc-dự-án--tổ-chức-mã-nguồn)
5. [Cơ chế Xác thực Thẻ Sinh viên & Phân tầng Người bán](#5-cơ-chế-xác-thực-thẻ-sinh-viên--phân-tầng-người-bán)
6. [Đặc tả Danh mục Sản phẩm Cốt lõi](#6-đặc-tả-danh-mục-sản-phẩm-cốt-lõi)
7. [Quy trình Đăng Bán Đồ (AI Quick Post & 5 Bước Đăng Chuẩn)](#7-quy-trình-đăng-bán-đồ-ai-quick-post--5-bước-đăng-chuẩn)
8. [Phân hệ Tin nhắn Thời gian thực & Phím tắt Mua Bán (P2P Chat)](#8-phân-hệ-tin-nhắn-thời-gian-thực--phím-tắt-mua-bán-p2p-chat)
9. [Cơ chế Đánh Giá 2 Chiều & Hệ thống Phần Thưởng (Campus Coin & Karma)](#9-cơ-chế-đánh-giá-2-chiều--hệ-thống-phần-thưởng-campus-coin--karma)
10. [Phân hệ Trợ lý Thông minh AI (Campus AI Assistant)](#10-phân-hệ-trợ-lý-thông-minh-ai-campus-ai-assistant)
11. [Quy chế Tự động Hết hạn & Gỡ tin sau 30 ngày (Auto-Expire)](#11-quy-chế-tự-động-hết-hạn--gỡ-tin-sau-30-ngày-auto-expire)
12. [Phương Thức Mua Hàng & Thanh Toán (Nhận Hàng Rồi Mới Trả Tiền / COD)](#12-phương-thức-mua-hàng--thanh-toán-nhận-hàng-rồi-mới-trả-tiền--cod)
13. [Quy trình Pass Đồ, Bao Test 24h-48h & Đổi Trả / Khiếu Nại](#13-quy-trình-pass-đồ-bao-test-24h-48h--đổi-trả--khiếu-nại)
14. [Kiến trúc Thông báo Đa kênh (Multi-Channel Notification)](#14-kiến-trúc-thông-báo-đa-kênh-multi-channel-notification)
15. [Quy chuẩn kỹ thuật & Tối ưu hóa hiệu năng](#15-quy-chuẩn-kỹ-thuật--tối-ưu-hóa-hiệu-năng)
16. [Lộ trình triển khai (Roadmap)](#16-lộ-trình-triển-khai-roadmap)
17. [Hướng dẫn cài đặt & Khởi chạy](#17-hướng-dẫn-cài-đặt--khởi-chạy)

---

## 1. TỔNG QUAN DỰ ÁN

* **Tên dự án:** Campus Marketplace
* **Mô hình hoạt động:** Sàn thương mại điện tử P2P (Peer-to-Peer) nội bộ kết hợp **Trợ lý AI thông minh**, **Giao dịch Trực tiếp & Ship COD nhận hàng mới trả tiền**, **Hệ thống thưởng Gamification (Campus Coin)** dành cho sinh viên, giảng viên và cựu sinh viên.
* **Vấn đề giải quyết:**
  * Sinh viên có nhu cầu thanh lý / mua lại **đồ gia dụng phòng trọ & KTX** (tủ lạnh mini, quạt điện, bếp từ, bàn ghế, nệm), **sách đọc / truyện / sách kỹ năng & ngoại ngữ**, **đồ công nghệ / phụ kiện** và **xe cộ, đồ dùng sinh hoạt**.
  * Các kênh truyền thống (Facebook Group, Chợ Tốt) thường xuyên gặp tình trạng **scam cọc, đồ hỏng giấu lỗi, tin ảo treo mãi không gỡ, spam tin quảng cáo**.
  * Cung cấp giải pháp xác thực danh tính sinh viên bằng Thẻ Sinh viên (MSSV, Campus), thanh toán VietQR động, cơ chế QR Handshake xác nhận gặp mặt trực tiếp, **tùy chọn Ship COD nhận hàng đồng kiểm tra rồi mới trả tiền cho Shipper**, **chính sách bao test 24h-48h & đổi trả minh bạch**, **tự động gỡ tin quá hạn sau 30 ngày**, **thưởng Xu sinh viên khi đánh giá** và **thông báo đẩy FCM & Email**.

---

## 2. KIẾN TRÚC HỆ THỐNG TỔNG THỂ

Hệ thống tuân thủ nghiêm ngặt nguyên tắc **Tách biệt giao diện và nghiệp vụ (Headless / Decoupled)**:

```text
                                  CAMPUS MARKETPLACE
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
 ┌───────────────┐                 ┌───────────────┐                 ┌───────────────┐
 │    WEB APP    │                 │   MOBILE APP  │                 │   ADMIN WEB   │
 │    Next.js    │                 │  React Native │                 │    Next.js    │
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
                       │       (Modular Monolith Pattern)      │
                       │   + AI Engine (Google Gemini API)     │
                       │   + Multi-Channel Notification Engine │
                       │     (Firebase FCM + Nodemailer SMTP)  │
                       │   + Webhook Receiver (GHTK/GHN)       │
                       │   + Cron Job Auto-Expire (30d)        │
                       └───────────────────┬───────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
  ┌──────────────┐                  ┌──────────────┐                  ┌─────────────┐
  │MongoDB Atlas │                  │ Redis Cache  │                  │ Cloudinary  │
  │ (Dữ liệu gốc)│                  │(Session/Cache│                  │(Media/Ảnh)  │
  └──────────────┘                  └──────────────┘                  └─────────────┘
```

---

## 3. NGĂN XẾP CÔNG NGHỆ (TECH STACK)

### 🌐 Frontend Web & Admin Portal
* **Framework:** Next.js (App Router, TypeScript).
* **Styling:** Tailwind CSS, Lucide React (Icons).
* **Quản lý dữ liệu:** TanStack Query v5 (Caching, Automatic Refetch, Optimistic UI).
* **Quản lý trạng thái:** Zustand (Global State: Giỏ hàng, Auth, Bộ lọc).
* **Real-time:** Socket.io-client.

### 📱 Mobile App (iOS / Android)
* **Framework:** React Native / Expo (TypeScript, Expo SDK 52).
* **Điều hướng:** React Navigation (Native Stack & Bottom Tabs).
* **Giao diện & Hiệu năng:** `@gorhom/bottom-sheet`, `expo-image` (cache ảnh), `expo-image-picker`, `react-native-reanimated`.
* **Bảo mật cục bộ:** Expo SecureStore (Lưu trữ Token an toàn).
* **Push Notification:** `@react-native-firebase/messaging` / Expo Notifications (FCM).
* **Real-time:** Socket.io-client.

### ⚙️ Backend Server & Notification Engine
* **Nền tảng:** Node.js, Express.js (Kiến trúc Modular Monolith).
* **Trí tuệ nhân tạo (AI):** **Google Gemini API** (`@google/generative-ai`) hỗ trợ Vision AI phân tích ảnh và Function Calling tra cứu sản phẩm.
* **Thông báo Đa kênh:** **Firebase Admin SDK** (Push FCM) & **Nodemailer** (SMTP gửi Email giao dịch, duyệt thẻ SV).
* **Vận chuyển & Webhook:** Nhận Webhook từ GHTK / GHN đối soát tiền COD và trạng thái `DELIVERED`.
* **Cơ sở dữ liệu:** MongoDB Atlas (Mongoose ODM).
* **Bộ nhớ đệm & Cron Job:** Redis, Node-Cron (Tự động quét và gỡ bài sau 30 ngày).
* **Lưu trữ tệp & ảnh:** Cloudinary SDK (Upload, tự động resize và tối ưu ảnh thẻ SV / sản phẩm).
* **Bảo mật:** JWT (Access + Refresh Token), Zod (Validation), Helmet, Express Rate Limit, Bcryptjs.
* **Giao tiếp Realtime:** Socket.io.

---

## 4. CẤU TRÚC DỰ ÁN & TỔ CHỨC MÃ NGUỒN

```text
fu-student-secondhand-market/
│
├── backend/                         # ⚙️ Express Backend (Modular Monolith)
│   ├── src/
│   │   ├── config/                  # database.ts, redis.ts, cloudinary.ts, ai.ts, firebase.ts, mail.ts, env.ts
│   │   ├── constants/               # campus.enum.ts, post-status.enum.ts, category.enum.ts
│   │   ├── middlewares/             # auth, role, validate, rateLimit, error
│   │   ├── modules/                 # Các module tính năng độc lập
│   │   │   ├── auth/                # Đăng ký, Đăng nhập (Google / SĐT / Email), JWT refresh
│   │   │   ├── users/               # Profile, Điểm uy tín, Thẻ SV, Số dư Xu Campus Coin
│   │   │   ├── products/            # Quản lý tin đăng bán, lọc Campus, Danh mục, Auto-expire
│   │   │   ├── categories/          # Danh mục đồ gia dụng, sách, công nghệ, đồ trọ...
│   │   │   ├── orders/              # Đơn hàng, lịch sử mua bán, VietQR, QR Handshake, COD & Khiếu nại
│   │   │   ├── reviews/             # Đánh giá 2 chiều, chấm sao, tặng Xu Campus Coin
│   │   │   ├── chats/               # Chat 1-1, deal giá, hẹn điểm gặp
│   │   │   ├── ai/                  # Module Trợ lý AI (Tìm đồ trọ, Vision tạo bài đăng)
│   │   │   ├── reports/             # Báo cáo vi phạm, lừa đảo, tranh chấp đổi trả
│   │   │   └── notifications/       # Multi-Channel: Push FCM, Nodemailer Email, In-App
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                        # 🌐 Next.js Web App & Admin Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/              # Login, Register, Verify-Student
│   │   │   ├── (main)/              # Home, Posts, CreatePost, Chat, Profile, Orders, Notifications, AI-Chatbot
│   │   │   └── (admin)/             # Dashboard, Duyệt Thẻ SV, Xử lý khiếu nại đổi trả
│   │   ├── components/              # ui/, product/, chat/, order/, review/, ai/, notification/
│   │   ├── hooks/                   # useAuth, useSocket, useDebounce
│   │   ├── services/                # Axios API services
│   │   ├── stores/                  # Zustand stores
│   │   └── types/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/                          # 📱 React Native Mobile App (Expo SDK 52)
    ├── src/
    │   ├── api/                     # Axios client + Interceptors
    │   ├── components/              # PostCard, BottomSheet, ImagePicker, AIChatModal, NotiBadge
    │   ├── navigation/              # RootNavigator, TabNavigator
    │   ├── screens/                 # Auth, Home, PostDetail, CreatePost, Chat, ReviewScreen, OrderDetail, NotificationScreen
    │   ├── stores/                  # Zustand stores
    │   └── types/
    ├── app.json
    ├── babel.config.js
    ├── package.json
    └── tsconfig.json
```

---

## 5. CƠ CHẾ XÁC THỰC DANH TÍNH & QUY CHẾ PHÂN QUYỀN BÁN HÀNG (STRICT SELLER POLICY)

Nhằm loại bỏ triệt để tình trạng lừa đảo cọc, hàng giả mạo và bảo vệ an toàn tuyệt đối cho sinh viên 5 Campus, hệ thống áp dụng cơ chế phân quyền nghiêm ngặt: **Sinh viên thông thường chỉ có quyền MUA, tuyệt đối KHÔNG ĐƯỢC BÁN khi chưa hoàn tất hồ sơ Seller Onboarding**.

```text
               ┌──────────────────────────────────────────────────┐
               │              NGƯỜI DÙNG ĐĂNG KÝ                  │
               │        (Bằng Google / Email cá nhân / SĐT)       │
               └────────────────────────┬─────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        [CẤP 1: TÀI KHOẢN VÃNG LAI]           [CẤP 2: SINH VIÊN XÁC THỰC (BUYER)]
        (Role: UNVERIFIED)                    (Role: BUYER - Đã nộp Thẻ Sinh Viên)
                    │                                       │
        - Xem danh sách sản phẩm              ┌─────────────┴─────────────┐
        - Không được chat P2P                 ▼                           ▼
        - Không được đặt mua             QUYỀN MUA HÀNG:             QUYỀN BÁN HÀNG:
        - Không được bán                 - Nhắn tin P2P              ⛔ BỊ KHÓA HOÀN TOÀN
                                         - Đặt mua Escrow 48h        - Không được vào /create-post
                                         - Quét QR Safe-Handoff      - Không có tab Đơn bán
                                         - Đánh giá nhận Xu (+200)   (Muốn bán phải sang Cấp 3)
                                                                          │
                                                                          ▼
                                                         [CẤP 3: NGƯỜI BÁN XÁC THỰC (SELLER)]
                                                         (Role: SELLER / ADMIN)
                                                         - Điều kiện: Nộp Thẻ SV + CCCD 2 mặt
                                                           + STK ngân hàng chính chủ nhận tiền
                                                         - Được Ban Quản Trị thẩm định duyệt
                                                                          │
                                                         ┌────────────────┴────────────────┐
                                                         ▼                                 ▼
                                                    QUYỀN BÁN HÀNG:                  QUẢN LÝ ĐƠN HÀNG:
                                                    - Mở khóa /create-post           - Tab "Đơn bán cần gửi"
                                                    - Đăng bài bằng AI Vision        - Nhận tiền bảo chứng Escrow
                                                    - Đăng bài thủ công 5 bước       - Đóng gói chuẩn FPT KTX
                                                    - Huy hiệu Seller Uy Tín         - Xuất mã vận đơn GHN/GHTK
```

### Bảng so sánh quyền hạn chi tiết giữa các cấp tài khoản:

| Tính năng / Quyền hạn | Chưa xác thực (`UNVERIFIED`) | Sinh viên mua (`BUYER`) | Người bán duyệt (`SELLER`) |
| :--- | :---: | :---: | :---: |
| **Xem bảng tin, tìm kiếm Meilisearch** | ✅ Có | ✅ Có | ✅ Có |
| **Nhắn tin trao đổi P2P & trả giá** | ❌ Chặn | ✅ Có | ✅ Có |
| **Đặt hàng Escrow & Safe-Handoff** | ❌ Chặn | ✅ Có | ✅ Có |
| **Đăng bài bán đồ (`/create-post`)** | ❌ **Cấm tuyệt đối** | ❌ **Cấm (Bắt buộc nâng cấp)** | ✅ **Không giới hạn** |
| **Quản lý đơn bán cần gửi (`/orders`)** | ❌ Bị khóa | ❌ Bị khóa (Hiện form KYC) | ✅ **Mở toàn quyền** |
| **Nhận tiền giải ngân từ Quỹ Escrow** | ❌ Không | ❌ Không | ✅ **Về STK chính chủ** |
| **Tạo vận đơn GHN liên campus** | ❌ Không | ❌ Không | ✅ **Tự động sinh mã** |

---


## 6. ĐẶC TẢ DANH MỤC SẢN PHẨM CỐT LÕI

1. 🍳 **Đồ gia dụng & Phòng trọ / KTX**: Tủ lạnh mini, quạt điện, ấm siêu tốc, bếp từ/bếp hồng ngoại, nồi cơm điện, nệm/chiếu ngủ, bàn học, ghế công thái học, kệ sách mini, giá phơi đồ...
2. 📚 **Sách đọc & Tài liệu tham khảo**: Sách luyện thi chứng chỉ (IELTS, TOEIC, JLPT...), tiểu thuyết, sách kỹ năng mềm, truyện tranh, sách chuyên ngành tham khảo...
3. 💻 **Đồ công nghệ & Phụ kiện**: Màn hình rời, bàn phím cơ, chuột không dây, tai nghe chống ồn, củ cáp sạc nhanh, ổ cắm nối dài, giá đỡ laptop...
4. 🛵 **Xe cộ & Di chuyển**: Xe đạp, xe máy, xe điện, mũ bảo hiểm, áo mưa...
5. 👕 **Đồng phục & Đồ cá nhân**: Võ phục Vovinam, áo cam sự kiện FPT, balo, vợt cầu lông/bóng bàn...
6. 🏠 **Nhượng phòng trọ & Tìm bạn ở ghép**: Nhượng lại phòng trọ giá tốt khu vực xung quanh trường (Tân Xã, Bình Yên, Thạch Hòa, Q9, Ngũ Hành Sơn...).

---

## 7. QUY TRÌNH ĐĂNG BÁN ĐỒ (DÀNH RIÊNG CHO VERIFIED SELLER)

> **Lưu ý quan trọng**: Chỉ tài khoản có vai trò **`SELLER`** (hoặc `ADMIN`) mới có quyền truy cập trang `/create-post`. Nếu tài khoản sinh viên thông thường (`BUYER`) truy cập, hệ thống tự động kích hoạt **Màn hình khóa bảo vệ (Non-Seller Guard)** kèm modal hướng dẫn nộp hồ sơ nâng cấp Người Bán.

```text
                                  BẤM NÚT "+" ĐĂNG BÀI
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
       [TÀI KHOẢN SINH VIÊN (BUYER)]                 [TÀI KHOẢN NGƯỜI BÁN (SELLER)]
       - Bị chặn bởi Non-Seller Guard                - Mở form đăng bài đầy đủ
       - Bấm: "Đăng ký mở Seller ngay"               - Lựa chọn 1 trong 2 phương thức:
       - Nộp Thẻ SV + CCCD + STK Ngân hàng                        │
       - Chờ BQT duyệt cấp quyền SELLER              ┌────────────┴────────────┐
                                                     ▼                         ▼
                                       [CÁCH 1: AI QUICK POST]    [CÁCH 2: FORM 5 BƯỚC]
                                       - Tải 1 ảnh sản phẩm       - Tự điền chi tiết
                                       - Gemini Vision tự động    - Chọn Safe-Point campus
                                         điền form trong 3s       - Bật Ship GHN liên cơ sở
                                       - Người bán bấm ĐĂNG       - Duyệt qua AI lọc từ cấm
```

---


## 8. PHÂN HỆ TIN NHẮN THỜI GIAN THỰC & PHÍM TẮT MUA BÁN (P2P CHAT)

Khung chat được thiết kế chuyên biệt cho giao dịch thương mại giữa sinh viên:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ ◀ [Avatar] Nguyễn Hoàng Nam ✅ (HE190123)            🟢 Đang online • [📞] │
├────────────────────────────────────────────────────────────────────────────┤
│ 📌 MÓN ĐỒ ĐANG TRAO ĐỔI (Ghim cố định trên đầu):                           │
│ [Ảnh] Quạt lửng Senko 3 cánh • 150.000 ₫ • 📍 Hòa Lạc                      │
├────────────────────────────────────────────────────────────────────────────┤
│  [Người mua]: Quạt này bạn dùng lâu chưa, có kêu to không?                 │
│  [Người bán]: Dùng được 1 kỳ thôi bạn, motor êm ru cắm điện test thoải mái │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 🏷️ [ĐỀ XUẤT GIÁ MỚI]: 130.000 ₫ (-20.000 ₫)                         │  │
│  │                  [❌ Từ chối]      [✅ ĐỒNG Ý GIÁ NÀY]               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 📍 [LỊCH HẸN GIAO DỊCH]: Sảnh Tòa Alpha • 17:30 Chiều nay            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────┤
│ [🏷️ Mặc cả giá]     [📍 Hẹn điểm gặp trong trường]     [🤝 TẠO QR CHỐT ĐƠN]│ ◄── 3 Phím tắt nhanh
├────────────────────────────────────────────────────────────────────────────┤
│ [📷 Gửi ảnh]  [ Nhập tin nhắn...                                  ] [ Gửi ]│
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. CƠ CHẾ ĐÁNH GIÁ 2 CHIỀU & HỆ THỐNG PHẦN THƯỞNG (CAMPUS COIN & GAMIFICATION)

Hệ thống Xu thưởng (**Campus Coins**) là cơ chế Gamification & Điểm thưởng nội bộ 100% tự chủ của MarketFU, nhằm khuyến khích văn hóa giao dịch tử tế và đánh giá trung thực giữa các sinh viên:

### 🪙 9.1 Cơ chế Kiếm Xu (Earn Coins)
* **Người Bán:** Hoàn tất đơn hàng + nhận đánh giá 5 sao $\rightarrow$ Nhận **+5 đến +10 Điểm Uy Tín**.
* **Người Mua:** Viết nhận xét có tâm $\ge 20$ từ + 1 ảnh thực tế $\rightarrow$ Nhận ngay **+100 Xu** (kèm video test máy: **+200 Xu**).
* **Xác thực Thẻ Sinh Viên (KYC thành công):** Nhận ngay **+500 Xu** chào mừng tài khoản Cấp 2.

### 🛍️ 9.2 Công dụng tiêu Xu (100% Nội bộ tự chủ, không phụ thuộc bên thứ 3)
1. **Đẩy tin bài đăng lên đầu trang (Bump Post) — 100 Xu:** Đưa món đồ đang bị trôi xuống dưới trở lại vị trí đầu trang chủ để tiếp cận sinh viên mới.
2. **Ghim tin nổi bật 24 giờ (Pin to Top) — 300 Xu:** Đưa bài đăng vào mục *"Thanh lý gấp / Đồ hot trong ngày"* kèm huy hiệu viền cam nổi bật để bán nhanh trong ngày.
3. **Khấu trừ tiền khi đặt đơn Online (VietQR / Napas / Ship COD):** 1 Xu = 1 VNĐ (được trừ tối đa 10% - 20% giá trị đơn hàng, chỉ áp dụng cho đơn thanh toán qua sàn).
4. **Mở khóa Huy hiệu & Khung Avatar trang cá nhân:** Dùng Xu đổi khung trang trí Profile *"Top Seller 5 Sao"*, *"Sinh viên K18 Uy Tín"*, tăng độ tin cậy khi giao dịch.

---

## 10. PHÂN HỆ TRỢ LÝ THÔNG MINH AI (CAMPUS AI ASSISTANT)

1. **Tìm đồ gia dụng & Sách theo nhu cầu:** Sinh viên hỏi: *"Tìm giúp mình quạt điện hoặc nồi cơm mini còn tốt dưới 200k ở Hòa Lạc với bot!"* $\rightarrow$ AI lọc ngay bài pass phù hợp.
2. **AI Vision tự tạo bài từ Camera:** Chụp ảnh món đồ $\rightarrow$ AI tự động nhận diện món đồ, điền tiêu đề và gợi ý giá pass hợp lý trong 10 giây.
3. **Trợ lý Định giá & Kiểm tra đồ cũ:** Hướng dẫn cách test đồ gia dụng cũ + Cảnh báo các địa điểm giao dịch không an toàn ngoài trường.

---

## 11. QUY CHẾ TỰ ĐỘNG HẾT HẠN & GỠ TIN SAU 30 NGÀY (AUTO-EXPIRE)

* **Ngày 27:** Hệ thống gửi thông báo đẩy (FCM) & Email nhắc nhở người bán: *"Bài đăng của bạn sắp hết hạn sau 3 ngày. Bấm vào đây nếu muốn Gia hạn thêm 30 ngày!"*.
* **Ngày 30:** Nếu không gia hạn $\rightarrow$ **Cron Job (chạy ngầm lúc 00:00 hàng ngày)** tự động chuyển trạng thái bài sang `EXPIRED` và ẩn khỏi bảng tin tìm kiếm.

---

## 12. PHƯƠNG THỨC MUA HÀNG & THANH TOÁN (NHẬN HÀNG RỒI MỚI TRẢ TIỀN / COD)

Hỗ trợ 2 phương thức mua hàng cực kỳ an toàn, sinh viên luôn được **xem hàng tận tay trước khi trả tiền**:

```text
                                  LỰA CHỌN GIAO DỊCH
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
 [CÁCH 1: GẶP TRỰC TIẾP TẠI TRƯỜNG]                           [CÁCH 2: SHIP COD TẬN NƠI (BÊN THỨ 3)]
 - Hẹn gặp tại Căn tin / Thư viện / KTX                      - Shipper mang kiện hàng đến KTX / Nhà trọ
 - Cắm điện test đồ, kiểm tra ưng ý tận tay                  - Người mua mở hộp đồng kiểm tra đồ
 - Quét VietQR chuyển tiền trực tiếp cho người bán           - Đúng đồ -> Trả tiền mặt / VietQR cho Shipper
 - Người bán mở QR Handshake -> Người mua quét               - Webhook đối soát chuyển tiền về STK người bán
```

---

## 13. QUY TRÌNH PASS ĐỒ, BAO TEST 24H-48H & ĐỔI TRẢ / KHIẾU NẠI

* **Giao dịch cùng Campus:** Bao test 24 giờ.
* **Giao dịch Ship COD liên tỉnh:** Bao test 48 giờ (tính từ thời điểm Webhook báo `DELIVERED`).
* **Quy trình khiếu nại:**
  * Người mua quay Video khui hộp và chứng minh lỗi kỹ thuật $\rightarrow$ Bấm *"Khiếu nại / Yêu cầu Trả hàng"*.
  * Mod Campus phân xử: Hoàn tiền 100% nếu người bán gian dối; Bác bỏ và phạt người mua nếu bom hàng/vu khống.

---

## 14. KIẾN TRÚC THÔNG BÁO ĐA KÊNH (MULTI-CHANNEL NOTIFICATION)

1. **Push Notification (FCM - Khẩn cấp / Thời gian thực):** Tin nhắn chat mới, đơn hàng mới, quét QR thành công, thông báo Webhook giao hàng.
2. **Email Notification (Nodemailer SMTP):** Kết quả duyệt Thẻ SV, biên lai hóa đơn giao dịch, cảnh báo hết hạn ngày thứ 27.
3. **In-App Notification (Tab Cái Chuông 🔔):** Lưu trữ toàn bộ lịch sử thông báo trong MongoDB.

---

## 15. QUY CHUẨN KỸ THUẬT & TỐI ƯU HÓA

* **Optimistic UI:** Thao tác thích/lưu bài phản hồi tức thì trên UI.
* **Tối ưu hình ảnh:** Upload trực tiếp Cloudinary, tự động nén WebP và tạo thumbnail ảnh thẻ SV và ảnh sản phẩm.
* **Phân trang FlatList (Mobile):** Load 20 items/trang kèm Skeleton Loading, dùng `expo-image` để cache ảnh mượt mà.
* **Bảo mật Token:** Access Token ngắn hạn trong Memory; Refresh Token qua HttpOnly Cookie (Web) hoặc SecureStore (Mobile).

---

## 16. LỘ TRÌNH TRIỂN KHAI (ROADMAP)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: NỀN TẢNG CỐT LÕI (CORE MVP)                                  │
│ - Kết nối MongoDB Atlas, Redis, Cloudinary, Gemini AI                      │
│ - Auth Module: Đăng ký, Đăng nhập (Google / Email / SĐT), Nộp Thẻ SV KYC   │
│ - Products Module: Đăng bài đồ gia dụng/sách, Danh sách, Chi tiết & Campus │
│ - Cron Job tự động ẩn tin quá hạn 30 ngày (Auto-Expire)                    │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: TRẢI NGHIỆM TƯƠNG TÁC THỜI GIAN THỰC & TRỢ LÝ AI              │
│ - Socket.io Server cho Chat 1-1 trực tiếp (Web + Mobile) + Phím tắt Mặc cả │
│ - Module AI: Chatbot tra cứu đồ gia dụng & Vision tạo bài từ ảnh           │
│ - Multi-Channel Notification: Push FCM + Email Nodemailer + Tab Cái Chuông │
│ - Hệ thống Đánh giá 2 chiều & Tặng Xu Campus Coin                          │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: GIAO DỊCH NÂNG CAO, SHIP COD, WEBHOOK & ADMIN DASHBOARD       │
│ - Module Giao dịch: VietQR động + QR Handshake xác nhận nhận đồ            │
│ - Module Ship COD & Webhook Logistics (GHTK/GHN)                           │
│ - Module Đổi trả / Khiếu nại (Dispute System) & Chính sách Bao test 24h-48h│
│ - Admin Dashboard: Quản lý người dùng, duyệt thẻ SV, xử lý khiếu nại       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 17. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY

```bash
# 1. Cài đặt Backend
cd backend && npm install

# 2. Cài đặt Frontend Web
cd ../frontend && npm install

# 3. Cài đặt Mobile App
cd ../mobile && npm install

# Khởi chạy trong từng thư mục:
npm run dev    # (trong backend & frontend)
npm run start  # (trong mobile)
```
