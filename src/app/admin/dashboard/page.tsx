'use client';

import { useAdminDashboardStats } from '@/api/admin';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Gift, Loader2, Package, TrendingUp, UserPlus, Users } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function formatVND(n: number) {
  return `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
}

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useAdminDashboardStats();
  const stats = data ?? {
    overview: { totalPlayers: 0, totalGiftCodeBatches: 0, totalShopItems: 0 },
    revenue: { today: 0, month: 0 },
    registrations: { today: 0, month: 0 },
    dailySeries: [],
  };

  const statCards = [
    { label: 'Tổng người chơi', value: `${stats.overview.totalPlayers}`, icon: Users, color: 'text-blue-400' },
    { label: 'Tổng giftcode', value: `${stats.overview.totalGiftCodeBatches}`, icon: Gift, color: 'text-green-400' },
    { label: 'Tổng item shop', value: `${stats.overview.totalShopItems}`, icon: Package, color: 'text-purple-400' },
  ];

  return (
    <div className='space-y-6 p-8'>
      <div>
        <h1 className='font-bold text-2xl text-white'>Dashboard</h1>
        <p className='mt-1 text-sm text-white/50'>Xin chào, {user?.name || user?.userId || 'Admin'}</p>
      </div>

      {isLoading ? (
        <div className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-6 text-white/60'>
          <Loader2 size={18} className='animate-spin' />
          Đang tải thống kê...
        </div>
      ) : null}

      <div className='grid gap-4 sm:grid-cols-3'>
        {statCards.map(({ label, value, icon: Icon, color }) => (
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

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='rounded-xl border border-white/10 bg-white/5 p-5'>
          <div className='mb-4 flex items-center gap-2 text-white'>
            <TrendingUp size={18} className='text-[#44C8F3]' />
            <p className='font-semibold'>Doanh thu nạp tiền</p>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2'>
              <p className='text-sm text-white/60'>Hôm nay</p>
              <p className='font-semibold text-[#44C8F3]'>{formatVND(stats.revenue.today)}</p>
            </div>
            <div className='flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2'>
              <p className='text-sm text-white/60'>Tháng này</p>
              <p className='font-semibold text-[#44C8F3]'>{formatVND(stats.revenue.month)}</p>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-white/10 bg-white/5 p-5'>
          <div className='mb-4 flex items-center gap-2 text-white'>
            <UserPlus size={18} className='text-[#44C8F3]' />
            <p className='font-semibold'>Đăng ký tài khoản</p>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2'>
              <p className='text-sm text-white/60'>Hôm nay</p>
              <p className='font-semibold text-white'>{stats.registrations.today}</p>
            </div>
            <div className='flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2'>
              <p className='text-sm text-white/60'>Tháng này</p>
              <p className='font-semibold text-white'>{stats.registrations.month}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-xl border border-white/10 bg-white/5 p-5'>
        <div className='mb-4 flex items-center gap-2 text-white'>
          <TrendingUp size={18} className='text-[#44C8F3]' />
          <p className='font-semibold'>Biểu đồ 30 ngày: Doanh thu & Đăng ký</p>
        </div>
        <div className='h-[320px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={stats.dailySeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.08)' />
              <XAxis
                dataKey='date'
                tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                tickFormatter={(v: string) => String(v).slice(5)}
              />
              <YAxis yAxisId='left' tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
              <YAxis yAxisId='right' orientation='right' tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#0C111D',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  color: 'white',
                }}
                formatter={(value, name) => {
                  if (name === 'Doanh thu') return [formatVND(Number(value) || 0), String(name)];
                  return [value, String(name)];
                }}
              />
              <Legend />
              <Line
                yAxisId='left'
                type='monotone'
                dataKey='revenue'
                name='Doanh thu'
                stroke='#44C8F3'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='registrations'
                name='Đăng ký'
                stroke='#22c55e'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
