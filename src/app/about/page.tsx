import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsAppButton } from '@/components/ui/FloatingWhatsAppButton';
import { AboutStats } from '@/components/about/AboutStats';
import { AboutVisionMission } from '@/components/about/AboutVisionMission';
import { FinalCTASection } from '@/components/home/FinalCTASection';

export const revalidate = 60;

export const metadata = {
  title: 'About Us | DFD Sports — Destination for Dreams',
  description:
    'Learn about DFD (Destination for Dreams) — high-performance sports equipment, custom teamwear, and tournament gear for athletes, schools, and academies across India.',
};

export default async function AboutPage() {
  const company = await getCompanySettings();

  const whatsappHref = company?.whatsapp_number
    ? `https://wa.me/${company.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
      'Hi DFD Sports, I would like to know more about your teamwear and sports equipment.'
    )}`
    : 'https://wa.me/919876543210';

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#F5A623] selection:text-[#080A0F]">
      <Header company={company} />

      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-16 sm:space-y-24">
          {/* =========================================================================
            1. HERO / FIRST SECTION
            Left: Heading, Eyebrow, Paragraph & Action CTAs
            Right: Hero Image Section
           ========================================================================= */}
          <section className="space-y-10 sm:space-y-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading & Paragraph */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-3">
                <div className="inline-flex items-center gap-2 py-1.5 rounded-full">
                  <span className="text-[11px] sm:text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623]">
                    DESTINATION FOR DREAMS
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-semibold uppercase tracking-tight text-white leading-tight">
                  More Than Sports.{' '}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
                    We Support The Dream Behind It.
                  </span>
                </h1>

                <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed max-w-2xl">
                  DFD – Destination for Dreams is a sports initiative founded by three young sports enthusiasts with a simple vision: to make quality sports products accessible at the right price and help people turn their sporting dreams into reality.              </p>
                <p>
                  What started as a new journey in the sports industry has grown into a trusted choice for 100+ satisfied regular customers. Over the past two years, we have built strong relationships with athletes, students, schools, clubs and sports enthusiasts by focusing on what matters most — quality, reliability and customer satisfaction.
                </p>
                <p>At DFD, we provide a wide range of quality sports equipment, customised jerseys, medals, sports accessories and sports mats, sourced from leading and trusted brands. We also offer customised solutions to meet the requirements of schools, clubs, academies, tournaments and sporting events.</p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <Link
                    href="/collections"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5A623] hover:bg-[#d9901a] text-black text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#F5A623]/15 active:scale-[0.98]"
                  >
                    Explore Collections
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/custom-jerseys"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0E121B] hover:bg-[#151B28] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all active:scale-[0.98]"
                  >
                    Custom Teamwear
                  </Link>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs sm:text-sm font-bold transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* Right Column: Image Section */}
              <div className="lg:col-span-5">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-[#0E121B] group">
                  <Image
                    src="/images/about/hero_athletes.jpg"
                    alt="DFD Sports Athletes and Gear"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/90 via-transparent to-black/20" />

                  {/* Corner Floating Highlight Badge */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 p-3.5 sm:p-4 rounded-2xl bg-[#0E121B]/90 backdrop-blur-md shadow-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">

                      <div>
                        <p className="text-[11px] sm:text-xs font-bold uppercase text-white tracking-wide">
                          Engineered for Champions
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Kozhikode, Kerala • Delivering Pan-India
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#F5A623] px-2.5 py-1 rounded-full bg-[#F5A623]/10 shrink-0">
                      Est. 2025
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
              STATISTICS DATA (Separate Component at bottom of first section)
             ========================================================================= */}
            <div className="pt-2">
              <AboutStats />
            </div>
          </section>

          {/* =========================================================================
            2. VISION & MISSION SECTION
           ========================================================================= */}
          <section className="pt-4 sm:pt-8">
            <AboutVisionMission />
          </section>
        </div>

        {/* =========================================================================
            3. FINAL CTA SECTION
           ========================================================================= */}
        <FinalCTASection company={company} />
      </main>

      <Footer company={company} />
      <FloatingWhatsAppButton company={company} />
    </div>
  );
}
