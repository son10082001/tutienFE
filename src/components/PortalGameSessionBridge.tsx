'use client';

import { usePortalBroadcastSync } from '@/hooks/usePortalBroadcastSync';
import { usePortalSessionSync } from '@/hooks/usePortalSessionSync';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Đồng bộ phiên portal:
 * - Broadcast listener chạy từ startup (dù chưa login) để nhận tín hiệu login từ game.
 * - Per-user session sync + poll /auth/me chỉ chạy khi đã đăng nhập.
 */
export function PortalGameSessionBridge() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  usePortalBroadcastSync();
  usePortalSessionSync(isAuthenticated);
  return null;
}
