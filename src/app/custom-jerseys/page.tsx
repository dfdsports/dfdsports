import React from 'react';
import type { Metadata } from 'next';
import { getActiveFabrics } from '@/services/fabrics';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CustomTeamwearBuilder } from '@/components/teamwear/CustomTeamwearBuilder';
import { FinalCTASection } from '@/components/home/FinalCTASection';
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

interface CustomJerseysPageProps {
  searchParams?: Promise<{
    fabric?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function CustomJerseysPage({ searchParams }: CustomJerseysPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialFabric = typeof resolvedSearchParams?.fabric === 'string' ? resolvedSearchParams.fabric : undefined;

  const [company, fabrics] = await Promise.all([
    getCompanySettings(),
    getActiveFabrics(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#FF001E] selection:text-white">
      <Header company={company} />

      <main className="flex-1 w-full space-y-12 sm:space-y-16">
        {/* Interactive Jersey Builder */}
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 pt-8 sm:pt-12">
          <CustomTeamwearBuilder company={company} fabrics={fabrics} initialFabric={initialFabric} />
        </div>

        {/* Build Your Team Identity Bottom CTA Section */}
        <FinalCTASection company={company} />
      </main>

      <Footer company={company} />
    </div>
  );
}
