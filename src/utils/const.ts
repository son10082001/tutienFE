export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const GAME_LAUNCH_URL =
  process.env.NEXT_PUBLIC_GAME_URL || 'http://172.20.10.2:7456/web-mobile/web-mobile/index.html';

/**
 * Trên trang HTTPS, trình duyệt chặn `ws://` (Mixed Content).
 * Biến môi trường build thường vẫn là `ws://api...` — luôn nâng lên `wss://` khi `window` là HTTPS.
 */
function upgradeWsToWssIfHttpsPage(url: string): string {
  if (typeof window === 'undefined' || window.location?.protocol !== 'https:') {
    return url;
  }
  if (url.startsWith('ws:')) {
    return `wss:${url.slice(3)}`;
  }
  return url;
}

/**
 * URL WebSocket đồng bộ phiên (dùng khi SYNC_MODE === 'websocket').
 * Gọi tại lúc mở socket — tránh dùng một hằng `WS_URL` bake sẵn `ws://` khi deploy HTTPS.
 */
export function getSessionWsBaseUrl(): string {
  let base = (process.env.NEXT_PUBLIC_WS_URL ?? '').trim().replace(/\/$/, '');
  if (!base) {
    base =
      typeof window !== 'undefined' && window.location?.protocol === 'https:'
        ? 'wss://api.ngutienky.com/ws/session'
        : 'ws://localhost:4000/ws/session';
  }
  return upgradeWsToWssIfHttpsPage(base);
}

/** Giữ tương thích import cũ; khi mở socket nên dùng `getSessionWsBaseUrl()` để luôn đúng theo giao thức trang. */
export const WS_URL = getSessionWsBaseUrl();

/**
 * Chế độ đồng bộ phiên portal ↔ game.
 * - 'firebase': dùng Firebase Realtime Database (cross-device, cross-origin)
 * - 'broadcast-channel': dùng BroadcastChannel API (same-origin, same-browser cross-tab)
 * - 'websocket': dùng WebSocket broker in-memory của tutien-be
 */
export type SyncMode = 'firebase' | 'broadcast-channel' | 'websocket';
export const SYNC_MODE: SyncMode = (process.env.NEXT_PUBLIC_SYNC_MODE as SyncMode) || 'websocket';
