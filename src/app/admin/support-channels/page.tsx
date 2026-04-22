'use client';

import {
  useAdminSupportChannels,
  useCreateAdminSupportChannel,
  useDeleteAdminSupportChannel,
  useUploadAdminSupportIcon,
  useUpdateAdminSupportChannel,
} from '@/api/support';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/stores/auth-store';
import { API_URL } from '@/utils/const';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

const createSupportChannelSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Mã kênh tối thiểu 2 ký tự')
    .max(32, 'Mã kênh tối đa 32 ký tự')
    .regex(/^[a-z0-9_-]+$/i, 'Mã chỉ gồm chữ, số, _ hoặc -'),
  name: z.string().trim().min(2, 'Tên kênh tối thiểu 2 ký tự').max(128, 'Tên kênh tối đa 128 ký tự'),
  url: z.string().trim().url('URL không hợp lệ').max(512, 'URL quá dài'),
  icon: z.string().trim().max(64, 'Icon tối đa 64 ký tự').optional().nullable(),
  sortOrder: z.coerce.number().int('Thứ tự phải là số nguyên').min(0, 'Thứ tự phải >= 0').max(9999, 'Thứ tự quá lớn'),
});

function toAssetUrl(src?: string | null) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  const apiOrigin = API_URL.replace(/\/api\/?$/, '');
  return `${apiOrigin}${src.startsWith('/') ? '' : '/'}${src}`;
}

function StatusToggle({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-14 items-center rounded-full border transition ${
        checked
          ? 'border-emerald-400/70 bg-emerald-500/30'
          : 'border-white/20 bg-white/10'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          checked ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function AdminSupportChannelsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.adminRole === 'SUPERADMIN';

  const { data, isLoading } = useAdminSupportChannels();
  const { mutate: createSupportChannel } = useCreateAdminSupportChannel();
  const { mutate: updateSupportChannel } = useUpdateAdminSupportChannel();
  const { mutate: deleteSupportChannel } = useDeleteAdminSupportChannel();
  const { mutate: uploadIcon, isPending: uploadingIcon } = useUploadAdminSupportIcon();

  const [newChannel, setNewChannel] = useState({
    code: '',
    name: '',
    url: '',
    icon: '',
    sortOrder: '0',
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<'code' | 'name' | 'url' | 'icon' | 'sortOrder', string>>>(
    {},
  );
  const [editErrors, setEditErrors] = useState<Partial<Record<'name' | 'url' | 'icon' | 'sortOrder', string>>>({});
  const [editingChannel, setEditingChannel] = useState<{
    id: string;
    code: string;
    name: string;
    url: string;
    icon: string;
    sortOrder: string;
    isActive: boolean;
  } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: useAdminSupportChannels.getKey() });

  function handleCreateChannel() {
    const parsed = createSupportChannelSchema.safeParse({
      code: newChannel.code,
      name: newChannel.name,
      url: newChannel.url,
      icon: newChannel.icon || null,
      sortOrder: newChannel.sortOrder,
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFormErrors({
        code: flattened.code?.[0],
        name: flattened.name?.[0],
        url: flattened.url?.[0],
        icon: flattened.icon?.[0],
        sortOrder: flattened.sortOrder?.[0],
      });
      return;
    }

    setFormErrors({});
    createSupportChannel(
      {
        code: parsed.data.code,
        name: parsed.data.name,
        url: parsed.data.url,
        icon: parsed.data.icon ?? null,
        sortOrder: parsed.data.sortOrder,
        isActive: true,
      },
      {
        onSuccess: () => {
          notifySuccess('Đã tạo', 'Đã thêm kênh liên hệ');
          setNewChannel({ code: '', name: '', url: '', icon: '', sortOrder: '0' });
          setFormErrors({});
          setOpenCreateDialog(false);
          refresh();
        },
        onError: notifyErrorFromUnknown,
      },
    );
  }

  function openEdit(channel: {
    id: string;
    code: string;
    name: string;
    url: string;
    icon: string | null;
    sortOrder: number;
    isActive: boolean;
  }) {
    setEditingChannel({
      id: channel.id,
      code: channel.code,
      name: channel.name,
      url: channel.url,
      icon: channel.icon ?? '',
      sortOrder: String(channel.sortOrder),
      isActive: channel.isActive,
    });
    setEditErrors({});
    setOpenEditDialog(true);
  }

  function handleSaveEdit() {
    if (!editingChannel) return;
    const parsed = createSupportChannelSchema.omit({ code: true }).safeParse({
      name: editingChannel.name,
      url: editingChannel.url,
      icon: editingChannel.icon || null,
      sortOrder: editingChannel.sortOrder,
    });
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setEditErrors({
        name: flattened.name?.[0],
        url: flattened.url?.[0],
        icon: flattened.icon?.[0],
        sortOrder: flattened.sortOrder?.[0],
      });
      return;
    }
    setEditErrors({});
    updateSupportChannel(
      {
        id: editingChannel.id,
        data: {
          name: parsed.data.name,
          url: parsed.data.url,
          icon: parsed.data.icon ?? null,
          sortOrder: parsed.data.sortOrder,
          isActive: editingChannel.isActive,
        },
      },
      {
        onSuccess: () => {
          notifySuccess('Đã lưu', 'Đã cập nhật kênh liên hệ');
          setOpenEditDialog(false);
          setEditingChannel(null);
          refresh();
        },
        onError: notifyErrorFromUnknown,
      },
    );
  }

  return (
    <div className='space-y-6 p-8 text-white'>
      <div>
        <h1 className='text-2xl font-bold'>Kênh liên hệ CSKH</h1>
      </div>

      {isSuperAdmin ? (
        <div className='flex justify-end'>
          <Button onClick={() => setOpenCreateDialog(true)}>Tạo kênh liên hệ</Button>
        </div>
      ) : null}

      {isLoading ? <p className='text-white/50'>Đang tải...</p> : null}

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/50'>Icon</TableHead>
              <TableHead className='text-white/50'>Mã</TableHead>
              <TableHead className='text-white/50'>Tên</TableHead>
              <TableHead className='text-white/50'>URL</TableHead>
              <TableHead className='text-white/50'>Thứ tự</TableHead>
              <TableHead className='text-white/50'>Trạng thái</TableHead>
              <TableHead className='text-right text-white/50'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.items ?? []).map((channel) => (
              <TableRow key={channel.id} className='border-white/10 bg-transparent hover:bg-white/5'>
                <TableCell>
                  {channel.icon ? (
                    <img src={toAssetUrl(channel.icon)} alt={channel.name} className='h-8 w-8 rounded object-cover' />
                  ) : (
                    <span className='text-xs text-white/35'>—</span>
                  )}
                </TableCell>
                <TableCell className='font-mono text-xs text-white/80'>{channel.code}</TableCell>
                <TableCell className='text-white/90'>{channel.name}</TableCell>
                <TableCell className='max-w-[320px] truncate text-white/70'>{channel.url}</TableCell>
                <TableCell className='text-white/80'>{channel.sortOrder}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <StatusToggle
                      checked={channel.isActive}
                      disabled={!isSuperAdmin}
                      onToggle={() =>
                        updateSupportChannel(
                          { id: channel.id, data: { isActive: !channel.isActive } },
                          { onSuccess: refresh, onError: notifyErrorFromUnknown },
                        )
                      }
                    />
                    <span className={`text-xs ${channel.isActive ? 'text-emerald-300' : 'text-white/50'}`}>
                      {channel.isActive ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className='text-right space-x-2'>
                  <Button variant='outline' disabled={!isSuperAdmin} onClick={() => openEdit(channel)}>
                    Sửa
                  </Button>
                  <Button
                    variant='destructive'
                    disabled={!isSuperAdmin}
                    onClick={() => {
                      if (!window.confirm(`Xóa kênh ${channel.name}?`)) return;
                      deleteSupportChannel(channel.id, {
                        onSuccess: () => {
                          notifySuccess('Đã xóa', 'Đã xóa kênh liên hệ');
                          refresh();
                        },
                        onError: notifyErrorFromUnknown,
                      });
                    }}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle className='text-white'>Tạo kênh liên hệ CSKH</DialogTitle>
          </DialogHeader>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div>
              <Input
                value={newChannel.code}
                onChange={(e) => setNewChannel((p) => ({ ...p, code: e.target.value }))}
                placeholder='Mã (fb, zl,...)'
                className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
              />
              {formErrors.code ? <p className='mt-1 text-xs text-red-400'>{formErrors.code}</p> : null}
            </div>
            <div>
              <Input
                value={newChannel.name}
                onChange={(e) => setNewChannel((p) => ({ ...p, name: e.target.value }))}
                placeholder='Tên kênh'
                className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
              />
              {formErrors.name ? <p className='mt-1 text-xs text-red-400'>{formErrors.name}</p> : null}
            </div>
            <div className='sm:col-span-2'>
              <div className='space-y-2'>
                <Input
                  value={newChannel.url}
                  onChange={(e) => setNewChannel((p) => ({ ...p, url: e.target.value }))}
                  placeholder='URL'
                  className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
                />
                <div className='flex items-center gap-2'>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      uploadIcon(file, {
                        onSuccess: (res) => {
                          setNewChannel((p) => ({ ...p, icon: res.imageUrl, url: p.url || res.imageUrl }));
                          notifySuccess('Tải lên thành công', 'Đã cập nhật icon kênh');
                        },
                        onError: notifyErrorFromUnknown,
                      });
                      e.currentTarget.value = '';
                    }}
                    className='border-white/10 bg-black/30 text-white file:mr-2 file:rounded file:border-0 file:bg-[#44C8F3] file:px-2 file:py-1 file:text-black'
                  />
                  {uploadingIcon ? <Loader2 size={16} className='animate-spin text-white/60' /> : null}
                </div>
                {newChannel.icon ? (
                  <div className='flex items-center gap-2'>
                    <img src={toAssetUrl(newChannel.icon)} alt='Icon preview' className='h-8 w-8 rounded object-cover' />
                    <span className='text-xs text-white/50'>{newChannel.icon}</span>
                  </div>
                ) : null}
              </div>
              {formErrors.url ? <p className='mt-1 text-xs text-red-400'>{formErrors.url}</p> : null}
            </div>
            <div>
              <Input
                value={newChannel.icon}
                onChange={(e) => setNewChannel((p) => ({ ...p, icon: e.target.value }))}
                placeholder='Icon (tuỳ chọn)'
                className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
              />
              {formErrors.icon ? <p className='mt-1 text-xs text-red-400'>{formErrors.icon}</p> : null}
            </div>
            <div>
              <Input
                value={newChannel.sortOrder}
                onChange={(e) => setNewChannel((p) => ({ ...p, sortOrder: e.target.value }))}
                placeholder='Thứ tự'
                className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
              />
              {formErrors.sortOrder ? <p className='mt-1 text-xs text-red-400'>{formErrors.sortOrder}</p> : null}
            </div>
          </div>
          <div className='mt-2 flex justify-end gap-2'>
            <Button variant='ghost' onClick={() => setOpenCreateDialog(false)} className='text-white/70 hover:bg-white/10'>
              Huỷ
            </Button>
            <Button onClick={handleCreateChannel}>Tạo</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onOpenChange={(open) => {
          setOpenEditDialog(open);
          if (!open) setEditingChannel(null);
        }}
      >
        <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle className='text-white'>Sửa kênh liên hệ CSKH</DialogTitle>
          </DialogHeader>
          {editingChannel ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <Input value={editingChannel.code} disabled className='border-white/10 bg-black/30 text-white/60' />
              </div>
              <div>
                <Input
                  value={editingChannel.name}
                  onChange={(e) => setEditingChannel((p) => (p ? { ...p, name: e.target.value } : p))}
                  placeholder='Tên kênh'
                  className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
                />
                {editErrors.name ? <p className='mt-1 text-xs text-red-400'>{editErrors.name}</p> : null}
              </div>
              <div className='sm:col-span-2'>
                <Input
                  value={editingChannel.url}
                  onChange={(e) => setEditingChannel((p) => (p ? { ...p, url: e.target.value } : p))}
                  placeholder='URL'
                  className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
                />
                {editErrors.url ? <p className='mt-1 text-xs text-red-400'>{editErrors.url}</p> : null}
              </div>
              <div className='sm:col-span-2'>
                <div className='flex items-center gap-2'>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      uploadIcon(file, {
                        onSuccess: (res) => {
                          setEditingChannel((p) => (p ? { ...p, icon: res.imageUrl } : p));
                          notifySuccess('Tải lên thành công', 'Đã cập nhật icon kênh');
                        },
                        onError: notifyErrorFromUnknown,
                      });
                      e.currentTarget.value = '';
                    }}
                    className='border-white/10 bg-black/30 text-white file:mr-2 file:rounded file:border-0 file:bg-[#44C8F3] file:px-2 file:py-1 file:text-black'
                  />
                  {uploadingIcon ? <Loader2 size={16} className='animate-spin text-white/60' /> : null}
                </div>
                {editingChannel.icon ? (
                  <div className='mt-2 flex items-center gap-2'>
                    <img src={toAssetUrl(editingChannel.icon)} alt='Icon preview' className='h-8 w-8 rounded object-cover' />
                    <span className='text-xs text-white/50'>{editingChannel.icon}</span>
                  </div>
                ) : null}
                {editErrors.icon ? <p className='mt-1 text-xs text-red-400'>{editErrors.icon}</p> : null}
              </div>
              <div>
                <Input
                  value={editingChannel.sortOrder}
                  onChange={(e) => setEditingChannel((p) => (p ? { ...p, sortOrder: e.target.value } : p))}
                  placeholder='Thứ tự'
                  className='border-white/10 bg-black/30 text-white placeholder:text-white/40'
                />
                {editErrors.sortOrder ? <p className='mt-1 text-xs text-red-400'>{editErrors.sortOrder}</p> : null}
              </div>
              <div className='flex items-center gap-2'>
                <StatusToggle
                  checked={editingChannel.isActive}
                  onToggle={() => setEditingChannel((p) => (p ? { ...p, isActive: !p.isActive } : p))}
                />
                <span className={`text-xs ${editingChannel.isActive ? 'text-emerald-300' : 'text-white/50'}`}>
                  {editingChannel.isActive ? 'Bật' : 'Tắt'}
                </span>
              </div>
            </div>
          ) : null}
          <div className='mt-2 flex justify-end gap-2'>
            <Button variant='ghost' onClick={() => setOpenEditDialog(false)} className='text-white/70 hover:bg-white/10'>
              Huỷ
            </Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
