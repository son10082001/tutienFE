export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  items: NewsPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeaturedNewsResponse {
  items: NewsPost[];
}

export interface AdminNewsUpsertInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  isFeatured?: boolean;
  isPublished?: boolean;
  publishedAt?: string | null;
}
