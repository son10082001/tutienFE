import type { FirebaseBroadcastData, FirebaseSessionData } from './firebaseSync';
import { getOrCreateDeviceGroupId } from '@/utils/deviceGroup';
import { WS_URL } from '@/utils/const';

export const FIREBASE_PLATFORM_PORTAL = 'portal';
export const FIREBASE_PLATFORM_GAME = 'game';

/**
 * Adapter dùng WebSocket broker của tutien-be để đồng bộ phiên portal ↔ game.
 *
 * Expose cùng bộ API công khai với `firebaseSync` / `broadcastChannelSync`
 * để có thể swap qua `sessionSync` facade mà consumer (hook) không cần đổi.
 *
 * Đặc điểm:
 * - Kết nối lazy: chỉ mở WebSocket khi có call đầu tiên (reportLogin/startListening/...)
 * - Queue outbound khi readyState !== OPEN, flush khi onopen.
 * - Reconnect backoff 1s → tối đa 30s; subscribe lại userId đang theo dõi sau reconnect.
 */

type OutboundMsg =
  | { type: 'subscribe'; userId?: string }
  | { type: 'unsubscribe' }
  | { type: 'report_login'; userId: string; password: string; platform: string }
  | { type: 'report_logout'; userId: string; platform: string }
  | { type: 'report_broadcast'; userId: string; password: string; platform: string }
  | { type: 'clear_broadcast' }
  | { type: 'ping' };

type InboundMsg =
  | { type: 'session'; userId: string; data: FirebaseSessionData | null }
  | { type: 'broadcast'; data: FirebaseBroadcastData | null }
  | { type: 'revoked'; at: number; platform?: string }
  | { type: 'pong' }
  | { type: 'error'; message: string }
  | {
      type: 'deposit_status';
      userId: string;
      depositId: string;
      status: string;
      note: string;
      amount: number;
    };

const MIN_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

class WebSocketSyncService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private syncCallback: ((data: FirebaseSessionData) => void) | null = null;
  private broadcastCallback: ((data: FirebaseBroadcastData | null) => void) | null = null;
  private revokedCallback: ((at: number, platform?: string) => void) | null = null;
  private lastRevokedAt: number | null = null;
  private depositStatusCallback:
    | ((p: { depositId: string; status: string; note: string; amount: number }) => void)
    | null = null;

  private outbound: OutboundMsg[] = [];
  private backoffMs: number = MIN_BACKOFF_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manualClose = false;

  public initEarly(): void {
    if (typeof window === 'undefined') return;
    this.ensureConnection();
  }

  private buildUrl(): string | null {
    try {
      const gid = getOrCreateDeviceGroupId();
      if (!gid) return null;
      const sep = WS_URL.includes('?') ? '&' : '?';
      return `${WS_URL}${sep}gid=${encodeURIComponent(gid)}`;
    } catch {
      return null;
    }
  }

  private ensureConnection(): void {
    if (typeof window === 'undefined') return;
    if (this.ws) {
      const rs = this.ws.readyState;
      if (rs === WebSocket.OPEN || rs === WebSocket.CONNECTING) return;
    }
    const url = this.buildUrl();
    if (!url) return;

    this.manualClose = false;
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      console.warn('[WebSocketSync] open failed', e);
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.backoffMs = MIN_BACKOFF_MS;
      this.send({ type: 'subscribe', userId: this.userId ?? undefined });
      const queued = this.outbound;
      this.outbound = [];
      for (const msg of queued) this.send(msg);
    };

    ws.onmessage = (ev: MessageEvent) => {
      let msg: InboundMsg;
      try {
        msg = JSON.parse(String(ev.data)) as InboundMsg;
      } catch {
        return;
      }
      this.dispatch(msg);
    };

    ws.onerror = () => {
      // onclose sẽ xử lý reconnect
    };

    ws.onclose = () => {
      this.ws = null;
      if (this.manualClose) return;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    const delay = this.backoffMs;
    this.backoffMs = Math.min(MAX_BACKOFF_MS, this.backoffMs * 2);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureConnection();
    }, delay);
  }

  private send(msg: OutboundMsg): void {
    this.ensureConnection();
    const ws = this.ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(msg));
        return;
      } catch (e) {
        console.warn('[WebSocketSync] send failed', e);
      }
    }
    this.outbound.push(msg);
  }

  private dispatch(msg: InboundMsg): void {
    if (msg.type === 'session') {
      if (this.userId && msg.userId !== this.userId) return;
      if (this.syncCallback && msg.data) {
        this.syncCallback(msg.data);
      }
    } else if (msg.type === 'broadcast') {
      if (this.broadcastCallback) {
        this.broadcastCallback(msg.data);
      }
    } else if (msg.type === 'revoked') {
      // Dedupe theo `at` để không trigger nhiều lần khi server resend (ví
      // dụ vừa fanout revoked rồi client reconnect lại sẽ nhận retained
      // revoked nữa trong lúc subscribe).
      const at = typeof msg.at === 'number' ? msg.at : 0;
      if (this.lastRevokedAt != null && at <= this.lastRevokedAt) return;
      this.lastRevokedAt = at;
      if (this.revokedCallback) {
        try {
          this.revokedCallback(at, msg.platform);
        } catch (e) {
          console.warn('[WebSocketSync] revokedCallback threw', e);
        }
      }
    } else if (msg.type === 'deposit_status') {
      if (!this.userId || String(msg.userId) !== String(this.userId)) return;
      if (this.depositStatusCallback) {
        try {
          this.depositStatusCallback({
            depositId: msg.depositId,
            status: msg.status,
            note: msg.note,
            amount: msg.amount,
          });
        } catch (e) {
          console.warn('[WebSocketSync] depositStatusCallback threw', e);
        }
      }
    }
  }

  public reportLogin(userId: string, password: string): void {
    this.userId = userId;
    this.ensureConnection();
    // Gửi report_login TRƯỚC để server cập nhật state.sessions[uid] thành
    // online; sau đó mới subscribe. Nếu đảo thứ tự (subscribe trước), server
    // sẽ echo retained session snapshot (có thể là `offline` từ phiên cũ)
    // về ngay cho chính client này và khiến `usePortalSessionSync` tưởng
    // game vừa logout → redirect về màn login.
    this.send({
      type: 'report_login',
      userId,
      password,
      platform: FIREBASE_PLATFORM_PORTAL,
    });
    this.send({ type: 'subscribe', userId });
  }

  public reportLogout(): void {
    if (!this.userId) {
      this.send({ type: 'clear_broadcast' });
      return;
    }
    const uid = this.userId;
    this.send({ type: 'report_logout', userId: uid, platform: FIREBASE_PLATFORM_PORTAL });
    this.userId = null;
  }

  public startListening(userId: string): void {
    this.userId = userId;
    this.ensureConnection();
    this.send({ type: 'subscribe', userId });
  }

  public setSyncCallback(callback: (data: FirebaseSessionData) => void): void {
    this.syncCallback = callback;
  }

  public setRevokedCallback(callback: (at: number, platform?: string) => void): void {
    this.revokedCallback = callback;
  }

  public setDepositStatusCallback(
    callback:
      | ((p: { depositId: string; status: string; note: string; amount: number }) => void)
      | null
  ): void {
    this.depositStatusCallback = callback;
  }

  public reportBroadcast(userId: string, password: string, platform: string): void {
    this.ensureConnection();
    this.send({ type: 'report_broadcast', userId, password, platform });
  }

  public clearBroadcast(): void {
    this.send({ type: 'clear_broadcast' });
  }

  public listenBroadcast(callback: (data: FirebaseBroadcastData | null) => void): void {
    this.broadcastCallback = callback;
    this.ensureConnection();
    this.send({ type: 'subscribe', userId: this.userId ?? undefined });
  }

  public stopBroadcastListen(): void {
    this.broadcastCallback = null;
  }
}

export const websocketSync = new WebSocketSyncService();
