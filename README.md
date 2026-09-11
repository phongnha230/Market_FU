# 🎓 FU Student Second-hand Market

Hệ thống sàn giao dịch đồ cũ & pass đồ sinh viên dành riêng cho sinh viên **Đại học FPT (FU)**.

---

## 🏗️ Cấu trúc Dự án (Monorepo Architecture)

- **`backend/`**: REST API Server + Socket.io Server (Node.js, Express, TypeScript, MongoDB, Mongoose, Redis, Cloudinary).
- **`frontend/`**: Web Portal & Admin Dashboard (Next.js 14/15, React, TailwindCSS, Shadcn UI).
- **`mobile/`**: Ứng dụng di động iOS/Android (React Native, Expo, React Navigation, NativeWind).

---

## 🚀 Hướng dẫn Cài đặt & Chạy Dự án

### 1. Yêu cầu Môi trường
- **Node.js**: `>= 18.x` (Khuyên dùng v20 hoặc v22)
- **MongoDB**: Local MongoDB hoặc MongoDB Atlas URI
- **Redis** *(Tùy chọn cho cache/socket adapter)*

### 2. Cài đặt Dependencies
```bash
# Cài đặt cho từng service
cd backend && npm install
cd ../frontend && npm install
cd ../mobile && npm install
```

### 3. Cấu hình Biến Môi trường (.env)
- Tạo file `.env` trong thư mục `backend/` theo mẫu `backend/.env.example`.
- Tạo file `.env.local` trong thư mục `frontend/` theo mẫu `frontend/.env.example`.

### 4. Khởi chạy ở Môi trường Phát triển (Dev Mode)
```bash
# Chạy Backend (Cổng mặc định: 5000)
npm run dev:backend

# Chạy Frontend Web (Cổng mặc định: 3000)
npm run dev:frontend

# Chạy Mobile App (Expo Metro bundler)
npm run dev:mobile
```
