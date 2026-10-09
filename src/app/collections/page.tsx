import React, { Suspense } from 'react';
import { getActiveCategories } from '@/services/categories';
import { getActiveProducts } from '@/services/products';
import { getActiveBrands } from '@/services/brands';
import { getCompanySettings } from '@/services/company';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CollectionsCatalog } from '@/components/collections/CollectionsCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'All Collections | DFD Sports — Sportswear & Sports Equipment',
  description:
    'Browse authentic sports equipment, custom sublimation team jerseys, tournament kits, and athletic gear at DFD Sports across India.',
  alternates: {
    canonical: 'https://dfdsports.com/collections',
  },
  openGraph: {
    title: 'All Collections | DFD Sports — Sportswear & Sports Equipment',
    description:
      'Browse authentic sports equipment, custom sublimation team jerseys, tournament kits, and athletic gear at DFD Sports across India.',
    url: 'https://dfdsports.com/collections',
    type: 'website',
  },
};

interface CollectionsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const resolvedParams = await searchParams;

  const [company, categories, products, brands] = await Promise.all([
    getCompanySettings(),
    getActiveCategories(),
    getActiveProducts(),
    getActiveBrands(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white">
      <Header company={company} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <Suspense
          fallback={
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#F5A623]/20 border-t-[#F5A623] animate-spin mb-4" />
              <p className="text-xs uppercase tracking-widest text-gray-400">Loading sports collections...</p>
            </div>
          }
        >
          <CollectionsCatalog
            initialProducts={products}
            categories={categories}
            brands={brands}
            company={company}
            initialParams={resolvedParams}
          />
        </Suspense>
      </main>

      <Footer company={company} />
    </div>
  );
}
