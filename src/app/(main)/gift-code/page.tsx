'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronDown, Gift, Loader2, Package, Server, Sparkles } from 'lucide-react';
import { useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVER_OPTIONS = [
  { value: 'sv1', label: 'Server 1' },
  { value: 'sv2', label: 'Server 2' },
  { value: 'sv3', label: 'Server 3' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface RewardItem {
  name: string;
  quantity: number;
}

interface RedeemResult {
  code: string;
  server: string;
  rewards: RewardItem[];
}

// ─── Fake redeem logic ─────────────────────────────────────────────────────────

const VALID_CODES: Record<string, RewardItem[]> = {
  TUTIEN2025: [
    { name: 'Kim nguyên bảo', quantity: 500 },
    { name: 'Linh thạch', quantity: 100 },
  ],
  VIPGIFT: [
    { name: 'Kim nguyên bảo', quantity: 2000 },
    { name: 'Đan dược thượng phẩm', quantity: 10 },
    { name: 'Linh thạch', quantity: 500 },
  ],
  NEWSERVER: [{ name: 'Huyền thiết kiếm', quantity: 1 }],
};

async function fakeRedeem(code: string, server: string): Promise<RedeemResult> {
  await new Promise((r) => setTimeout(r, 1200));
  const rewards = VALID_CODES[code.toUpperCase()];
  if (!rewards) throw new Error('Mã gift code không hợp lệ hoặc đã hết hạn');
  return { code: code.toUpperCase(), server, rewards };
}

// ─── Reward popup ──────────────────────────────────────────────────────────────

function RewardPopup({ result, onClose }: { result: RedeemResult | null; onClose: () => void }) {
  const serverLabel = SERVER_OPTIONS.find((s) => s.value === result?.server)?.label ?? result?.server;

  return (
    <Dialog open={!!result} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='border-white/10 bg-[#0C111D] text-white sm:max-w-md overflow-hidden p-0'>
        {result && (
          <>
            <div className='relative flex flex-col items-center bg-gradient-to-b from-[#44C8F3]/20 to-transparent px-6 pt-10 pb-6'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[#44C8F3]/20 ring-4 ring-[#44C8F3]/30'>
                <Sparkles size={36} className='text-[#44C8F3]' />
              </div>
              <CheckCircle2
                size={22}
                className='absolute right-[calc(50%-12px)] top-[calc(4.5rem-11px)] translate-x-5 translate-y-5 text-green-400'
              />
              <h2 className='mt-4 font-bold text-2xl text-white'>Nhận thưởng thành công!</h2>
              <p className='mt-1 text-sm text-white/50'>
                Mã <span className='font-mono font-semibold text-[#44C8F3]'>{result.code}</span>
                {' · '}
                <span className='text-white/70'>{serverLabel}</span>
              </p>
            </div>

            <div className='px-6 pb-6'>
              <p className='mb-3 text-xs font-medium uppercase tracking-wider text-white/40'>Vật phẩm nhận được</p>
              <div className='space-y-2'>
                {result.rewards.map((r, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex h-9 w-9 items-center justify-center rounded-md bg-[#44C8F3]/10'>
                        <Package size={16} className='text-[#44C8F3]' />
                      </div>
                      <span className='font-medium text-sm text-white'>{r.name}</span>
                    </div>
                    <span className='font-bold text-[#44C8F3]'>×{r.quantity}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={onClose}
                className='mt-6 w-full bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80'
              >
                Tuyệt vời!
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function GiftCodePage() {
  const [code, setCode] = useState('');
  const [server, setServer] = useState(SERVER_OPTIONS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RedeemResult | null>(null);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fakeRedeem(code.trim(), server);
      setResult(res);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-black px-4 py-16'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='mb-6 flex flex-col items-center text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#44C8F3]/30 to-[#44C8F3]/5 ring-1 ring-[#44C8F3]/20'>
            <Gift size={28} className='text-[#44C8F3]' />
          </div>
          <h1 className='font-bold text-2xl text-white'>Nhập Gift Code</h1>
          <p className='mt-2 text-sm text-white/50'>Nhập mã quà tặng để nhận vật phẩm trong game Ngư Tiên Ký</p>
        </div>

        {/* Form card */}
        <div className='rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm'>
          <form onSubmit={handleRedeem} className='space-y-4'>
            {/* Server select */}
            <div className='space-y-1.5'>
              <label className='flex items-center gap-1.5 text-sm font-medium text-white/70'>
                <Server size={14} />
                Chọn server
              </label>
              <div className='relative'>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  disabled={loading}
                  className={cn(
                    'flex h-10 w-full appearance-none rounded-md border border-white/10 bg-white/5',
                    'px-3 pr-9 text-sm text-white',
                    'focus:outline-none focus:ring-1 focus:ring-[#44C8F3]/50',
                    '[&>option]:bg-[#0C111D] [&>option]:text-white',
                    'disabled:opacity-50'
                  )}
                >
                  {SERVER_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40'
                />
              </div>
            </div>

            {/* Code input */}
            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-white/70'>Mã gift code</label>
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder='Nhập mã code tại đây...'
                disabled={loading}
                className={cn(
                  'border-white/10 bg-white/5 font-mono text-white placeholder:text-white/25 focus-visible:ring-[#44C8F3]/50',
                  error && 'border-red-500/50'
                )}
                maxLength={32}
              />
              {error && <p className='text-xs text-red-400'>{error}</p>}
            </div>

            <Button
              type='submit'
              disabled={loading || !code.trim()}
              className='w-full gap-2 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80 disabled:opacity-50'
            >
              {loading ? (
                <>
                  <Loader2 size={16} className='animate-spin' />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <Gift size={16} />
                  Nhận thưởng
                </>
              )}
            </Button>
          </form>
        </div>

        <p className='mt-4 text-center text-xs text-white/30'>
          Mỗi mã chỉ có thể sử dụng một lần và có thời hạn sử dụng nhất định
        </p>
      </div>

      <RewardPopup result={result} onClose={() => setResult(null)} />
    </div>
  );
}
