import React from 'react';
import { getCompanySettings } from '@/services/company';
import { getActiveHeroSlides } from '@/services/hero';
import { getActiveCategories } from '@/services/categories';
import { getFeaturedProducts, getActiveProducts } from '@/services/products';
import { getFeaturedSettings } from '@/services/featuredSettings';
import { getActiveFabrics } from '@/services/fabrics';
import { getActiveBrands } from '@/services/brands';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { AllProductsSection } from '@/components/home/AllProductsSection';
import { CustomTeamwearSection } from '@/components/home/CustomTeamwearSection';
import { FabricCollectionSection } from '@/components/home/FabricCollectionSection';
import { BrandsSection } from '@/components/home/BrandsSection';
import { FinalCTASection } from '@/components/home/FinalCTASection';
import { FloatingWhatsAppButton } from '@/components/ui/FloatingWhatsAppButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Fetch all live dynamic content concurrently on the server
  const [
    company,
    heroSlides,
    categories,
    featuredProducts,
    allProducts,
    fabrics,
    brands,
  ] = await Promise.all([
    getCompanySettings(),
    getActiveHeroSlides(),
    getActiveCategories(),
    getFeaturedProducts(8),
    getActiveProducts(),
    getActiveFabrics(),
    getActiveBrands(),
  ]);

  const featuredSettings = getFeaturedSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#F5A623] selection:text-black">
      {/* Top Header */}
      <Header company={company} />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection slides={heroSlides} company={company} />

        {/* 7. Brands We Supply (Dynamically shown if brands exist) */}
        <BrandsSection brands={brands} />

        {/* 2. Sports Categories ("Shop the Game") */}
        <CategoriesSection categories={categories} />

        {/* 3. Featured Products Showcase (Untouched, original design) */}
        <FeaturedProductsSection products={featuredProducts} company={company} settings={featuredSettings} />

        {/* 4. Custom Teamwear & Sublimation Jerseys ("Made for Your Team") */}
        <CustomTeamwearSection company={company} />

        {/* 5. All Products Showcase (8 products: 2 rows of 4, View All button) */}
        <AllProductsSection products={allProducts} company={company} />

        {/* 6. Fabric Collection (Dynamically shown if fabrics exist) */}
        <FabricCollectionSection fabrics={fabrics} />

        {/* 10. Final CTA */}
        <FinalCTASection company={company} />
      </main>

      {/* Dynamic Footer */}
      <Footer company={company} />

      {/* Floating WhatsApp Action Button (Bottom Right) */}
      <FloatingWhatsAppButton company={company} />
    </div>
  );
}
