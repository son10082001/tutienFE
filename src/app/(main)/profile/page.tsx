'use client';

import { useMe } from '@/api/auth';
import { useUpdateProfile } from '@/api/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { formatVnd, VIP_TIER_DESCRIPTIONS } from '@/lib/vip';
import { useAuthStore } from '@/stores/auth-store';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import { Crown, Loader2, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type TabId = 'profile' | 'password';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const { data: me, isLoading } = useMe();

  const [tab, setTab] = useState<TabId>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!editingProfile && me) {
      setEmail(me.email ?? '');
      setPhone(me.phone ?? '');
    }
  }, [me, editingProfile]);

  const { mutate: saveProfile, isPending: savingProfile } = useUpdateProfile({
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: useMe.getKey() });
      notifySuccess('Đã cập nhật', 'Thông tin hồ sơ đã được lưu.');
      setEditingProfile(false);
    },
    onError: (err) => notifyErrorFromUnknown(err),
  });

  const { mutate: savePassword, isPending: savingPassword } = useUpdateProfile({
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: useMe.getKey() });
      notifySuccess('Đã đổi mật khẩu', 'Vui lòng đăng nhập lại nếu cần.');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (err) => notifyErrorFromUnknown(err),
  });

  function startEdit() {
    setEmail(me?.email ?? '');
    setPhone(me?.phone ?? '');
    setEditingProfile(true);
  }

  function cancelEdit() {
    setEditingProfile(false);
    setEmail(me?.email ?? '');
    setPhone(me?.phone ?? '');
  }

  function handleSaveProfile() {
    const em = email.trim();
    if (em.length > 0) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
      if (!ok) {
        notifyErrorFromUnknown(new Error('Email không hợp lệ'));
        return;
      }
    }
    saveProfile({
      email: em,
      phone: phone.trim(),
    });
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    savePassword({
      currentPassword: currentPassword.trim(),
      newPassword: newPassword.trim(),
    });
  }

  if (isLoading && !me) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <Loader2 className='size-8 animate-spin text-[#44C8F3]/50' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black px-4 py-32'>
      <div className='mx-auto max-w-lg'>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-[#44C8F3]/15'>
            <UserCircle className='size-8 text-[#44C8F3]' />
          </div>
          <h1 className='font-bold text-2xl text-white'>Hồ sơ</h1>
          <p className='mt-1 text-sm text-white/50'>Thông tin tài khoản và bảo mật</p>
        </div>

        <div className='mb-6 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1'>
          <button
            type='button'
            onClick={() => setTab('profile')}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-semibold transition',
              tab === 'profile' ? 'bg-[#44C8F3] text-black' : 'text-white/60 hover:text-white'
            )}
          >
            Hồ sơ
          </button>
          <button
            type='button'
            onClick={() => setTab('password')}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-semibold transition',
              tab === 'password' ? 'bg-[#44C8F3] text-black' : 'text-white/60 hover:text-white'
            )}
          >
            Đổi mật khẩu
          </button>
        </div>

        {tab === 'profile' && (
          <div className='space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6'>
            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-white/70'>Tên tài khoản</label>
              <Input
                value={String(me?.userId ?? me?.id ?? '')}
                disabled
                className='border-white/10 bg-white/5 text-white/50'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-white/70'>Email</label>
              {editingProfile ? (
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type='email'
                  autoComplete='email'
                  placeholder='email@example.com'
                  className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
                />
              ) : (
                <p className='rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/90'>
                  {me?.email?.trim() ? me.email : 'Chưa cập nhật'}
                </p>
              )}
            </div>

            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-white/70'>Số điện thoại</label>
              {editingProfile ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type='tel'
                  autoComplete='tel'
                  placeholder='0xxxxxxxxx'
                  className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
                />
              ) : (
                <p className='rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/90'>
                  {me?.phone?.trim() ? me.phone : 'Chưa cập nhật'}
                </p>
              )}
            </div>

            <div className='rounded-xl border border-amber-500/25 bg-amber-500/10 p-4'>
              <div className='mb-2 flex items-center gap-2 text-amber-200'>
                <Crown className='size-5 shrink-0' />
                <span className='font-semibold text-sm'>Hạng VIP</span>
              </div>
              <p className='text-sm text-white/85 leading-relaxed'>{me?.vipLabel ?? '—'}</p>
              <p className='mt-2 text-xs text-white/45'>
                Tổng nạp duyệt:{' '}
                <span className='text-white/70'>{formatVnd(me?.balance ?? 0)}</span>
              </p>
              <details className='mt-3 text-xs text-white/50'>
                <summary className='cursor-pointer text-amber-200/80 hover:text-amber-200'>
                  Bảng mốc VIP
                </summary>
                <ul className='mt-2 space-y-1 border-white/10 border-t pt-2'>
                  {VIP_TIER_DESCRIPTIONS.map((row) => (
                    <li key={row.level}>
                      <span className='text-white/60'>VIP {row.level}</span>
                      {' — '}
                      {row.note}
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            <div className='flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end'>
              <Link
                href={ROUTES.HOME}
                className={cn(
                  'flex h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-medium text-white/70 transition hover:bg-white/10'
                )}
              >
                Quay lại
              </Link>
              {editingProfile ? (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={cancelEdit}
                    disabled={savingProfile}
                    className='h-11 rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10'
                  >
                    Huỷ
                  </Button>
                  <Button
                    type='button'
                    onClick={() => handleSaveProfile()}
                    disabled={savingProfile}
                    className='h-11 rounded-xl bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/90'
                  >
                    {savingProfile && <Loader2 className='mr-2 size-4 animate-spin' />}
                    Lưu hồ sơ
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.TICKET_EXCHANGE}
                    className='flex h-11 items-center justify-center rounded-xl border border-[#44C8F3]/40 px-4 text-sm font-medium text-[#44C8F3] transition hover:bg-[#44C8F3]/10'
                  >
                    Đổi phiếu
                  </Link>
                  <Button
                    type='button'
                    onClick={startEdit}
                    className='h-11 rounded-xl bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/90'
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'password' && (
          <form
            onSubmit={handleChangePassword}
            className='space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6'
          >
            <p className='text-sm text-white/55'>
              Nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 6 ký tự).
            </p>
            <Input
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder='Mật khẩu hiện tại'
              className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
              autoComplete='current-password'
            />
            <Input
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder='Mật khẩu mới'
              className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
              autoComplete='new-password'
            />

            <div className='flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end'>
              <Link
                href={ROUTES.HOME}
                className={cn(
                  'flex h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-medium text-white/70 transition hover:bg-white/10'
                )}
              >
                Quay lại
              </Link>
              <Button
                type='submit'
                disabled={
                  savingPassword || !currentPassword.trim() || newPassword.trim().length < 6
                }
                className='h-11 rounded-xl bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/90'
              >
                {savingPassword && <Loader2 className='mr-2 size-4 animate-spin' />}
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
