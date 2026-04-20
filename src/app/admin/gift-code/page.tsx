'use client';

import { useCreateGiftCodesMutation, useGiftCodeBatches, useGiftCodeItems } from '@/api/gift-code/queries';
import { getGiftCodeBatchCodes } from '@/api/gift-code/requests';
import { useTicketExchangeMeta } from '@/api/ticket-exchange/queries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Calendar, Check, Copy, Gift, Loader2, Package, Plus, Search, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SERVERS = 'all';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RewardItem {
  id: string; // Internal React ID
  gameItemId: string; // Actual Game Item ID
  name: string;
  quantity: number;
}

interface BatchInfo {
  id: number;
  name: string;
  expiryDate: string;
  channel: string;
}

interface GameItem {
  id: string;
  name: string;
}

// ─── Item Selector ─────────────────────────────────────────────────────────────

function ItemSelector({
  value,
  onSelect,
  items,
}: {
  value: string;
  onSelect: (item: GameItem) => void;
  items: GameItem[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return items.slice(0, 50);
    return items.filter((it) => it.name.toLowerCase().includes(s) || it.id.includes(s)).slice(0, 50);
  }, [items, search]);

  const selectedItem = items.find((it) => it.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={cn(
            'flex h-9 w-32 items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white',
            'hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#44C8F3]/50'
          )}
        >
          <span className='truncate'>{selectedItem ? selectedItem.name : value || 'Chọn vật phẩm'}</span>
          <Search size={14} className='ml-2 shrink-0 opacity-50' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-64 border-white/10 bg-[#0C111D] p-0 text-white' align='start'>
        <div className='flex items-center border-b border-white/10 p-2'>
          <Search size={14} className='mr-2 text-white/30' />
          <input
            className='flex-1 bg-transparent text-sm focus:outline-none'
            placeholder='Tìm theo tên hoặc ID...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className='max-h-60 overflow-y-auto p-1'>
          {filtered.length === 0 && <div className='py-4 text-center text-xs text-white/30'>Không tìm thấy vật phẩm</div>}
          {filtered.map((it) => (
            <button
              key={it.id}
              type='button'
              onClick={() => {
                onSelect(it);
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Reward item row ────────────────────────────────────────────────────────────

function RewardRow({
  item,
  onChange,
  onRemove,
  items,
}: {
  item: RewardItem;
  onChange: (field: keyof RewardItem, value: string | number) => void;
  onRemove: () => void;
  items: GameItem[];
}) {
  return (
    <div className='flex items-center gap-2'>
      <ItemSelector
        value={item.gameItemId}
        items={items}
        onSelect={(it) => {
          onChange('gameItemId', it.id);
          onChange('name', it.name);
        }}
      />
      <Input
        placeholder='Ghi chú'
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
        className='w-20 border-white/10 bg-white/5 text-white placeholder:text-white/30'
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
  name: string;
  channel: string;
  generateCount: number;
  expiryDate: string;
  bonusesStr: string;
  vipLevel: number;
  useType: string;
  rewards: RewardItem[];
}

const emptyForm = (): FormState => ({
  name: '',
  channel: 'all',
  generateCount: 1,
  expiryDate: '',
  bonusesStr: '',
  vipLevel: 0,
  useType: '0',
  rewards: [{ id: crypto.randomUUID(), gameItemId: '', name: '', quantity: 1 }],
});

// ─── Batch codes dialog ─────────────────────────────────────────────────────────

function BatchCodesDialog({ batch, onClose }: { batch: BatchInfo | null; onClose: () => void }) {
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (batch) {
      setLoading(true);
      getGiftCodeBatchCodes(batch.id)
        .then(setCodes)
        .finally(() => setLoading(false));
    } else {
      setCodes([]);
    }
  }, [batch]);

  const handleCopy = () => {
    if (!codes.length) return;
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Đã sao chép danh sách mã');
  };

  return (
    <Dialog open={!!batch} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-h-[80vh] border-white/10 bg-[#0C111D] text-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-white'>Mã đã tạo: {batch?.name}</DialogTitle>
        </DialogHeader>
        <div className='mt-4 space-y-4'>
          <div className='max-h-60 min-h-32 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-4'>
            {loading ? (
              <div className='flex h-full items-center justify-center py-10'>
                <Loader2 className='animate-spin text-[#44C8F3]' />
              </div>
            ) : (
              <pre className='font-mono text-sm text-[#44C8F3]'>
                {codes.join('\n')}
              </pre>
            )}
          </div>
          <Button 
            onClick={handleCopy} 
            disabled={loading || !codes.length}
            className='w-full gap-2 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80'
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            Sao chép tất cả
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminGiftCodePage() {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [selectedBatch, setSelectedBatch] = useState<BatchInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: gameItems = [] } = useGiftCodeItems();
  const { data: batches = [], refetch: refetchBatches } = useGiftCodeBatches();
  const { data: meta } = useTicketExchangeMeta();
  const createMutation = useCreateGiftCodesMutation();

  const filteredBatches = useMemo(() => {
    if (!searchTerm.trim()) return batches;
    const s = searchTerm.toLowerCase().trim();
    return batches.filter((b: any) => 
      b.name.toLowerCase().includes(s) || 
      b.id.toString().includes(s)
    );
  }, [batches, searchTerm]);

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function addReward() {
    setForm((p) => ({
      ...p,
      rewards: [...p.rewards, { id: crypto.randomUUID(), gameItemId: '', name: '', quantity: 1 }],
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    
    const bonusesStr = form.rewards
      .filter(r => r.gameItemId && r.quantity > 0)
      .map(r => `2:1:${r.gameItemId},${r.quantity},0,0`)
      .join(';');

    if (!bonusesStr) {
      toast.error('Vui lòng chọn ít nhất một vật phẩm hợp lệ');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: form.name,
        channel: form.channel,
        generateCount: form.generateCount,
        expiryDate: form.expiryDate,
        bonusesStr,
        vipLevel: form.vipLevel,
        useType: form.useType,
      });

      await refetchBatches();
      setFormOpen(false);
      setForm(emptyForm());
      toast.success(`Đã tạo thành công đợt mã mới`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo mã');
    }
  }

  return (
    <div className='space-y-6 p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-2xl text-white'>Gift Code</h1>
          <p className='mt-1 text-sm text-white/50'>Quản lý đợt phát mã quà tặng</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative w-64'>
            <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/30' />
            <Input
              placeholder='Tìm theo tên đợt...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 border-white/10 bg-white/5'
            />
          </div>
          <Button onClick={() => setFormOpen(true)} className='gap-2 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80'>
            <Plus size={16} />
            Tạo đợt mã mới
          </Button>
        </div>
      </div>

      {/* History Table */}
      <div className='overflow-hidden rounded-xl border border-white/10'>
        <Table>
          <TableHeader className='bg-white/5'>
            <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
              <TableHead className='text-white/50 w-[100px]'>ID Đợt</TableHead>
              <TableHead className='text-white/50'>Tên đợt phát</TableHead>
              <TableHead className='text-white/50'>Ngày hết hạn</TableHead>
              <TableHead className='text-white/50'>Kênh (Server)</TableHead>
              <TableHead className='text-right text-white/50'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.length === 0 && (
              <TableRow className='border-white/10 bg-transparent hover:bg-transparent'>
                <TableCell colSpan={5} className='py-12 text-center text-white/30'>
                  {searchTerm ? 'Không tìm thấy kết quả nào' : 'Chưa có lịch sử tạo mã'}
                </TableCell>
              </TableRow>
            )}
            {filteredBatches.map((batch: any) => (
              <TableRow key={batch.id} className='border-white/10 bg-transparent hover:bg-white/5'>
                <TableCell className='font-mono text-xs text-white/50'>#{batch.id}</TableCell>
                <TableCell className='font-medium text-white'>{batch.name}</TableCell>
                <TableCell className='text-white/70'>{formatDate(batch.expiryDate)}</TableCell>
                <TableCell className='text-white/70'>
                  {batch.channel === 'all' ? 'Tất cả' : (meta?.servers?.find(s => s.id.toString() === batch.channel)?.name || batch.channel)}
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setSelectedBatch(batch)}
                    className='text-[#44C8F3] hover:bg-[#44C8F3]/10'
                  >
                    Xem mã
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#0C111D] text-white sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-white'>Tạo đợt Gift Code mới</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className='mt-2 space-y-5'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-white/70'>Tên đợt phát</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder='VD: Quà Tân Thủ'
                  className='border-white/10 bg-white/5 text-white'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-white/70'>Kênh (Server)</label>
                <Select value={form.channel} onValueChange={(val) => setField('channel', val)}>
                  <SelectTrigger className='border-white/10 bg-white/5 text-white'>
                    <SelectValue placeholder="Chọn server" />
                  </SelectTrigger>
                  <SelectContent className='bg-[#0C111D] border-white/10 text-white'>
                    <SelectItem value="all">Toàn bộ server</SelectItem>
                    {meta?.servers?.map((server) => (
                      <SelectItem key={server.id} value={server.id.toString()}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-white/70'>Số lượng mã cần tạo</label>
                <Input
                  required
                  type='number'
                  min={1}
                  max={1000}
                  value={form.generateCount}
                  onChange={(e) => setField('generateCount', Number(e.target.value))}
                  className='border-white/10 bg-white/5 text-white'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-white/70'>Loại sử dụng</label>
                <Select value={form.useType} onValueChange={(val) => setField('useType', val)}>
                  <SelectTrigger className='border-white/10 bg-white/5 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-[#0C111D] border-white/10 text-white'>
                    <SelectItem value='0'>Mỗi mã dùng 1 lần (Global)</SelectItem>
                    <SelectItem value='1'>Mỗi nhân vật 1 mã / đợt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='flex items-center gap-1.5 text-sm font-medium text-white/70'>
                <Calendar size={14} />
                Ngày hết hạn
              </label>
              <Input
                required
                type='datetime-local'
                value={form.expiryDate}
                onChange={(e) => setField('expiryDate', e.target.value)}
                className='border-white/10 bg-white/5 text-white [color-scheme:dark]'
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
                  className='h-7 gap-1 px-2 text-[#44C8F3] hover:bg-[#44C8F3]/10'
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
                    items={gameItems}
                  />
                ))}
              </div>
            </div>

            <div className='flex justify-end gap-3 pt-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setFormOpen(false)}
                className='text-white/60 hover:bg-white/10'
              >
                Huỷ
              </Button>
              <Button 
                type='submit' 
                disabled={createMutation.isPending}
                className='bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80'
              >
                {createMutation.isPending ? <Loader2 size={16} className='mr-2 animate-spin' /> : <Gift size={16} className='mr-2' />}
                Bắt đầu tạo mã
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BatchCodesDialog batch={selectedBatch} onClose={() => setSelectedBatch(null)} />
    </div>
  );
}
