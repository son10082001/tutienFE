'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMessagePopupStore } from '@/stores/message-popup-store';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CheckCircle2, X, XCircle } from 'lucide-react';

export function MessagePopupHost() {
  const open = useMessagePopupStore((s) => s.open);
  const variant = useMessagePopupStore((s) => s.variant);
  const title = useMessagePopupStore((s) => s.title);
  const description = useMessagePopupStore((s) => s.description);
  const close = useMessagePopupStore((s) => s.close);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-[10050] bg-black/65 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-[10051] w-full max-w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-white/12 bg-gradient-to-b from-[#1e2436] to-[#0c111d] p-6 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)] outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-300'
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Close
            className='absolute top-3 right-3 rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white'
            aria-label='Đóng'
            type='button'
          >
            <X className='size-5' />
          </DialogPrimitive.Close>

          <div className='flex flex-col items-center gap-4 pt-2 text-center'>
            {variant === 'success' ? (
              <div className='relative flex size-[92px] items-center justify-center'>
                <div
                  className='absolute size-[90px] rounded-full border-2 border-[#44C8F3]/18'
                  aria-hidden
                />
                <div
                  className='absolute size-[90px] motion-safe:animate-spin rounded-full border-2 border-transparent border-t-[#44C8F3] border-r-[#44C8F3]/45 motion-reduce:animate-none'
                  style={{ animationDuration: '0.9s' }}
                  aria-hidden
                />
                <div className='relative z-10 flex size-[72px] items-center justify-center rounded-full bg-[#44C8F3]/12 shadow-[0_0_28px_-6px_rgba(68,200,243,0.5)] ring-4 ring-[#44C8F3]/22'>
                  <CheckCircle2
                    className='success-popup-tick size-10 text-[#44C8F3]'
                    strokeWidth={2.25}
                  />
                </div>
              </div>
            ) : (
              <div className='flex size-[72px] animate-in zoom-in-95 items-center justify-center duration-500 rounded-full bg-red-500/12 ring-4 ring-red-400/25'>
                <XCircle className='size-10 text-red-400' strokeWidth={2.25} />
              </div>
            )}

            <DialogPrimitive.Title className='pr-8 text-lg leading-snug font-bold text-white'>
              {title}
            </DialogPrimitive.Title>

            {description ? (
              <DialogPrimitive.Description className='text-sm text-white/65'>
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className='sr-only'>
                {variant === 'success' ? 'Thao tác thành công' : 'Có lỗi xảy ra'}
              </DialogPrimitive.Description>
            )}

            <Button
              type='button'
              className={cn(
                'mt-1 h-11 w-full rounded-xl font-semibold',
                variant === 'success'
                  ? 'bg-[#44C8F3] text-black hover:bg-[#44C8F3]/90'
                  : 'bg-red-500 text-white hover:bg-red-500/90'
              )}
              onClick={close}
            >
              Đóng
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
