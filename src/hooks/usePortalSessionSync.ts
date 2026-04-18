'use client';

import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/auth-store';
import { getAccessToken } from '@/utils/auth';
import { API_URL } from '@/utils/const';
import { clearPortalGameHandoff, ensurePortalGameHandoffForLaunch, savePortalGameLoginSession, setPortalGameHandoff } from '@/utils/game-handoff';
import { useEffect, useRef } from 'react';
import { firebaseSync } from '@/lib/firebaseSync';
import { signIn, type UserInfoResponse } from '@/api/auth';
import { toast } from 'sonner';

/** Khi session bị thu hồi trên BE (logout web/game), /auth/me trả 401. */
const POLL_MS = 5000;

/**
 * Poll /auth/me khi đã đăng nhập — không dùng postMessage/storage; game cũng poll tương tự.
 */
export function usePortalSessionSync(enabled: boolean): void {
  const logout = useAuthStore((s) => s.logout);
  const portalUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialize Firebase Sync for the current user if available
    const uid = portalUser?.userId || portalUser?.id;
    if (uid) {
      firebaseSync.startListening(String(uid));
    }

    firebaseSync.setSyncCallback(async (data) => {
      // 1. Handle Logout Signal
      if (data.status === 'offline') {
        if (isAuthenticated) {
          console.log('[FirebaseSync] Logout signal received, logging out portal...');
          logout();
          window.location.href = ROUTES.LOGIN;
        }
        return;
      }

      // 2. Handle Login Signal from Game
      if (data.status === 'online' && data.platform === 'game' && data.credentials) {
        const currentUserId = portalUser?.userId || portalUser?.id;
        if (String(currentUserId) !== String(data.credentials.userId)) {
          console.log('[FirebaseSync] Game login detected, syncing to portal...');
          try {
            const loginData = await signIn({
              userId: data.credentials.userId,
              password: data.credentials.password,
            });

            setPortalGameHandoff(
              data.credentials.userId,
              data.credentials.password,
              loginData.accessToken,
              API_URL
            );
            savePortalGameLoginSession(data.credentials.userId, data.credentials.password);

            const userInfo = {
              id: loginData?.user?.id,
              userId: loginData?.user?.userId,
              email: loginData?.user?.email,
              name: loginData?.user?.name,
              role: loginData?.user?.role,
              type: loginData?.user?.type,
              kycStatus: loginData?.user?.kycStatus ?? 'none',
            } as UserInfoResponse;

            useAuthStore.getState().login(loginData.accessToken, '', userInfo);
            toast.success('Đồng bộ đăng nhập từ Game thành công.');
            window.location.reload();
          } catch (error) {
            console.error('[FirebaseSync] Failed to auto-login portal:', error);
          }
        }
      }
    });

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
  }, [enabled, logout, portalUser?.id, portalUser?.userId, isAuthenticated]);
}
