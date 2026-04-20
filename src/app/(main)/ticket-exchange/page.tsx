'use client';

import { useMe } from '@/api/auth';
import {
  useCreateTicketConversion,
  useTicketExchangeHistory,
  useTicketExchangeMeta,
} from '@/api/ticket-exchange';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, History, Loader2 } from 'lucide-react';
import { useState } from 'react';

type Tab = 'exchange' | 'history';

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const HISTORY_PAGE_SIZE = 10;

export default function TicketExchangePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('exchange');
  const [serverId, setServerId] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState('10000');
  const [historyPage, setHistoryPage] = useState(1);

  const { data: me } = useMe();
  const { data: meta, isLoading: loadingMeta } = useTicketExchangeMeta();
  const { data: historyRes, isLoading: loadingHistory } = useTicketExchangeHistory({
    variables: { page: historyPage, limit: HISTORY_PAGE_SIZE },
  });

  const rate = meta?.rate ?? 1;
  const balance = meta?.balance ?? me?.balance ?? 0;
  const servers = meta?.servers ?? [];
  const characters = meta?.characters ?? [];
  const resolvedServerId = serverId ?? servers[0]?.id ?? null;
  const selectedCharacter =
    resolvedServerId != null
      ? characters.find((c) => c.serverId === resolvedServerId) ?? null
      : null;
  const convertAmount = Number(amountInput.replace(/\D/g, ''));
  const convertTickets = convertAmount > 0 ? Math.floor(convertAmount / rate) : 0;

  const { mutate: convertTicket, isPending: converting } = useCreateTicketConversion({
    onSuccess: (res) => {
      notifySuccess(
        'Đổi tiền sang phiếu thành công',
        `Số dư còn ${res.balanceAfter.toLocaleString('vi-VN')}đ · Phiếu ${res.ticketBalanceAfter.toLocaleString('vi-VN')}`
      );
      queryClient.refetchQueries({ queryKey: useTicketExchangeMeta.getKey() });
      queryClient.refetchQueries({ queryKey: useMe.getKey() });
      setAmountInput('');
    },
    onError: (e) => notifyErrorFromUnknown(e),
  });

  function handleConvertBalance() {
    if (!convertAmount || convertAmount <= 0) {
      notifyErrorFromUnknown(new Error('Số tiền cần đổi phải lớn hơn 0'));
      return;
    }
    if (!resolvedServerId) {
      notifyErrorFromUnknown(new Error('Vui lòng chọn server nhận phiếu'));
      return;
    }
    if (!selectedCharacter) {
      notifyErrorFromUnknown(new Error('Tài khoản chưa có nhân vật ở server này'));
      return;
    }
    convertTicket({ amount: convertAmount, serverId: resolvedServerId });
  }

  return (
    <div className='min-h-screen bg-black px-4 py-20'>
      <div className='mx-auto max-w-lg space-y-5'>
        <div className='text-center'>
          <h1 className='font-bold text-3xl text-white'>Đổi phiếu</h1>
          <p className='mt-2 text-sm text-white/50'>Đổi tiền nạp sang phiếu để dùng trong game</p>
        </div>

        <div className='flex rounded-xl border border-white/10 bg-white/5 p-1'>
          <button
            type='button'
            onClick={() => setTab('exchange')}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
              tab === 'exchange' ? 'bg-[#44C8F3] text-black' : 'text-white/50 hover:text-white'
            )}
          >
            Đổi phiếu
          </button>
          <button
            type='button'
            onClick={() => setTab('history')}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
              tab === 'history' ? 'bg-[#44C8F3] text-black' : 'text-white/50 hover:text-white'
            )}
          >
            Lịch sử
          </button>
        </div>

        {tab === 'exchange' && (
          <div className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
            <div className='rounded-xl border border-white/10 bg-white/5 p-4 text-sm'>
              <div>
                <p className='text-white/45'>Số dư tiền nạp</p>
                <p className='font-semibold text-white'>{formatVND(balance)}</p>
              </div>
            </div>

            <div className='space-y-2 rounded-xl border border-amber-400/25 bg-amber-500/10 p-4'>
              <p className='text-sm font-semibold text-amber-100'>Đổi tiền sang phiếu</p>
              <div className='space-y-1.5'>
                <label className='text-sm text-white/70'>Server nhận phiếu</label>
                <select
                  value={resolvedServerId ?? ''}
                  onChange={(e) => setServerId(Number(e.target.value))}
                  className='flex h-10 w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#44C8F3]/50 [&>option]:bg-[#0C111D]'
                >
                  {servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='space-y-1.5'>
                <label className='text-sm text-white/70'>Tên nhân vật ở server đã chọn</label>
                <Input
                  disabled
                  value={selectedCharacter?.name ?? 'Chưa có nhân vật'}
                  className='border-white/10 bg-white/5 text-white/80'
                />
              </div>
              <Input
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value.replace(/\D/g, ''))}
                placeholder='Nhập số tiền muốn đổi...'
                className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
              />
              <p className='text-xs text-white/60'>
                Tỉ lệ: {rate.toLocaleString('vi-VN')}đ = 1 phiếu · Dự kiến nhận {convertTickets.toLocaleString('vi-VN')} phiếu
              </p>
              <Button
                onClick={handleConvertBalance}
                disabled={
                  converting ||
                  !convertAmount ||
                  convertAmount > balance ||
                  convertTickets <= 0 ||
                  !resolvedServerId ||
                  !selectedCharacter
                }
                className='w-full bg-amber-400 font-semibold text-black hover:bg-amber-300 disabled:opacity-50'
              >
                {converting ? (
                  <>
                    <Loader2 size={16} className='mr-2 animate-spin' />
                    Đang đổi...
                  </>
                ) : (
                  'Đổi tiền sang phiếu'
                )}
              </Button>
              {convertAmount > balance && (
                <p className='text-xs text-red-300'>Số tiền cần đổi vượt quá số dư hiện có.</p>
              )}
              {!selectedCharacter && resolvedServerId && (
                <p className='text-xs text-red-300'>Server này chưa có nhân vật, không thể đổi phiếu.</p>
              )}
            </div>
            {loadingMeta && (
              <div className='flex items-center justify-center py-2'>
                <Loader2 className='animate-spin text-white/40' size={18} />
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className='space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6'>
            {loadingHistory ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='animate-spin text-white/40' size={20} />
              </div>
            ) : (historyRes?.items.length ?? 0) === 0 ? (
              <div className='flex flex-col items-center gap-2 py-10 text-white/35'>
                <History size={28} />
                <p className='text-sm'>Chưa có lịch sử đổi phiếu</p>
              </div>
            ) : (
              <>
                <div className='space-y-3'>
                  {historyRes?.items.map((row) => (
                    <div
                      key={row.id}
                      className='rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm'
                    >
                      <p className='font-semibold text-white'>
                        {formatVND(row.amount)} → +{row.tickets.toLocaleString('vi-VN')} phiếu
                      </p>
                      <p className='mt-1 text-xs text-[#44C8F3]/90'>
                        Server {row.serverId} · {row.playerName}
                      </p>
                      <p className='mt-1 text-xs text-white/45'>
                        Tỉ lệ: {row.conversionRate.toLocaleString('vi-VN')}đ/phiếu
                      </p>
                      <p className='mt-1 text-xs text-white/35'>{formatDate(row.createdAt)}</p>
                    </div>
                  ))}
                </div>

                <div className='flex items-center justify-between border-t border-white/10 pt-3 text-sm text-white/45'>
                  <span>
                    Tổng {historyRes?.total ?? 0} giao dịch · {HISTORY_PAGE_SIZE} / trang
                  </span>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage <= 1}
                      className='flex h-8 w-8 items-center justify-center rounded-md border border-white/10 disabled:opacity-30'
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type='button'
                      onClick={() => setHistoryPage((p) => p + 1)}
                      disabled={historyPage >= Math.ceil((historyRes?.total ?? 0) / HISTORY_PAGE_SIZE)}
                      className='flex h-8 w-8 items-center justify-center rounded-md border border-white/10 disabled:opacity-30'
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
