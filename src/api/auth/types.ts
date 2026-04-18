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
  email?: string;
  name?: string;
  role: string;
  type?: number;
  balance?: number;
  kycStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface RegisterAccountRequest {
  name: string;
  email: string;
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
