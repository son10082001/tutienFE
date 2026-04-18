'use client';

import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/auth-store';
import { getAccessToken } from '@/utils/auth';
import { API_URL } from '@/utils/const';
import { clearPortalGameHandoff, ensurePortalGameHandoffForLaunch } from '@/utils/game-handoff';
import { useEffect, useRef } from 'react';

/** Khi session bị thu hồi trên BE (logout web/game), /auth/me trả 401. */
const POLL_MS = 5000;

/**
 * Poll /auth/me khi đã đăng nhập — không dùng postMessage/storage; game cũng poll tương tự.
 */
export function usePortalSessionSync(enabled: boolean): void {
  const logout = useAuthStore((s) => s.logout);
  const portalUser = useAuthStore((s) => s.user);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const base = API_URL.replace(/\/$/, '');

    const tick = async () => {
      const token = getAccessToken();
      if (!token) return;
      try {
        const res = await fetch(`${base}/auth/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (res.status === 401) {
          clearPortalGameHandoff();
          logout();
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith(ROUTES.LOGIN)) {
            window.location.href = ROUTES.LOGIN;
          }
          return;
        }
        if (res.ok) {
          const uid =
            portalUser?.userId != null
              ? String(portalUser.userId)
              : portalUser?.id != null
                ? String(portalUser.id)
                : undefined;
          ensurePortalGameHandoffForLaunch(uid, getAccessToken(), base);
        }
      } catch {
        // ignore network errors for poll
      }
    };

    void tick();
    intervalRef.current = setInterval(() => {
      void tick();
    }, POLL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, logout, portalUser?.id, portalUser?.userId]);
}
