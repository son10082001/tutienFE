export type DepositMethod = string;
export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  /** Thưởng % khi duyệt (đã khóa theo KM lúc tạo yêu cầu) */
  bonusAmount: number;
  promoPercentSnapshot: number | null;
  method: DepositMethod;
  note: string;
  server: string;
  status: DepositStatus;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepositPromotionActive {
  id: string;
  percent: number;
  label: string | null;
  startAt: string;
  endAt: string;
}

export interface DepositPromotionResponse {
  active: DepositPromotionActive | null;
}

export interface CreateDepositPromotionInput {
  percent: number;
  startDate: string;
  endDate: string;
  label?: string;
  isActive?: boolean;
}

export interface DepositPromotionRow {
  id: string;
  percent: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  label: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepositPromotionListResponse {
  items: DepositPromotionRow[];
}

export interface CreateDepositInput {
  amount: number;
  method: DepositMethod;
  /** Không dùng — BE gán nội dung CK `NGUTIENKY+{id}`. */
  note?: string;
  server: string;
}

export interface DepositOptionServer {
  id: string;
  code: string;
  name: string;
  host: string | null;
  isActive: boolean;
}

export interface DepositOptionBank {
  code: string;
  name: string;
  accountName: string | null;
  accountNumber: string | null;
}

export interface DepositOptionMethod {
  id: string;
  code: string;
  name: string;
  channel: 'bank_transfer' | 'ewallet';
  accountName: string | null;
  accountNumber: string | null;
  phoneNumber: string | null;
  qrTemplate: string | null;
  banks?: DepositOptionBank[] | null;
  isActive: boolean;
}

export interface DepositOptionsResponse {
  servers: DepositOptionServer[];
  methods: DepositOptionMethod[];
}

export interface UpdateDepositAdminInput {
  amount?: number;
  note?: string;
  status?: DepositStatus;
  adminNote?: string;
}

export interface DepositListResponse {
  items: DepositRequest[];
  total: number;
  page: number;
  limit: number;
}
