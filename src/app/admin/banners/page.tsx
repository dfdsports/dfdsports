import React from 'react';
import { getDualBannersSettings } from '@/services/dualBanners';
import { getActiveCategories } from '@/services/categories';
import { getActiveProducts } from '@/services/products';
import { DualBannersAdminClient } from '@/components/admin/DualBannersAdminClient';

export const revalidate = 0;

export const metadata = {
  title: 'Dual Banners Management | DFD Sports Admin',
};

export default async function AdminBannersPage() {
  const [settings, categories, products] = await Promise.all([
    getDualBannersSettings(),
    getActiveCategories(),
    getActiveProducts(),
  ]);

  return (
    <DualBannersAdminClient
      initialSettings={settings}
      categories={categories}
      products={products}
    />
  );
}
