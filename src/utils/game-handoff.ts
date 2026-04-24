import { getOrCreateDeviceGroupId } from './deviceGroup';

/** Khớp với Cocos `PortalAuthBridge` / `LocaleUser` (game). */
export const PORTAL_GAME_HANDOFF_KEY = 'TUTIEN_PORTAL_HANDOFF';

const PORTAL_GAME_LOGIN_SESSION_KEY = 'tutien_portal_game_login';

export type PortalGameHandoffPayload = {
  userId: string;
  password: string;
  accessToken: string;
  apiBaseUrl: string;
  deviceGroupId: string;
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

/**
 * Mã tài khoản game dùng cho handoff (khớp lúc đăng nhập form).
 * Không ưu tiên `user.id` trước session/handoff — `id` thường là ID nội bộ, lệch với userId đã lưu handoff (dễ lỗi trên mobile khi store thiếu userId).
 */
export function resolvePortalGameAccountId(
  user: { userId?: string | number | null; id?: string | number | null } | null | undefined,
  accessToken: string | null
): string | undefined {
  if (user?.userId != null && String(user.userId).trim() !== '') {
    return String(user.userId);
  }
  const h = readPortalGameHandoff();
  if (h?.userId && accessToken && h.accessToken === accessToken) {
    return String(h.userId);
  }
  const sess = readPortalLoginSession();
  if (sess?.userId) {
    return String(sess.userId);
  }
  if (user?.id != null) return String(user.id);
  return undefined;
}

export function readPortalGameHandoff(): PortalGameHandoffPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PORTAL_GAME_HANDOFF_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<PortalGameHandoffPayload>;
    if (o.userId && o.password && o.accessToken && o.apiBaseUrl) {
      const deviceGroupId =
        o.deviceGroupId && typeof o.deviceGroupId === 'string' && o.deviceGroupId.length > 0
          ? o.deviceGroupId
          : getOrCreateDeviceGroupId();
      return {
        userId: String(o.userId),
        password: String(o.password),
        accessToken: String(o.accessToken),
        apiBaseUrl: String(o.apiBaseUrl).replace(/\/$/, ''),
        deviceGroupId,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function setPortalGameHandoff(
  userId: string,
  password: string,
  accessToken: string,
  apiBaseUrl: string,
  deviceGroupId?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const gid = deviceGroupId && deviceGroupId.length > 0 ? deviceGroupId : getOrCreateDeviceGroupId();
    const payload: PortalGameHandoffPayload = {
      userId,
      password,
      accessToken,
      apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
      deviceGroupId: gid,
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
  setPortalGameHandoff(cur.userId, cur.password, accessToken, cur.apiBaseUrl, cur.deviceGroupId);
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
  const gid = getOrCreateDeviceGroupId();
  const existing = readPortalGameHandoff();
  // Cùng JWT với handoff đã lưu → cùng phiên (tránh lệch so sánh khi UI chỉ có `id` mà không có `userId`).
  if (existing?.password) {
    const sameToken = existing.accessToken === accessToken;
    const samePortalUser =
      portalUserId != null && String(existing.userId) === String(portalUserId);
    if (sameToken || samePortalUser) {
      if (
        existing.accessToken !== accessToken ||
        existing.apiBaseUrl !== base ||
        existing.deviceGroupId !== gid
      ) {
        setPortalGameHandoff(existing.userId, existing.password, accessToken, base, gid);
      }
      return true;
    }
  }
  const sess = readPortalLoginSession();
  if (sess && sess.userId === portalUserId && sess.password) {
    setPortalGameHandoff(sess.userId, sess.password, accessToken, base, gid);
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

/** Base64url cho fragment URL (game decode bằng atob + decodeURIComponent). Chỉ userId/password + deviceGroupId để URL không quá dài; JWT nằm trong localStorage handoff (cùng origin). */
export function encodeGameHandoffPayload(userId: string, password: string, deviceGroupId?: string): string {
  const gid = deviceGroupId && deviceGroupId.length > 0 ? deviceGroupId : getOrCreateDeviceGroupId();
  const json = JSON.stringify({ userId, password, deviceGroupId: gid });
  return btoa(encodeURIComponent(json)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function buildGameLaunchUrlWithHandoff(
  baseUrl: string,
  userId: string,
  password: string,
  deviceGroupId?: string
): string {
  const url = baseUrl.replace(/\/$/, '');
  const gid = deviceGroupId && deviceGroupId.length > 0 ? deviceGroupId : getOrCreateDeviceGroupId();
  const token = encodeGameHandoffPayload(userId, password, gid);
  return `${url}#tutien_handoff=${token}`;
}
