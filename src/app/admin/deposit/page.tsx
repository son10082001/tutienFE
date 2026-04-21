'use client';

import type { DepositRequest, DepositStatus, UpdateDepositAdminInput } from '@/api/deposit';
import { useAdminDeposits, useApproveDeposit, useRejectDeposit, useUpdateDeposit } from '@/api/deposit';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Loader2,
  Percent,
  Search,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { useEffect, useState } from 'react';
import { z } from 'zod';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_CONFIG: Record<DepositStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'bg-yellow-500/15 text-yellow-400' },
  approved: { label: 'Đã duyệt', className: 'bg-green-500/15 text-green-400' },
  rejected: { label: 'Từ chối', className: 'bg-red-500/15 text-red-400' },
};

const METHOD_LABEL: Record<string, string> = {
  vietqr: 'VietQR',
  momo: 'MoMo',
};

const SERVER_LABEL: Record<string, string> = {
  sv1: 'Server 1',
  sv2: 'Server 2',
  sv3: 'Server 3',
};

const updateDepositSchema = z.object({
  amount: z.number().int().min(1000, 'Số tiền tối thiểu 1.000đ').optional(),
  note: z
    .string()
    .trim()
    .regex(/^NT\d{6}$/, 'Mã giao dịch phải theo định dạng NT + 6 số (VD: NT123456)')
    .optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  adminNote: z.string().max(512, 'Ghi chú admin tối đa 512 ký tự').optional(),
});

const adminNoteSchema = z.string().max(512, 'Ghi chú admin tối đa 512 ký tự');

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

function EditDialog({
  item,
  onClose,
}: {
  item: DepositRequest | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutate: update, isPending } = useUpdateDeposit({
    onSuccess: () => {
      notifySuccess('Đã cập nhật', 'Yêu cầu nạp tiền đã được lưu.');
      queryClient.refetchQueries({ queryKey: useAdminDeposits.getKey() });
      onClose();
    },
    onError: (err) => notifyErrorFromUnknown(err),
  });

  const [form, setForm] = useState<UpdateDepositAdminInput>({
    amount: item?.amount,
    note: item?.note ?? '',
    status: item?.status as DepositStatus,
    adminNote: item?.adminNote ?? '',
  });

  if (!item) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validated = updateDepositSchema.safeParse(form);
    if (!validated.success) {
      notifyErrorFromUnknown(new Error(validated.error.issues[0]?.message || 'Dữ liệu cập nhật chưa hợp lệ'));
      return;
    }
    update({ id: item!.id, data: validated.data });
  }

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-white'>Chỉnh sửa yêu cầu nạp</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='mt-2 space-y-4'>
          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-white/70'>Số tiền (VNĐ)</label>
            <Input
              type='number'
              min={1000}
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
              className='border-white/10 bg-white/5 text-white'
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-white/70'>Mã giao dịch</label>
            <Input
              value={form.note}
              onChange={(e) =>
                setForm((p) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                  return { ...p, note: `NT${digits}` };
                })
              }
              placeholder='VD: NT123456'
              className='border-white/10 bg-white/5 font-mono text-white text-sm'
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-white/70'>Trạng thái</label>
            <div className='relative'>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as DepositStatus }))}
                className='flex h-10 w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 pr-9 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#44C8F3]/50 [&>option]:bg-[#0C111D]'
              >
                <option value='pending'>Chờ duyệt</option>
                <option value='approved'>Đã duyệt</option>
                <option value='rejected'>Từ chối</option>
              </select>
              <ChevronDown
                size={15}
                className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-white/70'>Ghi chú admin (tuỳ chọn)</label>
            <Input
              value={form.adminNote}
              onChange={(e) => setForm((p) => ({ ...p, adminNote: e.target.value }))}
              placeholder='Lý do từ chối, ghi chú...'
              className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />
          </div>

          <div className='flex justify-end gap-3 pt-1'>
            <Button
              type='button'
              variant='ghost'
              onClick={onClose}
              className='text-white/60 hover:bg-white/10 hover:text-white'
            >
              Huỷ
            </Button>
            <Button
              type='submit'
              disabled={isPending}
              className='gap-2 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80'
            >
              {isPending && <Loader2 size={14} className='animate-spin' />}
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Approve dialog ───────────────────────────────────────────────────────────

function ApproveDialog({
  item,
  onClose,
}: {
  item: DepositRequest | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState('');
  const { mutate: approve, isPending } = useApproveDeposit({
    onSuccess: () => {
      notifySuccess('Đã duyệt', 'Yêu cầu nạp tiền đã được duyệt.');
      queryClient.invalidateQueries({ queryKey: useAdminDeposits.getKey() });
      onClose();
    },
    onError: (err) => notifyErrorFromUnknown(err),
  });

  useEffect(() => {
    if (item) setAdminNote('');
  }, [item?.id]);

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle className='text-white'>Duyệt yêu cầu nạp</DialogTitle>
        </DialogHeader>
        <p className='mt-1 text-sm text-white/60'>
          Xác nhận duyệt nạp <span className='font-semibold text-white'>{formatVND(item?.amount ?? 0)}</span> của{' '}
          <span className='font-semibold text-white'>{item?.userId}</span>?
        </p>
        <p className='mt-2 font-mono text-xs text-[#44C8F3]/80'>{item?.note}</p>
        <div className='mt-3 space-y-1.5'>
          <label className='text-sm font-medium text-white/70'>Ghi chú admin (tuỳ chọn)</label>
          <Input
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder='Ghi chú khi duyệt...'
            className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
          />
        </div>
        <div className='mt-4 flex justify-end gap-3'>
          <Button variant='ghost' onClick={onClose} className='text-white/60 hover:bg-white/10 hover:text-white'>
            Huỷ
          </Button>
          <Button
            disabled={isPending}
            onClick={() => {
              const validated = adminNoteSchema.safeParse(adminNote);
              if (!validated.success) {
                notifyErrorFromUnknown(new Error(validated.error.issues[0]?.message || 'Ghi chú admin chưa hợp lệ'));
                return;
              }
              approve({ id: item!.id, adminNote: validated.data || undefined });
            }}
            className='gap-2 bg-green-500 font-semibold text-white hover:bg-green-600'
          >
            {isPending && <Loader2 size={14} className='animate-spin' />}
            Duyệt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reject dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  item,
  onClose,
}: {
  item: DepositRequest | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState('');
  const { mutate: reject, isPending } = useRejectDeposit({
    onSuccess: () => {
      notifySuccess('Đã từ chối', 'Yêu cầu nạp tiền đã bị từ chối.');
      queryClient.invalidateQueries({ queryKey: useAdminDeposits.getKey() });
      onClose();
    },
    onError: (err) => notifyErrorFromUnknown(err),
  });

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle className='text-white'>Từ chối yêu cầu nạp</DialogTitle>
        </DialogHeader>
        <p className='mt-1 text-sm text-white/60'>
          Từ chối yêu cầu nạp <span className='font-semibold text-white'>{formatVND(item?.amount ?? 0)}</span> của{' '}
          <span className='font-semibold text-white'>{item?.userId}</span>?
        </p>
        <div className='mt-3 space-y-1.5'>
          <label className='text-sm font-medium text-white/70'>Lý do (tuỳ chọn)</label>
          <Input
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder='Nhập lý do từ chối...'
            className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
          />
        </div>
        <div className='mt-4 flex justify-end gap-3'>
          <Button variant='ghost' onClick={onClose} className='text-white/60 hover:bg-white/10 hover:text-white'>
            Huỷ
          </Button>
          <Button
            disabled={isPending}
            onClick={() => {
              const validated = adminNoteSchema.safeParse(adminNote);
              if (!validated.success) {
                notifyErrorFromUnknown(new Error(validated.error.issues[0]?.message || 'Ghi chú admin chưa hợp lệ'));
                return;
              }
              reject({ id: item!.id, adminNote: validated.data || undefined });
            }}
            className='gap-2 bg-red-500 font-semibold text-white hover:bg-red-600'
          >
            {isPending && <Loader2 size={14} className='animate-spin' />}
            Từ chối
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDepositPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<DepositRequest | null>(null);
  const [approving, setApproving] = useState<DepositRequest | null>(null);
  const [rejecting, setRejecting] = useState<DepositRequest | null>(null);

  const { data, isLoading } = useAdminDeposits({
    variables: { page, limit: PAGE_SIZE, status: statusFilter || undefined },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = search
    ? items.filter(
        (i) =>
          i.userId.toLowerCase().includes(search.toLowerCase()) || i.note.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <div className='space-y-6 p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-wrap items-start gap-3'>
          <div>
            <h1 className='font-bold text-2xl text-white'>Nạp tiền</h1>
            <p className='mt-1 text-sm text-white/50'>Quản lý yêu cầu nạp tiền của người chơi</p>
          </div>
          <Link
            href={ROUTES.ADMIN_DEPOSIT_PROMOTION}
            className='inline-flex items-center gap-2 rounded-lg border border-[#44C8F3]/40 bg-[#44C8F3]/10 px-3 py-2 text-sm font-medium text-[#44C8F3] transition hover:bg-[#44C8F3]/20'
          >
            <Percent size={16} />
            Khuyến mãi nạp tiền
          </Link>
        </div>
        {/* Summary chips */}
        <div className='hidden gap-3 sm:flex'>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <button
              key={s}
              type='button'
              onClick={() => {
                setStatusFilter(statusFilter === s ? '' : s);
                setPage(1);
              }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-all',
                statusFilter === s ? cfg.className : 'bg-white/5 text-white/40 hover:bg-white/10'
              )}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className='relative max-w-xs'>
        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/30' />
        <Input
          placeholder='Tìm user, mã giao dịch...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-9 border-white/10 bg-white/5 text-white placeholder:text-white/30'
        />
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/50'>Mã giao dịch</TableHead>
              <TableHead className='text-white/50'>Người chơi</TableHead>
              <TableHead className='text-white/50'>Số tiền</TableHead>
              <TableHead className='text-white/50'>Phương thức</TableHead>
              {/* <TableHead className='text-white/50'>Server</TableHead> */}
              <TableHead className='text-white/50'>Trạng thái</TableHead>
              <TableHead className='text-white/50'>Thời gian</TableHead>
              <TableHead className='text-right text-white/50'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={8} className='py-12 text-center'>
                  <Loader2 size={20} className='mx-auto animate-spin text-white/30' />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={8} className='py-12 text-center text-white/30'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => {
              const cfg = STATUS_CONFIG[item.status as DepositStatus];
              return (
                <TableRow key={item.id} className='border-white/10 bg-transparent hover:bg-white/5'>
                  <TableCell className='max-w-[200px] truncate font-mono text-xs text-[#44C8F3]/90' title={item.note}>
                    {item.note}
                  </TableCell>
                  <TableCell className='font-mono text-xs text-white/80'>{item.userId}</TableCell>
                  <TableCell className='font-semibold text-[#44C8F3]'>{formatVND(item.amount)}</TableCell>
                  <TableCell className='text-white/70'>{METHOD_LABEL[item.method] ?? item.method}</TableCell>
                  {/* <TableCell className='text-white/70'>{SERVER_LABEL[item.server] ?? item.server}</TableCell> */}
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        cfg.className
                      )}
                    >
                      {item.status === 'pending' && <Clock size={11} />}
                      {item.status === 'approved' && <CheckCircle2 size={11} />}
                      {item.status === 'rejected' && <XCircle size={11} />}
                      {cfg.label}
                    </span>
                    {item.adminNote && (
                      <p className='mt-0.5 text-xs text-white/30 max-w-[120px] truncate'>{item.adminNote}</p>
                    )}
                  </TableCell>
                  <TableCell className='text-xs text-white/40 whitespace-nowrap'>
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      {item.status === 'pending' && (
                        <>
                          <button
                            type='button'
                            title='Duyệt'
                            onClick={() => setApproving(item)}
                            className='flex h-8 w-8 items-center justify-center rounded-md text-green-400/70 hover:bg-green-500/10 hover:text-green-400'
                          >
                            <CheckCircle2 size={15} />
                          </button>
                          <button
                            type='button'
                            title='Từ chối'
                            onClick={() => setRejecting(item)}
                            className='flex h-8 w-8 items-center justify-center rounded-md text-red-400/60 hover:bg-red-500/10 hover:text-red-400'
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                      <button
                        type='button'
                        title='Chỉnh sửa'
                        onClick={() => setEditing(item)}
                        className='flex h-8 w-8 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-white'
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className='flex items-center justify-between text-sm text-white/40'>
          <span>
            Tổng {total} yêu cầu · {PAGE_SIZE} / trang
          </span>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || totalPages <= 1}
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
              disabled={page === totalPages || totalPages <= 1}
              className='flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 disabled:opacity-30'
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <EditDialog item={editing} onClose={() => setEditing(null)} />
      <ApproveDialog item={approving} onClose={() => setApproving(null)} />
      <RejectDialog item={rejecting} onClose={() => setRejecting(null)} />
    </div>
  );
}
