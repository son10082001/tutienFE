import { createMutation, createQuery } from 'react-query-kit';
import {
  adminCreateNews,
  adminDeleteNews,
  adminGetNewsList,
  adminUploadNewsImage,
  adminUpdateNews,
  getFeaturedNews,
  getNewsBySlug,
  getNewsList,
} from './requests';
import type { AdminNewsUpsertInput, FeaturedNewsResponse, NewsListResponse, NewsPost } from './types';

export const useFeaturedNews = createQuery<FeaturedNewsResponse, { limit?: number }, Error>({
  primaryKey: 'featured-news',
  queryFn: ({ queryKey: [, variables] }) => getFeaturedNews(variables?.limit),
});

export const useNewsList = createQuery<NewsListResponse, { page?: number; limit?: number }, Error>({
  primaryKey: 'news-list',
  queryFn: ({ queryKey: [, variables] }) => getNewsList(variables?.page, variables?.limit),
});

export const useNewsBySlug = createQuery<NewsPost, { slug: string }, Error>({
  primaryKey: 'news-detail',
  queryFn: ({ queryKey: [, variables] }) => getNewsBySlug(variables.slug),
});

export const useAdminNewsList = createQuery<
  NewsListResponse,
  { page?: number; limit?: number; search?: string },
  Error
>({
  primaryKey: 'admin-news-list',
  queryFn: ({ queryKey: [, variables] }) => adminGetNewsList(variables?.page, variables?.limit, variables?.search),
});

export const useAdminCreateNews = createMutation({
  mutationFn: (payload: AdminNewsUpsertInput) => adminCreateNews(payload),
});

export const useAdminUpdateNews = createMutation({
  mutationFn: ({ id, payload }: { id: string; payload: AdminNewsUpsertInput }) => adminUpdateNews(id, payload),
});

export const useAdminDeleteNews = createMutation({
  mutationFn: (id: string) => adminDeleteNews(id),
});

export const useAdminUploadNewsImage = createMutation({
  mutationFn: (file: File) => adminUploadNewsImage(file),
});
