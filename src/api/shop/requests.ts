import { axiosInstance } from '../axios';
import type {
  BuyShopItemInput,
  CreateShopItemInput,
  ExternalItem,
  ShopItem,
  ShopItemsQuery,
  ShopItemsResponse,
  ShopMeta,
  UpdateShopItemInput,
  UploadShopImageResponse,
} from './types';

export const adminListShopItems = async (): Promise<{ items: ShopItem[] }> => {
  const { data } = await axiosInstance.get('/admin/shop/items');
  return data;
};

export const adminListExternalItems = async (): Promise<{ items: ExternalItem[] }> => {
  const { data } = await axiosInstance.get('/admin/shop/external-items');
  return data;
};

export const adminCreateShopItem = async (payload: CreateShopItemInput): Promise<ShopItem> => {
  const { data } = await axiosInstance.post('/admin/shop/items', payload);
  return data;
};

export const adminUpdateShopItem = async (id: string, payload: UpdateShopItemInput): Promise<ShopItem> => {
  const { data } = await axiosInstance.patch(`/admin/shop/items/${encodeURIComponent(id)}`, payload);
  return data;
};

export const adminDeleteShopItem = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/admin/shop/items/${encodeURIComponent(id)}`);
  return data;
};

export const adminUploadShopImage = async (file: File): Promise<UploadShopImageResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await axiosInstance.post('/admin/shop/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const listShopItems = async (params: ShopItemsQuery): Promise<ShopItemsResponse> => {
  const { data } = await axiosInstance.get('/shop/items', { params });
  return data;
};

export const getShopMeta = async (): Promise<ShopMeta> => {
  const { data } = await axiosInstance.get('/shop/meta');
  return data;
};

export const buyShopItem = async (
  payload: BuyShopItemInput
): Promise<{ balanceAfter: number; order: { id: string } }> => {
  const { data } = await axiosInstance.post('/shop/buy', payload);
  return data;
};
