import React from 'react';
import { CompanySettings } from '@/types/database';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import Link from 'next/link';

interface FinalCTASectionProps {
  company?: CompanySettings | null;
}

export function FinalCTASection({ company }: FinalCTASectionProps) {
  return (
    <section className="py-24 relative overflow-hidden bg-[#080A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-[3rem] bg-gradient-to-r from-[#121622] via-[#1A2234] to-[#101420] p-10 sm:p-16 lg:p-20 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#F5A623]/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#F5A623] mb-4">
              DESTINATION FOR DREAMS
            </p>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight mb-6">
              BUILD YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
                TEAM IDENTITY.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed mb-10">
              Talk to DFD Sports about custom sublimation jerseys, academy kits, and certified sports
              equipment for your team, school, or club.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <WhatsAppButton
                phoneNumber={company?.whatsapp_number}
                type="custom_jersey"
                variant="whatsapp"
                size="lg"
              >
                Enquire on WhatsApp
              </WhatsAppButton>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-colors"
              >
                Submit Custom Quote Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
