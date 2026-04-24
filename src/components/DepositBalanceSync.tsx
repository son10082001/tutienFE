'use client';

import { useMyDeposits } from '@/api/deposit/queries';
import { useAuthStore } from '@/stores/auth-store';
import { SYNC_MODE } from '@/utils/const';
import { refreshUserBalanceFromServer } from '@/utils/refresh-balance';
import { websocketSync } from '@/lib/websocketSync';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Mọi trang: khi SePay auto-duyệt, BE bắn `deposit_status` qua WebSocket
 * → gọi lại /auth/me để cập nhật `balance`, VIP, phiếu (không cần mở trang nạp).
 */
export function DepositBalanceSync() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (SYNC_MODE !== 'websocket' || !isAuthenticated) return;
    return websocketSync.subscribeDepositStatus((p) => {
      if (p.status !== 'approved') return;
      void refreshUserBalanceFromServer(queryClient);
      void queryClient.invalidateQueries({ queryKey: useMyDeposits.getKey() });
    });
  }, [isAuthenticated, queryClient]);

  return null;
}
