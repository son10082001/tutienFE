export const ROUTES = {
  HOME: '/home',
  LANDING: '/home',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_GIFT_CODE: '/admin/gift-code',
  ADMIN_DEPOSIT: '/admin/deposit',
  ADMIN_DEPOSIT_PROMOTION: '/admin/deposit-promotion',
  ADMIN_CUMULATIVE_RECHARGE: '/admin/cumulative-recharge',
  ADMIN_SHOP: '/admin/shop',
  ADMIN_USERS: '/admin/users',
  ADMIN_NEWS: '/admin/news',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_ADMINS: '/admin/admins',
  ADMIN_SUPPORT_CHANNELS: '/admin/support-channels',
  PROFILE: '/profile',
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  ORDER: '/order',
  DEPOSIT: '/deposit',
  CUMULATIVE_RECHARGE: '/cumulative-recharge',
  TICKET_EXCHANGE: '/ticket-exchange',
  GIFT_CODE: '/gift-code',
  MARKET_PLACE: '/market-place',
  SUPPORT: '/support',
  NEWS: '/news',
};

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.SIGN_UP, ROUTES.FORGOT_PASSWORD];

/** Khớp với middleware: trang xem công khai, không cần đăng nhập. */
export const PUBLIC_ROUTES = ['/', ROUTES.HOME, ROUTES.MARKET_PLACE, ROUTES.SUPPORT, ROUTES.NEWS] as const;

export const PUBLIC_ROUTE_PREFIXES = [`${ROUTES.NEWS}/`, `${ROUTES.SUPPORT}/`] as const;
