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
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#FF001E] selection:text-white">
      <Header company={company} />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[#0E121B] pt-8 pb-10 sm:pt-14 sm:pb-16 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
            {/* Header Content */}
            <div className="space-y-3.5 sm:space-y-4">
              <p
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E8192C]"
              >
                {eyebrow}
              </p>

              <h1
                style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
                className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white leading-tight"
              >
                {title} <span className="text-[#E8192C]">{highlightWord}</span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-neutral-400 leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-10 sm:py-16 space-y-6 sm:space-y-8">
          {sections.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-none bg-[#0E121B] text-center space-y-3">
              <p className="text-base text-white font-semibold">Policy details are being updated.</p>
              <p className="text-xs sm:text-sm text-neutral-400">
                Please check back shortly or contact our support team via WhatsApp.
              </p>
            </div>
          ) : (
            sections.map((section, index) => (
              <article
                key={section.id}
                className="relative overflow-hidden rounded-none bg-[#0E121B] p-5 sm:p-8 lg:p-9 shadow-sm transition-all duration-300 group"
              >
                <div className="relative z-10 space-y-3.5 sm:space-y-4">
                  {/* Heading with sequential index pill */}
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <span
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-none bg-[#FF001E]/10 flex items-center justify-center text-[#FF001E] font-bold text-xs sm:text-sm shrink-0 mt-0.5"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
                      className="text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-tight text-white leading-snug"
                    >
                      {section.heading}
                    </h2>
                  </div>

                  {/* Description Paragraphs */}
                  <div className="pl-11.5 sm:pl-13 text-xs sm:text-sm lg:text-base text-neutral-300 leading-relaxed whitespace-pre-line space-y-2">
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
