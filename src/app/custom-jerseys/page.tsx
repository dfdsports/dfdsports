import React from 'react';
import type { Metadata } from 'next';
import { getActiveFabrics } from '@/services/fabrics';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CustomTeamwearBuilder } from '@/components/teamwear/CustomTeamwearBuilder';
import { FabricCollectionSection } from '@/components/home/FabricCollectionSection';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Custom Sublimation Sports Jerseys & Teamwear | DFD Sports',
  description:
    'Design and order custom sublimation team jerseys, kits, and athletic apparel tailored for schools, clubs, academies, and tournaments across India.',
  alternates: {
    canonical: `${SITE_URL}/custom-jerseys`,
  },
  openGraph: {
    title: 'Custom Sublimation Sports Jerseys & Teamwear | DFD Sports',
    description:
      'Design and order custom sublimation team jerseys, kits, and athletic apparel tailored for schools, clubs, academies, and tournaments across India.',
    url: `${SITE_URL}/custom-jerseys`,
    type: 'website',
  },
};

export default async function CustomJerseysPage() {
  const [company, fabrics] = await Promise.all([
    getCompanySettings(),
    getActiveFabrics(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#F5A623] selection:text-black">
      <Header company={company} />

      <main className="flex-1 w-full space-y-12 sm:space-y-16">
        {/* Interactive Jersey Builder */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <CustomTeamwearBuilder company={company} fabrics={fabrics} />
        </div>

        {/* Premium Fabric Collection (Exact component from Home Page) */}
        <FabricCollectionSection fabrics={fabrics} />
      </main>

      <Footer company={company} />
    </div>
  );
}
