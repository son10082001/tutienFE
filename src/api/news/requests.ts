import { axiosInstance } from '../axios';
import { normalizeApiMediaUrl } from '../media-url';
import type { AdminNewsUpsertInput, FeaturedNewsResponse, NewsListResponse, NewsPost } from './types';

function normalizeNewsPost(item: NewsPost): NewsPost {
  return {
    ...item,
    coverImage: normalizeApiMediaUrl(item.coverImage),
  };
}

export const getFeaturedNews = async (limit = 3): Promise<FeaturedNewsResponse> => {
  const res = await axiosInstance.get<FeaturedNewsResponse>('/news/featured', { params: { limit } });
  return {
    ...res.data,
    items: Array.isArray(res.data?.items) ? res.data.items.map(normalizeNewsPost) : [],
  };
};

export const getNewsList = async (page = 1, limit = 9): Promise<NewsListResponse> => {
  const res = await axiosInstance.get<NewsListResponse>('/news', { params: { page, limit } });
  return {
    ...res.data,
    items: Array.isArray(res.data?.items) ? res.data.items.map(normalizeNewsPost) : [],
  };
};

export const getNewsBySlug = async (slug: string): Promise<NewsPost> => {
  const res = await axiosInstance.get<NewsPost>(`/news/${encodeURIComponent(slug)}`);
  return normalizeNewsPost(res.data);
};

export const adminGetNewsList = async (page = 1, limit = 10, search?: string): Promise<NewsListResponse> => {
  const res = await axiosInstance.get<NewsListResponse>('/admin/news', { params: { page, limit, search } });
  return {
    ...res.data,
    items: Array.isArray(res.data?.items) ? res.data.items.map(normalizeNewsPost) : [],
  };
};

export const adminCreateNews = async (payload: AdminNewsUpsertInput): Promise<NewsPost> => {
  const res = await axiosInstance.post<NewsPost>('/admin/news', payload);
  return normalizeNewsPost(res.data);
};

export const adminUpdateNews = async (id: string, payload: AdminNewsUpsertInput): Promise<NewsPost> => {
  const res = await axiosInstance.patch<NewsPost>(`/admin/news/${encodeURIComponent(id)}`, payload);
  return normalizeNewsPost(res.data);
};

export const adminDeleteNews = async (id: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/admin/news/${encodeURIComponent(id)}`);
  return res.data;
};

export const adminUploadNewsImage = async (file: File): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await axiosInstance.post<{ imageUrl: string }>('/admin/news/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    ...res.data,
    imageUrl: normalizeApiMediaUrl(res.data?.imageUrl) ?? '',
  };
};
