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
  TEXTBOOK = 'TEXTBOOK',         // Giáo trình / Sách / Tài liệu (theo mã môn)
  ELECTRONICS = 'ELECTRONICS',   // Laptop, bàn phím, chuột, màn hình
  DORM_ITEM = 'DORM_ITEM',       // Đồ phòng trọ: Quạt, nệm, tủ, bếp
  VEHICLE = 'VEHICLE',           // Xe máy, xe đạp, mũ bảo hiểm
  ROOM_RENTAL = 'ROOM_RENTAL',   // Nhượng phòng trọ gần trường
  CLOTHING = 'CLOTHING',         // Đồng phục Vovinam, áo cam FU, quần áo
  OTHER = 'OTHER',
}
