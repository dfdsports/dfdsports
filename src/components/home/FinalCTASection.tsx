import React from 'react';
import { CompanySettings } from '@/types/database';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import Link from 'next/link';

interface FinalCTASectionProps {
  company?: CompanySettings | null;
}

export function FinalCTASection({ company }: FinalCTASectionProps) {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden bg-[#080A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl sm:rounded-md bg-[#0D111A] p-8 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#F5A623]/10 blur-[100px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#1E3A8A]/15 blur-[100px]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-10">
            {/* Left side: Content */}
            <div className="max-w-2xl text-left">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-[#F5A623] mb-2 sm:mb-2.5">
                Destination for Dreams
              </p>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight mb-2.5 sm:mb-3">
                BUILD YOUR{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
                  TEAM IDENTITY.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-gray-300/80 leading-relaxed max-w-xl">
                Talk to DFD Sports about custom sublimation jerseys, academy kits, and certified sports
                equipment for your team, school, or club.
              </p>
            </div>

            {/* Right side: Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 shrink-0">
              <WhatsAppButton
                phoneNumber={company?.whatsapp_number}
                type="custom_jersey"
                variant="whatsapp"
                size="md"
                className="justify-center shadow-lg shadow-[#25D366]/20"
              >
                Enquire on WhatsApp
              </WhatsAppButton>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-colors hover:border-white/20 text-center"
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
