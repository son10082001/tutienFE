'use client';

import { usePortalSessionSync } from '@/hooks/usePortalSessionSync';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Đồng bộ phiên portal chỉ qua BE: poll GET /auth/me; JWT kèm `jti` — logout một bên thu hồi session DB → 401.
 */
export function PortalGameSessionBridge() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  usePortalSessionSync(isAuthenticated);
  return null;
}
