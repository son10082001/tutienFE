import { axiosInstance } from '../axios';
import type { CreateGiftCodeInput, CreateGiftCodeResponse, RedeemGiftCodeInput, RedeemGiftCodeResponse } from './types';

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

export const getGiftCodeBatches = async (): Promise<any[]> => {
  const { data } = await axiosInstance.get<any[]>('/admin/gift-codes');
  return data;
};

export const getGiftCodeBatchCodes = async (batchId: number): Promise<string[]> => {
  const { data } = await axiosInstance.get<string[]>(`/admin/gift-codes/${batchId}/codes`);
  return data;
};
