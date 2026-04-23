import { API_URL } from '@/utils/const';
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

const API_BASE_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return 'https://api.ngutienky.com';
  }
})();

function normalizeShopImageUrl(rawUrl?: string | null): string | null {
  const value = rawUrl?.trim();
  if (!value) return null;

  if (value.startsWith('/')) {
    return `${API_BASE_ORIGIN}${value}`;
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return `${API_BASE_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch {
    return value;
  }
}

function normalizeShopItemImage(item: ShopItem): ShopItem {
  return {
    ...item,
    imageUrl: normalizeShopImageUrl(item.imageUrl),
  };
}

export const adminListShopItems = async (): Promise<{ items: ShopItem[] }> => {
  const { data } = await axiosInstance.get('/admin/shop/items');
  return {
    ...data,
    items: Array.isArray(data?.items) ? data.items.map(normalizeShopItemImage) : [],
  };
};

export const adminListExternalItems = async (): Promise<{ items: ExternalItem[] }> => {
  const { data } = await axiosInstance.get('/admin/shop/external-items');
  return data;
};

export const adminCreateShopItem = async (payload: CreateShopItemInput): Promise<ShopItem> => {
  const { data } = await axiosInstance.post('/admin/shop/items', payload);
  return normalizeShopItemImage(data);
};

export const adminUpdateShopItem = async (id: string, payload: UpdateShopItemInput): Promise<ShopItem> => {
  const { data } = await axiosInstance.patch(`/admin/shop/items/${encodeURIComponent(id)}`, payload);
  return normalizeShopItemImage(data);
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
  return {
    ...data,
    url: normalizeShopImageUrl(data?.url) ?? '',
  };
};

export const listShopItems = async (params: ShopItemsQuery): Promise<ShopItemsResponse> => {
  const { data } = await axiosInstance.get('/shop/items', { params });
  return {
    ...data,
    items: Array.isArray(data?.items) ? data.items.map(normalizeShopItemImage) : [],
  };
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
