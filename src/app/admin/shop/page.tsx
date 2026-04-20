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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Edit2, Loader2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';

function formatVND(n: number) {
  return `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
}

const PAGE_SIZE = 10;

export default function AdminShopPage() {
  const queryClient = useQueryClient();
  const { data: shopRes, isLoading } = useAdminShopItems();
  const { data: extRes } = useAdminExternalItems();
  const extItems = extRes?.items ?? [];

  const [externalItemId, setExternalItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [price, setPrice] = useState('10000');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingCreateImage, setIsUploadingCreateImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      queryClient.invalidateQueries({ queryKey: useAdminShopItems.getKey() });
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  const { mutate: updateItem, isPending: updating } = useAdminUpdateShopItem({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: useAdminShopItems.getKey() }),
    onError: (e) => notifyErrorFromUnknown(e),
  });

  const { mutate: deleteItem, isPending: deleting } = useAdminDeleteShopItem({
    onSuccess: () => {
      notifySuccess('Đã xóa', 'Sản phẩm đã được xóa.');
      queryClient.invalidateQueries({ queryKey: useAdminShopItems.getKey() });
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  function handleCreate() {
    const extId = Number(externalItemId);
    if (!extId) {
      notifyErrorFromUnknown(new Error('Vui lòng chọn item từ danh sách API'));
      return;
    }
    createItem({
      externalItemId: extId,
      itemName: itemName.trim() || itemNameById.get(extId) || `Item ${extId}`,
      itemQuantity: Number(itemQuantity),
      price: Number(price),
      imageUrl: imageUrl.trim() || null,
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
      <div>
        <h1 className='text-2xl font-bold text-white'>Quản lý Shop</h1>
        <p className='mt-1 text-sm text-white/50'>Tạo sản phẩm bán cho user, bật/tắt và chỉnh sửa trực tiếp.</p>
      </div>

      <div className='grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2'>
        <div className='space-y-1'>
          <label className='text-xs text-white/60'>Item từ API ngoài</label>
          <select
            value={externalItemId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setExternalItemId(e.target.value);
              if (id && !itemName.trim()) {
                setItemName(itemNameById.get(id) ?? '');
              }
            }}
            className='h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white'
          >
            <option value=''>-- Chọn item --</option>
            {extItems.map((it) => (
              <option key={it.id} value={it.id}>
                #{it.id} - {String(it.name).trim()}
              </option>
            ))}
          </select>
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
        <div className='sm:col-span-2'>
          <Button onClick={handleCreate} disabled={creating || isUploadingCreateImage} className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'>
            {creating && <Loader2 size={14} className='mr-2 animate-spin' />}
            Tạo sản phẩm
          </Button>
        </div>
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

      <Dialog open={!!editingId} onOpenChange={(v) => !v && setEditingId(null)}>
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
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
                  updateItem({
                    id: editingId,
                    payload: {
                      itemName: editingName.trim(),
                      itemQuantity: Number(editingQuantity),
                      price: Number(editingPrice),
                      imageUrl: editingImage.trim() || null,
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
