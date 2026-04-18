/**
 * Giữ tham chiếu tab game để gửi postMessage khi đăng xuất web.
 * - Không dùng `noopener` trên window.open: nhiều trình duyệt trả về `null` → không postMessage được.
 * - Dùng targetOrigin '*' vì URL env có thể khác origin thực tế của tab game (preview / CDN).
 */

const gameWindows: Window[] = [];

export function registerPortalGameWindow(win: Window | null | undefined): void {
  if (!win || typeof win.postMessage !== 'function') return;
  gameWindows.push(win);
}

/** Gửi tín hiệu đăng xuất tới mọi tab game đã mở từ portal trong phiên này. */
export function notifyPortalGameWindowsLogout(): void {
  if (typeof window === 'undefined') return;
  const msg = { type: 'TUTIEN_PORTAL_LOGOUT' as const };
  for (let i = gameWindows.length - 1; i >= 0; i--) {
    const w = gameWindows[i];
    if (!w || w.closed) {
      gameWindows.splice(i, 1);
      continue;
    }
    try {
      w.postMessage(msg, '*');
    } catch {
      gameWindows.splice(i, 1);
    }
  }
}

/** Đồng bộ đăng nhập tới tab game đã mở (khớp `PortalAuthBridge` Cocos). */
export function notifyPortalGameWindowsLogin(params: {
  userId: string;
  password: string;
  accessToken: string;
  apiBaseUrl: string;
}): void {
  if (typeof window === 'undefined') return;
  const { userId, password, accessToken, apiBaseUrl } = params;
  const msg = {
    type: 'TUTIEN_PORTAL_AUTH' as const,
    userId,
    password,
    accessToken,
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  };
  for (let i = gameWindows.length - 1; i >= 0; i--) {
    const w = gameWindows[i];
    if (!w || w.closed) {
      gameWindows.splice(i, 1);
      continue;
    }
    try {
      w.postMessage(msg, '*');
    } catch {
      gameWindows.splice(i, 1);
    }
  }
}
