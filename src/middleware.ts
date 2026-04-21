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
        // use original value if decode fails
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

  const publicPages = ['/', ROUTES.HOME, ROUTES.MARKET_PLACE, ROUTES.SUPPORT];
  const isPublicPage = publicPages.includes(pathname);

  const authPages = [ROUTES.LOGIN, ROUTES.SIGN_UP, ROUTES.FORGOT_PASSWORD];
  const isAuthPage = authPages.includes(pathname);

  const isAdminPage = pathname.startsWith('/admin');

  // 1. Admin đã login: bất kể ở đâu (kể cả public page) đều redirect về /admin
  //    Ngoại trừ đang ở trang auth (xử lý riêng bên dưới) hoặc đã ở trong /admin
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|payment|callback).*)'],
};
