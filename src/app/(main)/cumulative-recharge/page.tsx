'use client';

import { useClaimCumulativeRechargeMilestone, useCumulativeRechargeState } from '@/api/cumulative-recharge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Gift, Loader2, Lock, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function milestoneProgress(total: number, threshold: number): number {
  if (threshold <= 0) return 0;
  return Math.max(0, Math.min(100, Math.floor((total / threshold) * 100)));
}

export default function CumulativeRechargePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useCumulativeRechargeState();
  const [serverId, setServerId] = useState<number | null>(null);

  const total = data?.totalDeposited ?? 0;
  const milestones = data?.milestones ?? [];
  const servers = data?.servers ?? [];
  const characters = data?.characters ?? [];

  const serversWithChar = useMemo(() => {
    const set = new Set(characters.map((c) => c.serverId));
    return servers.filter((s) => set.has(s.id));
  }, [servers, characters]);

  useEffect(() => {
    if (serverId != null && serversWithChar.some((s) => s.id === serverId)) return;
    const first = serversWithChar[0]?.id ?? null;
    setServerId(first);
  }, [serversWithChar, serverId]);

  const selectedCharacter = useMemo(() => {
    if (serverId == null) return null;
    return characters.find((c) => c.serverId === serverId) ?? null;
  }, [characters, serverId]);

  const { mutate: claim, isPending: claiming } = useClaimCumulativeRechargeMilestone({
    onSuccess: (res) => {
      notifySuccess('Thành công', res.message);
      queryClient.invalidateQueries({ queryKey: useCumulativeRechargeState.getKey() });
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  function handleClaim(milestoneId: string) {
    if (serverId == null) {
      notifyErrorFromUnknown(new Error('Chưa có server có nhân vật để nhận quà'));
      return;
    }
    if (!selectedCharacter) {
      notifyErrorFromUnknown(new Error('Server đã chọn chưa có nhân vật'));
      return;
    }
    claim({ milestoneId, serverId });
  }

  return (
    <div className='min-h-screen bg-black px-4 py-32'>
      <div className='mx-auto max-w-lg'>
        <div className='mb-8 text-center'>
          <h1 className='font-bold text-3xl text-white'>Tích nạp</h1>
          <p className='mt-2 text-sm text-white/50'>
            Tổng nạp đã duyệt: gồm số tiền chuyển khoản và thưởng khuyến mãi (nếu có).
          </p>
        </div>

        {isLoading ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='animate-spin text-white/30' size={28} />
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='rounded-2xl border border-white/10 bg-white/5 p-5'>
              <p className='text-white/40 text-xs uppercase tracking-wide'>Tổng đã nạp</p>
              <p className='mt-1 font-bold text-2xl text-[#44C8F3]'>{formatVND(total)}</p>
            </div>

            <div className='space-y-2'>
              <p className='font-medium text-sm text-white/70'>Server nhận quà trong game</p>
              <p className='text-white/40 text-xs'>Chỉ server có nhân vật mới chọn được — quà gửi qua mail game (xác thực nhân vật).</p>
              {serversWithChar.length === 0 ? (
                <p className='rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-amber-200 text-sm'>
                  Tài khoản chưa có nhân vật trên bất kỳ server nào. Vào game tạo nhân vật rồi quay lại nhận quà.
                </p>
              ) : (
                <select
                  value={serverId ?? ''}
                  onChange={(e) => setServerId(Number(e.target.value))}
                  className='w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#44C8F3]/50 focus:outline-none'
                >
                  {serversWithChar.map((s) => (
                    <option key={s.id} value={s.id} className='bg-[#0C111D]'>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedCharacter && (
                <p className='text-white/45 text-xs'>
                  Nhân vật: <span className='text-white/80'>{selectedCharacter.name}</span> (UID {selectedCharacter.uid})
                </p>
              )}
            </div>

            <div className='space-y-3'>
              <p className='font-medium text-sm text-white/70'>Mốc quà</p>
              {milestones.length === 0 ? (
                <p className='py-8 text-center text-sm text-white/35'>Chưa có chương trình tích nạp.</p>
              ) : (
                milestones.map((m) => {
                  const locked = !m.eligible;
                  const progress = milestoneProgress(total, m.thresholdAmount);
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'overflow-hidden rounded-xl border',
                        m.claimed ? 'border-green-500/25 bg-green-500/5' : 'border-white/10 bg-white/5'
                      )}
                    >
                      <div className='border-white/10 border-b bg-black/20 px-4 py-2'>
                        <div className='mb-1 flex items-center justify-between text-xs'>
                          <span className='text-white/60'>Tiến độ</span>
                          <span className='text-[#44C8F3]'>{progress}%</span>
                        </div>
                        <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
                          <div className='h-full rounded-full bg-[#44C8F3] transition-all' style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className='flex items-start justify-between gap-3 px-4 py-3'>
                        <div className='min-w-0'>
                          <p className='font-semibold text-white'>
                            {m.title?.trim() || `Mốc ${formatVND(m.thresholdAmount)}`}
                          </p>
                          <p className='mt-0.5 text-white/45 text-xs'>Đạt {formatVND(m.thresholdAmount)}</p>
                          <ul className='mt-2 space-y-1.5 text-white/55 text-xs'>
                            {m.gifts.map((g, i) => (
                              <li key={i} className='flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5'>
                                {g.imageUrl ? (
                                  <img src={g.imageUrl} alt='gift' className='h-7 w-7 rounded-md border border-white/10 object-cover' />
                                ) : (
                                  <div className='flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5'>
                                    <Sparkles size={12} className='text-white/40' />
                                  </div>
                                )}
                                <span className='truncate'>
                                  Item #{g.externalItemId} × <span className='text-white'>{g.quantity}</span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className='shrink-0'>
                          {m.claimed ? (
                            <span className='flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-1 font-medium text-green-400 text-xs'>
                              <CheckCircle2 size={12} /> Đã nhận
                            </span>
                          ) : locked ? (
                            <span className='flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-white/45 text-xs'>
                              <Lock size={12} /> Chưa đạt
                            </span>
                          ) : (
                            <Button
                              type='button'
                              size='sm'
                              disabled={claiming || serversWithChar.length === 0}
                              onClick={() => handleClaim(m.id)}
                              className='gap-1 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/85'
                            >
                              <Gift size={14} /> Nhận quà
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
