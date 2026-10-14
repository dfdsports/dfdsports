import React from 'react';
import { CompanySettings } from '@/types/database';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { MotionDiv } from '@/components/ui/MotionDiv';
import Link from 'next/link';

interface FinalCTASectionProps {
  company?: CompanySettings | null;
}

export function FinalCTASection({ company }: FinalCTASectionProps) {
  return (
    <section className="py-0 sm:py-10 lg:py-14 relative overflow-hidden bg-[#080A0F] w-full">
      <MotionDiv className="w-full px-0 sm:px-6 lg:px-10 xl:px-12 relative z-10">
        <div className="rounded-none bg-[#0E121B] px-4 py-8 sm:p-10 lg:p-12 relative overflow-hidden w-full shadow-lg">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-10">
            {/* Left side: Content */}
            <div className="max-w-2xl text-left">
              <p
                className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-[#E8192C] mb-2 sm:mb-2.5"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                Destination for Dreams
              </p>

              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight mb-2.5 sm:mb-3"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
              >
                BUILD YOUR{' '}
                <span className="text-[#E8192C]">
                  TEAM IDENTITY.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                Talk to DFD Sports about custom sublimation jerseys, academy kits, and certified sports
                equipment for your team, school, or club.
              </p>
            </div>

            {/* Right side: Buttons with border radius none and red custom quote button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
              <WhatsAppButton
                phoneNumber={company?.whatsapp_number}
                type="custom_jersey"
                variant="whatsapp"
                size="md"
                className="h-11 sm:h-12 px-6 sm:px-8 justify-center rounded-none !rounded-none font-bold uppercase tracking-[0.12em] text-xs sm:text-sm shadow-none whitespace-nowrap"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                Enquire on WhatsApp
              </WhatsAppButton>

              <Link
                href="/contact"
                className="inline-flex h-11 sm:h-12 items-center justify-center px-6 sm:px-8 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white font-bold uppercase tracking-[0.12em] text-xs sm:text-sm transition-colors shadow-md text-center whitespace-nowrap"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                Submit Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </MotionDiv>
    </section>
  );
}
