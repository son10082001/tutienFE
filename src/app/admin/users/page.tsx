'use client';

import type { AdminUserRow } from '@/api/user';
import { useAdminDeleteUser, useAdminUsers } from '@/api/user';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminUsers({
    variables: { page, limit: PAGE_SIZE, search: search || undefined },
  });

  const { mutate: removeUser, isPending: isDeleting } = useAdminDeleteUser({
    onSuccess: () => {
      notifySuccess('Đã xóa', 'Người dùng đã được xóa khỏi hệ thống.');
      queryClient.invalidateQueries({ queryKey: useAdminUsers.getKey() });
      setDeleting(null);
      setPage(1);
    },
    onError: (err) => notifyErrorFromUnknown(err),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function applySearch() {
    setSearch(searchInput.trim());
    setPage(1);
  }

  return (
    <div className='space-y-6 p-8'>
      <div>
        <h1 className='font-bold text-2xl text-white'>Người dùng</h1>
        <p className='mt-1 text-sm text-white/50'>Xem danh sách và xóa tài khoản người chơi (không xóa được admin)</p>
      </div>

      <div className='flex max-w-md gap-2'>
        <div className='relative flex-1'>
          <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/30' />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            placeholder='Tìm theo tài khoản hoặc tên...'
            className='border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/30'
          />
        </div>
        <Button type='button' onClick={applySearch} className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/90'>
          Tìm
        </Button>
      </div>

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/50'>Tài khoản</TableHead>
              <TableHead className='text-white/50'>Tên</TableHead>
              <TableHead className='text-white/50'>Vai trò</TableHead>
              <TableHead className='text-white/50'>Đăng ký</TableHead>
              <TableHead className='text-white/50'>Đăng nhập gần nhất</TableHead>
              <TableHead className='text-right text-white/50'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={6} className='py-12 text-center'>
                  <Loader2 size={20} className='mx-auto animate-spin text-white/30' />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={6} className='py-12 text-center text-white/30'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              items.map((row) => (
                <TableRow key={row.userId} className='border-white/10 bg-transparent hover:bg-white/5'>
                  <TableCell className='font-mono text-xs text-white/80'>{row.userId}</TableCell>
                  <TableCell className='text-white/90'>{row.name}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        row.role === 'ADMIN' ? 'bg-[#44C8F3]/20 text-[#44C8F3]' : 'bg-white/10 text-white/60'
                      )}
                    >
                      {row.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </TableCell>
                  <TableCell className='text-white/50 text-xs'>{formatDate(row.createTime)}</TableCell>
                  <TableCell className='text-white/50 text-xs'>{formatDate(row.loginTime)}</TableCell>
                  <TableCell className='text-right'>
                    {row.role === 'USER' ? (
                      <button
                        type='button'
                        title='Xóa user'
                        onClick={() => setDeleting(row)}
                        className='inline-flex h-8 w-8 items-center justify-center rounded-md text-red-400/70 hover:bg-red-500/15 hover:text-red-400'
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : (
                      <span className='text-white/25 text-xs'>—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && total > 0 && (
        <div className='flex items-center justify-between text-sm text-white/40'>
          <span>Tổng {total} tài khoản · {PAGE_SIZE} / trang</span>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className='flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 disabled:opacity-30'
            >
              <ChevronLeft size={16} />
            </button>
            <span className='text-white/60'>
              {page} / {totalPages}
            </span>
            <button
              type='button'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className='flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 disabled:opacity-30'
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-white'>Xóa người dùng</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-white/65'>
            Xóa vĩnh viễn tài khoản <span className='font-mono font-semibold text-white'>{deleting?.userId}</span>? Toàn bộ
            phiên đăng nhập và lịch sử nạp tiền liên quan cũng sẽ bị xóa. Thao tác không thể hoàn tác.
          </p>
          <div className='mt-4 flex justify-end gap-3'>
            <Button type='button' variant='ghost' onClick={() => setDeleting(null)} className='text-white/70 hover:bg-white/10'>
              Huỷ
            </Button>
            <Button
              type='button'
              disabled={isDeleting}
              onClick={() => deleting && removeUser(deleting.userId)}
              className='gap-2 bg-red-500 font-semibold text-white hover:bg-red-600'
            >
              {isDeleting && <Loader2 size={14} className='animate-spin' />}
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
