import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ROUTES } from './lib/routes';
import { COOKIE_KEY } from './utils/auth';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const forceLogin = request.nextUrl.searchParams.get('force') === '1';

  let isAuthenticated = false;
  let role: string | undefined;
  try {
    const authData = request.cookies.get(COOKIE_KEY);
    if (authData?.value) {
      let cookieValue = authData.value;
      try {
        cookieValue = decodeURIComponent(cookieValue);
      } catch {
      }
      const parsedData = JSON.parse(cookieValue);
      const state = parsedData?.state || {};
      isAuthenticated = state.isAuthenticated || false;
      role = state.user?.role;
    }
  } catch (error) {
    console.error('Error parsing auth cookie in middleware:', error);
    isAuthenticated = false;
  }

  const normalizedRole = (role || '').toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN';
  let permissions: string[] = [];
  let adminRole = '';
  try {
    const authData = request.cookies.get(COOKIE_KEY);
    if (authData?.value) {
      let cookieValue = authData.value;
      try {
        cookieValue = decodeURIComponent(cookieValue);
      } catch {
      }
      const parsedData = JSON.parse(cookieValue);
      const state = parsedData?.state || {};
      permissions = Array.isArray(state.user?.permissions) ? state.user.permissions : [];
      adminRole = String(state.user?.adminRole || '').toUpperCase();
    }
  } catch {
  }

  const publicPages = ['/', ROUTES.HOME, ROUTES.MARKET_PLACE, ROUTES.SUPPORT, ROUTES.NEWS];
  const isPublicPage = publicPages.includes(pathname);

  const authPages = [ROUTES.LOGIN, ROUTES.SIGN_UP, ROUTES.FORGOT_PASSWORD];
  const isAuthPage = authPages.includes(pathname);

  const isAdminPage = pathname.startsWith('/admin');
  const routePermissionMap: Record<string, string> = {
    '/admin/dashboard': 'dashboard.view',
    '/admin/users': 'users.view',
    '/admin/deposit': 'deposits.view',
    '/admin/deposit-promotion': 'promotions.manage',
    '/admin/shop': 'shop.manage',
    '/admin/gift-code': 'giftcode.manage',
    '/admin/news': 'news.manage',
    '/admin/admins': 'admins.manage',
    '/admin/support-channels': 'dashboard.view',
    '/admin/settings': 'settings.manage',
  };


  if (isAuthenticated && isAdmin && !isAdminPage && !isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
  }

  // 2. Đang ở trang auth mà đã login
  if (isAuthPage && isAuthenticated) {
    if (pathname === ROUTES.LOGIN && forceLogin) {
      return NextResponse.next();
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
    }
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  // 3. Public page → cho vào (chỉ user thường hoặc chưa login mới xuống đến đây)
  if (isPublicPage) {
    return NextResponse.next();
  }

  // 4. Chưa đăng nhập + không phải trang auth → redirect về login
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  // 5. User thường cố vào /admin → redirect về home
  if (!isAdmin && isAdminPage) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  if (isAdminPage && isAdmin && adminRole !== 'SUPERADMIN') {
    if (pathname.startsWith('/admin/support-channels')) {
      return NextResponse.next();
    }
    const required = Object.entries(routePermissionMap).find(([prefix]) => pathname.startsWith(prefix))?.[1];
    if (required && !permissions.includes(required)) {
      return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|payment|callback).*)'],
};
