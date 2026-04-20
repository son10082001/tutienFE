'use client';

import type { DepositRequest, DepositStatus } from '@/api/deposit';
import { useCreateDeposit, useDepositPromotion, useMyDeposits } from '@/api/deposit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { notifyError, notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Loader2,
  Percent,
  QrCode,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const VIETCOMBANK_ACCOUNT = '0461000633851';
const VIETCOMBANK_NAME = 'TU%20TIEN%20KIEM%20HIEP';
const MOMO_PHONE = '0961795312';


const AMOUNT_PRESETS = [
  { label: '10K', value: 10_000 },
  { label: '20K', value: 20_000 },
  { label: '50K', value: 50_000 },
  { label: '100K', value: 100_000 },
  { label: '200K', value: 200_000 },
  { label: '500K', value: 500_000 },
];

const STATUS_CONFIG: Record<DepositStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'Chờ duyệt',
    icon: <Clock size={13} />,
    className: 'bg-yellow-500/15 text-yellow-400',
  },
  approved: {
    label: 'Đã duyệt',
    icon: <CheckCircle2 size={13} />,
    className: 'bg-green-500/15 text-green-400',
  },
  rejected: {
    label: 'Từ chối',
    icon: <XCircle size={13} />,
    className: 'bg-red-500/15 text-red-400',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getVietQRUrl(amount: number, note: string) {
  return `https://img.vietqr.io/image/VCB-${VIETCOMBANK_ACCOUNT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${VIETCOMBANK_NAME}`;
}

function getMoMoQRUrl(amount: number, note: string) {
  return `https://momosv3.apimienphi.com/api/QRCode?phone=${MOMO_PHONE}&amount=${amount}&note=${encodeURIComponent(note)}`;
}

// ─── QR Panel ─────────────────────────────────────────────────────────────────

function QRPanel({
  method,
  amount,
  note,
  bonusAmount = 0,
}: {
  method: 'vietqr' | 'momo';
  amount: number;
  note: string;
  bonusAmount?: number;
}) {
  const url = method === 'vietqr' ? getVietQRUrl(amount, note) : getMoMoQRUrl(amount, note);
  const isVietQR = method === 'vietqr';

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='overflow-hidden rounded-2xl border border-white/10 bg-white p-4 shadow-xl shadow-black/40'>
        <Image
          src={url}
          alt='QR code'
          width={220}
          height={220}
          className='h-[220px] w-[220px] object-contain'
          unoptimized
        />
      </div>
      <div className='w-full rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm'>
        {isVietQR ? (
          <>
            <Row label='Ngân hàng' value='Vietcombank (VCB)' />
            <Row label='Số tài khoản' value={VIETCOMBANK_ACCOUNT} mono />
            <Row label='Chủ tài khoản' value='TU TIEN KIEM HIEP' />
          </>
        ) : (
          <>
            <Row label='Ví MoMo' value={MOMO_PHONE} mono />
          </>
        )}
        <Row label='Số tiền chuyển' value={formatVND(amount)} highlight />
        {bonusAmount > 0 && (
          <>
            <Row label='Thưởng KM' value={`+ ${formatVND(bonusAmount)}`} />
            <Row label='Thực nhận khi duyệt' value={formatVND(amount + bonusAmount)} highlight />
          </>
        )}
        <Row label='Mã giao dịch' value={note} mono highlight />
        {/* <Row label='Nội dung CK' value={note} mono /> */}
      </div>
      <p className='text-center text-xs text-white/30'>
        Quét mã QR bằng app {isVietQR ? 'ngân hàng / VietQR' : 'MoMo'} để chuyển tiền
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className='flex items-center justify-between gap-2'>
      <span className='text-white/40 shrink-0'>{label}</span>
      <span
        className={cn(
          'truncate text-right',
          mono && 'font-mono',
          highlight ? 'font-bold text-[#44C8F3]' : 'text-white/80'
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ─── History tab ──────────────────────────────────────────────────────────────

const HISTORY_PAGE_SIZE = 10;

function HistoryTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyDeposits({ variables: { page, limit: HISTORY_PAGE_SIZE } });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 size={22} className='animate-spin text-white/30' />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-16 text-white/30'>
        <History size={32} />
        <p className='text-sm'>Chưa có lịch sử nạp tiền</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        {items.map((item) => {
          const cfg = STATUS_CONFIG[item.status as DepositStatus];
          return (
            <div
              key={item.id}
              className='flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3'
            >
              <div className='space-y-0.5'>
                <p className='font-semibold text-sm text-white'>{formatVND(item.amount)}</p>
                {(item.bonusAmount ?? 0) > 0 && (
                  <p className='text-xs text-amber-300/90'>
                    + KM {item.promoPercentSnapshot ?? '?'}%: {formatVND(item.bonusAmount ?? 0)} → thực nhận{' '}
                    {formatVND(item.amount + (item.bonusAmount ?? 0))}
                  </p>
                )}
                <p className='font-mono text-xs text-[#44C8F3]/90'>{item.note}</p>
                <p className='text-xs text-white/40'>{item.method === 'vietqr' ? 'VietQR' : 'MoMo'}</p>
                <p className='text-xs text-white/30'>{formatDate(item.createdAt)}</p>
                {item.adminNote && (
                  <p className='text-xs text-red-400'>{item.adminNote}</p>
                )}
              </div>
              <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', cfg.className)}>
                {cfg.icon}
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className='flex items-center justify-between border-white/10 border-t pt-4 text-sm text-white/45'>
        <span>Tổng {total} giao dịch · {HISTORY_PAGE_SIZE} / trang</span>
        {totalPages > 1 ? (
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30'
            >
              <ChevronLeft size={18} />
            </button>
            <span className='min-w-[4.5rem] text-center text-white/70'>{page} / {totalPages}</span>
            <button
              type='button'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30'
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <span className='text-white/35'>Trang 1 / 1</span>
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type Tab = 'deposit' | 'history';
type Method = 'vietqr' | 'momo';

export default function DepositPage() {
  const [tab, setTab] = useState<Tab>('deposit');
  const [method, setMethod] = useState<Method>('vietqr');
  const [amount, setAmount] = useState<number>(100_000);
  const [amountInput, setAmountInput] = useState('100000');
  const [showQR, setShowQR] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeDeposit, setActiveDeposit] = useState<DepositRequest | null>(null);

  const { data: promoRes } = useDepositPromotion();
  const activePromo = promoRes?.active ?? null;
  const previewBonus =
    activePromo && amount >= 10_000 ? Math.floor((amount * activePromo.percent) / 100) : 0;

  const queryClient = useQueryClient();
  const { mutate: createDeposit, isPending } = useCreateDeposit({
    onError: (err) => notifyErrorFromUnknown(err),
  });

  const transferNote = activeDeposit?.note ?? '';

  function handleAmountInput(val: string) {
    const num = Number(val.replace(/\D/g, ''));
    setAmountInput(val.replace(/\D/g, ''));
    setAmount(num);
    setShowQR(false);
    setSubmitted(false);
    setActiveDeposit(null);
  }

  function handlePreset(val: number) {
    setAmount(val);
    setAmountInput(String(val));
    setShowQR(false);
    setSubmitted(false);
    setActiveDeposit(null);
  }

  function handleShowQR() {
    if (!amount || amount < 10_000) {
      notifyError('Số tiền không hợp lệ', 'Số tiền tối thiểu là 10.000đ');
      return;
    }
    createDeposit(
      { amount, method, server: 'all' },
      {
        onSuccess: (data) => {
          setActiveDeposit(data);
          setShowQR(true);
          setSubmitted(false);
          queryClient.refetchQueries({ queryKey: useMyDeposits.getKey() });
        },
      }
    );
  }

  function handleConfirm() {
    notifySuccess('Đã ghi nhận', 'Vui lòng chờ admin đối chiếu theo mã giao dịch.');
    setSubmitted(true);
    queryClient.invalidateQueries({ queryKey: useMyDeposits.getKey() });
  }

  return (
    <div className='min-h-screen bg-black px-4 py-20'>
      <div className='mx-auto max-w-lg'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <h1 className='font-bold text-3xl text-white'>Nạp tiền</h1>
          <p className='mt-2 text-sm text-white/50'>Chuyển khoản ngay trong game</p>
        </div>

        {/* Tabs */}
        <div className='mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1'>
          {([['deposit', 'Nạp tiền'], ['history', 'Lịch sử']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              type='button'
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                tab === t ? 'bg-[#44C8F3] text-black' : 'text-white/50 hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'history' ? (
          <HistoryTab />
        ) : (
          <div className='space-y-5'>
            {activePromo && (
              <div className='flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm'>
                <Percent className='mt-0.5 size-5 shrink-0 text-amber-300' />
                <div>
                  <p className='font-semibold text-amber-100'>
                    Khuyến mãi nạp +{activePromo.percent}%
                    {activePromo.label ? ` · ${activePromo.label}` : ''}
                  </p>
                  <p className='mt-1 text-xs text-white/50'>
                    Áp dụng đến hết ngày{' '}
                    {new Date(activePromo.endAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Method select */}
            <div className='space-y-2'>
              <p className='text-sm font-medium text-white/70'>Phương thức nạp</p>
              <div className='grid grid-cols-2 gap-3'>
                {([['vietqr', 'VietQR'], ['momo', 'MoMo']] as [Method, string][]).map(
                  ([m, label]) => (
                    <button
                      key={m}
                      type='button'
                      onClick={() => {
                        setMethod(m);
                        setShowQR(false);
                        setSubmitted(false);
                        setActiveDeposit(null);
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                        method === m
                          ? 'border-[#44C8F3]/50 bg-[#44C8F3]/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                      )}
                    >
                      <Image
                        src={m === 'vietqr' ? '/images/logo-bank/vietqr.webp' : '/images/logo-bank/momo.svg'}
                        alt={label}
                        width={36}
                        height={36}
                        className='rounded-lg object-contain'
                      />
                      <div>
                        <p className='font-semibold text-sm'>{label}</p>
                        <p className='text-xs opacity-60'>
                          {m === 'vietqr' ? 'Vietcombank' : `SĐT ${MOMO_PHONE}`}
                        </p>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Amount */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-white/70'>Số tiền (VNĐ)</label>
              <Input
                value={amountInput}
                onChange={(e) => handleAmountInput(e.target.value)}
                placeholder='Nhập số tiền...'
                className='border-white/10 bg-white/5 text-white placeholder:text-white/25'
              />
              <div className='grid grid-cols-3 gap-2'>
                {AMOUNT_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type='button'
                    onClick={() => handlePreset(p.value)}
                    className={cn(
                      'rounded-lg border py-2 text-xs font-medium transition-colors',
                      amount === p.value
                        ? 'border-[#44C8F3]/50 bg-[#44C8F3]/10 text-[#44C8F3]'
                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {amount >= 10_000 && (
                <div className='rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm'>
                  {activePromo && previewBonus > 0 ? (
                    <>
                      <p className='text-white/55'>Thực nhận khi admin duyệt</p>
                      <p className='font-bold text-lg text-[#44C8F3]'>{formatVND(amount + previewBonus)}</p>
                      <p className='text-xs text-white/40'>
                        Gồm chuyển {formatVND(amount)} + thưởng {activePromo.percent}% (
                        {formatVND(previewBonus)})
                      </p>
                    </>
                  ) : (
                    <p className='text-white/60'>
                      Số tiền chuyển khoản:{' '}
                      <span className='font-semibold text-white'>{formatVND(amount)}</span>
                      {activePromo && previewBonus === 0 ? (
                        <span className='text-white/35'> (không có KM cho mức này)</span>
                      ) : null}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Show QR button */}
            {!showQR && (
              <Button
                onClick={handleShowQR}
                disabled={!amount || isPending}
                className='w-full gap-2 bg-[#44C8F3] font-semibold text-black hover:bg-[#44C8F3]/80 disabled:opacity-50'
              >
                {isPending ? (
                  <><Loader2 size={16} className='animate-spin' /> Đang tạo mã...</>
                ) : (
                  <><QrCode size={16} /> Hiển thị mã QR</>
                )}
              </Button>
            )}

            {/* QR + confirm */}
            {showQR && activeDeposit && (
              <div className='space-y-4'>
                <QRPanel
                  method={method}
                  amount={amount}
                  note={transferNote}
                  bonusAmount={activeDeposit.bonusAmount ?? 0}
                />

                {!submitted ? (
                  <Button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className='w-full gap-2 bg-green-500 font-semibold text-white hover:bg-green-600 disabled:opacity-50'
                  >
                    {isPending ? (
                      <><Loader2 size={16} className='animate-spin' /> Đang gửi...</>
                    ) : (
                      <><CheckCircle2 size={16} /> Tôi đã chuyển tiền</>
                    )}
                  </Button>
                ) : (
                  <div className='flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-400'>
                    <CheckCircle2 size={18} />
                    <span className='text-sm font-medium'>Đã ghi nhận! Admin sẽ duyệt sớm nhất có thể.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
