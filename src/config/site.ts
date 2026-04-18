import { appConfig } from '.';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  appUrl: appConfig.appUrl,
  name: 'Câu Cá Tu Tiên',
  metaTitle: 'Câu Cá Tu Tiên',
  description: 'Câu Cá Tu Tiên',
  ogImage: `${appConfig.appUrl}/og-image.jpg`,
};
