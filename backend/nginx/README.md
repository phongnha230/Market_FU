# 🚀 Hướng Dẫn Triển Khai Nginx Load Balancer (2 Backend) + Cloudflare + VPS

Tài liệu này hướng dẫn chi tiết cách cấu hình và triển khai **Hệ thống Backend FU Student Market** sử dụng **Nginx làm Reverse Proxy & Load Balancer**, chia tải qua **2 Backend con (Port 5001 & 5002)**, đồng thời tương thích hoàn hảo với **Cloudflare** và **VPS Linux (Ubuntu/Debian)**.

---

## 1. Sơ Đồ Kiến Trúc Hệ Thống (Architecture)

```
[ Người Dùng (Web / Mobile App) ]
               │
               ▼ (HTTPS / WSS)
    [ CLOUDFLARE CDN & WAF ]
    - Chống DDoS & Caching static
    - SSL Termination (Full / Strict)
    - Gửi kèm Header: CF-Connecting-IP
               │
               ▼ (Port 80 / 443)
       [ VPS LINUX (Ubuntu) ]
  ┌──────────────────────────────┐
  │  NGINX LOAD BALANCER         │
  │  - Khôi phục Real IP từ CF   │
  │  - Rate Limiting 40 req/s    │
  │  - Upload max 50MB (video)   │
  │  - Sticky Session (ip_hash)  │
  └──────────────┬───────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
 ┌──────────────┐  ┌──────────────┐
 │ Backend BE-1 │  │ Backend BE-2 │
 │ (Port 5001)  │  │ (Port 5002)  │
 └──────┬───────┘  └──────┬───────┘
        │                 │
        └────────┬────────┘
                 ▼
 [ MongoDB Atlas + Redis + Meilisearch ]
```

---

## 2. Phương Án 1: Chạy trực tiếp trên VPS với PM2 (Khuyên dùng)

### Bước 1: Build source code trên VPS
```bash
cd /var/www/fu-market/backend
npm install
npm run build
```

### Bước 2: Khởi động 2 Backend Instances bằng PM2
Hệ thống đã có sẵn file cấu hình [`backend/ecosystem.config.js`](../ecosystem.config.js):
```bash
# Cài đặt PM2 (nếu chưa có)
sudo npm install -g pm2

# Khởi động cả 2 instances (Port 5001 và 5002)
pm2 start ecosystem.config.js

# Thiết lập tự động khởi động cùng hệ điều hành VPS
pm2 save
pm2 startup
```
Kiểm tra trạng thái:
```bash
pm2 status
# Kết quả hiển thị:
# fu-market-backend-1 │ online │ Port 5001
# fu-market-backend-2 │ online │ Port 5002
```

### Bước 3: Cài đặt và cấu hình Nginx trên VPS
```bash
# 1. Cài đặt Nginx
sudo apt update && sudo apt install -y nginx

# 2. Copy file Cloudflare Real IP vào Nginx
sudo cp nginx/cloudflare.conf /etc/nginx/conf.d/cloudflare.conf

# 3. Copy file Nginx cấu hình chính
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# 4. Kiểm tra cú pháp cấu hình
sudo nginx -t

# 5. Khởi động lại Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 3. Cấu Hình Cloudflare Cho Tên Miền Của Bạn

1. **Cấu hình DNS (Cloudflare Dashboard):**
   - Tạo bản ghi **A Record**:
     - Name: `api` (hoặc `@` nếu chạy trên root domain)
     - IPv4 address: `IP_VPS_CỦA_BẠN`
     - Proxy status: **Proxied (Đám mây màu cam 🟠)** để hưởng lợi từ CDN, DDoS protection và che giấu IP thật của VPS.

2. **Cấu hình SSL/TLS:**
   - Vào mục **SSL/TLS** trên Cloudflare: Chọn **Full** hoặc **Full (Strict)**.
   - **Tạo chứng chỉ gốc miễn phí (Origin Certificate):**
     - Vào `SSL/TLS` -> `Origin Server` -> `Create Certificate`.
     - Lưu nội dung chứng chỉ vào VPS tại: `/etc/ssl/certs/fu_market_ssl.crt`
     - Lưu private key vào VPS tại: `/etc/ssl/private/fu_market_ssl.key`
     - Cấp quyền bảo mật: `sudo chmod 600 /etc/ssl/private/fu_market_ssl.key`

3. **Bật WebSocket:**
   - Vào `Network` trên Cloudflare: Đảm bảo mục **WebSockets** được bật (**ON**) để tính năng Chat thời gian thực và Thông báo đẩy hoạt động mượt mà.

---

## 4. Phương Án 2: Triển Khai Qua Docker Compose

Nếu bạn muốn chạy toàn bộ trên Docker (Backend 1, Backend 2, Nginx, Redis, Meilisearch):

```bash
docker compose -f docker-compose.deploy.yml up -d --scale backend=2
```

---

## 5. Các Tính Năng Đã Được Tối Ưu Sẵn Trong Nginx

| Tính năng | Giải thích kỹ thuật |
| :--- | :--- |
| **`ip_hash` Upstream** | Giúp các kết nối WebSocket (Socket.io) duy trì phiên làm việc liên tục trên cùng 1 backend, không bị lỗi `Session ID unknown`. |
| **Cloudflare Real IP** | Danh sách IP chính thức của Cloudflare được nạp vào `cloudflare.conf` giúp backend nhận đúng địa chỉ IP của sinh viên thay vì IP của proxy. |
| **`client_max_body_size 50M`** | Cho phép người dùng đăng bán sản phẩm đính kèm video clip (tối đa 30MB) và nhiều hình ảnh phân giải cao. |
| **`proxy_read_timeout 86400s`** | Giữ kết nối WebSocket Socket.io luôn mở (24 giờ) không bị gián đoạn hay timeout ngắt kết nối. |
| **Rate Limiting** | Giới hạn 40 req/giây cho API chung và 10 req/giây cho API đăng nhập/xác thực, chống brute-force và spam request. |
