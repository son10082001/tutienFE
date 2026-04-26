export const ROUTE = {
  HOME: '/home',
  LANDING_PAGE: '/home',
  DASHBOARD: '/dashboard',
  ME: '/me',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  PROFILE: '/profile',
  SUPPORT: '/support',
  SUPPORT_NEW: '/support_new',
  LOGIN: '/login',
  MARKET_PLACE: '/market-place',
  NFTS_MARKET_PLACE: '/market-place/nfts',
  LOOTBOXES_MARKET_PLACE: '/market-place/lootboxes',
  COLLECTIONS_MARKET_PLACE: '/market-place/collections',
  TERMS: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
  FAQS: '/faqs',
  BLOG: '/blog',
  MY_PORTFOLIO: '/profile?tab=portfolio',
  MY_DETAILS: '/profile?tab=details',
  MY_WALLET: '/profile?tab=wallet',
  MY_NFTS: '/profile?tab=nfts',
  MY_ACTIVITY: '/profile?tab=activity',
  AUTH: '/auth',
  DEPOSIT: '/deposit',
  CUMULATIVE_RECHARGE: '/cumulative-recharge',
  TICKET_EXCHANGE: '/ticket-exchange',
  GIFT_CODE: '/gift-code',
  NEWS: '/news',
  ADMIN_GIFT_CODE: '/admin/gift-code',
  ADMIN_NEWS: '/admin/news',
} as const;

export type ROUTE_KEY = keyof typeof ROUTE;

export const MAPPING_ROUTE_TITLE = {
  [ROUTE.DASHBOARD]: 'Course',
  [ROUTE.SUPPORT]: 'Support',
  [ROUTE.PROFILE]: 'Profile',
} as unknown as Record<ROUTE_KEY, string>;

export const noneMarketPlaceUrl: string[] = [ROUTE.BLOG, ROUTE.LANDING_PAGE, '/blog/[id]', '/'];
