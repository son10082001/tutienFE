export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const GAME_LAUNCH_URL =
  process.env.NEXT_PUBLIC_GAME_URL || 'http://172.20.10.2:7456/web-mobile/web-mobile/index.html';

/**
 * URL WebSocket đồng bộ phiên (dùng khi SYNC_MODE === 'websocket').
 * Trỏ tới endpoint `attachSessionSyncWs` gắn trên tutien-be.
 * Trang HTTPS không được gọi `ws://` tới host khác — Mixed Content; dùng WSS khi deploy HTTPS.
 */
function resolvePublicWsUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
    return 'wss://api.ngutienky.com/ws/session';
  }
  return 'ws://localhost:4000/ws/session';
}

export const WS_URL = resolvePublicWsUrl();

/**
 * Chế độ đồng bộ phiên portal ↔ game.
 * - 'firebase': dùng Firebase Realtime Database (cross-device, cross-origin)
 * - 'broadcast-channel': dùng BroadcastChannel API (same-origin, same-browser cross-tab)
 * - 'websocket': dùng WebSocket broker in-memory của tutien-be
 */
export type SyncMode = 'firebase' | 'broadcast-channel' | 'websocket';
export const SYNC_MODE: SyncMode = (process.env.NEXT_PUBLIC_SYNC_MODE as SyncMode) || 'websocket';
