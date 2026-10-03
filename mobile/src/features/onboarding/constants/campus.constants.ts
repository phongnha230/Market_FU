export interface CampusItem {
  id: string;
  name: string;
  sub: string;
}

export const ONBOARDING_CAMPUSES: CampusItem[] = [
  { id: 'hn', name: 'Hà Nội', sub: 'Hola Campus' },
  { id: 'hcm', name: 'TP.HCM', sub: 'Khu CNC' },
  { id: 'dn', name: 'Đà Nẵng', sub: 'FPT City' },
  { id: 'qn', name: 'Quy Nhơn', sub: 'An Phú Thịnh' },
  { id: 'ct', name: 'Cần Thơ', sub: 'Nguyễn Văn Cừ' },
];
