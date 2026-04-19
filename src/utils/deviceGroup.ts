/** Khớp với Cocos `DeviceGroup` (game). */
export const DEVICE_GROUP_ID_KEY = 'TUTIEN_DEVICE_GROUP_ID';

function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fallback below
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** Đọc deviceGroupId; trả về null nếu chưa có hoặc không chạy browser. */
export function getDeviceGroupId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(DEVICE_GROUP_ID_KEY);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

/** Đọc hoặc sinh mới deviceGroupId (portal là nguồn truth, an toàn auto-sinh). */
export function getOrCreateDeviceGroupId(): string {
  const existing = getDeviceGroupId();
  if (existing) return existing;
  const id = randomId();
  try {
    window.localStorage.setItem(DEVICE_GROUP_ID_KEY, id);
  } catch {
    // ignore quota / private mode; vẫn trả id để caller dùng trong phiên
  }
  return id;
}

/** Override id (dùng khi sync từ nơi khác hoặc test). */
export function setDeviceGroupId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    window.localStorage.setItem(DEVICE_GROUP_ID_KEY, id);
  } catch {
    // ignore
  }
}
