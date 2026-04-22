import { axiosInstance } from '../axios';
import type {
  AdminAccountListResponse,
  AdminDashboardStatsResponse,
  AdminSettingsResponse,
  PaymentMethodSetting,
  GameServerSetting,
} from './types';

export const getAdminDashboardStats = async (): Promise<AdminDashboardStatsResponse> => {
  const { data } = await axiosInstance.get<AdminDashboardStatsResponse>('/admin/dashboard/stats');
  return data;
};

export const getAdminSettings = async (): Promise<AdminSettingsResponse> => {
  const { data } = await axiosInstance.get<AdminSettingsResponse>('/admin/settings');
  return data;
};

export const getAdminAccounts = async (): Promise<AdminAccountListResponse> => {
  const { data } = await axiosInstance.get<AdminAccountListResponse>('/admin/admins');
  return data;
};

export const createAdminAccount = async (payload: {
  userId: string;
  name: string;
  password: string;
  role: 'OPERATOR' | 'ADVERTISER';
}) => {
  const { data } = await axiosInstance.post('/admin/admins', payload);
  return data;
};

export const updateAdminAccount = async (
  userId: string,
  payload: { role?: 'SUPERADMIN' | 'OPERATOR' | 'ADVERTISER'; name?: string; password?: string },
) => {
  const { data } = await axiosInstance.patch(`/admin/admins/${encodeURIComponent(userId)}`, payload);
  return data;
};

export const deleteAdminAccount = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/admin/admins/${encodeURIComponent(userId)}`);
};

export const updateRolePermissions = async (
  role: 'OPERATOR' | 'ADVERTISER',
  permissions: string[],
) => {
  const { data } = await axiosInstance.patch(`/admin/settings/role-permissions/${role}`, { permissions });
  return data;
};

export const updatePaymentMethodSetting = async (
  code: 'vietqr' | 'momo',
  payload: {
    accountName?: string | null;
    phoneNumber?: string | null;
    bankName?: string | null;
    bankCode?: string | null;
    bankNumber?: string | null;
  },
): Promise<PaymentMethodSetting> => {
  const { data } = await axiosInstance.patch<PaymentMethodSetting>(`/admin/settings/payment-methods/${code}`, payload);
  return data;
};

export const createGameServerSetting = async (payload: {
  code: string;
  name: string;
  host?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<GameServerSetting> => {
  const { data } = await axiosInstance.post<GameServerSetting>('/admin/settings/game-servers', payload);
  return data;
};

export const deleteGameServerSetting = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/settings/game-servers/${id}`);
};
