# 🖥️ HƯỚNG DẪN CẤU HÌNH VPS TỪ A ĐẾN Z CHO BACKEND PRODUCTION
> **Dành cho:** Kỹ sư triển khai hệ thống (DevOps & Backend Engineer)  
> **Mục tiêu:** Tự tay biến một máy chủ VPS Linux (Ubuntu 20.04 / 22.04 LTS) trắng tinh thành một hệ sinh thái vận hành ứng dụng Docker an toàn, tối ưu bộ nhớ, có Nginx Reverse Proxy, Cloudflare SSL và CI/CD tự động.  
> **Kèm theo:** Chú thích chi tiết từng câu lệnh và giải thích bản chất kỹ thuật.

---

## 📑 MỤC LỤC
1. [Giai đoạn 1: Thiết lập Hệ điều hành & Gia cố Bảo mật (Hardening)](#-giai-đoạn-1-thiết-lập-hệ-điều-hành--gia-cố-bảo-mật-hardening)
2. [Giai đoạn 2: Cài đặt Docker & Môi trường Chạy ứng dụng](#-giai-đoạn-2-cài-đặt-docker--môi-trường-chạy-ứng-dụng)
3. [Giai đoạn 3: Cài đặt & Cấu hình Nginx Reverse Proxy](#-giai-đoạn-3-cài-đặt--cấu-hình-nginx-reverse-proxy)
4. [Giai đoạn 4: Đưa Ứng dụng Backend lên VPS (Docker Compose)](#-giai-đoạn-4-đưa-ứng-dụng-backend-lên-vps-docker-compose)
5. [Giai đoạn 5: Cấu hình Khóa SSH cho CI/CD GitHub Actions](#-giai-đoạn-5-cấu-hình-khóa-ssh-cho-cicd-github-actions)
6. [Giai đoạn 6: Tự động hóa Bảo trì & Dọn dẹp Định kỳ](#-giai-đoạn-6-tự-động-hóa-bảo-trì--dọn-dẹp-định-kỳ)

---

## 🛡️ GIAI ĐOẠN 1: THIẾT LẬP HỆ ĐIỀU HÀNH & GIA CỐ BẢO MẬT (HARDENING)

Khi mới mua VPS, bạn sẽ nhận được IP và mật khẩu `root`. Việc đầu tiên là kết nối qua SSH và dọn dẹp hệ điều hành.

```bash
# 1. Đăng nhập vào VPS từ máy tính cá nhân
ssh root@<IP_CỦA_BẠN>
```

### 1.1. Cập nhật các gói phần mềm hệ thống
```bash
# Cập nhật danh sách các package mới nhất từ kho lưu trữ của Ubuntu
apt update

# Tự động tải và nâng cấp các phần mềm đã cài lên phiên bản mới nhất (-y là tự động chọn Yes)
apt upgrade -y
```
> **Tại sao cần?** Giúp vá tất cả các lỗ hổng bảo mật của nhân Linux và thư viện hệ thống trước khi cài phần mềm khác.

---

### 1.2. Cấu hình Múi giờ Việt Nam (GMT+7)
Mặc định VPS nước ngoài chạy giờ UTC (chậm hơn VN 7 tiếng).
```bash
# Đặt múi giờ hệ thống sang múi giờ Hồ Chí Minh / Hà Nội
timedatectl set-timezone Asia/Ho_Chi_Minh

# Kiểm tra lại ngày giờ hiện tại của VPS
date
```
> **Tại sao cần?** Để log hệ thống và các tác vụ hẹn giờ tự động (Cronjob như quét bài hết hạn 00:00 AM, giải ngân Escrow) chạy chính xác theo giờ sinh hoạt của người Việt.

---

### 1.3. Cấu hình Bộ nhớ ảo (4GB SWAP) – Cứu tinh của VPS 2GB RAM
VPS giá rẻ chỉ có 2GB RAM, khi chạy Docker rất dễ bị hệ điều hành "bắn hạ" (OOM Killer). Swap giúp lấy 4GB ổ cứng NVMe làm RAM dự phòng.

```bash
# 1. Cấp phát một file có kích thước 4GB tên là /swapfile
fallocate -l 4G /swapfile

# 2. Phân quyền chỉ có người dùng root mới được đọc/ghi file này (bảo mật dữ liệu ram trên đĩa)
chmod 600 /swapfile

# 3. Định dạng file này thành phân vùng Swap
mkswap /swapfile

# 4. Kích hoạt bộ nhớ Swap ngay lập tức
swapon /swapfile

# 5. Ghi cấu hình vào /etc/fstab để khi reboot VPS không bị mất Swap
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 6. Thiết lập swappiness = 10 (mặc định là 60)
# Nghĩa là: Khi RAM thật còn dưới 10% thì mới đẩy dữ liệu sang ổ cứng (giữ cho máy luôn nhanh)
sysctl vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf

# 7. Kiểm tra kết quả (sẽ thấy dòng Swap có dung lượng 4.0Gi)
free -h
```

---

### 1.4. Thiết lập Tường lửa UFW (Uncomplicated Firewall)
Tường lửa giúp đóng tất cả các cổng lạ, chỉ mở đúng 3 cổng phục vụ Web và quản trị.

```bash
# 1. BẮT BUỘC MỞ CỔNG 22 (SSH) TRƯỚC, nếu không bạn sẽ bị khóa không thể đăng nhập lại!
ufw allow 22/tcp comment 'Mo cong SSH quan tri'

# 2. Mở cổng 80 (HTTP) để Nginx đón web và chứng chỉ SSL
ufw allow 80/tcp comment 'Mo cong Web HTTP'

# 3. Mở cổng 443 (HTTPS) để truyền tải mã hóa SSL/TLS
ufw allow 443/tcp comment 'Mo cong Web HTTPS'

# 4. Bật tường lửa lên (chọn 'y' khi được hỏi)
ufw enable

# 5. Xem lại danh sách các cổng đang mở
ufw status verbose
```

---

### 1.5. Cài đặt Fail2ban (Chống Hacker dò mật khẩu SSH)
Mỗi ngày có hàng ngàn con bot tự động quét IP của bạn để thử mật khẩu SSH. Fail2ban sẽ tự động chặn IP kẻ xấu nếu gõ sai pass quá 5 lần.

```bash
# Cài đặt fail2ban
apt install fail2ban -y

# Bật dịch vụ fail2ban tự chạy cùng hệ điều hành
systemctl enable --now fail2ban

# Kiểm tra fail2ban đang giám sát cổng SSH
fail2ban-client status sshd
```

---

### 1.6. Giới hạn dung lượng Log hệ thống (Chống tràn ổ đĩa)
Linux ghi log rất nhiều, sau vài tháng file log `journald` có thể ngốn 10GB - 15GB ổ cứng.
```bash
# Mở file cấu hình log
nano /etc/systemd/journald.conf
```
*Tìm dòng `SystemMaxUse`, bỏ dấu `#` ở đầu và sửa thành:*
```ini
SystemMaxUse=200M
```
*(Bấm `Ctrl + O` -> `Enter` để lưu, `Ctrl + X` để thoát)*.
```bash
# Áp dụng cấu hình ngay lập tức
systemctl restart systemd-journald
```

---

## 🐳 GIAI ĐOẠN 2: CÀI ĐẶT DOCKER & MÔI TRƯỜNG CHẠY ỨNG DỤNG

Ta cài đặt bản Docker chính hãng từ trang chủ Docker (thay vì bản cũ có sẵn trong Ubuntu).

```bash
# 1. Cài các công cụ hỗ trợ tải qua giao thức HTTPS
apt install -y ca-certificates curl gnupg lsb-release

# 2. Tạo thư mục chứa khóa bảo mật GPG của Docker
mkdir -p /etc/apt/keyrings

# 3. Tải khóa xác thực GPG chính thức của Docker về máy
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Thêm kho phần mềm của Docker vào danh sách nguồn tải
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Cập nhật lại danh sách package sau khi thêm nguồn Docker
apt update

# 6. Cài đặt Docker Engine, Docker CLI và Docker Compose v2 (plugin)
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 7. Kiểm tra phiên bản Docker và Docker Compose
docker --version
docker compose version
```

---

## 🌐 GIAI ĐOẠN 3: CÀI ĐẶT & CẤU HÌNH NGINX REVERSE PROXY

Nginx đóng vai trò là "người gác cổng": Đón toàn bộ người dùng từ Internet vào cổng 80/443, sau đó chuyển tiếp âm thầm vào ứng dụng Node.js chạy ở cổng `5000`.

### 3.1. Cài đặt Nginx
```bash
apt install nginx -y

# Kiểm tra xem Nginx đã chạy chưa
systemctl status nginx
```

---

### 3.2. Tạo file cấu hình Virtual Host cho Dự án
Tạo một file cấu hình riêng cho dự án trong `/etc/nginx/sites-available/`:
```bash
nano /etc/nginx/sites-available/fu-market.conf
```

*Dán toàn bộ nội dung cấu hình chuẩn sau vào:*
```nginx
# 1. BẮT ĐẦU CẤU HÌNH LẤY IP THẬT TỪ CLOUDFLARE
# Do request đi qua Cloudflare Proxy nên IP gửi đến máy chủ sẽ là IP của Cloudflare.
# Ta dùng danh sách dải IP này để Nginx tự động trích xuất IP thật của người dùng từ header CF-Connecting-IP.
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
real_ip_header CF-Connecting-IP;

# 2. KHỐI CHẶN HACKER / BOT QUÉT TRỰC TIẾP QUA ĐỊA CHỈ IP
# Bất kỳ ai gõ thẳng http://<IP_VPS> mà không qua tên miền chính chủ sẽ bị ngắt kết nối ngay (HTTP 444).
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}

# 3. KHỐI MÁY CHỦ CHÍNH CHO TÊN MIỀN API
server {
    listen 80;
    server_name api.jintdp.dpdns.org; # Thay bằng tên miền của bạn

    # Giới hạn kích thước file upload (ảnh thẻ sinh viên, video preview sản phẩm tối đa 25MB)
    client_max_body_size 25M;

    location / {
        # Đẩy traffic vào container Node.js chạy ở cổng nội bộ 5000
        proxy_pass http://127.0.0.1:5000;

        # Chuyển tiếp các thông tin quan trọng của Client cho Backend biết
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # HỖ TRỢ KẾT NỐI WEBSOCKET THỜI GIAN THỰC (SOCKET.IO)
        # Nếu thiếu 2 dòng này, các tính năng Realtime Chat / Nhận diện tiền về tức thì sẽ bị lỗi!
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Thời gian chờ tối đa 1 request (tránh bị timeout khi xử lý AI phân loại đồ cũ)
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
    }
}
```
*(Bấm `Ctrl + O` -> `Enter` để lưu, `Ctrl + X` để thoát)*.

---

### 3.3. Kích hoạt Site và Kiểm tra cú pháp
```bash
# 1. Xóa cấu hình mặc định cũ của Nginx
rm -f /etc/nginx/sites-enabled/default

# 2. Tạo Symbolic Link (liên kết tượng trưng) từ sites-available sang sites-enabled để kích hoạt
ln -s /etc/nginx/sites-available/fu-market.conf /etc/nginx/sites-enabled/

# 3. Kiểm tra xem có lỗi chính tả trong file cấu hình không
# (BẮT BUỘC PHẢI THẤY DÒNG: "syntax is ok" và "test is successful")
nginx -t

# 4. Tải lại cấu hình Nginx mà không làm gián đoạn người dùng
systemctl reload nginx
```

---

## 🚀 GIAI ĐOẠN 4: ĐƯA ỨNG DỤNG BACKEND LÊN VPS (DOCKER COMPOSE)

### 4.1. Tạo thư mục và Kéo code từ GitHub
```bash
# Tạo thư mục chứa app và di chuyển vào trong
mkdir -p ~/app && cd ~/app

# Clone mã nguồn dự án từ GitHub
git clone https://github.com/phongnha230/Market_FU.git .
```

---

### 4.2. Thiết lập Biến môi trường (`backend/.env`)
```bash
cd ~/app/backend
nano .env
```
*Điền các thông tin production thật:*
```ini
NODE_ENV=production
PORT=5000

# URL kết nối MongoDB Atlas Cloud
DATABASE_URL=mongodb+srv://<USER>:<PASS>@cluster.mongodb.net/campus_market_prod?retryWrites=true&w=majority

# URL Frontend (TUYỆT ĐỐI KHÔNG CÓ DẤU / Ở CUỐI)
CLIENT_URL=https://market-fu.vercel.app
ALLOWED_ORIGINS=https://market-fu.vercel.app

# Khóa JWT đăng nhập
JWT_SECRET=chuoi_bi_mat_rat_dai_ngau_nhien_jwt_32_ky_tu
JWT_REFRESH_SECRET=chuoi_bi_mat_rat_dai_ngau_nhien_refresh_32_ky_tu

# Kết nối Redis & Meilisearch nội bộ trong mạng Docker
REDIS_HOST=fu_market_deploy_redis
REDIS_PORT=6379
MEILISEARCH_HOST=http://fu_market_deploy_meilisearch:7700
MEILISEARCH_MASTER_KEY=mat_khau_meilisearch_master_key_16_ky_tu

# Cổng thanh toán PayOS (Lấy từ payos.vn)
PAYOS_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PAYOS_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PAYOS_CHECKSUM_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Khóa Webhook Vận chuyển
SHIPPING_WEBHOOK_SECRET=your_hmac_secret_key_for_shipping_webhook

# Google OAuth
GOOGLE_CLIENT_ID=1093899519891-c9r9jv1imm3s104crlhels37fl71stuo.apps.googleusercontent.com
```

---

### 4.3. Tạo File Khóa Dịch vụ Firebase Admin SDK
```bash
nano firebase-service-account.json
```
*Dán toàn bộ file JSON tải từ Firebase Console vào, sau đó phân quyền chuẩn:*
```bash
chmod 644 firebase-service-account.json
```
> **Lưu ý bài học:** Phải tạo file này **trước khi** chạy lệnh Docker up, tránh bị Docker tạo nhầm thành thư mục rỗng.

---

### 4.4. Khởi động Cụm Ứng dụng bằng Docker Compose
Quay về thư mục gốc của dự án (`~/app`):
```bash
cd ~/app

# Build Docker image và khởi chạy ngầm (-d = detached mode)
docker compose -f docker-compose.deploy.yml up -d --build
```

Kiểm tra trạng thái khởi động:
```bash
# Xem 3 container đã chạy thành công chưa
docker compose -f docker-compose.deploy.yml ps

# Xem log chạy của backend
docker logs -f fu_market_deploy_backend
```

---

## 🤖 GIAI ĐOẠN 5: CẤU HÌNH KHÓA SSH CHO CI/CD GITHUB ACTIONS

Mục đích: Mỗi khi bạn `git push origin main` ở máy cá nhân, GitHub Actions sẽ tự động SSH vào VPS, kéo code mới và cập nhật ứng dụng tự động mà không cần gõ lệnh thủ công.

### 5.1. Sinh cặp khóa SSH riêng cho GitHub Actions trên VPS
```bash
# Tạo cặp khóa SSH chuẩn ed25519 hiện đại
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

# Thêm khóa công khai (public key) vào danh sách được phép đăng nhập của VPS
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Phân quyền chuẩn bảo mật bắt buộc của SSH
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 5.2. Lấy khóa bí mật (Private Key) để điền vào GitHub Secrets
```bash
# In khóa bí mật ra màn hình để copy
cat ~/.ssh/github_deploy
```
*Sao chép toàn bộ từ dòng `-----BEGIN OPENSSH PRIVATE KEY-----` đến dòng `-----END OPENSSH PRIVATE KEY-----`*.

### 5.3. Thêm Secrets vào GitHub Repository
Vào Repository trên GitHub -> **Settings** -> **Secrets and variables** -> **Actions** -> Bấm **New repository secret** và thêm 4 biến:

| Tên Secret | Giá trị điền | Chú thích |
| :--- | :--- | :--- |
| `VPS_HOST` | `180.93.115.211` | Địa chỉ IP của VPS |
| `VPS_USER` | `root` | Tên tài khoản đăng nhập |
| `VPS_SSH_KEY` | *(Nội dung khóa vừa copy ở bước trên)* | Private Key để GitHub xác thực |
| `VPS_PORT` | `22` | Cổng SSH |

---

## 🧹 GIAI ĐOẠN 6: TỰ ĐỘNG HÓA BẢO TRÌ & DỌN DẸP ĐỊNH KỲ

Ổ cứng VPS chỉ có 30GB. Mỗi lần CI/CD build code mới, Docker sẽ sinh ra các "image rác" (dangling images) không còn dùng đến. Ta đặt lịch tự động dọn rác mỗi tuần.

```bash
# Mở bảng lập lịch tác vụ Cronjob của root
crontab -e
```
*(Nếu hỏi chọn trình soạn thảo, bấm phím `1` để chọn Nano)*.

*Thêm 2 dòng sau vào cuối cùng của file:*
```cron
# 1. Tự động dọn rác Docker (image cũ, container chết) vào 03:00 sáng Chủ Nhật hàng tuần
0 3 * * 0 docker system prune -af --volumes > /dev/null 2>&1

# 2. Tự động đồng bộ lại đồng hồ hệ thống mỗi ngày vào lúc 04:00 sáng
0 4 * * * /usr/sbin/ntpdate pool.ntp.org > /dev/null 2>&1
```
*(Bấm `Ctrl + O` -> `Enter` để lưu, `Ctrl + X` để thoát)*.

Kiểm tra lại lịch đã lưu:
```bash
crontab -l
```

---

## 🏁 BẢNG TỔNG KẾT QUY TRÌNH "CỨU HỘ" KHI GẶP LỖI

Khi hệ thống gặp trục trặc, thực hiện đúng 4 bước sau theo thứ tự:

1. **Bước 1: Soi log container bị lỗi**
   ```bash
   docker logs --tail 100 fu_market_deploy_backend
   ```
2. **Bước 2: Kiểm tra RAM có bị tràn không**
   ```bash
   free -h
   ```
3. **Bước 3: Kiểm tra Nginx có bị lỗi cú pháp không**
   ```bash
   nginx -t
   ```
4. **Bước 4: Restart an toàn toàn bộ ứng dụng**
   ```bash
   cd ~/app && docker compose -f docker-compose.deploy.yml restart
   ```
