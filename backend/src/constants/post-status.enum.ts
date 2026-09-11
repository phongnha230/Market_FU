export enum PostStatus {
  AVAILABLE = 'AVAILABLE', // Đang bán
  RESERVED = 'RESERVED',   // Đã có người hẹn / đặt cọc
  SOLD = 'SOLD',           // Đã bán xong
  HIDDEN = 'HIDDEN',       // Đã ẩn bởi người bán
  BANNED = 'BANNED',       // Bị khoá bởi Admin (do vi phạm / scam)
}

export enum UserRole {
  STUDENT = 'STUDENT',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}
