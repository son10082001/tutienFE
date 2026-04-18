import { navLinkItems } from '@/components/layout/landingpage-layout/navbar';
import { siteConfig } from '@/config/site';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const staticPages: MetadataRoute.Sitemap = Object.values(navLinkItems).map((route) => ({
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
