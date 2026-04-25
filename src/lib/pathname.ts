import { AUTH_ROUTES, PUBLIC_ROUTE_PREFIXES, PUBLIC_ROUTES } from '@/lib/routes';

/** Bỏ / cuối (trừ /) để so khớp với danh sách route cố định. */
export function normalizePathname(p: string): string {
  if (p.length > 1 && p.endsWith('/')) {
    return p.slice(0, -1);
  }
  return p;
}

export function isAuthRoutePath(pathname: string): boolean {
  return (AUTH_ROUTES as readonly string[]).includes(normalizePathname(pathname));
}

export function isPublicRoutePath(pathname: string): boolean {
  const p = normalizePathname(pathname);
  if ((PUBLIC_ROUTES as readonly string[]).includes(p)) {
    return true;
  }
  return (PUBLIC_ROUTE_PREFIXES as readonly string[]).some((prefix) => p.startsWith(prefix));
}

/** Trang auth + trang public: không ép redirect /login khi 401/refresh hỏng. */
export function isAuthOrPublicRoutePath(pathname: string): boolean {
  return isAuthRoutePath(pathname) || isPublicRoutePath(pathname);
}
