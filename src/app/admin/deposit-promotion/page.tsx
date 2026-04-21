'use client';

import {
  useAdminCreateDepositPromotion,
  useAdminDepositPromotions,
  useAdminPatchDepositPromotion,
} from '@/api/deposit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Percent } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { z } from 'zod';

const createPromotionSchema = z
  .object({
    percent: z.number().int().min(1, 'Phần trăm thưởng từ 1 đến 100').max(100, 'Phần trăm thưởng từ 1 đến 100'),
    startDate: z.string().min(1, 'Chọn ngày bắt đầu'),
    endDate: z.string().min(1, 'Chọn ngày kết thúc'),
    label: z.string().trim().max(128, 'Tên hiển thị tối đa 128 ký tự').optional(),
  })
  .refine((data) => new Date(data.endDate).getTime() >= new Date(data.startDate).getTime(), {
    message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu',
    path: ['endDate'],
  });

function formatRange(startIso: string, endIso: string) {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${fmt(startIso)} → ${fmt(endIso)}`;
}

export default function AdminDepositPromotionPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminDepositPromotions();
  const items = data?.items ?? [];

  const [percent, setPercent] = useState('10');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [label, setLabel] = useState('');

  const { mutate: createPromo, isPending: creating } = useAdminCreateDepositPromotion({
    onSuccess: () => {
      notifySuccess('Đã tạo', 'Khuyến mãi nạp tiền đã được thêm.');
      queryClient.invalidateQueries({ queryKey: useAdminDepositPromotions.getKey() });
      setLabel('');
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  const { mutate: patchPromo, isPending: patching } = useAdminPatchDepositPromotion({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useAdminDepositPromotions.getKey() });
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const validated = createPromotionSchema.safeParse({
      percent: Number(percent),
      startDate,
      endDate,
      label: label.trim() || undefined,
    });
    if (!validated.success) {
      notifyErrorFromUnknown(new Error(validated.error.issues[0]?.message || 'Dữ liệu khuyến mãi không hợp lệ'));
      return;
    }
    createPromo({
      percent: validated.data.percent,
      startDate: validated.data.startDate,
      endDate: validated.data.endDate,
      label: validated.data.label,
      isActive: true,
    });
  }

  return (
    <div className='space-y-8 p-8'>
      <div className='flex flex-wrap items-center gap-4'>
        <Link
          href={ROUTES.ADMIN_DEPOSIT}
          className='flex items-center gap-2 text-sm text-white/50 transition hover:text-white'
        >
          <ArrowLeft size={16} />
          Nạp tiền
        </Link>
      </div>

      <div>
        <div className='flex items-center gap-2'>
          <Percent className='text-[#44C8F3]' size={28} />
          <div>
            <h1 className='font-bold text-2xl text-white'>Khuyến mãi nạp tiền</h1>
            <p className='mt-1 text-sm text-white/50'>
              Tạo đợt KM theo % và khoảng thời gian. Người chơi nạp trong thời gian hiệu lực được cộng thưởng khi
              admin duyệt.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className='max-w-xl space-y-4 rounded-xl border border-white/10 bg-white/5 p-6'
      >
        <p className='font-medium text-sm text-white/80'>Tạo khuyến mãi mới</p>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <label className='text-sm text-white/60'>% thưởng (1–100)</label>
            <Input
              type='number'
              min={1}
              max={100}
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className='border-white/10 bg-white/5 text-white'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-sm text-white/60'>Tên hiển thị (tuỳ chọn)</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='VD: Khai mở Tu Tiên'
              className='border-white/10 bg-white/5 text-white placeholder:text-white/25'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-sm text-white/60'>Từ ngày</label>
            <Input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='border-white/10 bg-white/5 text-white'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-sm text-white/60'>Đến ngày</label>
            <Input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='border-white/10 bg-white/5 text-white'
            />
          </div>
        </div>
        <Button
          type='submit'
          disabled={creating}
          className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'
        >
          {creating && <Loader2 size={14} className='mr-2 animate-spin' />}
          Tạo khuyến mãi
        </Button>
      </form>

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 hover:bg-transparent'>
              <TableHead className='text-white/50'>%</TableHead>
              <TableHead className='text-white/50'>Thời gian</TableHead>
              <TableHead className='text-white/50'>Tên</TableHead>
              <TableHead className='text-white/50'>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={4} className='py-12 text-center'>
                  <Loader2 className='mx-auto animate-spin text-white/30' size={22} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={4} className='py-10 text-center text-white/40 text-sm'>
                  Chưa có khuyến mãi
                </TableCell>
              </TableRow>
            )}
            {items.map((row) => (
              <TableRow key={row.id} className='border-white/10 hover:bg-white/5'>
                <TableCell className='font-semibold text-[#44C8F3]'>{row.percent}%</TableCell>
                <TableCell className='text-sm text-white/70'>{formatRange(row.startAt, row.endAt)}</TableCell>
                <TableCell className='text-sm text-white/50'>{row.label ?? '—'}</TableCell>
                <TableCell>
                  <button
                    type='button'
                    disabled={patching}
                    onClick={() => patchPromo({ id: row.id, data: { isActive: !row.isActive } })}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition',
                      row.isActive
                        ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                        : 'bg-white/10 text-white/45 hover:bg-white/15'
                    )}
                  >
                    {row.isActive ? 'Đang bật' : 'Đang tắt'}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
