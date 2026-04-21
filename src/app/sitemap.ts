import { siteConfig } from '@/config/site';
import { NAV_BAR_ITEMS } from '@/lib/const';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const staticPages: MetadataRoute.Sitemap = Object.values(NAV_BAR_ITEMS).map((route: any) => ({
      url: `${siteConfig.appUrl}${route.href}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    }));

    return staticPages;
  } catch (err) {
    return [];
  }
}
