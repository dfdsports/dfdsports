import React from 'react';
import { getCompanySettings } from '@/services/company';
import { getActiveHeroSlides } from '@/services/hero';
import { getActiveCategories } from '@/services/categories';
import { getActiveProducts } from '@/services/products';
import { getActiveFabrics } from '@/services/fabrics';
import { getActiveBrands } from '@/services/brands';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CustomTeamwearSection } from '@/components/home/CustomTeamwearSection';
import { FabricCollectionSection } from '@/components/home/FabricCollectionSection';
import { BrandsSection } from '@/components/home/BrandsSection';
import { SportCategoriesSection } from '@/components/home/CategoryProductShowcase';
import { FinalCTASection } from '@/components/home/FinalCTASection';
import { FloatingWhatsAppButton } from '@/components/ui/FloatingWhatsAppButton';

import { getDualBannersSettings } from '@/services/dualBanners';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Fetch all live dynamic content concurrently on the server
  const [
    company,
    heroSlides,
    categories,
    allProducts,
    fabrics,
    brands,
    dualBanners,
  ] = await Promise.all([
    getCompanySettings(),
    getActiveHeroSlides(),
    getActiveCategories(),
    getActiveProducts(),
    getActiveFabrics(),
    getActiveBrands(),
    getDualBannersSettings(),
  ]);

  // Split active categories with products: first two, then dual promotional banners, then remaining categories
  const activeCategoriesWithProducts = (categories || [])
    .filter((c) => c.is_active)
    .filter((cat) =>
      allProducts.some(
        (p) => p.category_id === cat.id || p.category?.slug === cat.slug
      )
    );

  const firstTwoCategories = activeCategoriesWithProducts.slice(0, 2);
  const remainingCategories = activeCategoriesWithProducts.slice(2);

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#F5A623] selection:text-black">
      {/* Top Header */}
      <Header company={company} categories={categories} />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection slides={heroSlides} />

        {/* 2. Brands We Supply (Dynamically shown if brands exist) */}
        <BrandsSection brands={brands} />

        {/* 3. First Two Sport Categories */}
        {firstTwoCategories.length > 0 ? (
          <SportCategoriesSection categories={firstTwoCategories} products={allProducts} />
        ) : (
          <SportCategoriesSection categories={categories} products={allProducts} />
        )}

        {/* 4. Dual Promotional Banners (Left: Product Link, Right: Custom Jerseys) */}
        <CustomTeamwearSection settings={dualBanners} company={company} />

        {/* 5. Remaining Sport Categories */}
        {remainingCategories.length > 0 && (
          <SportCategoriesSection categories={remainingCategories} products={allProducts} />
        )}

        {/* 6. Fabric Collection (Dynamically shown if fabrics exist) */}
        <FabricCollectionSection fabrics={fabrics} />

        {/* 7. Final CTA */}
        <FinalCTASection company={company} />
      </main>

      {/* Dynamic Footer */}
      <Footer company={company} />

      {/* Floating WhatsApp Action Button (Bottom Right) */}
      <FloatingWhatsAppButton company={company} />
    </div>
  );
}
