'use client';

import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Gift, Users, TrendingUp } from 'lucide-react';

const STAT_CARDS = [
  { label: 'Người chơi', value: '—', icon: Users, color: 'text-blue-400' },
  { label: 'Gift Code đang hoạt động', value: '—', icon: Gift, color: 'text-green-400' },
  { label: 'Lượt nhập mã hôm nay', value: '—', icon: TrendingUp, color: 'text-yellow-400' },
];

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className='space-y-6 p-8'>
      <div>
        <h1 className='font-bold text-2xl text-white'>Dashboard</h1>
        <p className='mt-1 text-sm text-white/50'>Xin chào, {user?.name || user?.userId || 'Admin'}</p>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className='flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5'
          >
            <div className={cn('rounded-lg bg-white/10 p-3', color)}>
              <Icon size={20} />
            </div>
            <div>
              <p className='text-xs text-white/50'>{label}</p>
              <p className='mt-0.5 font-bold text-xl text-white'>{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
