import { SYNC_MODE } from '@/utils/const';
import { broadcastChannelSync } from './broadcastChannelSync';
import { firebaseSync } from './firebaseSync';
import { websocketSync } from './websocketSync';

export type { FirebaseBroadcastData, FirebaseSessionData } from './firebaseSync';
export { FIREBASE_PLATFORM_GAME, FIREBASE_PLATFORM_PORTAL } from './firebaseSync';

/**
 * Facade chọn backend đồng bộ phiên dựa vào NEXT_PUBLIC_SYNC_MODE.
 * Cả ba backend cùng một interface công khai.
 */
export const sessionSync =
  SYNC_MODE === 'firebase' ? firebaseSync : SYNC_MODE === 'websocket' ? websocketSync : broadcastChannelSync;

export const CURRENT_SYNC_MODE = SYNC_MODE;
