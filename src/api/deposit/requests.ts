import { axiosInstance } from '../axios';
import type {
  CreateDepositInput,
  CreateDepositPromotionInput,
  DepositListResponse,
  DepositPromotionListResponse,
  DepositPromotionResponse,
  DepositPromotionRow,
  DepositRequest,
  UpdateDepositAdminInput,
} from './types';

export const createDepositRequest = async (data: CreateDepositInput): Promise<DepositRequest> => {
  const res = await axiosInstance.post('/deposit/request', data);
  return res.data;
};

export const getMyDeposits = async (page = 1, limit = 10): Promise<DepositListResponse> => {
  const res = await axiosInstance.get('/deposit/my', { params: { page, limit } });
  return res.data;
};

export const getDepositPromotion = async (): Promise<DepositPromotionResponse> => {
  const res = await axiosInstance.get<DepositPromotionResponse>('/deposit/promotion');
  return res.data;
};

export const adminListDepositPromotions = async (): Promise<DepositPromotionListResponse> => {
  const res = await axiosInstance.get<DepositPromotionListResponse>('/admin/deposit-promotions');
  return res.data;
};

export const adminCreateDepositPromotion = async (data: CreateDepositPromotionInput): Promise<DepositPromotionRow> => {
  const res = await axiosInstance.post<DepositPromotionRow>('/admin/deposit-promotions', data);
  return res.data;
};

export const adminPatchDepositPromotion = async (
  id: string,
  data: { isActive?: boolean; label?: string | null }
): Promise<DepositPromotionRow> => {
  const res = await axiosInstance.patch<DepositPromotionRow>(
    `/admin/deposit-promotions/${encodeURIComponent(id)}`,
    data
  );
  return res.data;
};

export const adminGetAllDeposits = async (page = 1, limit = 10, status?: string): Promise<DepositListResponse> => {
  const res = await axiosInstance.get('/admin/deposits', { params: { page, limit, status } });
  return res.data;
};

export const adminApproveDeposit = async (id: string, adminNote?: string): Promise<DepositRequest> => {
  const res = await axiosInstance.patch(`/admin/deposits/${id}/approve`, { adminNote });
  return res.data;
};

export const adminRejectDeposit = async (id: string, adminNote?: string): Promise<DepositRequest> => {
  const res = await axiosInstance.patch(`/admin/deposits/${id}/reject`, { adminNote });
  return res.data;
};

export const adminUpdateDeposit = async (id: string, data: UpdateDepositAdminInput): Promise<DepositRequest> => {
  const res = await axiosInstance.patch(`/admin/deposits/${id}`, data);
  return res.data;
};
