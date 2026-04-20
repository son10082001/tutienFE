export interface SignInRequest {
  userId: string;
  password: string;
}

export interface SignInResponse {
  user: UserInfoResponse;
  accessToken: string;
  redirectTo: string;
}

export interface ITokens {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

export interface UserInfoResponse {
  id: string | number;
  userId?: string;
  email?: string | null;
  phone?: string | null;
  name?: string;
  role: string;
  type?: number;
  balance?: number;
  ticketBalance?: number;
  /** Hạng VIP theo tổng nạp duyệt (đồng bộ backend) */
  vipLevel?: number;
  vipLabel?: string;
  nextVipLevel?: number | null;
  amountToNextVip?: number | null;
  kycStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface RegisterAccountRequest {
  userId: string;
  password: string;
  referredBy?: string;
}

export interface KycSubmissionRequest {
  documentType: 'cccd' | 'passport';
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  nationality: string;
  permanentAddress: string;
  frontImage: string;
  backImage: string;
  portraitImage: string;
}

export interface KycInfoResponse {
  id: string;
  user: string;
  documentType: 'cccd' | 'passport';
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  nationality: string;
  permanentAddress: string;
  frontImage: string;
  backImage: string;
  portraitImage: string;
  status: 'pending' | 'approved' | 'rejected';
}
