import React from 'react';
import Link from 'next/link';
import { getCompanySettings } from '@/services/company';
import { getActiveWhyChooseUs } from '@/services/whyChooseUs';
import { getActiveHighlights } from '@/services/highlights';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HighlightsSection } from '@/components/home/HighlightsSection';
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ShieldCheck, Target, Award, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export default async function AboutPage() {
  const [company, whyChooseUs, highlights] = await Promise.all([
    getCompanySettings(),
    getActiveWhyChooseUs(),
    getActiveHighlights(),
  ]);

  const brandName = company?.company_name || 'DFD SPORTS';
  const fullName = company?.full_name || 'Destination For Dreams';

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white">
      <Header company={company} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-20">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#F5A623] mb-3">
            ABOUT {brandName}
          </p>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
            DESTINATION <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
              FOR DREAMS.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-normal">
            {company?.about_description ||
              `${brandName} (${fullName}) is a premier sports equipment supplier and custom teamwear provider. We cater to grassroots athletes, schools, colleges, clubs, and professional sports academies with certified gear and custom sublimation jerseys.`}
          </p>
        </div>

        {/* Brand Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#131724] to-[#0B0E14] shadow-xl">
            <Target className="w-8 h-8 text-[#F5A623] mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Our Mission</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              To supply athletes and sports organizations across India with tournament-grade equipment and custom apparel that ignites identity and team pride.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#131724] to-[#0B0E14] shadow-xl">
            <ShieldCheck className="w-8 h-8 text-[#F5A623] mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Authentic Quality</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              We exclusively stock and supply 100% genuine equipment from certified sports brands, backed by high-precision in-house jersey manufacturing.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#131724] to-[#0B0E14] shadow-xl">
            <Award className="w-8 h-8 text-[#F5A623] mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Pan-India Reach</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Whether you are an academy ordering hundreds of kits or an institution needing multi-sport gear, we deliver directly to your field safely and promptly.
            </p>
          </div>
        </div>

        {/* Dynamic Highlights / Stats (strictly hides if empty) */}
        <HighlightsSection highlights={highlights} />

        {/* Why Choose Us */}
        <WhyChooseUsSection items={whyChooseUs} />

        {/* Call to action */}
        <div className="rounded-3xl bg-gradient-to-r from-[#141926] to-[#0E121B] p-10 text-center shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-4">
            Partner With DFD Sports Today
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto mb-8">
            Connect with our sports consultants on WhatsApp to discuss equipment tenders, tournament supplies, or custom jersey prototypes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <WhatsAppButton
              phoneNumber={company?.whatsapp_number}
              type="general"
              variant="whatsapp"
              size="lg"
            >
              Contact on WhatsApp
            </WhatsAppButton>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer company={company} />
    </div>
  );
}
