export interface ReportReasonOption {
  id: string;
  label: string;
  desc: string;
}

export const PRODUCT_REPORT_REASONS: ReportReasonOption[] = [
  {
    id: 'SCAM',
    label: 'Dấu hiệu lừa đảo / Gian lận cọc',
    desc: 'Yêu cầu chuyển khoản ngoài sàn, không hẹn giao dịch tại Safe-point.',
  },
  {
    id: 'PROHIBITED_ITEM',
    label: 'Hàng cấm / Vi phạm nội quy FPT',
    desc: 'Tài liệu thi, phao thi, chất kích thích hoặc vũ khí nguy hiểm.',
  },
  {
    id: 'COUNTERFEIT',
    label: 'Hàng giả / Sai tình trạng thực tế',
    desc: 'Mô tả nguyên seal nhưng đồ cũ nát, tráo đổi mã sản phẩm.',
  },
  {
    id: 'INAPPROPRIATE_CONTENT',
    label: 'Hình ảnh / Nội dung phản cảm',
    desc: 'Hình ảnh thô tục, spam lặp tin hoặc xúc phạm người khác.',
  },
  {
    id: 'OTHER',
    label: 'Lý do khác',
    desc: 'Các hành vi vi phạm chuẩn mực văn hóa FPT khác.',
  },
];

export const USER_REPORT_REASONS: ReportReasonOption[] = [
  {
    id: 'HARASSMENT',
    label: 'Quấy rối / Đe dọa trong khung Chat',
    desc: 'Ngôn từ xúc phạm, spam tin nhắn đe dọa sinh viên.',
  },
  {
    id: 'SCAMMER',
    label: 'Bùng hẹn Safe-Point nhiều lần',
    desc: 'Hẹn giao dịch nhưng bỏ bom không đến, chiếm dụng thời gian.',
  },
  {
    id: 'FAKE_IDENTITY',
    label: 'Mạo danh sinh viên FPT',
    desc: 'Sử dụng thông tin hoặc mã sinh viên giả mạo.',
  },
  {
    id: 'OTHER',
    label: 'Lý do khác',
    desc: 'Các hành vi gian lận vi phạm quy tắc cộng đồng.',
  },
];
