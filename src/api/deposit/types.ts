export type DepositMethod = 'vietqr' | 'momo';
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
