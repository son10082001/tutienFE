'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Calendar, Edit2, Gift, Globe, Package, Plus, RefreshCw, Search, Server, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SERVERS = 'all';

const SERVER_OPTIONS = [
  { value: ALL_SERVERS, label: 'Toàn server' },
  { value: 'sv1', label: 'Server 1' },
  { value: 'sv2', label: 'Server 2' },
  { value: 'sv3', label: 'Server 3' },
];

function serverLabel(value: string) {
  return SERVER_OPTIONS.find((s) => s.value === value)?.label ?? value;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RewardItem {
  id: string;
  name: string;
  quantity: number;
}

interface GiftCode {
  id: string;
  code: string;
  server: string;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  rewards: RewardItem[];
  createdAt: string;
  status: 'active' | 'expired' | 'disabled';
}

// ─── Fake data ─────────────────────────────────────────────────────────────────

const FAKE_CODES: GiftCode[] = [
  {
    id: '1',
    code: 'TUTIEN2025',
    server: ALL_SERVERS,
    expiresAt: '2025-12-31T23:59:59',
    usageLimit: 1000,
    usedCount: 234,
    rewards: [
      { id: 'r1', name: 'Kim nguyên bảo', quantity: 500 },
      { id: 'r2', name: 'Linh thạch', quantity: 100 },
    ],
    createdAt: '2025-01-01',
    status: 'active',
  },
  {
    id: '2',
    code: 'NEWSERVER',
    server: 'sv1',
    expiresAt: '2025-06-30T23:59:59',
    usageLimit: 500,
    usedCount: 500,
    rewards: [{ id: 'r3', name: 'Huyền thiết kiếm', quantity: 1 }],
    createdAt: '2025-01-15',
    status: 'expired',
  },
  {
    id: '3',
    code: 'VIPGIFT',
    server: 'sv2',
    expiresAt: '2026-03-01T23:59:59',
    usageLimit: 100,
    usedCount: 12,
    rewards: [
      { id: 'r4', name: 'Kim nguyên bảo', quantity: 2000 },
      { id: 'r5', name: 'Đan dược thượng phẩm', quantity: 10 },
      { id: 'r6', name: 'Linh thạch', quantity: 500 },
    ],
    createdAt: '2025-02-01',
    status: 'active',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function randomCode(len = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_MAP: Record<GiftCode['status'], { label: string; className: string }> = {
  active: { label: 'Hoạt động', className: 'bg-green-500/15 text-green-400' },
  expired: { label: 'Hết hạn', className: 'bg-red-500/15 text-red-400' },
  disabled: { label: 'Tắt', className: 'bg-white/10 text-white/40' },
};

// ─── Server select ─────────────────────────────────────────────────────────────

function ServerSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'flex h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white',
        'focus:outline-none focus:ring-1 focus:ring-[#44C8F3]/50',
        '[&>option]:bg-[#0C111D] [&>option]:text-white',
        className
      )}
    >
      {SERVER_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

// ─── Reward item row ────────────────────────────────────────────────────────────

function RewardRow({
  item,
  onChange,
  onRemove,
}: {
  item: RewardItem;
  onChange: (field: keyof RewardItem, value: string | number) => void;
  onRemove: () => void;
}) {
  return (
    <div className='flex items-center gap-2'>
      <Input
        placeholder='Tên vật phẩm'
        value={item.name}
        onChange={(e) => onChange('name', e.target.value)}
        className='flex-1 border-white/10 bg-white/5 text-white placeholder:text-white/30'
      />
      <Input
        type='number'
        placeholder='SL'
        min={1}
        value={item.quantity}
        onChange={(e) => onChange('quantity', Number(e.target.value))}
        className='w-24 border-white/10 bg-white/5 text-white placeholder:text-white/30'
      />
      <button
        type='button'
        onClick={onRemove}
        className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-red-400 hover:bg-red-500/10'
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Form state ─────────────────────────────────────────────────────────────────

interface FormState {
  code: string;
  server: string;
  expiresAt: string;
  usageLimit: number;
  rewards: RewardItem[];
}

const emptyForm = (): FormState => ({
  code: '',
  server: ALL_SERVERS,
  expiresAt: '',
  usageLimit: 100,
  rewards: [{ id: crypto.randomUUID(), name: '', quantity: 1 }],
});

function fromGiftCode(g: GiftCode): FormState {
  return {
    code: g.code,
    server: g.server,
    expiresAt: g.expiresAt.slice(0, 16),
    usageLimit: g.usageLimit,
    rewards: g.rewards.map((r) => ({ ...r })),
  };
}

// ─── Gift Code Form Dialog ──────────────────────────────────────────────────────

function GiftCodeFormDialog({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: GiftCode | null;
  onClose: () => void;
  onSave: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setForm(editing ? fromGiftCode(editing) : emptyForm());
    }
    prevOpen.current = open;
  }, [open, editing]);

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function addReward() {
    setForm((p) => ({
      ...p,
      rewards: [...p.rewards, { id: crypto.randomUUID(), name: '', quantity: 1 }],
    }));
  }

  function updateReward(id: string, field: keyof RewardItem, val: string | number) {
    setForm((p) => ({
      ...p,
      rewards: p.rewards.map((r) => (r.id === id ? { ...r, [field]: val } : r)),
    }));
  }

  function removeReward(id: string) {
    setForm((p) => ({ ...p, rewards: p.rewards.filter((r) => r.id !== id) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#0C111D] text-white sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-white'>
            {editing ? 'Chỉnh sửa Gift Code' : 'Tạo Gift Code mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='mt-2 space-y-5'>
          {/* Code */}
          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-white/70'>Mã code</label>
            <div className='flex gap-2'>
              <Input
                required
                value={form.code}
                onChange={(e) => setField('code', e.target.value.toUpperCase())}
                placeholder='VD: TUTIEN2025'
                className='flex-1 border-white/10 bg-white/5 text-white placeholder:text-white/30'
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='shrink-0 border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                onClick={() => setField('code', randomCode())}
              >
                <RefreshCw size={15} />
              </Button>
            </div>
          </div>

          {/* Server */}
          <div className='space-y-1.5'>
            <label className='flex items-center gap-1.5 text-sm font-medium text-white/70'>
              <Server size={14} />
              Server áp dụng
            </label>
            <ServerSelect value={form.server} onChange={(v) => setField('server', v)} />
            {form.server === ALL_SERVERS && (
              <p className='text-xs text-white/30'>Mã này có thể dùng trên tất cả các server</p>
            )}
          </div>

          {/* Expiry */}
          <div className='space-y-1.5'>
            <label className='flex items-center gap-1.5 text-sm font-medium text-white/70'>
              <Calendar size={14} />
              Ngày hết hạn
            </label>
            <Input
              required
              type='datetime-local'
              value={form.expiresAt}
              onChange={(e) => setField('expiresAt', e.target.value)}
              className='border-white/10 bg-white/5 text-white [color-scheme:dark]'
            />
          </div>

          {/* Usage limit */}
          <div className='space-y-1.5'>
            <label className='text-sm font-medium text-white/70'>Giới hạn lượt dùng</label>
            <Input
              required
              type='number'
              min={1}
              value={form.usageLimit}
              onChange={(e) => setField('usageLimit', Number(e.target.value))}
              className='border-white/10 bg-white/5 text-white'
            />
          </div>

          {/* Rewards */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-1.5 text-sm font-medium text-white/70'>
                <Package size={14} />
                Vật phẩm nhận thưởng
              </label>
              <Button
                type='button'
                size='sm'
                variant='ghost'
                onClick={addReward}
                className='h-7 gap-1 px-2 text-[#44C8F3] hover:bg-[#44C8F3]/10 hover:text-[#44C8F3]'
              >
                <Plus size={13} /> Thêm
              </Button>
            </div>
            <div className='space-y-2'>
              {form.rewards.map((r) => (
                <RewardRow
                  key={r.id}
                  item={r}
                  onChange={(field, val) => updateReward(r.id, field, val)}
                  onRemove={() => removeReward(r.id)}
                />
              ))}
            </div>
            {form.rewards.length === 0 && (
              <p className='py-2 text-center text-xs text-white/30'>Chưa có vật phẩm nào</p>
            )}
          </div>

          <div className='flex justify-end gap-3 pt-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={onClose}
              className='text-white/60 hover:bg-white/10 hover:text-white'
            >
              Huỷ
            </Button>
            <Button type='submit' className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80'>
              {editing ? 'Lưu thay đổi' : 'Tạo mã'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete confirm dialog ──────────────────────────────────────────────────────

function DeleteDialog({
  code,
  onClose,
  onConfirm,
}: {
  code: GiftCode | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!code} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle className='text-white'>Xác nhận xoá</DialogTitle>
        </DialogHeader>
        <p className='mt-2 text-sm text-white/60'>
          Bạn có chắc muốn xoá gift code{' '}
          <span className='font-semibold text-white'>{code?.code}</span>? Hành động này không thể hoàn tác.
        </p>
        <div className='mt-4 flex justify-end gap-3'>
          <Button variant='ghost' onClick={onClose} className='text-white/60 hover:bg-white/10 hover:text-white'>
            Huỷ
          </Button>
          <Button onClick={onConfirm} className='bg-red-500 font-semibold text-white hover:bg-red-600'>
            Xoá
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminGiftCodePage() {
  const [codes, setCodes] = useState<GiftCode[]>(FAKE_CODES);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GiftCode | null>(null);
  const [deleting, setDeleting] = useState<GiftCode | null>(null);

  const filtered = codes.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(code: GiftCode) {
    setEditing(code);
    setFormOpen(true);
  }

  function handleSave(form: FormState) {
    if (editing) {
      setCodes((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                code: form.code,
                server: form.server,
                expiresAt: form.expiresAt,
                usageLimit: form.usageLimit,
                rewards: form.rewards,
              }
            : c
        )
      );
    } else {
      const now = new Date().toISOString().slice(0, 10);
      const status: GiftCode['status'] = new Date(form.expiresAt) > new Date() ? 'active' : 'expired';
      setCodes((prev) => [
        {
          id: crypto.randomUUID(),
          code: form.code,
          server: form.server,
          expiresAt: form.expiresAt,
          usageLimit: form.usageLimit,
          usedCount: 0,
          rewards: form.rewards,
          createdAt: now,
          status,
        },
        ...prev,
      ]);
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleting) return;
    setCodes((prev) => prev.filter((c) => c.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className='space-y-6 p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-2xl text-white'>Gift Code</h1>
          <p className='mt-1 text-sm text-white/50'>Quản lý mã quà tặng trong game</p>
        </div>
        <Button onClick={openCreate} className='gap-2 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80'>
          <Plus size={16} />
          Tạo mã mới
        </Button>
      </div>

      <div className='relative max-w-xs'>
        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/30' />
        <Input
          placeholder='Tìm mã code...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-9 border-white/10 bg-white/5 text-white placeholder:text-white/30'
        />
      </div>

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/50'>Mã code</TableHead>
              <TableHead className='text-white/50'>Server</TableHead>
              <TableHead className='text-white/50'>Trạng thái</TableHead>
              <TableHead className='text-white/50'>Hết hạn</TableHead>
              <TableHead className='text-white/50'>Đã dùng / Giới hạn</TableHead>
              <TableHead className='text-white/50'>Vật phẩm</TableHead>
              <TableHead className='text-right text-white/50'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={7} className='py-12 text-center text-white/30'>
                  Không tìm thấy gift code nào
                </TableCell>
              </TableRow>
            )}
            {filtered.map((code) => (
              <TableRow key={code.id} className='border-white/10 bg-transparent hover:bg-white/5'>
                <TableCell className='text-white'>
                  <div className='flex items-center gap-2'>
                    <Gift size={14} className='text-[#44C8F3]' />
                    <span className='font-mono font-semibold text-white'>{code.code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-1.5'>
                    {code.server === ALL_SERVERS ? (
                      <Globe size={13} className='text-white/40' />
                    ) : (
                      <Server size={13} className='text-white/40' />
                    )}
                    <span
                      className={cn(
                        'text-xs font-medium',
                        code.server === ALL_SERVERS ? 'text-[#44C8F3]' : 'text-white/70'
                      )}
                    >
                      {serverLabel(code.server)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      STATUS_MAP[code.status].className
                    )}
                  >
                    {STATUS_MAP[code.status].label}
                  </span>
                </TableCell>
                <TableCell className='text-white/70'>{formatDate(code.expiresAt)}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div className='h-1.5 w-24 rounded-full bg-white/10'>
                      <div
                        className='h-full rounded-full bg-[#44C8F3]'
                        style={{ width: `${Math.min(100, (code.usedCount / code.usageLimit) * 100)}%` }}
                      />
                    </div>
                    <span className='text-xs text-white/50'>
                      {code.usedCount}/{code.usageLimit}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    {code.rewards.map((r) => (
                      <span
                        key={r.id}
                        className='inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/70'
                      >
                        {r.name} ×{r.quantity}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    <button
                      type='button'
                      onClick={() => openEdit(code)}
                      className='flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white'
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type='button'
                      onClick={() => setDeleting(code)}
                      className='flex h-8 w-8 items-center justify-center rounded-md text-red-400/60 hover:bg-red-500/10 hover:text-red-400'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <GiftCodeFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <DeleteDialog code={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
}
