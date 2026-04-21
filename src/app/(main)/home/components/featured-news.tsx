'use client';

import 'swiper/css';

import { useFeaturedNews } from '@/api/news/queries';
import { containerDelayedVariants, textVariants } from '@/components/_animations';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/utils/const';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper/types';

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

export default function FeaturedNews() {
  const { data, isLoading } = useFeaturedNews({ variables: { limit: 10 } });
  const items = data?.items ?? [];
  const useSlider = items.length > 1;
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeSnap, setActiveSnap] = useState(0);
  const snapCount = useMemo(() => swiper?.snapGrid.length ?? items.length, [swiper?.snapGrid.length, items.length]);

  const NewsCard = ({ item }: { item: (typeof items)[number] }) => (
    <article className='group overflow-hidden rounded-2xl border border-white/10 bg-[#0D1422] transition-colors hover:border-[#44C8F3]/35'>
      {item.coverImage ? (
        <div
          className='h-36 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105'
          style={{ backgroundImage: `url(${resolveImageUrl(item.coverImage)})` }}
        />
      ) : (
        <div className='flex h-36 items-center justify-center bg-gradient-to-r from-[#102033] to-[#0A1524]'>
          <Newspaper size={28} className='text-[#44C8F3]' />
        </div>
      )}

      <div className='space-y-3 p-4'>
        <p className='inline-flex items-center gap-1 text-xs text-white/45'>
          <CalendarDays size={13} />
          {formatDateTime(item.publishedAt)}
        </p>
        <h3 className='line-clamp-2 font-semibold text-white leading-6'>{item.title}</h3>
        <p className='line-clamp-3 text-sm text-white/65'>{item.excerpt}</p>
        <Link href={`/news/${item.slug}`} className='inline-block text-sm text-[#44C8F3] hover:underline'>
          Đọc thêm
        </Link>
      </div>
    </article>
  );

  return (
    <section className='relative bg-[#080C14] px-4 py-16 md:py-20'>
      <div className='mx-auto max-w-6xl'>
        <motion.div variants={containerDelayedVariants} initial='hidden' whileInView='visible' viewport={{ once: true }} className='mb-6 flex items-end justify-between gap-3'>
          <motion.div variants={textVariants}>
            <p className='inline-flex items-center gap-2 rounded-full border border-[#44C8F3]/40 bg-[#44C8F3]/10 px-3 py-1 text-xs text-[#44C8F3] uppercase'>
              <Newspaper size={14} />
              Tin tức nổi bật
            </p>
            <h2 className='mt-3 font-bold text-2xl text-white md:text-3xl'>Cập nhật tin tức mới nhất</h2>
          </motion.div>
          <Link href='/news'>
            <Button className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'>Xem thêm</Button>
          </Link>
        </motion.div>

        <motion.div variants={containerDelayedVariants} initial='hidden' whileInView='visible' viewport={{ once: true }}>
          {isLoading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className='h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5' />
            ))}

          {!isLoading && !useSlider && (
            <div className='grid gap-4 md:grid-cols-3'>
              {items.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {!isLoading && useSlider && (
            <div className='space-y-4'>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => swiper?.slidePrev()}
                  className='absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#44C8F3]/35 bg-[#0D1422]/90 text-[#44C8F3] shadow-lg backdrop-blur md:left-2 md:h-9 md:w-9'
                  aria-label='Tin trước'
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type='button'
                  onClick={() => swiper?.slideNext()}
                  className='absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#44C8F3]/35 bg-[#0D1422]/90 text-[#44C8F3] shadow-lg backdrop-blur md:right-2 md:h-9 md:w-9'
                  aria-label='Tin sau'
                >
                  <ChevronRight size={16} />
                </button>
                <Swiper
                  spaceBetween={16}
                  slidesPerView={1}
                  speed={550}
                  grabCursor
                  onSwiper={setSwiper}
                  onSlideChange={(s) => setActiveSnap(s.snapIndex)}
                  breakpoints={{
                    768: { slidesPerView: 2, slidesPerGroup: 1 },
                    1024: { slidesPerView: 3, slidesPerGroup: 1 },
                  }}
                  className='featured-news-swiper'
                >
                  {items.map((item) => (
                    <SwiperSlide key={item.id}>
                      <NewsCard item={item} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className='flex justify-center gap-2 pt-1'>
                {Array.from({ length: snapCount }).map((_, idx) => (
                  <button
                    key={`snap-${idx}`}
                    type='button'
                    onClick={() => swiper?.slideTo(idx)}
                    className={idx === activeSnap ? 'h-1.5 w-6 rounded-full bg-[#44C8F3]' : 'h-1.5 w-1.5 rounded-full bg-white/30'}
                    aria-label={`Tới tin ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
