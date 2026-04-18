'use client';

import { signIn, type UserInfoResponse } from '@/api/auth';
import { FIREBASE_PLATFORM_PORTAL, firebaseSync, type FirebaseBroadcastData } from '@/lib/firebaseSync';
import { useAuthStore } from '@/stores/auth-store';
import { setPortalGameHandoff, savePortalGameLoginSession } from '@/utils/game-handoff';
import { API_URL } from '@/utils/const';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Lắng nghe kênh broadcast Firebase ngay từ khi portal khởi động.
 * - Bỏ qua signal do chính portal phát.
 * - Nếu signal từ game với userId khác user hiện tại → auto-login portal.
 */
export function usePortalBroadcastSync(): void {
  const lastSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    firebaseSync.initEarly();

    firebaseSync.listenBroadcast(async (data: FirebaseBroadcastData | null) => {
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
        toast.success('Đồng bộ đăng nhập từ Game thành công.');
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
      firebaseSync.stopBroadcastListen();
    };
  }, []);
}
