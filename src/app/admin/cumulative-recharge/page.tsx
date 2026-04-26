'use client';

import {
  useAdminCreateCumulativeRechargeMilestone,
  useAdminCumulativeRechargeMilestones,
  useAdminDeleteCumulativeRechargeMilestone,
  useAdminUpdateCumulativeRechargeMilestone,
} from '@/api/cumulative-recharge';
import type { CumulativeGiftEntry, CumulativeMilestoneAdmin } from '@/api/cumulative-recharge/types';
import { adminUploadShopImage, useAdminExternalItems } from '@/api/shop';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Award, Check, ChevronLeft, ChevronRight, Edit2, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 10;

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function ExternalItemSelector({
  value,
  items,
  onChange,
}: {
  value: string;
  items: Array<{ id: string; name: string }>;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items.slice(0, 80);
    return items.filter((it) => it.name.toLowerCase().includes(s) || it.id.includes(s)).slice(0, 80);
  }, [items, search]);

  const selected = items.find((it) => it.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white',
            'hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#44C8F3]/50'
          )}
        >
          <span className='truncate'>{selected ? `#${selected.id} - ${selected.name}` : '-- Chọn item --'}</span>
          <Search size={14} className='ml-2 shrink-0 opacity-50' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-[340px] border-white/10 bg-[#0C111D] p-0 text-white' align='start'>
        <div className='flex items-center border-white/10 border-b p-2'>
          <Search size={14} className='mr-2 text-white/30' />
          <input
            className='flex-1 bg-transparent text-sm focus:outline-none'
            placeholder='Tìm theo tên hoặc ID...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className='max-h-64 overflow-y-auto p-1' onWheelCapture={(e) => e.stopPropagation()}>
          {filtered.length === 0 && <div className='py-4 text-center text-white/30 text-xs'>Không tìm thấy item</div>}
          {filtered.map((it) => (
            <button
              key={it.id}
              type='button'
              onClick={() => {
                onChange(it.id);
                setOpen(false);
                setSearch('');
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[#44C8F3]/10',
                it.id === value && 'bg-[#44C8F3]/20 text-[#44C8F3]'
              )}
            >
              <div className='flex flex-col'>
                <span className='font-medium'>{it.name}</span>
                <span className='text-[10px] opacity-40'>ID: {it.id}</span>
              </div>
              {it.id === value && <Check size={14} />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function emptyGiftRow(): CumulativeGiftEntry {
  return { externalItemId: 0, quantity: 1 };
}

function GiftRowsEditor({
  gifts,
  setGifts,
  extForSelect,
  itemNameById,
  isUploading,
  onUploadImage,
}: {
  gifts: CumulativeGiftEntry[];
  setGifts: React.Dispatch<React.SetStateAction<CumulativeGiftEntry[]>>;
  extForSelect: Array<{ id: string; name: string }>;
  itemNameById: Map<number, string>;
  isUploading: boolean;
  onUploadImage: (idx: number, file: File | null) => Promise<void>;
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <label className='text-white/60 text-xs'>Danh sách quà (item game + số lượng)</label>
        <Button
          type='button'
          variant='primary'
          size='xs'
          onClick={() => setGifts((g) => [...g, emptyGiftRow()])}
        >
          <Plus size={14} className='mr-1' /> Thêm
        </Button>
      </div>
      <div className='space-y-2'>
        {gifts.map((g, idx) => (
          <div key={idx} className='grid gap-2 sm:grid-cols-[1fr_120px_180px_auto] sm:items-end'>
            <ExternalItemSelector
              value={g.externalItemId ? String(g.externalItemId) : ''}
              items={extForSelect}
              onChange={(idStr) => {
                const id = Number(idStr);
                setGifts((prev) => {
                  const next = [...prev];
                  const row = { ...next[idx]!, externalItemId: id };
                  if (id && !row.itemName?.trim()) {
                    row.itemName = itemNameById.get(id) ?? '';
                  }
                  next[idx] = row;
                  return next;
                });
              }}
            />
            <div className='space-y-1'>
              <span className='text-white/50 text-xs'>Số lượng</span>
              <Input
                value={String(g.quantity)}
                onChange={(e) => {
                  const q = Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1);
                  setGifts((prev) => {
                    const next = [...prev];
                    next[idx] = { ...next[idx]!, quantity: q };
                    return next;
                  });
                }}
                className='border-white/10 bg-white/5 text-white'
              />
            </div>
            <div className='space-y-1'>
              <span className='text-white/50 text-xs'>Ảnh item</span>
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => onUploadImage(idx, e.target.files?.[0] ?? null)}
                className='border-white/10 bg-white/5 text-white file:mr-2 file:rounded-md file:border-0 file:bg-[#44C8F3] file:px-2 file:py-1 file:font-semibold file:text-[10px] file:text-black'
              />
              {isUploading && <p className='text-[10px] text-white/50'>Đang upload...</p>}
              {g.imageUrl && (
                <img src={g.imageUrl} alt='gift' className='h-8 w-8 rounded border border-white/10 object-cover' />
              )}
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='text-red-400 hover:bg-red-500/10'
              disabled={gifts.length <= 1}
              onClick={() => setGifts((prev) => prev.filter((_, i) => i !== idx))}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminCumulativeRechargePage() {
  const queryClient = useQueryClient();
  const { data: extRes } = useAdminExternalItems();
  const extItems = extRes?.items ?? [];
  const extForSelect = useMemo(
    () => extItems.map((it) => ({ id: String(it.id), name: String(it.name ?? '').trim() || `Item ${it.id}` })),
    [extItems]
  );
  const itemNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const it of extItems) {
      map.set(Number(it.id), String(it.name ?? '').trim());
    }
    return map;
  }, [extItems]);

  const { data: listRes, isLoading } = useAdminCumulativeRechargeMilestones();
  const rows = listRes?.items ?? [];
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (page > tp) setPage(tp);
  }, [rows.length, page]);

  const [createOpen, setCreateOpen] = useState(false);
  const [threshold, setThreshold] = useState('100000');
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [gifts, setGifts] = useState<CumulativeGiftEntry[]>([emptyGiftRow()]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editThreshold, setEditThreshold] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSort, setEditSort] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editGifts, setEditGifts] = useState<CumulativeGiftEntry[]>([]);
  const [uploadingCreateImage, setUploadingCreateImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  function resetCreateForm() {
    setThreshold('100000');
    setTitle('');
    setSortOrder('0');
    setGifts([emptyGiftRow()]);
  }

  const { mutate: createRow, isPending: creating } = useAdminCreateCumulativeRechargeMilestone({
    onSuccess: () => {
      notifySuccess('Đã tạo mốc', 'Mốc tích nạp đã được lưu.');
      queryClient.invalidateQueries({ queryKey: useAdminCumulativeRechargeMilestones.getKey() });
      setCreateOpen(false);
      resetCreateForm();
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  const { mutate: updateRow, isPending: updating } = useAdminUpdateCumulativeRechargeMilestone({
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: useAdminCumulativeRechargeMilestones.getKey() });
      const keys = Object.keys(variables.data);
      const toggleOnly = keys.length === 1 && keys[0] === 'isActive';
      if (!toggleOnly) {
        notifySuccess('Đã cập nhật', '');
        setEditingId(null);
      }
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  const { mutate: deleteRow, isPending: deleting } = useAdminDeleteCumulativeRechargeMilestone({
    onSuccess: () => {
      notifySuccess('Đã xóa', '');
      queryClient.invalidateQueries({ queryKey: useAdminCumulativeRechargeMilestones.getKey() });
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  function normalizeGifts(list: CumulativeGiftEntry[]): CumulativeGiftEntry[] {
    return list
      .filter((g) => g.externalItemId > 0 && g.quantity > 0)
      .map((g) => ({
        externalItemId: g.externalItemId,
        quantity: g.quantity,
        itemName: g.itemName?.trim() || itemNameById.get(g.externalItemId) || undefined,
        imageUrl: g.imageUrl?.trim() || undefined,
      }));
  }

  async function handleUploadCreateGiftImage(idx: number, file: File | null) {
    if (!file) return;
    try {
      setUploadingCreateImage(true);
      const res = await adminUploadShopImage(file);
      setGifts((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx]!, imageUrl: res.url };
        return next;
      });
      notifySuccess('Upload thành công', 'Ảnh quà đã được cập nhật.');
    } catch (e) {
      notifyErrorFromUnknown(e);
    } finally {
      setUploadingCreateImage(false);
    }
  }

  async function handleUploadEditGiftImage(idx: number, file: File | null) {
    if (!file) return;
    try {
      setUploadingEditImage(true);
      const res = await adminUploadShopImage(file);
      setEditGifts((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx]!, imageUrl: res.url };
        return next;
      });
      notifySuccess('Upload thành công', 'Ảnh quà đã được cập nhật.');
    } catch (e) {
      notifyErrorFromUnknown(e);
    } finally {
      setUploadingEditImage(false);
    }
  }

  function handleCreate() {
    const th = Number(threshold.replace(/\D/g, ''));
    const so = Number(sortOrder.replace(/\D/g, '')) || 0;
    const ng = normalizeGifts(gifts);
    if (!th || th < 1) {
      notifyErrorFromUnknown(new Error('Mốc nạp không hợp lệ'));
      return;
    }
    if (ng.length === 0) {
      notifyErrorFromUnknown(new Error('Thêm ít nhất một quà (item + số lượng)'));
      return;
    }
    createRow({
      thresholdAmount: th,
      title: title.trim() || null,
      gifts: ng,
      sortOrder: so,
      isActive: true,
    });
  }

  function openEdit(m: CumulativeMilestoneAdmin) {
    setEditingId(m.id);
    setEditThreshold(String(m.thresholdAmount));
    setEditTitle(m.title ?? '');
    setEditSort(String(m.sortOrder));
    setEditActive(m.isActive);
    setEditGifts(m.gifts.length ? m.gifts.map((g) => ({ ...g })) : [emptyGiftRow()]);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const th = Number(editThreshold.replace(/\D/g, ''));
    const so = Number(editSort.replace(/\D/g, '')) || 0;
    const ng = normalizeGifts(editGifts);
    if (!th || th < 1) {
      notifyErrorFromUnknown(new Error('Mốc nạp không hợp lệ'));
      return;
    }
    if (ng.length === 0) {
      notifyErrorFromUnknown(new Error('Thêm ít nhất một quà'));
      return;
    }
    updateRow({
      id: editingId,
      data: {
        thresholdAmount: th,
        title: editTitle.trim() || null,
        sortOrder: so,
        isActive: editActive,
        gifts: ng,
      },
    });
  }

  return (
    <div className='space-y-6 p-8'>
      <div className='flex flex-wrap items-center gap-4'>
        <Link
          href={ROUTES.ADMIN_DEPOSIT_PROMOTION}
          className='flex items-center gap-2 text-sm text-white/50 transition hover:text-white'
        >
          <ArrowLeft size={16} />
          KM nạp tiền
        </Link>
      </div>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5'>
            <Award className='text-[#44C8F3]' size={22} />
          </div>
          <div>
            <h1 className='font-bold text-2xl text-white'>Tích nạp</h1>
            
          </div>
        </div>
        <Button
          onClick={() => {
            resetCreateForm();
            setCreateOpen(true);
          }}
          className='shrink-0 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'
        >
          Thêm mốc tích nạp
        </Button>
      </div>

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/60'>Thứ tự</TableHead>
              <TableHead className='text-white/60'>Mốc nạp</TableHead>
              <TableHead className='text-white/60'>Tiêu đề</TableHead>
              <TableHead className='text-white/60'>Quà</TableHead>
              <TableHead className='text-white/60'>Hiển thị</TableHead>
              <TableHead className='text-right text-white/60'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={6} className='py-10 text-center'>
                  <Loader2 className='mx-auto animate-spin text-white/40' size={18} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={6} className='py-12 text-center text-sm text-white/40'>
                  Chưa có mốc nào. Nhấn &quot;Thêm mốc tích nạp&quot; để tạo.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              pagedRows.map((m) => (
                <TableRow key={m.id} className='border-white/10 bg-transparent hover:bg-white/5'>
                  <TableCell className='text-white/80'>{m.sortOrder}</TableCell>
                  <TableCell className='font-medium text-[#44C8F3]'>{formatVND(m.thresholdAmount)}</TableCell>
                  <TableCell className='text-white'>{m.title?.trim() || '—'}</TableCell>
                  <TableCell className='max-w-[260px] text-white/60 text-xs'>
                    <ul className='space-y-0.5'>
                      {m.gifts.map((g) => (
                        <li key={`${m.id}-${g.externalItemId}-${g.quantity}`} className='flex items-center gap-2'>
                          {g.imageUrl ? (
                            <img src={g.imageUrl} alt='gift' className='h-6 w-6 rounded border border-white/10 object-cover' />
                          ) : (
                            <span className='inline-block h-6 w-6 rounded border border-white/10 bg-white/5' />
                          )}
                          <span>
                            #{g.externalItemId} × {g.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <button
                      type='button'
                      onClick={() => updateRow({ id: m.id, data: { isActive: !m.isActive } })}
                      disabled={updating}
                      className={cn(
                        'relative inline-flex h-7 w-14 items-center rounded-full border transition',
                        m.isActive ? 'border-green-400/40 bg-green-500/20' : 'border-white/20 bg-white/10'
                      )}
                      aria-pressed={m.isActive}
                      title={m.isActive ? 'Đang bật' : 'Đang tắt'}
                    >
                      <span
                        className={cn(
                          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
                          m.isActive ? 'translate-x-8 bg-green-300' : 'translate-x-1 bg-white/80'
                        )}
                      />
                    </button>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='inline-flex items-center gap-2'>
                      <button
                        type='button'
                        className='inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white'
                        onClick={() => openEdit(m)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type='button'
                        disabled={deleting}
                        onClick={() => {
                          if (confirm('Xóa mốc này? Chỉ xóa được khi chưa ai nhận quà.')) deleteRow(m.id);
                        }}
                        className='inline-flex h-9 w-9 items-center justify-center rounded-md text-red-400 hover:bg-red-500/10'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && total > 0 && (
        <div className='flex items-center justify-between text-sm text-white/45'>
          <span>
            Tổng {total} mốc · {PAGE_SIZE} / trang
          </span>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className='flex h-8 w-8 items-center justify-center rounded-md border border-white/10 hover:bg-white/10 disabled:opacity-30'
            >
              <ChevronLeft size={16} />
            </button>
            <span className='min-w-[4.5rem] text-center text-white/70'>
              {Math.min(page, totalPages)} / {totalPages}
            </span>
            <button
              type='button'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className='flex h-8 w-8 items-center justify-center rounded-md border border-white/10 hover:bg-white/10 disabled:opacity-30'
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#0C111D] text-white sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Thêm mốc tích nạp</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='space-y-1'>
                <label className='text-white/60 text-xs'>Mốc nạp (VNĐ)</label>
                <Input
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ''))}
                  className='border-white/10 bg-white/5 text-white'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-white/60 text-xs'>Tiêu đề (tuỳ chọn)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='VD: Gói mở đầu'
                  className='border-white/10 bg-white/5 text-white'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-white/60 text-xs'>Thứ tự hiển thị</label>
                <Input
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value.replace(/\D/g, ''))}
                  className='border-white/10 bg-white/5 text-white'
                />
              </div>
            </div>
            <GiftRowsEditor
              gifts={gifts}
              setGifts={setGifts}
              extForSelect={extForSelect}
              itemNameById={itemNameById}
              isUploading={uploadingCreateImage}
              onUploadImage={handleUploadCreateGiftImage}
            />
            <div className='flex justify-end gap-2 pt-1'>
              <Button variant='ghost' className='text-white/70 hover:bg-white/10' onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button
                type='button'
                onClick={handleCreate}
                disabled={creating}
                className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'
              >
                {creating && <Loader2 size={14} className='mr-2 animate-spin' />}
                Tạo mốc
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingId} onOpenChange={(v) => !v && setEditingId(null)}>
        <DialogContent className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#0C111D] text-white sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Sửa mốc tích nạp</DialogTitle>
          </DialogHeader>
          {editingId && (
            <form onSubmit={handleSaveEdit} className='space-y-4'>
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <label className='text-white/60 text-xs'>Mốc (VNĐ)</label>
                  <Input
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(e.target.value.replace(/\D/g, ''))}
                    className='border-white/10 bg-white/5 text-white'
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-white/60 text-xs'>Thứ tự</label>
                  <Input
                    value={editSort}
                    onChange={(e) => setEditSort(e.target.value.replace(/\D/g, ''))}
                    className='border-white/10 bg-white/5 text-white'
                  />
                </div>
              </div>
              <div className='space-y-1'>
                <label className='text-white/60 text-xs'>Tiêu đề</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className='border-white/10 bg-white/5 text-white'
                />
              </div>
              <label className='flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 py-2'>
                <Checkbox checked={editActive} onCheckedChange={(v) => setEditActive(v === true)} />
                <span className='text-sm text-white/70'>Đang bật</span>
              </label>
              <GiftRowsEditor
                gifts={editGifts}
                setGifts={setEditGifts}
                extForSelect={extForSelect}
                itemNameById={itemNameById}
                isUploading={uploadingEditImage}
                onUploadImage={handleUploadEditGiftImage}
              />
              <div className='flex justify-end gap-2 pt-1'>
                <Button type='button' variant='ghost' className='text-white/70 hover:bg-white/10' onClick={() => setEditingId(null)}>
                  Hủy
                </Button>
                <Button type='submit' disabled={updating} className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'>
                  {updating && <Loader2 size={14} className='mr-2 animate-spin' />}
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
