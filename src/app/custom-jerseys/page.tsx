import React from 'react';
import Image from 'next/image';
import { getActiveTeamwear } from '@/services/teamwear';
import { getActiveFabrics } from '@/services/fabrics';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CustomTeamwearBuilder } from '@/components/teamwear/CustomTeamwearBuilder';
import { FabricCollectionSection } from '@/components/home/FabricCollectionSection';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { Shirt } from 'lucide-react';

export const revalidate = 60;

export default async function CustomJerseysPage() {
  const [company, teamwear, fabrics] = await Promise.all([
    getCompanySettings(),
    getActiveTeamwear(),
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

        {/* Existing Designs Showcase (From Supabase) */}
        {teamwear.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#F5A623] mb-1">
                PORTFOLIO
              </p>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Recent Teamwear Designs
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamwear.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl overflow-hidden bg-gradient-to-b from-[#121622] to-[#0A0D14] border border-white/5 p-6 shadow-xl flex flex-col justify-between hover:border-white/15 transition-all duration-300"
                >
                  <div className="relative aspect-square w-full bg-[#0E121B] rounded-2xl overflow-hidden mb-6 flex items-center justify-center p-4">
                    {item.front_image_url ? (
                      <Image
                        src={item.front_image_url}
                        alt={item.title}
                        fill
                        className="object-contain p-2 hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Shirt className="w-20 h-20 text-gray-600" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {item.customization_options && item.customization_options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {item.customization_options.slice(0, 4).map((opt) => (
                          <span
                            key={opt}
                            className="px-2.5 py-1 rounded-md bg-white/5 text-[10px] font-bold text-gray-300"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <WhatsAppButton
                    phoneNumber={company?.whatsapp_number}
                    type="custom_jersey"
                    productName={item.title}
                    variant="whatsapp"
                    size="sm"
                    className="w-full justify-center"
                  >
                    Enquire on This Design
                  </WhatsAppButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Fabric Collection (Exact component from Home Page) */}
        <FabricCollectionSection fabrics={fabrics} />
      </main>

      <Footer company={company} />
    </div>
  );
}
