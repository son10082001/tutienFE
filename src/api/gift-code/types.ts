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
