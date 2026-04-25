'use client';

import type { DepositRequest, DepositStatus } from '@/api/deposit';
import { useCreateDeposit, useDepositOptions, useDepositPromotion, useMyDeposits } from '@/api/deposit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { websocketSync } from '@/lib/websocketSync';
import { SYNC_MODE, VIETQR_SEPAY_QR_TEMPLATE } from '@/utils/const';
import { notifyError, notifyErrorFromUnknown, notifySuccess } from '@/utils/notify';
import { refreshUserBalanceFromServer } from '@/utils/refresh-balance';
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
import { useEffect, useMemo, useRef, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildQrUrl(template: string | null | undefined, vars: Record<string, string | number>) {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(String(vars[key] ?? '')));
}

// ─── QR Panel ─────────────────────────────────────────────────────────────────

function QRPanel({
  methodName,
  bankCode,
  accountName,
  accountNumber,
  phoneNumber,
  bankName,
  amount,
  note,
  qrTemplate,
  bonusAmount = 0,
}: {
  methodName: string;
  bankCode?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  phoneNumber?: string | null;
  bankName?: string | null;
  amount: number;
  note: string;
  qrTemplate?: string | null;
  bonusAmount?: number;
}) {
  const url = buildQrUrl(qrTemplate, {
    amount,
    note,
    bankCode: bankCode ?? '',
    accountName: accountName ?? '',
    accountNumber: accountNumber ?? '',
    phoneNumber: phoneNumber ?? '',
    bankName: bankName ?? '',
  });

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
        <Row label='Phương thức' value={methodName} />
        {bankName ? <Row label='Ngân hàng' value={bankName} /> : null}
        {accountNumber ? <Row label='Số tài khoản' value={accountNumber} mono /> : null}
        {accountName ? <Row label='Chủ tài khoản' value={accountName} /> : null}
        {phoneNumber ? <Row label='Số điện thoại' value={phoneNumber} mono /> : null}
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
      <p className='text-center text-xs text-white/30'>Quét mã QR theo phương thức đã chọn để chuyển tiền</p>
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
                <p className='text-xs text-white/40'>{item.method}</p>
                <p className='text-xs text-white/30'>{formatDate(item.createdAt)}</p>
                {/* {item.adminNote && <p className='text-xs text-red-400'>{item.adminNote}</p>} */}
              </div>
              <span
                className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', cfg.className)}
              >
                {cfg.icon}
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className='flex items-center justify-between border-white/10 border-t pt-4 text-sm text-white/45'>
        <span>
          Tổng {total} giao dịch · {HISTORY_PAGE_SIZE} / trang
        </span>
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
            <span className='min-w-[4.5rem] text-center text-white/70'>
              {page} / {totalPages}
            </span>
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
type Method = string;

export default function DepositPage() {
  const [tab, setTab] = useState<Tab>('deposit');
  const [method, setMethod] = useState<Method>('');
  const [amount, setAmount] = useState<number>(100_000);
  const [amountInput, setAmountInput] = useState('100000');
  const [showQR, setShowQR] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeDeposit, setActiveDeposit] = useState<DepositRequest | null>(null);

  const { data: promoRes } = useDepositPromotion();
  const { data: optionsRes } = useDepositOptions();
  const paymentMethods = optionsRes?.methods ?? [];
  /** VietQR lên đầu; Momo chỉ hiển thị trạng thái bảo trì (không dùng được). */
  const orderedPaymentMethods = useMemo(() => {
    const vietqr = paymentMethods.filter((m) => m.code.toLowerCase() === 'vietqr');
    const rest = paymentMethods.filter((m) => m.code.toLowerCase() !== 'vietqr');
    return [...vietqr, ...rest];
  }, [paymentMethods]);
  const selectedMethod = useMemo(() => paymentMethods.find((m) => m.code === method) ?? null, [paymentMethods, method]);
  const selectedBank = useMemo(() => selectedMethod?.banks?.[0] ?? null, [selectedMethod]);
  const activePromo = promoRes?.active ?? null;
  const previewBonus = activePromo && amount >= 10_000 ? Math.floor((amount * activePromo.percent) / 100) : 0;

  const queryClient = useQueryClient();
  const { mutate: createDeposit, isPending } = useCreateDeposit({
    onError: (err) => notifyErrorFromUnknown(err),
  });

  /** Polling khi lệnh đang chờ SePay (backup nếu mất WebSocket / SYNC_MODE khác). */
  const { data: pollDeposits } = useMyDeposits({
    variables: { page: 1, limit: 20 },
    enabled: !!activeDeposit && activeDeposit.status === 'pending',
    refetchInterval: activeDeposit?.status === 'pending' ? 5000 : false,
  });

  useEffect(() => {
    if (!activeDeposit || activeDeposit.status !== 'pending' || !pollDeposits?.items) return;
    const row = pollDeposits.items.find((d) => d.id === activeDeposit.id);
    if (row && row.status !== 'pending') setActiveDeposit(row);
  }, [pollDeposits, activeDeposit]);

  const prevDepositStatusRef = useRef<DepositRequest['status'] | null>(null);
  useEffect(() => {
    if (!activeDeposit) {
      prevDepositStatusRef.current = null;
      return;
    }
    const was = prevDepositStatusRef.current;
    prevDepositStatusRef.current = activeDeposit.status;
    if (activeDeposit.status === 'approved' && was === 'pending') {
      void refreshUserBalanceFromServer(queryClient);
    }
  }, [activeDeposit, queryClient]);

  useEffect(() => {
    if (SYNC_MODE !== 'websocket') return;
    return websocketSync.subscribeDepositStatus((p) => {
      void queryClient.invalidateQueries({ queryKey: useMyDeposits.getKey() });
      setActiveDeposit((prev) =>
        prev && prev.id === p.depositId
          ? {
              ...prev,
              status: p.status as DepositRequest['status'],
              note: p.note,
              amount: p.amount,
              adminNote: 'Auto duyet boi SePay webhook',
            }
          : prev
      );
    });
  }, [queryClient]);

  useEffect(() => {
    if (orderedPaymentMethods.length === 0) return;
    const isMomo = (c: string) => c.toLowerCase() === 'momo';
    if (method && isMomo(method)) {
      const fallback =
        orderedPaymentMethods.find((m) => m.code.toLowerCase() === 'vietqr') ??
        orderedPaymentMethods.find((m) => !isMomo(m.code));
      if (fallback) setMethod(fallback.code);
      return;
    }
    if (!method) {
      const preferred =
        orderedPaymentMethods.find((m) => m.code.toLowerCase() === 'vietqr') ?? orderedPaymentMethods[0];
      if (preferred) setMethod(preferred.code);
    }
  }, [method, orderedPaymentMethods]);

  const transferNote = (() => {
    const raw = (activeDeposit?.note ?? '').toUpperCase();
    const matched = raw.match(/^NT\d{6}$/);
    if (matched) return matched[0];
    const digits = raw.replace(/\D/g, '').slice(0, 6).padEnd(6, '0');
    return `NT${digits}`;
  })();

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
    if (method.toLowerCase() === 'momo') {
      notifyError('Đang bảo trì', 'MoMo tạm ngưng. Vui lòng chọn VietQR.');
      return;
    }
    if (!method) {
      notifyError('Thiếu phương thức', 'Vui lòng chọn phương thức thanh toán');
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
    <div className='min-h-screen bg-black px-4 py-32'>
      <div className='mx-auto max-w-lg'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <h1 className='font-bold text-3xl text-white'>Nạp tiền</h1>
          <p className='mt-2 text-sm text-white/50'>Chuyển khoản ngay trong game</p>
        </div>

        {/* Tabs */}
        <div className='mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1'>
          {(
            [
              ['deposit', 'Nạp tiền'],
              ['history', 'Lịch sử'],
            ] as [Tab, string][]
          ).map(([t, label]) => (
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
                    Khuyến mãi nạp +{activePromo.percent}%{activePromo.label ? ` · ${activePromo.label}` : ''}
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
                {orderedPaymentMethods.map((m) => {
                  const methodCode = m.code.toLowerCase();
                  const momoMaintenance = methodCode === 'momo';
                  const logoSrc =
                    methodCode === 'vietqr' ? '/images/logo-bank/vietqr.webp' : '/images/logo-bank/momo.svg';
                  return (
                    <button
                      key={m.code}
                      type='button'
                      disabled={momoMaintenance}
                      onClick={() => {
                        if (momoMaintenance) return;
                        setMethod(m.code);
                        setShowQR(false);
                        setSubmitted(false);
                        setActiveDeposit(null);
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                        momoMaintenance && 'cursor-not-allowed opacity-50',
                        method === m.code && !momoMaintenance
                          ? 'border-[#44C8F3]/50 bg-[#44C8F3]/10 text-white'
                          : !momoMaintenance
                            ? 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/40'
                      )}
                    >
                      <Image
                        src={logoSrc}
                        alt={m.name}
                        width={36}
                        height={36}
                        className='rounded-lg object-contain'
                        onError={(e) => {
                          if (methodCode === 'vietqr') {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = '/images/logo-bank/vietqr.svg';
                          }
                        }}
                      />
                      <div>
                        <p className='font-semibold text-sm'>{m.name}</p>
                        <p className='text-xs opacity-60'>
                          {momoMaintenance ? 'Đang bảo trì' : m.code}
                        </p>
                      </div>
                    </button>
                  );
                })}
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
                      <p className='text-white/55'>Thực nhận</p>
                      <p className='font-bold text-lg text-[#44C8F3]'>{formatVND(amount + previewBonus)}</p>
                      <p className='text-xs text-white/40'>
                        Gồm chuyển {formatVND(amount)} + thưởng {activePromo.percent}% ({formatVND(previewBonus)})
                      </p>
                    </>
                  ) : (
                    <p className='text-white/60'>
                      Số tiền chuyển khoản: <span className='font-semibold text-white'>{formatVND(amount)}</span>
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
                  <>
                    <Loader2 size={16} className='animate-spin' /> Đang tạo mã...
                  </>
                ) : (
                  <>
                    <QrCode size={16} /> Hiển thị mã QR
                  </>
                )}
              </Button>
            )}

            {/* QR + confirm */}
            {showQR && activeDeposit && (
              <div className='space-y-4'>
                <QRPanel
                  methodName={selectedMethod?.name ?? method}
                  bankCode={selectedBank?.code ?? null}
                  accountName={selectedBank?.accountName ?? selectedMethod?.accountName}
                  accountNumber={selectedBank?.accountNumber ?? selectedMethod?.accountNumber}
                  phoneNumber={selectedMethod?.phoneNumber}
                  bankName={selectedBank?.name ?? null}
                  amount={amount}
                  note={transferNote}
                  qrTemplate={
                    selectedMethod?.qrTemplate ??
                    (method.toLowerCase() === 'vietqr' ? VIETQR_SEPAY_QR_TEMPLATE : null)
                  }
                  bonusAmount={activeDeposit.bonusAmount ?? 0}
                />

                {!submitted ? (
                  <Button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className='w-full gap-2 bg-green-500 font-semibold text-white hover:bg-green-600 disabled:opacity-50'
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className='animate-spin' /> Đang gửi...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Xác nhận chuyển tiền
                      </>
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
