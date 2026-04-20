'use client';

import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/stores/auth-store';
import { getAccessToken } from '@/utils/auth';
import { API_URL } from '@/utils/const';
import {
  clearPortalGameHandoff,
  ensurePortalGameHandoffForLaunch,
  patchPortalGameHandoffAccessToken,
  savePortalGameLoginSession,
  setPortalGameHandoff,
} from '@/utils/game-handoff';
import { useEffect, useRef } from 'react';
import { sessionSync } from '@/lib/sessionSync';
import { signIn, type UserInfoResponse } from '@/api/auth';
import { notifySuccess } from '@/utils/notify';

/** Khi session bị thu hồi trên BE (logout web/game), /auth/me trả 401. */
const POLL_MS = 5000;
const REFRESH_ENDPOINT = '/auth/refresh-token';

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

    const uid = portalUser?.userId || portalUser?.id;
    if (uid) {
      sessionSync.startListening(String(uid));
    }

    sessionSync.setSyncCallback(async (data) => {
      // 1. Handle Logout Signal
      // Chỉ coi là logout signal khi offline đến từ platform KHÁC (game).
      // Nếu offline có platform là 'portal' (hoặc chính mình vừa ghi) thì
      // đó là echo/retained state của chính portal → bỏ qua để tránh tự
      // đá ngược về /login ngay khi vừa đăng nhập xong, đặc biệt với
      // SYNC_MODE='websocket' nơi server có thể echo retained offline khi
      // client subscribe.
      if (data.status === 'offline') {
        const fromPlatform = String(data.platform ?? '');
        if (fromPlatform === 'portal') return;
        if (isAuthenticated) {
          console.log('[SessionSync] Logout signal received from', fromPlatform || 'unknown', '→ logging out portal...');
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
            notifySuccess('Đồng bộ thành công', 'Đăng nhập từ Game đã được đồng bộ.');
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
          // Access token có thể đã hết hạn: thử refresh trước, chỉ logout nếu refresh fail.
          try {
            const refreshRes = await fetch(`${base}${REFRESH_ENDPOINT}`, {
              method: 'POST',
              credentials: 'include',
            });
            if (refreshRes.ok) {
              const data = (await refreshRes.json()) as { accessToken?: string };
              if (data.accessToken) {
                const { useAuthStore } = await import('@/stores/auth-store');
                useAuthStore.getState().setToken(data.accessToken, '');
                patchPortalGameHandoffAccessToken(data.accessToken);
                return;
              }
            }
          } catch {
            // fallback logout phía dưới
          }
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
