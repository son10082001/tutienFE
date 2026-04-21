'use client';

import { useRedeemGiftCodeMutation } from '@/api/gift-code/queries';
import { useTicketExchangeMeta } from '@/api/ticket-exchange/queries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronDown, Gift, Loader2, Server, Sparkles, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RedeemResult {
  code: string;
  serverName: string;
  message: string;
}

// ─── Reward popup ──────────────────────────────────────────────────────────────

function RewardPopup({ result, onClose }: { result: RedeemResult | null; onClose: () => void }) {
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
              <h2 className='mt-4 font-bold text-2xl text-white text-center'>Nhận quà thành công!</h2>
              <p className='mt-1 text-sm text-white/50'>
                Mã <span className='font-mono font-semibold text-[#44C8F3]'>{result.code}</span>
                {' · '}
                <span className='text-white/70'>{result.serverName}</span>
              </p>
            </div>

            <div className='px-6 pb-8'>
              <div className='rounded-lg border border-white/10 bg-white/5 p-4 text-center'>
                <p className='text-sm text-white/80'>{result.message}</p>
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
  const [serverId, setServerId] = useState<number | ''>('');
  const [roleId, setRoleId] = useState('');
  const [result, setResult] = useState<RedeemResult | null>(null);

  const { data: meta, isLoading: isMetaLoading } = useTicketExchangeMeta();
  const redeemMutation = useRedeemGiftCodeMutation();

  const filteredCharacters = useMemo(() => {
    if (!meta?.characters || serverId === '') return [];
    return meta.characters.filter((c) => c.serverId === serverId);
  }, [meta, serverId]);

  useEffect(() => {
    if (!serverId || filteredCharacters.length === 0) {
      setRoleId('');
      return;
    }
    setRoleId(filteredCharacters[0]!.uid);
  }, [serverId, filteredCharacters]);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim()) {
      toast.error('Vui lòng nhập mã Gift Code');
      return;
    }
    if (!serverId) {
      toast.error('Vui lòng chọn server');
      return;
    }
    if (!roleId) {
      toast.error('Server đã chọn chưa có nhân vật');
      return;
    }

    try {
      const res = await redeemMutation.mutateAsync({
        code: code.trim(),
        serverId: Number(serverId),
        roleId,
      });

      const serverName = meta?.servers.find((s) => s.id === serverId)?.name || `Server ${serverId}`;

      setResult({
        code: code.trim().toUpperCase(),
        serverName,
        message: res.message,
      });
      setCode('');
      toast.success('Đã nhận quà thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      toast.error(msg);
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-black px-4 py-16 font-sans'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='mb-6 flex flex-col items-center text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#44C8F3]/30 to-[#44C8F3]/5 ring-1 ring-[#44C8F3]/20'>
            <Gift size={28} className='text-[#44C8F3]' />
          </div>
          <h1 className='font-bold text-2xl text-white tracking-tight uppercase'>Nhập Gift Code</h1>
          <p className='mt-2 text-sm text-white/50'>Nhận vật phẩm độc quyền cho nhân vật của bạn</p>
        </div>

        {/* Form card */}
        <div className='rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm'>
          <form onSubmit={handleRedeem} className='space-y-5'>
            {/* Server select */}
            <div className='space-y-1.5'>
              <label className='flex items-center gap-1.5 text-sm font-medium text-white/70'>
                <Server size={14} />
                Chọn server
              </label>
              <div className='relative'>
                <select
                  value={serverId}
                  onChange={(e) => {
                    setServerId(Number(e.target.value));
                    setRoleId('');
                  }}
                  disabled={isMetaLoading || redeemMutation.isPending}
                  className={cn(
                    'flex h-11 w-full appearance-none rounded-lg border border-white/10 bg-white/5',
                    'px-4 pr-10 text-sm text-white transition-all',
                    'focus:outline-none focus:ring-1 focus:ring-[#44C8F3]/50',
                    '[&>option]:bg-[#0C111D] [&>option]:text-white',
                    'disabled:opacity-50'
                  )}
                >
                  <option value='' disabled className='text-white/30'>
                    -- Chọn server --
                  </option>
                  {meta?.servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40'
                />
              </div>
            </div>

            {/* Character auto-fill */}
            <div className='space-y-1.5'>
              <label className='flex items-center gap-1.5 text-sm font-medium text-white/70'>
                <User size={14} />
                Nhân vật nhận quà
              </label>
              <Input
                readOnly
                value={
                  !serverId
                    ? 'Vui lòng chọn server trước'
                    : filteredCharacters.length === 0
                      ? 'Không có nhân vật nào'
                      : `${filteredCharacters[0]!.name}`
                }
                className='h-11 border-white/10 bg-white/5 text-white/85'
              />
            </div>

            {/* Code input */}
            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-white/70'>Mã gift code</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder='Nhập mã code tại đây...'
                disabled={redeemMutation.isPending}
                className='h-11 border-white/10 bg-white/5 font-mono text-white placeholder:text-white/20 focus-visible:ring-[#44C8F3]/50'
                maxLength={32}
              />
            </div>

            <Button
              type='submit'
              disabled={redeemMutation.isPending || !code.trim() || !roleId}
              className='h-11 w-full gap-2 bg-[#44C8F3] font-bold text-black hover:bg-[#44C8F3]/80 disabled:opacity-50 transition-all uppercase tracking-wide'
            >
              {redeemMutation.isPending ? (
                <>
                  <Loader2 size={18} className='animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Nhận thưởng ngay
                </>
              )}
            </Button>
          </form>
        </div>

        <p className='mt-5 text-center text-[11px] uppercase tracking-widest text-white/20'>
          Mỗi mã chỉ sử dụng một lần · Hạn chế theo nhân vật
        </p>
      </div>

      <RewardPopup result={result} onClose={() => setResult(null)} />
    </div>
  );
}
