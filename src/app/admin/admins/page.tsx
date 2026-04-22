'use client';

import {
  useAdminAccounts,
  useCreateAdminAccount,
  useDeleteAdminAccount,
  useUpdateAdminAccount,
} from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useState } from 'react';

const ROLE_OPTIONS = ['OPERATOR', 'ADVERTISER'] as const;

export default function AdminAccountsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminAccounts();
  const { mutate: createAdmin } = useCreateAdminAccount();
  const { mutate: updateAdmin } = useUpdateAdminAccount();
  const { mutate: deleteAdmin } = useDeleteAdminAccount();

  const [form, setForm] = useState({
    userId: '',
    name: '',
    password: '',
    role: 'OPERATOR' as 'OPERATOR' | 'ADVERTISER',
  });
  const [deletingAdmin, setDeletingAdmin] = useState<{ userId: string; name: string } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: useAdminAccounts.getKey() });

  return (
    <div className='space-y-6 p-8 text-white'>
      <div>
        <h1 className='text-2xl font-bold'>Quản lý admin</h1>
        <p className='mt-1 text-sm text-white/60'>Superadmin tạo/sửa/xóa tài khoản admin vận hành và quảng cáo.</p>
      </div>

      <div className='grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-5'>
        <Input
          value={form.userId}
          onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
          placeholder='userId'
          className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
        />
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder='Tên hiển thị'
          className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
        />
        <Input
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          placeholder='Mật khẩu'
          className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
        />
        <select
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as 'OPERATOR' | 'ADVERTISER' }))}
          className='rounded-md border border-white/10 bg-black/30 px-3 text-white [&>option]:bg-[#0C111D] [&>option]:text-white'
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <Button
          onClick={() =>
            createAdmin(form, {
              onSuccess: () => {
                notifySuccess('Thành công', 'Đã tạo tài khoản admin');
                setForm({ userId: '', name: '', password: '', role: 'OPERATOR' });
                refresh();
              },
              onError: notifyErrorFromUnknown,
            })
          }
        >
          Tạo admin
        </Button>
      </div>

      {isLoading ? <p className='text-white/40'>Đang tải...</p> : null}

      <div className='space-y-2'>
        {data?.items.map((a) => (
          <div key={a.userId} className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3'>
            <div>
              <p className='font-mono text-sm'>{a.userId}</p>
              <p className='text-xs text-white/45'>
                {a.name} · {a.role}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              {a.role === 'SUPERADMIN' ? (
                <span className='text-xs text-amber-300'>Superadmin cố định</span>
              ) : (
                <>
                  <select
                    value={a.role}
                    onChange={(e) =>
                      updateAdmin(
                        { userId: a.userId, data: { role: e.target.value as 'OPERATOR' | 'ADVERTISER' } },
                        { onSuccess: refresh, onError: notifyErrorFromUnknown },
                      )
                    }
                    className='rounded-md border border-white/10 bg-black/30 px-3 py-1 text-white [&>option]:bg-[#0C111D] [&>option]:text-white'
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant='destructive'
                    onClick={() => setDeletingAdmin({ userId: a.userId, name: a.name })}
                  >
                    Xóa
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!deletingAdmin} onOpenChange={(v) => !v && setDeletingAdmin(null)}>
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-white'>Xóa tài khoản admin</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-white/65'>
            Bạn có chắc muốn xóa tài khoản <span className='font-mono font-semibold text-white'>{deletingAdmin?.userId}</span>
            {deletingAdmin?.name ? ` (${deletingAdmin.name})` : ''}? Thao tác này không thể hoàn tác.
          </p>
          <div className='mt-4 flex justify-end gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setDeletingAdmin(null)}
              className='text-white/70 hover:bg-white/10'
            >
              Huỷ
            </Button>
            <Button
              type='button'
              className='bg-red-500 font-semibold text-white hover:bg-red-600'
              onClick={() => {
                if (!deletingAdmin) return;
                deleteAdmin(deletingAdmin.userId, {
                  onSuccess: () => {
                    notifySuccess('Đã xóa', 'Tài khoản admin đã được xóa');
                    setDeletingAdmin(null);
                    refresh();
                  },
                  onError: (err) => {
                    notifyErrorFromUnknown(err);
                    setDeletingAdmin(null);
                  },
                });
              }}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
