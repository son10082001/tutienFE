import { getOrCreateDeviceGroupId } from '@/utils/deviceGroup';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, onValue, ref, serverTimestamp, set, type Database, type Unsubscribe } from 'firebase/database';
import { firebaseConfig } from '../config/firebase';

const BROADCAST_PATH_SUFFIX = 'broadcast/latest_login';
export const FIREBASE_PLATFORM_PORTAL = 'portal';
export const FIREBASE_PLATFORM_GAME = 'game';

/** Portal là nguồn truth của deviceGroupId — luôn có thể sinh mới nếu cần. */
function getGid(): string {
  return getOrCreateDeviceGroupId();
}

function sessionPath(userId: string): string {
  return `groups/${getGid()}/sessions/${userId}`;
}

function broadcastPath(): string {
  return `groups/${getGid()}/${BROADCAST_PATH_SUFFIX}`;
}

export type FirebaseSessionData = {
  status?: string;
  platform?: string;
  timestamp?: number;
  credentials?: {
    userId?: string;
    password?: string;
  };
};

export type FirebaseBroadcastData = {
  userId?: string;
  password?: string;
  platform?: string;
  timestamp?: number;
  sessionId?: string;
};

/**
 * Firebase Realtime Synchronization Service for Web Portal.
 *
 * - `sessions/{userId}`: per-user session sync (portal ↔ game với cùng userId)
 * - `broadcast/latest_login`: kênh chung để client chưa login pickup được signal cross-platform
 */
class FirebaseSyncService {
  private app: FirebaseApp;
  private db: Database;
  private userId: string | null = null;
  private syncCallback: ((data: FirebaseSessionData) => void) | null = null;
  private sessionUnsub: Unsubscribe | null = null;
  private broadcastCallback: ((data: FirebaseBroadcastData | null) => void) | null = null;
  private broadcastUnsub: Unsubscribe | null = null;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
  }

  /** Init sớm (constructor đã init) — placeholder để đồng bộ API với game. */
  public initEarly(): void {
    // no-op: constructor đã init database
  }

  public reportLogin(userId: string, password: string) {
    this.userId = userId;
    const sessionRef = ref(this.db, sessionPath(userId));
    set(sessionRef, {
      status: 'online',
      platform: FIREBASE_PLATFORM_PORTAL,
      timestamp: serverTimestamp(),
      credentials: {
        userId: userId,
        password: password,
      },
    });
    this.reportBroadcast(userId, password, FIREBASE_PLATFORM_PORTAL);
    this.startListening(userId);
  }

  public reportLogout() {
    this.clearBroadcast();
    if (!this.userId) return;
    const sessionRef = ref(this.db, sessionPath(this.userId));
    set(sessionRef, {
      status: 'offline',
      timestamp: serverTimestamp(),
    });
    this.userId = null;
    if (this.sessionUnsub) {
      this.sessionUnsub();
      this.sessionUnsub = null;
    }
  }

  public startListening(userId: string) {
    this.userId = userId;
    if (this.sessionUnsub) {
      this.sessionUnsub();
      this.sessionUnsub = null;
    }
    const sessionRef = ref(this.db, sessionPath(userId));
    this.sessionUnsub = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val() as FirebaseSessionData | null;
      if (this.syncCallback && data) {
        this.syncCallback(data);
      }
    });
  }

  public setSyncCallback(callback: (data: FirebaseSessionData) => void) {
    this.syncCallback = callback;
  }

  /** Ghi broadcast (portal login) để game chưa login có thể pickup. */
  public reportBroadcast(userId: string, password: string, platform: string): void {
    try {
      const broadcastRef = ref(this.db, broadcastPath());
      set(broadcastRef, {
        userId,
        password,
        platform,
        timestamp: serverTimestamp(),
        sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
    } catch (e) {
      console.warn('[FirebaseSync] reportBroadcast failed', e);
    }
  }

  public clearBroadcast(): void {
    try {
      const broadcastRef = ref(this.db, broadcastPath());
      set(broadcastRef, null);
    } catch (e) {
      console.warn('[FirebaseSync] clearBroadcast failed', e);
    }
  }

  /** Listen broadcast từ startup (kể cả khi chưa login). */
  public listenBroadcast(callback: (data: FirebaseBroadcastData | null) => void): void {
    this.broadcastCallback = callback;
    if (this.broadcastUnsub) {
      this.broadcastUnsub();
      this.broadcastUnsub = null;
    }
    const broadcastRef = ref(this.db, broadcastPath());
    this.broadcastUnsub = onValue(broadcastRef, (snapshot) => {
      const data = snapshot.val() as FirebaseBroadcastData | null;
      if (this.broadcastCallback) {
        this.broadcastCallback(data);
      }
    });
  }

  public stopBroadcastListen(): void {
    if (this.broadcastUnsub) {
      this.broadcastUnsub();
      this.broadcastUnsub = null;
    }
    this.broadcastCallback = null;
  }
}

// export const firebaseSync = new FirebaseSyncService();
export const firebaseSync = null as any;
