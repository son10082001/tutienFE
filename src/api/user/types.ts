import type { UserInfoResponse } from '@/api/auth/types';

export interface AdminUserRow {
  userId: string;
  name: string;
  type: number;
  role: 'ADMIN' | 'USER';
  createTime: string;
  loginTime: string;
}

export interface AdminUserListResponse {
  items: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export type ProfileUpdateResponse = UserInfoResponse;
