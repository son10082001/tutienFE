'use client';

import { useSupportMeta } from '@/api/support';
import { useAuthStore } from '@/stores/auth-store';
import { Clock3, Headset, Loader2, ShieldCheck } from 'lucide-react';

export default function SupportPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: meta, isLoading: loadingMeta } = useSupportMeta();

  return (
    <div className='min-h-screen bg-black px-4 py-32'>
      <div className='mx-auto max-w-6xl space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-white'>Chăm sóc khách hàng</h1>
          <p className='mt-2 text-sm text-white/55'>
            Tạo yêu cầu hỗ trợ, theo dõi lịch sử và liên hệ CSKH qua các kênh chính thức.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <div className='mb-2 flex items-center gap-2 text-[#44C8F3]'>
              <Headset size={16} />
              <p className='text-sm font-semibold'>Hỗ trợ trực tuyến</p>
            </div>
            <p className='text-xs text-white/60'>08:00 - 23:00 mỗi ngày</p>
          </div>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <div className='mb-2 flex items-center gap-2 text-[#44C8F3]'>
              <Clock3 size={16} />
              <p className='text-sm font-semibold'>Thời gian phản hồi</p>
            </div>
            <p className='text-xs text-white/60'>Trung bình dưới 15 phút</p>
          </div>
          <div className='rounded-xl border border-white/10 bg-white/5 p-4'>
            <div className='mb-2 flex items-center gap-2 text-[#44C8F3]'>
              <ShieldCheck size={16} />
              <p className='text-sm font-semibold'>Bảo mật thông tin</p>
            </div>
            <p className='text-xs text-white/60'>Mọi trao đổi được lưu và bảo vệ</p>
          </div>
        </div>

        <section className='space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4'>
          <h2 className='font-semibold text-white'>Kênh liên hệ</h2>
          {loadingMeta ? (
            <div className='flex items-center gap-2 text-white/50'>
              <Loader2 size={14} className='animate-spin' />
              Đang tải kênh liên hệ...
            </div>
          ) : (
            <div className='grid gap-2 sm:grid-cols-3'>
              {(meta?.channels ?? []).map((channel) => (
                <a
                  key={channel.id}
                  href={channel.url}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white transition hover:border-[#44C8F3]/50 hover:text-[#44C8F3]'
                >
                  <p className='font-semibold'>{channel.name}</p>
                  <p className='mt-1 line-clamp-1 text-xs text-white/45'>{channel.url}</p>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
