'use client';

import {
  adminUploadShopImage,
  useAdminCreateShopItem,
  useAdminDeleteShopItem,
  useAdminExternalItems,
  useAdminShopItems,
  useAdminUpdateShopItem,
} from '@/api/shop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Edit2, Loader2, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

function formatVND(n: number) {
  return `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
}

const PAGE_SIZE = 10;
const shopCreateSchema = z.object({
  externalItemId: z.number().int().min(1, 'Vui lòng chọn item từ danh sách API'),
  itemName: z.string().trim().min(1, 'Tên item không được để trống').max(128, 'Tên item tối đa 128 ký tự'),
  itemQuantity: z.number().int().min(1, 'Tồn kho tối thiểu 1'),
  price: z.number().int().min(1000, 'Giá tối thiểu 1.000đ'),
  imageUrl: z.string().trim().nullable().optional(),
});

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
        <div className='flex items-center border-b border-white/10 p-2'>
          <Search size={14} className='mr-2 text-white/30' />
          <input
            className='flex-1 bg-transparent text-sm focus:outline-none'
            placeholder='Tìm theo tên hoặc ID...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className='max-h-64 overflow-y-auto p-1' onWheelCapture={(e) => e.stopPropagation()}>
          {filtered.length === 0 && <div className='py-4 text-center text-xs text-white/30'>Không tìm thấy item</div>}
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

export default function AdminShopPage() {
  const queryClient = useQueryClient();
  const { data: shopRes, isLoading } = useAdminShopItems();
  const { data: extRes } = useAdminExternalItems();
  const extItems = extRes?.items ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [externalItemId, setExternalItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [price, setPrice] = useState('10000');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingCreateImage, setIsUploadingCreateImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingExternalItemId, setEditingExternalItemId] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingQuantity, setEditingQuantity] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [editingImage, setEditingImage] = useState('');
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [page, setPage] = useState(1);

  const itemNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const it of extItems) {
      map.set(Number(it.id), String(it.name ?? '').trim());
    }
    return map;
  }, [extItems]);

  const { mutate: createItem, isPending: creating } = useAdminCreateShopItem({
    onSuccess: () => {
      notifySuccess('Đã tạo', 'Sản phẩm đã thêm vào shop.');
      queryClient.refetchQueries ({ queryKey: useAdminShopItems.getKey() });
      setCreateOpen(false);
      setExternalItemId('');
      setItemName('');
      setItemQuantity('1');
      setPrice('10000');
      setImageUrl('');
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  const { mutate: updateItem, isPending: updating } = useAdminUpdateShopItem({
    onSuccess: () => queryClient.refetchQueries({ queryKey: useAdminShopItems.getKey() }),
    onError: (e) => notifyErrorFromUnknown(e),
  });

  const { mutate: deleteItem, isPending: deleting } = useAdminDeleteShopItem({
    onSuccess: () => {
      notifySuccess('Đã xóa', 'Sản phẩm đã được xóa.');
      queryClient.refetchQueries ({ queryKey: useAdminShopItems.getKey() });
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  function handleCreate() {
    const extId = Number(externalItemId);
    const validated = shopCreateSchema.safeParse({
      externalItemId: extId,
      itemName: itemName.trim() || itemNameById.get(extId) || `Item ${extId}`,
      itemQuantity: Number(itemQuantity),
      price: Number(price),
      imageUrl: imageUrl.trim() || null,
    });
    if (!validated.success) {
      notifyErrorFromUnknown(new Error(validated.error.issues[0]?.message || 'Dữ liệu sản phẩm không hợp lệ'));
      return;
    }
    createItem({
      externalItemId: validated.data.externalItemId,
      itemName: validated.data.itemName,
      itemQuantity: validated.data.itemQuantity,
      price: validated.data.price,
      imageUrl: validated.data.imageUrl ?? null,
      isActive: true,
    });
  }

  async function handleUploadCreateImage(file: File | null) {
    if (!file) return;
    try {
      setIsUploadingCreateImage(true);
      const res = await adminUploadShopImage(file);
      setImageUrl(res.url);
      notifySuccess('Upload thành công', 'Ảnh đã được tải lên.');
    } catch (e) {
      notifyErrorFromUnknown(e);
    } finally {
      setIsUploadingCreateImage(false);
    }
  }

  async function handleUploadEditImage(file: File | null) {
    if (!file) return;
    try {
      setIsUploadingEditImage(true);
      const res = await adminUploadShopImage(file);
      setEditingImage(res.url);
      notifySuccess('Upload thành công', 'Ảnh đã được tải lên.');
    } catch (e) {
      notifyErrorFromUnknown(e);
    } finally {
      setIsUploadingEditImage(false);
    }
  }

  const items = shopRes?.items ?? [];
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  return (
    <div className='space-y-6 p-8'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Quản lý Shop</h1>
          <p className='mt-1 text-sm text-white/50'>Tạo sản phẩm bán cho user, bật/tắt và chỉnh sửa trực tiếp.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'>
          Tạo sản phẩm
        </Button>
      </div>

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/60'>Ảnh</TableHead>
              <TableHead className='text-white/60'>Tên item</TableHead>
              <TableHead className='text-white/60'>Tồn kho</TableHead>
              <TableHead className='text-white/60'>Giá</TableHead>
              <TableHead className='text-white/60'>Mở bán</TableHead>
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
            {!isLoading &&
              pagedItems.map((row) => (
                <TableRow key={row.id} className='border-white/10 bg-transparent hover:bg-white/5'>
                  <TableCell>
                    {row.imageUrl ? (
                      <img src={row.imageUrl} alt={row.itemName} className='h-10 w-10 rounded object-cover' />
                    ) : (
                      <div className='h-10 w-10 rounded bg-white/10' />
                    )}
                  </TableCell>
                  <TableCell className='text-white'>{row.itemName}</TableCell>
                  <TableCell className='text-white/70'>{row.itemQuantity}</TableCell>
                  <TableCell className='text-[#44C8F3]'>{formatVND(row.price)}</TableCell>
                  <TableCell>
                    <button
                      type='button'
                      onClick={() => updateItem({ id: row.id, payload: { isActive: !row.isActive } })}
                      disabled={updating}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full border transition ${
                        row.isActive
                          ? 'border-green-400/40 bg-green-500/20'
                          : 'border-white/20 bg-white/10'
                      }`}
                      aria-pressed={row.isActive}
                      title={row.isActive ? 'Đang mở bán' : 'Đang tắt bán'}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                          row.isActive ? 'translate-x-8 bg-green-300' : 'translate-x-1 bg-white/80'
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='inline-flex items-center gap-2'>
                      <button
                        type='button'
                        className='inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white'
                        onClick={() => {
                          setEditingId(row.id);
                          setEditingExternalItemId(String(row.externalItemId ?? ''));
                          setEditingName(row.itemName);
                          setEditingQuantity(String(row.itemQuantity));
                          setEditingPrice(String(row.price));
                          setEditingImage(row.imageUrl ?? '');
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type='button'
                        disabled={deleting}
                        onClick={() => deleteItem(row.id)}
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

      {!isLoading && (
        <div className='flex items-center justify-between text-sm text-white/45'>
          <span>
            Tổng {total} sản phẩm · {PAGE_SIZE} / trang
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Tạo sản phẩm mới</DialogTitle>
          </DialogHeader>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='space-y-1 sm:col-span-2'>
              <label className='text-xs text-white/60'>Vật phẩm</label>
              <ExternalItemSelector
                value={externalItemId}
                items={extItems.map((it) => ({ id: String(it.id), name: String(it.name).trim() }))}
                onChange={(idStr) => {
                  const id = Number(idStr);
                  setExternalItemId(idStr);
                  if (id && !itemName.trim()) {
                    setItemName(itemNameById.get(id) ?? '');
                  }
                }}
              />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-white/60'>Tên item hiển thị</label>
              <Input value={itemName} onChange={(e) => setItemName(e.target.value)} className='border-white/10 bg-white/5 text-white' />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-white/60'>Số lượng tồn kho</label>
              <Input value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value.replace(/\D/g, ''))} className='border-white/10 bg-white/5 text-white' />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-white/60'>Giá (cho 1 sản phẩm)</label>
              <Input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} className='border-white/10 bg-white/5 text-white' />
            </div>
            <div className='space-y-2 sm:col-span-2'>
              <label className='text-xs text-white/60'>Ảnh sản phẩm</label>
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => handleUploadCreateImage(e.target.files?.[0] ?? null)}
                className='border-white/10 bg-white/5 text-white file:mr-3 file:rounded-md file:border-0 file:bg-[#44C8F3] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-black'
              />
              {isUploadingCreateImage && <p className='text-xs text-white/60'>Đang upload ảnh...</p>}
              {imageUrl && (
                <img src={imageUrl} alt='Preview' className='h-16 w-16 rounded border border-white/10 object-cover' />
              )}
            </div>
            <div className='flex justify-end gap-2 pt-1 sm:col-span-2'>
              <Button variant='ghost' className='text-white/70 hover:bg-white/10' onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreate} disabled={creating || isUploadingCreateImage} className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'>
                {creating && <Loader2 size={14} className='mr-2 animate-spin' />}
                Tạo sản phẩm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingId} onOpenChange={(v) => !v && setEditingId(null)}>
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='space-y-1'>
              <label className='text-xs text-white/60'>Vật phẩm</label>
              <ExternalItemSelector
                value={editingExternalItemId}
                items={extItems.map((it) => ({ id: String(it.id), name: String(it.name).trim() }))}
                onChange={(idStr) => {
                  const id = Number(idStr);
                  setEditingExternalItemId(idStr);
                  if (id) {
                    setEditingName(itemNameById.get(id) ?? '');
                  }
                }}
              />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-white/60'>Tên sản phẩm</label>
              <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className='border-white/10 bg-white/5 text-white' />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <label className='text-xs text-white/60'>Tồn kho</label>
                <Input value={editingQuantity} onChange={(e) => setEditingQuantity(e.target.value.replace(/\D/g, ''))} className='border-white/10 bg-white/5 text-white' />
              </div>
              <div className='space-y-1'>
                <label className='text-xs text-white/60'>Giá</label>
                <Input value={editingPrice} onChange={(e) => setEditingPrice(e.target.value.replace(/\D/g, ''))} className='border-white/10 bg-white/5 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-xs text-white/60'>Ảnh sản phẩm</label>
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => handleUploadEditImage(e.target.files?.[0] ?? null)}
                className='border-white/10 bg-white/5 text-white file:mr-3 file:rounded-md file:border-0 file:bg-[#44C8F3] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-black'
              />
              {isUploadingEditImage && <p className='text-xs text-white/60'>Đang upload ảnh...</p>}
              {editingImage && (
                <img src={editingImage} alt='Preview edit' className='h-16 w-16 rounded border border-white/10 object-cover' />
              )}
            </div>
            <div className='flex justify-end gap-2 pt-1'>
              <Button variant='ghost' className='text-white/70 hover:bg-white/10' onClick={() => setEditingId(null)}>
                Huỷ
              </Button>
              <Button
                disabled={isUploadingEditImage}
                className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'
                onClick={() => {
                  if (!editingId) return;
                  const extId = Number(editingExternalItemId);
                  const validated = shopCreateSchema.safeParse({
                    externalItemId: extId,
                    itemName: editingName.trim(),
                    itemQuantity: Number(editingQuantity),
                    price: Number(editingPrice),
                    imageUrl: editingImage.trim() || null,
                  });
                  if (!validated.success) {
                    notifyErrorFromUnknown(new Error(validated.error.issues[0]?.message || 'Dữ liệu sản phẩm không hợp lệ'));
                    return;
                  }
                  updateItem({
                    id: editingId,
                    payload: {
                      externalItemId: validated.data.externalItemId,
                      itemName: validated.data.itemName,
                      itemQuantity: validated.data.itemQuantity,
                      price: validated.data.price,
                      imageUrl: validated.data.imageUrl ?? null,
                    },
                  });
                  setEditingId(null);
                }}
              >
                Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
