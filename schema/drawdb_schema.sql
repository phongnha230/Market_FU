-- =====================================================================
-- DATABASE SCHEMA: CAMPUS MARKETPLACE (FULL 3NF WITH AI SESSIONS)
-- HỖ TRỢ IMPORT TRỰC TIẾP LÊN DRAWDB (PostgreSQL Dialect)
-- =====================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'ADMIN');
CREATE TYPE campus_location AS ENUM ('HOL', 'HCM', 'DAD', 'QN', 'CT');
CREATE TYPE kyc_status AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE product_category AS ENUM ('DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER');
CREATE TYPE item_condition AS ENUM ('NEW_100', 'LIKE_NEW_99', 'USED_GOOD', 'USED_FAIR');
CREATE TYPE product_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN', 'EXPIRED');
CREATE TYPE order_type AS ENUM ('MEETUP', 'SHIP_COD');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'OFFER_PRICE', 'MEETUP_LOCATION');
CREATE TYPE ai_sender_role AS ENUM ('USER', 'MODEL', 'SYSTEM');
CREATE TYPE notification_type AS ENUM ('CHAT', 'ORDER', 'KYC', 'SYSTEM');
CREATE TYPE dispute_status AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- ---------------------------------------------------------------------
-- PHÂN HỆ 1: NGƯỜI DÙNG (USERS & SELLER PROFILE)
-- ---------------------------------------------------------------------

-- 1.1 Tài khoản cơ bản
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role user_role DEFAULT 'BUYER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Hồ sơ cá nhân & Điểm uy tín
CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500),
    phone_number VARCHAR(20),
    campus campus_location DEFAULT 'HOL',
    campus_coins INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 100,
    avatar_badge VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Xác thực Thẻ Sinh Viên (KYC)
CREATE TABLE user_kyc (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(20) NOT NULL,
    card_image_url VARCHAR(500) NOT NULL,
    status kyc_status DEFAULT 'PENDING',
    rejected_reason TEXT,
    verified_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 Tài khoản ngân hàng nhận tiền thanh toán
CREATE TABLE user_bank_accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_no VARCHAR(50) NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- PHÂN HỆ 2: SẢN PHẨM BÁN (PRODUCTS & ATTRIBUTES)
-- ---------------------------------------------------------------------

-- 2.1 Danh mục sản phẩm
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url VARCHAR(500)
);

-- 2.2 Thông tin Sản phẩm (Món đồ đăng bán)
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    seller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
    category_type product_category NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price BIGINT NOT NULL,
    original_price BIGINT,
    condition item_condition NOT NULL,
    quantity INTEGER DEFAULT 1,
    campus campus_location NOT NULL,
    meetup_location VARCHAR(255),
    allow_shipping BOOLEAN DEFAULT TRUE,
    status product_status DEFAULT 'AVAILABLE',
    is_pinned BOOLEAN DEFAULT FALSE,
    pinned_until TIMESTAMP WITH TIME ZONE,
    boosted_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 Thống kê tương tác sản phẩm
CREATE TABLE product_stats (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    views_count INTEGER DEFAULT 0,
    renew_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Thư viện ảnh sản phẩm
CREATE TABLE product_images (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0
);

-- ---------------------------------------------------------------------
-- PHÂN HỆ 3: TIN NHẮN REALTIME & MẶC CẢ GIÁ P2P
-- ---------------------------------------------------------------------

-- 3.1 Cuộc trò chuyện Người mua & Người bán
CREATE TABLE conversations (
    id VARCHAR(36) PRIMARY KEY,
    buyer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    last_message_text TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Tin nhắn chi tiết
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type message_type DEFAULT 'TEXT',
    text TEXT,
    media_url VARCHAR(500),
    offer_price BIGINT,
    meetup_location VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- PHÂN HỆ 4: TRỢ LÝ AI CHATBOT & PHÂN TÍCH ẢNH (AI SESSIONS)
-- ---------------------------------------------------------------------

-- 4.1 Phiên làm việc với Trợ lý AI (Session Chatbot)
CREATE TABLE ai_chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) DEFAULT 'Tìm đồ phòng trọ',
    total_tokens INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 Lịch sử tin nhắn giữa Người dùng và AI Model (Gemini 1.5 Flash)
CREATE TABLE ai_chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    sender_role ai_sender_role NOT NULL,
    content TEXT NOT NULL,
    suggested_product_ids JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.3 Lịch sử AI Vision Scan ảnh tạo bài đăng nhanh
CREATE TABLE ai_vision_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_image_url VARCHAR(500) NOT NULL,
    detected_title VARCHAR(255),
    suggested_price BIGINT,
    detected_category product_category,
    suggested_condition item_condition,
    ai_raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- PHÂN HỆ 5: ĐƠN MUA HÀNG (ORDERS & CHECKOUT)
-- ---------------------------------------------------------------------

-- 5.1 Đơn hàng sản phẩm
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    buyer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    order_type order_type NOT NULL,
    status order_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5.2 Chi tiết thanh toán & VietQR
CREATE TABLE order_payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    price BIGINT NOT NULL,
    shipping_fee BIGINT DEFAULT 0,
    coins_used INTEGER DEFAULT 0,
    coin_discount BIGINT DEFAULT 0,
    total_amount BIGINT NOT NULL,
    vietqr_url VARCHAR(500),
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 5.3 Xác thực nhận hàng trực tiếp tại trường (QR Handshake)
CREATE TABLE order_handshakes (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    handshake_token VARCHAR(255) NOT NULL,
    handshake_otp VARCHAR(6) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 5.4 Vận chuyển Ship COD (GHTK/GHN)
CREATE TABLE order_shippings (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    shipping_partner VARCHAR(50) DEFAULT 'GHTK',
    tracking_code VARCHAR(100),
    receiver_name VARCHAR(150) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- 5.5 Thời hạn Bao test sản phẩm (24h - 48h)
CREATE TABLE order_warranties (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    warranty_hours INTEGER DEFAULT 24,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_expired BOOLEAN DEFAULT FALSE
);

-- ---------------------------------------------------------------------
-- PHÂN HỆ 6: ĐÁNH GIÁ, KHIẾU NẠI & BẢO VỆ NGƯỜI MUA
-- ---------------------------------------------------------------------

-- 6.1 Đánh giá sản phẩm & người bán (Blind Review)
CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6.2 Khiếu nại đổi trả sản phẩm lỗi
CREATE TABLE disputes (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    claimant_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    proof_video_url VARCHAR(500) NOT NULL,
    status dispute_status DEFAULT 'PENDING',
    admin_note TEXT,
    resolved_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6.3 Tố cáo sản phẩm giả mạo / lừa đảo
CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    reported_product_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status dispute_status DEFAULT 'PENDING',
    resolved_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6.4 Thông báo sản phẩm & đơn hàng
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type notification_type DEFAULT 'SYSTEM',
    target_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6.5 Món đồ yêu thích (Wishlist ❤️)
CREATE TABLE product_favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_favorite UNIQUE(user_id, product_id)
);

-- 6.6 Sổ cái biến động Campus Coins (Audit Log)
CREATE TABLE coin_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
