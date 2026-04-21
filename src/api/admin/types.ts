export interface AdminDashboardStatsResponse {
  overview: {
    totalPlayers: number;
    totalGiftCodeBatches: number;
    totalShopItems: number;
  };
  revenue: {
    today: number;
    month: number;
  };
  registrations: {
    today: number;
    month: number;
  };
  dailySeries: Array<{
    date: string;
    revenue: number;
    registrations: number;
  }>;
  generatedAt: string;
}
