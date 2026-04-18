/** Khớp với Cocos `PortalAuthBridge` / `LocaleUser` (game). */
export const PORTAL_GAME_HANDOFF_KEY = 'TUTIEN_PORTAL_HANDOFF';

const PORTAL_GAME_LOGIN_SESSION_KEY = 'tutien_portal_game_login';

export type PortalGameHandoffPayload = {
  userId: string;
  password: string;
  accessToken: string;
  apiBaseUrl: string;
};

function readPortalLoginSession(): { userId: string; password: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PORTAL_GAME_LOGIN_SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { userId?: string; password?: string };
    if (o.userId && o.password) {
      return { userId: String(o.userId), password: String(o.password) };
    }
  } catch {
    // ignore
  }
  return null;
}

/** Lưu song song với handoff: tab mới không có sessionStorage, vẫn còn localStorage handoff. */
export function savePortalGameLoginSession(userId: string, password: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(PORTAL_GAME_LOGIN_SESSION_KEY, JSON.stringify({ userId, password }));
  } catch {
    // ignore
  }
}

export function readPortalGameHandoff(): PortalGameHandoffPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PORTAL_GAME_HANDOFF_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<PortalGameHandoffPayload>;
    if (o.userId && o.password && o.accessToken && o.apiBaseUrl) {
      return {
        userId: String(o.userId),
        password: String(o.password),
        accessToken: String(o.accessToken),
        apiBaseUrl: String(o.apiBaseUrl).replace(/\/$/, ''),
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function setPortalGameHandoff(userId: string, password: string, accessToken: string, apiBaseUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: PortalGameHandoffPayload = {
      userId,
      password,
      accessToken,
      apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    };
    window.localStorage.setItem(PORTAL_GAME_HANDOFF_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

/** Khi access token đổi (refresh axios) mà vẫn cùng tài khoản — giữ userId/password, chỉ cập nhật JWT. */
export function patchPortalGameHandoffAccessToken(accessToken: string): void {
  const cur = readPortalGameHandoff();
  if (!cur) return;
  setPortalGameHandoff(cur.userId, cur.password, accessToken, cur.apiBaseUrl);
}

/**
 * Trước khi mở game: đảm bảo localStorage handoff đầy đủ (JWT mới + tài khoản game).
 * Dùng sessionStorage từ lần đăng nhập gần nhất nếu handoff local bị xóa nhưng cookie web vẫn còn.
 */
export function ensurePortalGameHandoffForLaunch(
  portalUserId: string | undefined,
  accessToken: string | null,
  apiBaseUrl: string
): boolean {
  if (typeof window === 'undefined' || !portalUserId || !accessToken) {
    return false;
  }
  const base = apiBaseUrl.replace(/\/$/, '');
  const existing = readPortalGameHandoff();
  if (existing?.userId === portalUserId && existing.password) {
    if (existing.accessToken !== accessToken || existing.apiBaseUrl !== base) {
      setPortalGameHandoff(existing.userId, existing.password, accessToken, base);
    }
    return true;
  }
  const sess = readPortalLoginSession();
  if (sess && sess.userId === portalUserId && sess.password) {
    setPortalGameHandoff(sess.userId, sess.password, accessToken, base);
    return true;
  }
  return false;
}

export function clearPortalGameHandoff(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PORTAL_GAME_HANDOFF_KEY);
  } catch {
    // ignore
  }
  try {
    window.sessionStorage.removeItem(PORTAL_GAME_LOGIN_SESSION_KEY);
  } catch {
    // ignore
  }
}

/** Base64url cho fragment URL (game decode bằng atob + decodeURIComponent). Chỉ userId/password để URL không quá dài; JWT nằm trong localStorage handoff (cùng origin). */
export function encodeGameHandoffPayload(userId: string, password: string): string {
  const json = JSON.stringify({ userId, password });
  return btoa(encodeURIComponent(json)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function buildGameLaunchUrlWithHandoff(baseUrl: string, userId: string, password: string): string {
  const url = baseUrl.replace(/\/$/, '');
  const token = encodeGameHandoffPayload(userId, password);
  return `${url}#tutien_handoff=${token}`;
}
