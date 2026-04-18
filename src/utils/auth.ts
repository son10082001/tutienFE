export const COOKIE_KEY = 'web-auth-storage';

/**
 * Get cookie value by name
 */
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    if (!cookieValue) return null;
    try {
      // Decode URL-encoded cookie value
      return decodeURIComponent(cookieValue);
    } catch {
      // If decode fails, return original value
      return cookieValue;
    }
  }
  return null;
};

/**
 * Set cookie value with URL encoding to handle special characters
 */
const setCookie = (name: string, value: string, days: number = 1): void => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // URL encode the value to handle special characters and prevent truncation issues
  const encodedValue = encodeURIComponent(value);
  // Use Secure flag only in production (HTTPS)
  const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodedValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
};

/**
 * Remove cookie
 */
const removeCookie = (name: string): void => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

export const removeAuthStorage = (): void => {
  removeCookie(COOKIE_KEY);
};

/**
 * Get access token from auth-storage cookie
 * @returns The access token string or null if not found/invalid
 */
export const getAccessToken = (): string | null => {
  try {
    const authStorage = getCookie(COOKIE_KEY);
    if (!authStorage) return null;

    // getCookie already handles URL decoding
    const parsed = JSON.parse(authStorage);
    return parsed.state?.access_token || null;
  } catch (error) {
    console.error('Error parsing auth storage:', error);
    // Clear corrupted cookie
    removeAuthStorage();
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    const authStorage = getCookie(COOKIE_KEY);
    if (!authStorage) return null;

    // getCookie already handles URL decoding
    const parsed = JSON.parse(authStorage);
    return parsed.state?.refresh_token || null;
  } catch (error) {
    console.error('Error parsing auth storage:', error);
    // Clear corrupted cookie
    removeAuthStorage();
    return null;
  }
};

/**
 * Cookie storage adapter for Zustand persist middleware
 * This allows Zustand to use cookies as the storage mechanism
 */
export const cookieStorage = {
  getItem: (name: string): string | null => {
    return getCookie(name);
  },
  setItem: (name: string, value: string): void => {
    setCookie(name, value, 7); // 7 days expiry
  },
  removeItem: (name: string): void => {
    removeCookie(name);
  },
};
