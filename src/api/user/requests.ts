import { axiosInstance } from '../axios';
import type { AdminUserListResponse, ProfileUpdateResponse, UpdateProfileInput } from './types';

export const patchProfile = async (data: UpdateProfileInput): Promise<ProfileUpdateResponse> => {
  const { data: res } = await axiosInstance.patch<ProfileUpdateResponse>('/user/profile', data);
  return res;
};

export const adminListUsers = async (page = 1, limit = 10, search?: string): Promise<AdminUserListResponse> => {
  const { data } = await axiosInstance.get<AdminUserListResponse>('/admin/users', {
    params: { page, limit, search: search || undefined },
  });
  return data;
};

export const adminDeleteUser = async (userId: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete<{ message: string }>(`/admin/users/${encodeURIComponent(userId)}`);
  return data;
};
