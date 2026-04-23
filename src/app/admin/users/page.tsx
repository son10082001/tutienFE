'use client';

import type { AdminUserRow } from '@/api/user';
import { useAdminDeleteUser, useAdminSendItemMail, useAdminUserGameMeta, useAdminUsers } from '@/api/user';
import { useAdminExternalItems } from '@/api/shop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Gift, Loader2, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
          <span className='truncate'>{selected ? `#${selected.id} - ${selected.name}` : '-- Chọn vật phẩm --'}</span>
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

export default function AdminUsersPage() {
  const createEmptySendItem = () => ({ externalItemId: '', quantity: '1' });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null);
  const [sendingFor, setSendingFor] = useState<AdminUserRow | null>(null);
  const [sendServerId, setSendServerId] = useState<number | ''>('');
  const [sendItems, setSendItems] = useState<Array<{ externalItemId: string; quantity: string }>>([createEmptySendItem()]);

  const user = useAuthStore((s) => s.user);
  const permissions = user?.permissions ?? [];
  const isSuperAdmin = user?.adminRole === 'SUPERADMIN';
  const canSendItems = isSuperAdmin || permissions.includes('shop.manage');

  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminUsers({
    variables: { page, limit: PAGE_SIZE, search: search || undefined },
  });

  const { data: gameMeta, isLoading: gameMetaLoading } = useAdminUserGameMeta({
    variables: { userId: sendingFor?.userId ?? null },
    enabled: Boolean(sendingFor?.userId),
  });

  const { data: extRes, isLoading: extLoading } = useAdminExternalItems({
    enabled: Boolean(sendingFor),
  });
  const extItems = extRes?.items ?? [];

  const { mutate: removeUser, isPending: isDeleting } = useAdminDeleteUser({
    onSuccess: () => {
      notifySuccess('Đã xóa', 'Người dùng đã được xóa khỏi hệ thống.');
      queryClient.invalidateQueries({ queryKey: useAdminUsers.getKey() });
      setDeleting(null);
      setPage(1);
    },
    onError: (err) => notifyErrorFromUnknown(err),
  });

  const { mutate: sendItemMail, isPending: isSending } = useAdminSendItemMail({
    onSuccess: (res) => {
      notifySuccess('Đã gửi', res.message);
      setSendingFor(null);
    },
    onError: (err) => notifyErrorFromUnknown(err),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const characterOnServer = useMemo(() => {
    if (sendServerId === '' || !gameMeta?.characters) return undefined;
    return gameMeta.characters.find((c) => c.serverId === sendServerId);
  }, [gameMeta?.characters, sendServerId]);

  const serverNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of gameMeta?.servers ?? []) {
      m.set(s.id, s.name);
    }
    return m;
  }, [gameMeta?.servers]);

  useEffect(() => {
    if (!sendingFor) {
      setSendServerId('');
      setSendItems([createEmptySendItem()]);
      return;
    }
    const first = gameMeta?.characters?.[0];
    if (first) {
      setSendServerId(first.serverId);
    } else {
      setSendServerId('');
    }
  }, [sendingFor, gameMeta?.characters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      setSearch((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function handleSendItem() {
    if (!sendingFor || sendServerId === '' || !characterOnServer) {
      notifyErrorFromUnknown(new Error('Chưa chọn được tài khoản game trên server này.'));
      return;
    }
    try {
      const parsedItems = sendItems.map((item, idx) => {
        const extId = Number(item.externalItemId);
        const qty = Number(item.quantity);
        if (!Number.isFinite(extId) || extId < 1) {
          throw new Error(`Vui lòng chọn vật phẩm ở dòng ${idx + 1}.`);
        }
        if (!Number.isFinite(qty) || qty < 1 || qty > 9999) {
          throw new Error(`Số lượng ở dòng ${idx + 1} phải từ 1 đến 9999.`);
        }
        return { externalItemId: extId, quantity: qty };
      });
      if (parsedItems.length === 0) {
        notifyErrorFromUnknown(new Error('Vui lòng thêm ít nhất 1 vật phẩm.'));
        return;
      }
      sendItemMail({
        userId: sendingFor.userId,
        payload: { serverId: sendServerId, items: parsedItems },
      });
    } catch (error) {
      notifyErrorFromUnknown(error);
    }
  }

  return (
    <div className='space-y-6 p-8'>
      <div>
        <h1 className='font-bold text-2xl text-white'>Người dùng</h1>
        <p className='mt-1 text-sm text-white/50'>Xem danh sách và xóa tài khoản người chơi (không xóa được admin)</p>
      </div>

      <div className='relative max-w-md'>
        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/30' />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder='Tìm theo tài khoản (tự động sau khi gõ)...'
          className='border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/30'
        />
      </div>

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/50'>Tài khoản</TableHead>
              <TableHead className='text-white/50'>Vai trò</TableHead>
              <TableHead className='text-white/50'>Đăng ký</TableHead>
              <TableHead className='text-white/50'>Đăng nhập gần nhất</TableHead>
              <TableHead className='text-right text-white/50'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={5} className='py-12 text-center'>
                  <Loader2 size={20} className='mx-auto animate-spin text-white/30' />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={5} className='py-12 text-center text-white/30'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              items.map((row) => (
                <TableRow key={row.userId} className='border-white/10 bg-transparent hover:bg-white/5'>
                  <TableCell className='font-mono text-xs text-white/80'>{row.userId}</TableCell>
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
                      <div className='inline-flex items-center justify-end gap-1'>
                        {canSendItems && (
                          <button
                            type='button'
                            title='Gửi vật phẩm'
                            onClick={() => setSendingFor(row)}
                            className='inline-flex h-8 w-8 items-center justify-center rounded-md text-[#44C8F3]/80 hover:bg-[#44C8F3]/15 hover:text-[#44C8F3]'
                          >
                            <Gift size={16} />
                          </button>
                        )}
                        <button
                          type='button'
                          title='Xóa user'
                          onClick={() => setDeleting(row)}
                          className='inline-flex h-8 w-8 items-center justify-center rounded-md text-red-400/70 hover:bg-red-500/15 hover:text-red-400'
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
          <span>
            Tổng {total} tài khoản · {PAGE_SIZE} / trang
          </span>
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
            Xóa vĩnh viễn tài khoản <span className='font-mono font-semibold text-white'>{deleting?.userId}</span>? Toàn
            bộ phiên đăng nhập và lịch sử nạp tiền liên quan cũng sẽ bị xóa. Thao tác không thể hoàn tác.
          </p>
          <div className='mt-4 flex justify-end gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setDeleting(null)}
              className='text-white/70 hover:bg-white/10'
            >
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

      <Dialog open={!!sendingFor} onOpenChange={(v) => !v && setSendingFor(null)}>
        <DialogContent className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-white'>Gửi vật phẩm</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-white/55'>
            Tài khoản portal: <span className='font-mono text-white/90'>{sendingFor?.userId}</span>
          </p>

          <div className='mt-3 space-y-4'>
            {(gameMetaLoading || extLoading) && (
              <div className='flex items-center gap-2 text-sm text-white/50'>
                <Loader2 size={16} className='animate-spin' /> Đang tải...
              </div>
            )}

            {!gameMetaLoading && (
              <>
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-white/50'>Server</label>
                  <select
                    value={sendServerId === '' ? '' : String(sendServerId)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSendServerId(v === '' ? '' : Number(v));
                    }}
                    className='h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#44C8F3]/50'
                  >
                    <option value=''>-- Chọn server --</option>
                    {(gameMeta?.characters ?? []).map((c) => (
                      <option key={c.serverId} value={String(c.serverId)}>
                        {serverNameById.get(c.serverId) ?? `Server ${c.serverId}`}
                      </option>
                    ))}
                  </select>
                </div>

                {!gameMeta?.characters?.length && (
                  <p className='text-sm text-amber-400/90'>
                    Người chơi chưa có nhân vật trên bất kỳ server nào — không thể gửi thư.
                  </p>
                )}

                {Boolean(characterOnServer) && (
                  <div className='rounded-md border border-white/10 bg-white/5 p-3 text-sm'>
                    <p className='text-xs text-white/45'>Tài khoản game (nhân vật nhận thư)</p>
                    <p className='mt-1 font-medium text-white'>{characterOnServer!.name}</p>
                    <p className='mt-0.5 font-mono text-[11px] text-white/40'>UID: {characterOnServer!.uid}</p>
                  </div>
                )}

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <label className='text-xs font-medium text-white/50'>Danh sách vật phẩm</label>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => setSendItems((prev) => [...prev, createEmptySendItem()])}
                      className='h-7 px-2 text-xs text-[#44C8F3] hover:bg-[#44C8F3]/15'
                    >
                      + Thêm vật phẩm
                    </Button>
                  </div>
                  <div className='space-y-3'>
                    {sendItems.map((item, idx) => (
                      <div key={`${idx}-${item.externalItemId}`} className='rounded-md border border-white/10 bg-white/5 p-3'>
                        <div className='mb-2 flex items-center justify-between'>
                          <p className='text-xs text-white/45'>Vật phẩm #{idx + 1}</p>
                          {sendItems.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              onClick={() => setSendItems((prev) => prev.filter((_, i) => i !== idx))}
                              className='h-6 px-2 text-xs text-red-300 hover:bg-red-500/15'
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                        <div className='space-y-2'>
                          <ExternalItemSelector
                            value={item.externalItemId}
                            items={extItems}
                            onChange={(id) =>
                              setSendItems((prev) =>
                                prev.map((entry, i) => (i === idx ? { ...entry, externalItemId: id } : entry))
                              )
                            }
                          />
                          <Input
                            type='number'
                            min={1}
                            max={9999}
                            value={item.quantity}
                            onChange={(e) =>
                              setSendItems((prev) =>
                                prev.map((entry, i) => (i === idx ? { ...entry, quantity: e.target.value } : entry))
                              )
                            }
                            placeholder='Số lượng'
                            className='border-white/10 bg-white/5 text-white'
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className='flex justify-end gap-3 pt-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setSendingFor(null)}
                className='text-white/70 hover:bg-white/10'
              >
                Đóng
              </Button>
              <Button
                type='button'
                disabled={
                  isSending ||
                  gameMetaLoading ||
                  !characterOnServer ||
                  sendServerId === '' ||
                  sendItems.length === 0 ||
                  sendItems.some((item) => !item.externalItemId)
                }
                onClick={handleSendItem}
                className='gap-2 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/90'
              >
                {isSending && <Loader2 size={14} className='animate-spin' />}
                Gửi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
