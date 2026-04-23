import type { UserInfoResponse } from '@/api/auth/types';

export interface AdminUserRow {
  userId: string;
  type: number;
  role: 'ADMIN' | 'USER';
  createTime: string;
  loginTime: string;
}

export interface AdminUserGameCharacter {
  serverId: number;
  uid: string;
  name: string;
  level: number | null;
}

export interface AdminUserGameServer {
  id: number;
  name: string;
}

export interface AdminUserGameMeta {
  servers: AdminUserGameServer[];
  characters: AdminUserGameCharacter[];
}

export interface AdminSendItemMailPayload {
  serverId: number;
  externalItemId: number;
  quantity: number;
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
