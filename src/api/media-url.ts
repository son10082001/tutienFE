import { API_URL } from '@/utils/const';

const API_BASE_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return 'https://api.ngutienky.com';
  }
})();

export function normalizeApiMediaUrl(rawUrl?: string | null): string | null {
  const value = rawUrl?.trim();
  if (!value) return null;

  if (value.startsWith('/')) {
    return `${API_BASE_ORIGIN}${value}`;
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return `${API_BASE_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch {
    return value;
  }
}
