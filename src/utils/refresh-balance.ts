import { useMe } from '@/api/auth/queries';
import { userInfo } from '@/api/auth/requests';
import { useShopMeta } from '@/api/shop/queries';
import { useTicketExchangeMeta } from '@/api/ticket-exchange/queries';
import { useAuthStore } from '@/stores/auth-store';
import type { QueryClient } from '@tanstack/react-query';

let lastRefreshAt = 0;
const DEBOUNCE_MS = 1200;

/**
 * Gọi sau khi nạp tiền được duyệt (SePay / admin) để `balance` + VIP trên store
 * và cache shop/đổi phiếu đồng bộ với server.
 */
export async function refreshUserBalanceFromServer(queryClient: QueryClient): Promise<void> {
  const now = Date.now();
  if (now - lastRefreshAt < DEBOUNCE_MS) return;
  lastRefreshAt = now;

  try {
    const me = await userInfo();
    useAuthStore.getState().setUser(me);
  } catch (e) {
    console.warn('[refreshUserBalance] /auth/me failed', e);
  }
  void queryClient.invalidateQueries({ queryKey: useMe.getKey() });
  void queryClient.invalidateQueries({ queryKey: useTicketExchangeMeta.getKey() });
  void queryClient.invalidateQueries({ queryKey: useShopMeta.getKey() });
}
