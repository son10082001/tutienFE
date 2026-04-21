import { axiosInstance } from '../axios';
import type { AdminDashboardStatsResponse } from './types';

export const getAdminDashboardStats = async (): Promise<AdminDashboardStatsResponse> => {
  const { data } = await axiosInstance.get<AdminDashboardStatsResponse>('/admin/dashboard/stats');
  return data;
};
