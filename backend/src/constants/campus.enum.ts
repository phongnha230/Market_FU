export enum Campus {
  HOA_LAC = 'HOL',
  HO_CHI_MINH = 'HCM',
  DA_NANG = 'DAD',
  CAN_THO = 'CT',
  QUY_NHON = 'QN',
}

export const CampusNames: Record<Campus, string> = {
  [Campus.HOA_LAC]: 'FPT University Hòa Lạc (Hà Nội)',
  [Campus.HO_CHI_MINH]: 'FPT University TP. Hồ Chí Minh',
  [Campus.DA_NANG]: 'FPT University Đà Nẵng',
  [Campus.CAN_THO]: 'FPT University Cần Thơ',
  [Campus.QUY_NHON]: 'FPT University Quy Nhơn',
};

export enum ProductCategory {
  DORM_ITEM = 'DORM_ITEM',       // Đồ gia dụng phòng trọ / KTX (quạt, tủ lạnh, bếp, nệm, bàn ghế...)
  BOOKS = 'BOOKS',               // Sách đọc, truyện, tài liệu ngoại ngữ / kỹ năng...
  ELECTRONICS = 'ELECTRONICS',   // Màn hình, bàn phím, chuột, tai nghe, sạc cáp...
  VEHICLE = 'VEHICLE',           // Xe máy, xe đạp, xe điện, mũ bảo hiểm...
  CLOTHING = 'CLOTHING',         // Đồng phục Vovinam, áo cam sự kiện, đồ cá nhân...
  ROOM_RENTAL = 'ROOM_RENTAL',   // Nhượng phòng trọ & Tìm bạn ở ghép quanh trường
  OTHER = 'OTHER',
}
