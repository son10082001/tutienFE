import { createMutation, createQuery } from 'react-query-kit';
import {
  createGameServerSetting,
  createAdminAccount,
  deleteGameServerSetting,
  deleteAdminAccount,
  getAdminAccounts,
  getAdminDashboardStats,
  getAdminSettings,
  updateAdminAccount,
  updatePaymentMethodSetting,
  updateRolePermissions,
} from './requests';

export const useAdminDashboardStats = createQuery({
  primaryKey: 'admin-dashboard-stats',
  queryFn: () => getAdminDashboardStats(),
});

export const useAdminSettings = createQuery({
  primaryKey: 'admin-settings',
  queryFn: () => getAdminSettings(),
});

export const useAdminAccounts = createQuery({
  primaryKey: 'admin-accounts',
  queryFn: () => getAdminAccounts(),
});

export const useCreateAdminAccount = createMutation({
  mutationFn: createAdminAccount,
});

export const useUpdateAdminAccount = createMutation({
  mutationFn: ({ userId, data }: { userId: string; data: { role?: 'SUPERADMIN' | 'OPERATOR' | 'ADVERTISER'; name?: string; password?: string } }) =>
    updateAdminAccount(userId, data),
});

export const useDeleteAdminAccount = createMutation({
  mutationFn: deleteAdminAccount,
});

export const useUpdateRolePermissions = createMutation({
  mutationFn: ({ role, permissions }: { role: 'OPERATOR' | 'ADVERTISER'; permissions: string[] }) =>
    updateRolePermissions(role, permissions),
});

export const useUpdatePaymentMethodSetting = createMutation({
  mutationFn: ({ code, data }: { code: 'vietqr' | 'momo'; data: any }) => updatePaymentMethodSetting(code, data),
});

export const useCreateGameServerSetting = createMutation({
  mutationFn: createGameServerSetting,
});

export const useDeleteGameServerSetting = createMutation({
  mutationFn: deleteGameServerSetting,
});
