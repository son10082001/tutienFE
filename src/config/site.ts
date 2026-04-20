import { appConfig } from '.';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  appUrl: appConfig.appUrl,
  name: 'Ngư Tiên Ký',
  metaTitle: 'Ngư Tiên Ký',
  description: 'Ngư Tiên Ký',
  ogImage: `${appConfig.appUrl}/og-image.jpg`,
};
