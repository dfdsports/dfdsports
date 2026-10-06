import React from 'react';
import { getAllProducts } from '@/services/products';
import { getFeaturedSettings } from '@/services/featuredSettings';
import { FeaturedAdminClient } from '@/components/admin/FeaturedAdminClient';

export const revalidate = 0;

export default async function AdminFeaturedPage() {
  const [products, settings] = await Promise.all([
    getAllProducts(),
    getFeaturedSettings(),
  ]);

  return <FeaturedAdminClient products={products} initialSettings={settings} />;
}
