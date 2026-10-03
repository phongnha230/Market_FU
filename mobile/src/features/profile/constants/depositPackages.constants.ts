export interface DepositPackage {
  amount: number;
  coins: number;
  bonusPercent: number;
  badge?: string;
}

export const DEPOSIT_PACKAGES: DepositPackage[] = [
  { amount: 20000, coins: 20, bonusPercent: 0 },
  { amount: 50000, coins: 55, bonusPercent: 10, badge: 'Phổ biến' },
  { amount: 100000, coins: 120, bonusPercent: 20, badge: 'Ưu đãi +20%' },
  { amount: 200000, coins: 250, bonusPercent: 25, badge: 'Tiết kiệm nhất' },
];
