import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ROUTES } from './lib/routes';
import { COOKIE_KEY } from './utils/auth';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const forceLogin = request.nextUrl.searchParams.get('force') === '1';

  // read token only with error handling
  let isAuthenticated = false;
  let role: string | undefined;
  try {
    const authData = request.cookies.get(COOKIE_KEY);
    if (authData?.value) {
      // Decode URL-encoded cookie value if needed
      let cookieValue = authData.value;
      try {
        cookieValue = decodeURIComponent(cookieValue);
      } catch {
        // If decode fails, use original value
      }
      const parsedData = JSON.parse(cookieValue);
      const state = parsedData?.state || {};
      isAuthenticated = state.isAuthenticated || false;
      role = state.user?.role;
    }
  } catch (error) {
    // If cookie is corrupted or invalid, treat as not authenticated
    // This prevents "Unterminated string in JSON" errors
    console.error('Error parsing auth cookie in middleware:', error);
    isAuthenticated = false;
  }
  const normalizedRole = (role || '').toUpperCase();

  // --- PUBLIC PAGES ---
  const publicPages = ['/', ROUTES.HOME];
  const isPublicPage = publicPages.includes(pathname);

  // --- AUTH PAGE ---
  const authPages = [ROUTES.LOGIN, ROUTES.SIGN_UP, ROUTES.FORGOT_PASSWORD];
  const isAuthPage = authPages.includes(pathname);
  const isAdminPage = pathname.startsWith('/admin');

  // 1. Nếu vào trang login mà đã login → redirect về home
  if (isAuthPage && isAuthenticated) {
    if (pathname === ROUTES.LOGIN && forceLogin) {
      return NextResponse.next();
    }

    if (normalizedRole === 'ADMIN') {
      return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
    }
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  // 2. Nếu là public page → luôn cho vào
  if (isPublicPage) {
    return NextResponse.next();
  }

  // 3. Nếu chưa đăng nhập → redirect về login (trừ public và auth pages)
  if (!isAuthenticated && !isPublicPage && !isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  if (isAuthenticated && normalizedRole === 'ADMIN' && !isAdminPage && !isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
  }

  if (isAuthenticated && normalizedRole !== 'ADMIN' && isAdminPage) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  // 4. Nếu đã đăng nhập → cho phép truy cập tất cả các trang
  // KYC sẽ được kiểm tra tại điểm thực hiện giao dịch

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|payment|callback).*)'],
};
