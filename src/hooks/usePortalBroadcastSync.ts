'use client';

import { signIn, type UserInfoResponse } from '@/api/auth';
import { CURRENT_SYNC_MODE, FIREBASE_PLATFORM_PORTAL, sessionSync, type FirebaseBroadcastData } from '@/lib/sessionSync';
import { websocketSync } from '@/lib/websocketSync';
import { useAuthStore } from '@/stores/auth-store';
import { clearPortalGameHandoff, setPortalGameHandoff, savePortalGameLoginSession } from '@/utils/game-handoff';
import { getOrCreateDeviceGroupId } from '@/utils/deviceGroup';
import { API_URL } from '@/utils/const';
import { ROUTES } from '@/lib/routes';
import { useEffect, useRef } from 'react';
import { notifySuccess } from '@/utils/notify';

/**
 * Lắng nghe kênh broadcast Firebase ngay từ khi portal khởi động.
 * - Bỏ qua signal do chính portal phát.
 * - Nếu signal từ game với userId khác user hiện tại → auto-login portal.
 */
export function usePortalBroadcastSync(): void {
  const lastSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    getOrCreateDeviceGroupId();
    sessionSync.initEarly();

    // Khoá auto-login cross-origin ở SYNC_MODE='websocket': khi server
    // thông báo gid đã bị revoked (do FE hoặc game vừa logout), dọn sạch
    // local credentials và đưa về /login. Firebase mode không cần vì đã
    // có cơ chế retained session riêng và user xác nhận không bị lỗi này.
    if (CURRENT_SYNC_MODE === 'websocket') {
      websocketSync.setRevokedCallback((at, platform) => {
        console.log('[SessionSync] revoked signal received at', at, 'from', platform || 'unknown');
        clearPortalGameHandoff();
        const { isAuthenticated, logout } = useAuthStore.getState();
        if (isAuthenticated) {
          logout();
        }
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith(ROUTES.LOGIN)) {
          window.location.href = ROUTES.LOGIN;
        }
      });
    }

    sessionSync.listenBroadcast(async (data: FirebaseBroadcastData | null) => {
      if (!data || !data.userId) return;
      if (String(data.platform ?? '') === FIREBASE_PLATFORM_PORTAL) return;
      if (data.sessionId && data.sessionId === lastSessionIdRef.current) return;
      lastSessionIdRef.current = data.sessionId || null;

      const state = useAuthStore.getState();
      const currentUserId =
        state.user?.userId != null ? String(state.user.userId) : state.user?.id != null ? String(state.user.id) : '';
      if (currentUserId === String(data.userId)) return;

      try {
        console.log('[FirebaseSync] broadcast login from game → syncing to portal');
        const loginData = await signIn({
          userId: String(data.userId),
          password: String(data.password ?? ''),
        });

        setPortalGameHandoff(
          String(data.userId),
          String(data.password ?? ''),
          loginData.accessToken,
          API_URL,
        );
        savePortalGameLoginSession(String(data.userId), String(data.password ?? ''));

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
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 300);
      } catch (err) {
        console.error('[FirebaseSync] auto-login from broadcast failed', err);
      }
    });

    return () => {
      sessionSync.stopBroadcastListen();
    };
  }, []);
}
