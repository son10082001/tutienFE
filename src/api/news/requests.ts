import { axiosInstance } from '../axios';
import type { AdminNewsUpsertInput, FeaturedNewsResponse, NewsListResponse, NewsPost } from './types';

export const getFeaturedNews = async (limit = 3): Promise<FeaturedNewsResponse> => {
  const res = await axiosInstance.get<FeaturedNewsResponse>('/news/featured', { params: { limit } });
  return res.data;
};

export const getNewsList = async (page = 1, limit = 9): Promise<NewsListResponse> => {
  const res = await axiosInstance.get<NewsListResponse>('/news', { params: { page, limit } });
  return res.data;
};

export const getNewsBySlug = async (slug: string): Promise<NewsPost> => {
  const res = await axiosInstance.get<NewsPost>(`/news/${encodeURIComponent(slug)}`);
  return res.data;
};

export const adminGetNewsList = async (
  page = 1,
  limit = 10,
  search?: string
): Promise<NewsListResponse> => {
  const res = await axiosInstance.get<NewsListResponse>('/admin/news', { params: { page, limit, search } });
  return res.data;
};

export const adminCreateNews = async (payload: AdminNewsUpsertInput): Promise<NewsPost> => {
  const res = await axiosInstance.post<NewsPost>('/admin/news', payload);
  return res.data;
};

export const adminUpdateNews = async (id: string, payload: AdminNewsUpsertInput): Promise<NewsPost> => {
  const res = await axiosInstance.patch<NewsPost>(`/admin/news/${encodeURIComponent(id)}`, payload);
  return res.data;
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
  return res.data;
};
