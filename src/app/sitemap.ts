import type { MetadataRoute } from 'next';
import { getActiveProducts } from '@/services/products';
import { getActiveCategories } from '@/services/categories';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/custom-jerseys`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/delivery-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const [products, categories] = await Promise.all([
      getActiveProducts(),
      getActiveCategories(),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = (categories || [])
      .filter((c) => Boolean(c.slug && c.is_active))
      .map((c) => ({
        url: `${SITE_URL}/collections/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    const productRoutes: MetadataRoute.Sitemap = (products || [])
      .filter((p) => Boolean(p.slug && p.is_active))
      .map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: p.is_featured ? 0.9 : 0.8,
      }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error('[Sitemap Generation Error]:', error);
    return staticRoutes;
  }
}
