/** Hiển thị bảng hạng — đồng bộ với `tutien-be/src/modules/user/vip.ts` */
export const VIP_TIER_DESCRIPTIONS: { level: number; fromAmount: number; note: string }[] = [
  { level: 0, fromAmount: 0, note: 'Chưa nạp hoặc dưới 100.000đ' },
  { level: 1, fromAmount: 100_000, note: 'Từ 100.000đ' },
  { level: 2, fromAmount: 500_000, note: 'Từ 500.000đ' },
  { level: 3, fromAmount: 1_000_000, note: 'Từ 1.000.000đ' },
  { level: 4, fromAmount: 2_000_000, note: 'Từ 2.000.000đ' },
  { level: 5, fromAmount: 5_000_000, note: 'Từ 5.000.000đ' },
  { level: 6, fromAmount: 10_000_000, note: 'Từ 10.000.000đ' },
  { level: 7, fromAmount: 20_000_000, note: 'Từ 20.000.000đ' },
];

export function formatVnd(n: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
}
