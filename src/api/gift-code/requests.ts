import { axiosInstance } from '../axios';
import type {
  CreateGiftCodeInput,
  CreateGiftCodeResponse,
  GiftCodeBatch,
  GiftCodeBatchListResponse,
  RedeemGiftCodeInput,
  RedeemGiftCodeResponse,
} from './types';

export const createGiftCodes = async (payload: CreateGiftCodeInput): Promise<string[]> => {
  const { data } = await axiosInstance.post<CreateGiftCodeResponse>('/admin/gift-codes', payload);
  return data.codes;
};

export const redeemGiftCode = async (payload: RedeemGiftCodeInput): Promise<RedeemGiftCodeResponse> => {
  const { data } = await axiosInstance.post<RedeemGiftCodeResponse>('/user/gift-codes/redeem', payload);
  return data;
};

export const getGiftCodeItems = async (): Promise<{ id: string; name: string }[]> => {
  const { data } = await axiosInstance.get<{ id: string; name: string }[]>('/admin/gift-codes/items');
  return data;
};

export const getGiftCodeBatches = async (params: { page?: number; limit?: number; search?: string }): Promise<GiftCodeBatchListResponse> => {
  const { data } = await axiosInstance.get<GiftCodeBatchListResponse>('/admin/gift-codes', { params });
  return data;
};

export const getGiftCodeBatchCodes = async (batchId: number): Promise<string[]> => {
  const { data } = await axiosInstance.get<string[]>(`/admin/gift-codes/${batchId}/codes`);
  return data;
};

export const updateGiftCodeBatch = async (batchId: number, payload: Partial<CreateGiftCodeInput>): Promise<GiftCodeBatch> => {
  const { data } = await axiosInstance.patch<GiftCodeBatch>(`/admin/gift-codes/${batchId}`, payload);
  return data;
};

export const deleteGiftCodeBatch = async (batchId: number): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete<{ message: string }>(`/admin/gift-codes/${batchId}`);
  return data;
};
