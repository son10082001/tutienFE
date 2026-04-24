import type { FirebaseBroadcastData, FirebaseSessionData } from './firebaseSync';
import { getOrCreateDeviceGroupId } from '@/utils/deviceGroup';

export const FIREBASE_PLATFORM_PORTAL = 'portal';
export const FIREBASE_PLATFORM_GAME = 'game';

const CHANNEL_NAME_PREFIX = 'tutien_session_bus';
const LS_LATEST_KEY_PREFIX = 'tutien_bc_latest_login';
const LS_SESSION_KEY_PREFIX = 'tutien_bc_session';

function getGid(): string {
  return getOrCreateDeviceGroupId();
}

function channelName(): string {
  return `${CHANNEL_NAME_PREFIX}:${getGid()}`;
}

function latestKey(): string {
  return `${LS_LATEST_KEY_PREFIX}:${getGid()}`;
}

function sessionKey(userId: string): string {
  return `${LS_SESSION_KEY_PREFIX}:${getGid()}:${userId}`;
}

type BusMsg =
  | {
      kind: 'login';
      userId: string;
      password: string;
      platform: string;
      sessionId: string;
      timestamp: number;
    }
  | {
      kind: 'logout';
      userId: string;
      platform: string;
      sessionId: string;
      timestamp: number;
    };

function safeLS(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function makeSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Đồng bộ phiên portal ↔ game qua BroadcastChannel (same-origin cross-tab).
 * Kèm localStorage để client mở sau vẫn thấy state hiện tại (tương tự Firebase retained).
 */
class BroadcastChannelSyncService {
  private channel: BroadcastChannel | null = null;
  private userId: string | null = null;
  private syncCallback: ((data: FirebaseSessionData) => void) | null = null;
  private broadcastCallback: ((data: FirebaseBroadcastData | null) => void) | null = null;

  public initEarly(): void {
    if (this.channel) return;
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    try {
      this.channel = new BroadcastChannel(channelName());
      this.channel.onmessage = (ev: MessageEvent<BusMsg>) => {
        this.dispatch(ev.data);
      };
    } catch (e) {
      console.warn('[BroadcastChannelSync] init failed', e);
    }
  }

  private post(msg: BusMsg): void {
    this.initEarly();
    try {
      this.channel?.postMessage(msg);
    } catch (e) {
      console.warn('[BroadcastChannelSync] postMessage failed', e);
    }
  }

  private writeLatest(msg: BusMsg | null): void {
    const ls = safeLS();
    if (!ls) return;
    try {
      if (msg) {
        ls.setItem(latestKey(), JSON.stringify(msg));
      } else {
        ls.removeItem(latestKey());
      }
    } catch {
      // ignore
    }
  }

  private readLatest(): BusMsg | null {
    const ls = safeLS();
    if (!ls) return null;
    try {
      const raw = ls.getItem(latestKey());
      return raw ? (JSON.parse(raw) as BusMsg) : null;
    } catch {
      return null;
    }
  }

  private writeSession(userId: string, data: FirebaseSessionData | null): void {
    const ls = safeLS();
    if (!ls) return;
    try {
      if (data) {
        ls.setItem(sessionKey(userId), JSON.stringify(data));
      } else {
        ls.removeItem(sessionKey(userId));
      }
    } catch {
      // ignore
    }
  }

  private readSession(userId: string): FirebaseSessionData | null {
    const ls = safeLS();
    if (!ls) return null;
    try {
      const raw = ls.getItem(sessionKey(userId));
      return raw ? (JSON.parse(raw) as FirebaseSessionData) : null;
    } catch {
      return null;
    }
  }

  private dispatch(msg: BusMsg | null): void {
    if (!msg) return;
    if (msg.kind === 'login') {
      const sessionData: FirebaseSessionData = {
        status: 'online',
        platform: msg.platform,
        timestamp: msg.timestamp,
        credentials: { userId: msg.userId, password: msg.password },
      };
      this.writeSession(msg.userId, sessionData);
      if (this.syncCallback && this.userId && this.userId === msg.userId) {
        this.syncCallback(sessionData);
      }
      const bdata: FirebaseBroadcastData = {
        userId: msg.userId,
        password: msg.password,
        platform: msg.platform,
        timestamp: msg.timestamp,
        sessionId: msg.sessionId,
      };
      if (this.broadcastCallback) this.broadcastCallback(bdata);
    } else if (msg.kind === 'logout') {
      const sessionData: FirebaseSessionData = {
        status: 'offline',
        platform: msg.platform,
        timestamp: msg.timestamp,
      };
      this.writeSession(msg.userId, sessionData);
      if (this.syncCallback && this.userId && this.userId === msg.userId) {
        this.syncCallback(sessionData);
      }
      if (this.broadcastCallback) this.broadcastCallback(null);
    }
  }

  public reportLogin(userId: string, password: string): void {
    this.initEarly();
    this.userId = userId;
    const msg: BusMsg = {
      kind: 'login',
      userId,
      password,
      platform: FIREBASE_PLATFORM_PORTAL,
      sessionId: makeSessionId(),
      timestamp: Date.now(),
    };
    this.writeLatest(msg);
    this.writeSession(userId, {
      status: 'online',
      platform: FIREBASE_PLATFORM_PORTAL,
      timestamp: msg.timestamp,
      credentials: { userId, password },
    });
    this.post(msg);
  }

  public reportLogout(): void {
    this.initEarly();
    if (!this.userId) {
      this.writeLatest(null);
      return;
    }
    const uid = this.userId;
    const msg: BusMsg = {
      kind: 'logout',
      userId: uid,
      platform: FIREBASE_PLATFORM_PORTAL,
      sessionId: makeSessionId(),
      timestamp: Date.now(),
    };
    this.writeLatest(null);
    this.writeSession(uid, { status: 'offline', timestamp: msg.timestamp });
    this.post(msg);
    this.userId = null;
  }

  public startListening(userId: string): void {
    this.initEarly();
    this.userId = userId;
    const existing = this.readSession(userId);
    if (existing && this.syncCallback) {
      Promise.resolve().then(() => {
        if (this.syncCallback && existing) this.syncCallback(existing);
      });
    }
  }

  public setSyncCallback(callback: (data: FirebaseSessionData) => void): void {
    this.syncCallback = callback;
  }

  public reportBroadcast(userId: string, password: string, platform: string): void {
    this.initEarly();
    const msg: BusMsg = {
      kind: 'login',
      userId,
      password,
      platform,
      sessionId: makeSessionId(),
      timestamp: Date.now(),
    };
    this.writeLatest(msg);
    this.post(msg);
  }

  public clearBroadcast(): void {
    this.writeLatest(null);
  }

  public listenBroadcast(callback: (data: FirebaseBroadcastData | null) => void): void {
    this.initEarly();
    this.broadcastCallback = callback;
    const latest = this.readLatest();
    if (latest && latest.kind === 'login' && callback) {
      Promise.resolve().then(() => {
        callback({
          userId: latest.userId,
          password: latest.password,
          platform: latest.platform,
          timestamp: latest.timestamp,
          sessionId: latest.sessionId,
        });
      });
    }
  }

  public stopBroadcastListen(): void {
    this.broadcastCallback = null;
  }

  /** Chỉ WebSocket broker hỗ trợ — để API đồng bộ với `websocketSync`. */
  public setDepositStatusCallback(
    _callback:
      | ((p: { depositId: string; status: string; note: string; amount: number }) => void)
      | null
  ): void {
    void _callback;
  }
}

export const broadcastChannelSync = new BroadcastChannelSyncService();
