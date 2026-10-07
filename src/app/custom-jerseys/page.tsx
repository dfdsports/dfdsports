import React from 'react';
import { getActiveFabrics } from '@/services/fabrics';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CustomTeamwearBuilder } from '@/components/teamwear/CustomTeamwearBuilder';
import { FabricCollectionSection } from '@/components/home/FabricCollectionSection';

export const revalidate = 60;

export default async function CustomJerseysPage() {
  const [company, fabrics] = await Promise.all([
    getCompanySettings(),
    getActiveFabrics(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#F5A623] selection:text-black">
      <Header company={company} />

      <main className="flex-1 w-full space-y-16 sm:space-y-20">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#F5A623] mb-3">
              DESTINATION FOR DREAMS • CUSTOM TEAMWEAR
            </p>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
              TEAMWEAR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
                MADE FOR YOUR SQUAD.
              </span>
            </h1>
            <p className="text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
              High definition sublimation printing, zero-fade ink technology, breathable athletic fabrics,
              and complete customization for schools, colleges, clubs, and corporate teams.
            </p>
          </div>
        </div>

        {/* Interactive Jersey Builder */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomTeamwearBuilder company={company} fabrics={fabrics} />
        </div>

        {/* Premium Fabric Collection */}
        <FabricCollectionSection fabrics={fabrics} />
      </main>

      <Footer company={company} />
    </div>
  );
}
