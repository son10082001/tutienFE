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

export interface AdminAccessRow {
  userId: string;
  name: string;
  role: 'SUPERADMIN' | 'OPERATOR' | 'ADVERTISER';
  permissions: string[];
  createdAt: string;
}

export interface GameServerSetting {
  id: string;
  code: string;
  name: string;
  host: string | null;
  desc?: string;
  state?: number;
}

export type PaymentChannel = 'bank_transfer' | 'ewallet';

export interface PaymentBankSetting {
  code: string;
  name: string;
  accountName: string | null;
  accountNumber: string | null;
}

export interface PaymentMethodSetting {
  id: string;
  code: string;
  name: string;
  channel: PaymentChannel;
  accountName: string | null;
  accountNumber: string | null;
  phoneNumber: string | null;
  qrTemplate: string | null;
  banks?: PaymentBankSetting[] | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminSettingsResponse {
  rolePermissions: {
    OPERATOR: string[];
    ADVERTISER: string[];
  };
  paymentMethods: PaymentMethodSetting[];
  gameServers: GameServerSetting[];
  allPermissions: string[];
}

export interface AdminAccountListResponse {
  items: AdminAccessRow[];
}
