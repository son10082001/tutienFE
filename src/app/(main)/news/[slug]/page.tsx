'use client';

import { useNewsBySlug } from '@/api/news/queries';
import { API_URL } from '@/utils/const';
import { CalendarDays, ChevronLeft, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Markdown from 'react-markdown';

function formatDateTime(value: string | null) {
  if (!value) return 'Mới cập nhật';
  return new Date(value).toLocaleString('vi-VN');
}

function resolveImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiOrigin = API_URL.replace(/\/api\/?$/, '');
  return `${apiOrigin}${imageUrl}`;
}

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const { data, isLoading, isError } = useNewsBySlug({ variables: { slug }, enabled: !!slug });

  if (isLoading) {
    return <div className='min-h-screen bg-black px-4 py-32 text-center text-white/60'>Đang tải bài viết...</div>;
  }

  if (isError || !data) {
    return (
      <div className='min-h-screen bg-black px-4 py-32'>
        <div className='mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center'>
          <p className='text-white/75'>Không tìm thấy bài viết hoặc bài viết chưa được xuất bản.</p>
          <Link href='/news' className='mt-4 inline-flex items-center gap-1 text-[#44C8F3] hover:underline'>
            <ChevronLeft size={16} />
            Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black px-4 py-32'>
      <article className='mx-auto max-w-4xl'>
        <Link href='/news' className='mb-4 inline-flex items-center gap-1 text-sm text-[#44C8F3] hover:underline'>
          <ChevronLeft size={16} />
          Quay lại trang tin tức
        </Link>

        {data.coverImage ? (
          <div className='mb-5 h-64 w-full rounded-2xl border border-white/10 bg-cover bg-center' style={{ backgroundImage: `url(${resolveImageUrl(data.coverImage)})` }} />
        ) : (
          <div className='mb-5 flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-[#102033] to-[#0A1524]'>
            <Newspaper size={32} className='text-[#44C8F3]' />
          </div>
        )}

        <h1 className='font-bold text-3xl text-white leading-tight'>{data.title}</h1>
        <p className='mt-2 inline-flex items-center gap-1 text-sm text-white/45'>
          <CalendarDays size={14} />
          {formatDateTime(data.publishedAt)}
        </p>

        <div className='prose prose-invert mt-6 max-w-none prose-headings:text-white prose-p:text-white/80'>
          <Markdown>{data.content}</Markdown>
        </div>
      </article>
    </div>
  );
}
