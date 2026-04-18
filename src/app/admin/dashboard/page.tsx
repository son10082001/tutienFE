'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8'>
      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
        <p className='font-medium text-sm text-violet-600'>Admin Dashboard (Fake)</p>
        <h1 className='mt-2 font-bold text-3xl text-slate-900'>Quan tri he thong game Tu Tien</h1>
        <p className='mt-2 text-slate-600'>
          Xin chao {user?.name || 'Admin'}, day la trang dashboard tam de ban tu thiet ke UI sau.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {['Thong ke nguoi choi', 'Quan ly giao dich nap/rut', 'Quan ly su kien va qua tang'].map((item) => (
          <div key={item} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <h2 className='font-semibold text-lg text-slate-900'>{item}</h2>
            <p className='mt-2 text-slate-600 text-sm'>
              Placeholder chuc nang, ban co the thay bang component dashboard thuc te sau.
            </p>
            <Button className='mt-4 w-full'>Xem chi tiet</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
