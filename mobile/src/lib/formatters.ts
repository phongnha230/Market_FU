/**
 * Định dạng tiền tệ Việt Nam Đồng (VND)
 * Ví dụ: 1850000 -> "1.850.000đ"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '0đ';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
  if (isNaN(num)) return '0đ';
  return num.toLocaleString('vi-VN') + 'đ';
}

/**
 * Định dạng thời gian tương đối
 * Ví dụ: "Vừa xong", "5 phút trước", "2 giờ trước", "Hôm qua"
 */
export function formatRelativeTime(dateStr?: string | Date | null): string {
  if (!dateStr) return 'Vừa xong';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return String(dateStr);

  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Hôm qua';
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

/**
 * Chuẩn hóa tên cơ sở Campus
 */
export function formatCampusName(campus?: string): string {
  if (!campus) return 'Hòa Lạc';
  const upper = campus.toUpperCase().trim();
  if (upper.includes('HÒA LẠC') || upper.includes('HOLA') || upper === 'HOL') return 'Hòa Lạc';
  if (upper.includes('HCM') || upper.includes('HỒ CHÍ MINH')) return 'TP.HCM';
  if (upper.includes('ĐÀ NẴNG') || upper.includes('DN') || upper === 'DAD') return 'Đà Nẵng';
  if (upper.includes('CẦN THƠ') || upper === 'CT') return 'Cần Thơ';
  if (upper.includes('QUY NHƠN') || upper === 'QN') return 'Quy Nhơn';
  return campus;
}

/**
 * Che một phần MSSV để bảo vệ quyền riêng tư
 * Ví dụ: "SE172819" -> "SE17***19"
 */
export function maskStudentId(studentId?: string): string {
  if (!studentId) return 'Chưa cập nhật';
  if (studentId.length <= 4) return studentId;
  const start = studentId.slice(0, 4);
  const end = studentId.slice(-2);
  return `${start}***${end}`;
}

/**
 * Định dạng số điện thoại
 * Ví dụ: "0982345892" -> "0982 345 892"
 */
export function formatPhone(phone?: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}
