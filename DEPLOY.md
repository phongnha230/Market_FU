# 🚀 HƯỚNG DẪN DEPLOY RIÊNG BACKEND LÊN VPS UBUNTU

Hướng dẫn này giúp bạn đưa riêng service **Backend API** lên VPS Ubuntu một cách gọn nhẹ và nhanh chóng nhất.

---

## 1. CÀI ĐẶT DOCKER TRÊN VPS UBUNTU (Chỉ cần chạy 1 lần đầu)
Mở terminal VPS và chạy:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

---

## 2. TRIỂN KHAI BACKEND LÊN VPS

### Bước 1: Copy hoặc Git Clone mã nguồn về VPS
```bash
git clone https://github.com/phongnha230/Market_FU.git
cd Market_FU/backend
```

### Bước 2: Tạo file `.env` trong thư mục `backend/`
Tạo file `backend/.env` trên VPS và dán các cấu hình:
```bash
nano .env
```
Nội dung file `.env`:
```env
PORT=5000
NODE_ENV=production
CLIENT_URL=http://your-frontend-domain.com

# 1. Kết nối MongoDB Atlas (Cloud)
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/campus_market?retryWrites=true&w=majority"

# 2. JWT Secret
JWT_SECRET=super_secret_jwt_key_random_string_here_2026
JWT_REFRESH_SECRET=super_secret_refresh_key_random_string_here_2026

# 3. Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 4. Media Storage (Cloudflare R2 Object Storage + Sharp WebP)
MEDIA_DOMAIN=http://localhost:5000/uploads
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=my-uploads
R2_PUBLIC_DOMAIN=https://pub-xxxxxxxxxxxxxx.r2.dev

# 5. Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# 6. Webhooks & QR Secrets
SHIPPING_WEBHOOK_SECRET=your_shipping_webhook_secret
HANDSHAKE_QR_SECRET=your_handshake_qr_secret
```
*(Bấm `Ctrl + O` $\rightarrow$ `Enter` để lưu, `Ctrl + X` để thoát nano)*.

---

### Bước 3: Khởi chạy Backend bằng Docker
Trong thư mục `backend/`, gõ:
```bash
docker compose up -d --build
```
Lệnh này sẽ tự động:
- Cài đặt OpenSSL cho Linux Alpine.
- Tự động chạy `npx prisma generate` sinh mã kết nối MongoDB Atlas.
- Build TypeScript $\rightarrow$ JavaScript sang thư mục `dist/`.
- Chạy server Node.js production tại cổng `5000`.

---

## 3. CÁC LỆNH QUẢN LÝ THƯỜNG DÙNG TRÊN VPS

- **Xem log hoạt động của Backend:**
  ```bash
  docker compose logs -f backend
  ```
- **Kiểm tra trạng thái Container:**
  ```bash
  docker compose ps
  ```
- **Mở Prisma Studio trực tiếp trên server:**
  ```bash
  docker compose exec backend npx prisma studio
  ```
- **Khởi động lại / Dừng backend:**
  ```bash
  docker compose restart backend
  docker compose down
  ```
- **Cập nhật code mới sau khi git pull:**
  ```bash
  git pull origin main
  docker compose up -d --build
  ```

---

## 4. TẬN DỤNG DOMAIN & CLOUDFLARE CDN MIỄN PHÍ KHI CÓ VPS

Khi bạn đã mua Domain và có VPS:
1. **Trỏ DNS trên Cloudflare:**
   - Tạo A record: `media.yourdomain.com` (hoặc `api.yourdomain.com`) trỏ về IP VPS của bạn.
   - Bật **Proxy status: Proxied (Đám mây màu cam 🟠)**.
2. **Cập nhật file `.env` trên VPS:**
   - Sửa dòng: `MEDIA_DOMAIN=https://media.yourdomain.com` (hoặc `https://api.yourdomain.com/uploads`).
3. **Bật Cloudflare Caching:**
   - Vào Cloudflare Dashboard $\rightarrow$ **Caching** $\rightarrow$ **Cache Rules** $\rightarrow$ Tạo rule:
     - Match: Hostname bằng `media.yourdomain.com`
     - Action: **Eligible for cache** (Cache Everything), Edge Cache TTL = 1 tháng.
   - **Kết quả:** VPS chỉ chịu tải khi người dùng tải ảnh lên. Khi xem bài đăng, ảnh được phục vụ trực tiếp từ các máy chủ Edge Cache của Cloudflare tại Việt Nam, tiết kiệm 100% băng thông VPS và tốc độ tải ảnh đạt tối đa.

