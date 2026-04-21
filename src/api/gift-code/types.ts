export interface GiftCode {
  id: string;
  code: string;
  batch: number;
}

export interface CreateGiftCodeInput {
  name: string;
  channel: string;
  generateCount: number;
  expiryDate: string;
  bonusesStr: string;
  vipLevel?: number;
  useType?: string;
}

export interface RedeemGiftCodeInput {
  code: string;
  serverId: number;
  roleId: string;
}

export interface RedeemGiftCodeResponse {
  message: string;
}

export interface CreateGiftCodeResponse {
  message: string;
  count: number;
  codes: string[];
}

export interface GiftCodeBatch {
  id: number;
  name: string;
  expiryDate: string;
  channel: string;
  vipLevel: number;
  useType: string;
  bonusesStr: string;
  usedCount: number;
  totalAllowed: number;
}

export interface GiftCodeBatchListResponse {
  items: GiftCodeBatch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
