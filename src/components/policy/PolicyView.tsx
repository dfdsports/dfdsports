import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CompanySettings, PolicySection, PolicyType } from '@/types/database';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsAppButton } from '@/components/ui/FloatingWhatsAppButton';
import { FinalCTASection } from '@/components/home/FinalCTASection';

interface PolicyViewProps {
  type: PolicyType;
  title: string;
  highlightWord: string;
  eyebrow: string;
  description: string;
  sections: PolicySection[];
  company: CompanySettings | null;
}

export function PolicyView({
  title,
  highlightWord,
  eyebrow,
  description,
  sections,
  company,
}: PolicyViewProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#F5A623] selection:text-[#080A0F]">
      <Header company={company} />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16">
          {/* Ambient Lighting */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#F5A623]/10 blur-[130px]" />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[#1E3A8A]/15 blur-[120px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
       

            {/* Header Content */}
            <div className="space-y-3.5 sm:space-y-4">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#F5A623]">
                {eyebrow}
              </p>

              <h1 className="text-2xl sm:text-4xl font-semibold uppercase tracking-tight text-white leading-tight">
                {title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
                  {highlightWord}
                </span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6 sm:space-y-8">
          {sections.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#0D111A] text-center space-y-3">
              <p className="text-base text-white font-semibold">Policy details are being updated.</p>
              <p className="text-xs sm:text-sm text-gray-400">
                Please check back shortly or contact our support team via WhatsApp.
              </p>
            </div>
          ) : (
            sections.map((section, index) => (
              <article
                key={section.id}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0D111A] hover:border-white/10 p-5 sm:p-8 lg:p-9 shadow-xl transition-all duration-300 group"
              >
                {/* Subtle Ambient Accent inside card */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#F5A623]/5 blur-[70px] group-hover:bg-[#F5A623]/10 transition-colors" />

                <div className="relative z-10 space-y-3.5 sm:space-y-4">
                  {/* Heading with sequential index pill */}
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] font-bold text-xs sm:text-sm shrink-0 mt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-base sm:text-xl lg:text-2xl font-semibold uppercase tracking-tight text-white leading-snug">
                      {section.heading}
                    </h2>
                  </div>

                  {/* Description Paragraphs */}
                  <div className="pl-11.5 sm:pl-13 text-xs sm:text-sm lg:text-base text-gray-300/90 leading-relaxed whitespace-pre-line space-y-2">
                    {section.description}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Reusable Final CTA Section */}
        <FinalCTASection company={company} />
      </main>

      <Footer company={company} />
      <FloatingWhatsAppButton company={company} />
    </div>
  );
}
