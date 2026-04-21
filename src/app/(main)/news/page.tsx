'use client';

import { useNewsList } from '@/api/news/queries';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/utils/const';
import { CalendarDays, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function formatDateTime(value: string | null) {
  if (!value) return 'Mới cập nhật';
  return new Date(value).toLocaleDateString('vi-VN');
}

function resolveImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiOrigin = API_URL.replace(/\/api\/?$/, '');
  return `${apiOrigin}${imageUrl}`;
}

export default function NewsPage() {
  const [page, setPage] = useState(1);
  const LIMIT = 9;
  const { data, isLoading } = useNewsList({ variables: { page, limit: LIMIT } });
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className='min-h-screen bg-black px-4 py-32'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <div className='text-center'>
          <p className='inline-flex items-center gap-2 rounded-full border border-[#44C8F3]/40 bg-[#44C8F3]/10 px-3 py-1 text-xs text-[#44C8F3] uppercase'>
            <Newspaper size={14} />
            Tin tức
          </p>
          <h1 className='mt-3 font-bold text-3xl text-white'>Bản tin Ngư Tiên Ký</h1>
          <p className='mt-2 text-sm text-white/55'>Theo dõi sự kiện, cập nhật phiên bản và thông báo quan trọng.</p>
        </div>

        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {isLoading &&
            Array.from({ length: LIMIT }).map((_, idx) => (
              <div
                key={`news-skeleton-${idx}`}
                className='h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5'
              />
            ))}
          {!isLoading &&
            items.map((item) => (
              <article key={item.id} className='overflow-hidden rounded-2xl border border-white/10 bg-white/5'>
                {item.coverImage ? (
                  <div
                    className='h-40 bg-cover bg-center'
                    style={{ backgroundImage: `url(${resolveImageUrl(item.coverImage)})` }}
                  />
                ) : (
                  <div className='flex h-40 items-center justify-center bg-gradient-to-r from-[#102033] to-[#0A1524]'>
                    <Newspaper size={28} className='text-[#44C8F3]' />
                  </div>
                )}
                <div className='space-y-3 p-4'>
                  <p className='inline-flex items-center gap-1 text-xs text-white/45'>
                    <CalendarDays size={13} />
                    {formatDateTime(item.publishedAt)}
                  </p>
                  <h2 className='line-clamp-2 font-semibold text-white'>{item.title}</h2>
                  <p className='line-clamp-3 text-sm text-white/65'>{item.excerpt}</p>
                  <Link href={`/news/${item.slug}`} className='text-sm text-[#44C8F3] hover:underline'>
                    Xem chi tiết
                  </Link>
                </div>
              </article>
            ))}
        </div>

        <div className='flex items-center justify-center gap-3'>
          <Button variant='ghost' onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Trang trước
          </Button>
          <span className='text-sm text-white/70'>
            {page} / {totalPages}
          </span>
          <Button
            variant='ghost'
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Trang sau
          </Button>
        </div>
      </div>
    </div>
  );
}
