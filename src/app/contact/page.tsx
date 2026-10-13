import React from 'react';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Contact DFD Sports | Sports Equipment & Custom Jerseys',
  description:
    'Have questions about sports equipment supply, brand catalog quotations, or custom team jerseys? Connect with DFD Sports directly.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact DFD Sports | Sports Equipment & Custom Jerseys',
    description:
      'Have questions about sports equipment supply, brand catalog quotations, or custom team jerseys? Connect with DFD Sports directly.',
    url: `${SITE_URL}/contact`,
    siteName: 'DFD Sports',
  },
};

export default async function ContactPage() {
  const company = await getCompanySettings();

  const brandName = company?.company_name || 'DFD SPORTS';

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#FF001E] selection:text-white">
      <Header company={company} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p
            className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-[#E8192C] mb-2 sm:mb-3"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
          >
            GET IN TOUCH WITH {brandName}
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-3 sm:mb-4"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
          >
            LET&apos;S TALK <span className="text-[#E8192C]">SPORTS.</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400">
            Have questions about sports equipment supply, brand catalog quotations, or custom team jerseys?
            Connect with us directly.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Direct Contact Details from Supabase */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-none bg-[#0E121B] shadow-xs space-y-6 text-white">
              <h3
                className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white mb-4"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
              >
                Direct Contact Channels
              </h3>

              {company?.whatsapp_number && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-none bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold uppercase tracking-wider text-neutral-400"
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                    >
                      WhatsApp Hotline
                    </h4>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {company.whatsapp_number}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">Instant quotation & fabric samples</p>
                  </div>
                </div>
              )}

              {company?.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 text-[#FF001E] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold uppercase tracking-wider text-neutral-400"
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                    >
                      Phone Number
                    </h4>
                    <a
                      href={`tel:${company.phone}`}
                      className="text-sm font-bold text-white hover:text-[#FF001E] transition-colors mt-0.5 block"
                    >
                      {company.phone}
                    </a>
                  </div>
                </div>
              )}

              {company?.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 text-[#FF001E] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold uppercase tracking-wider text-neutral-400"
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                    >
                      Email Address
                    </h4>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-sm font-bold text-white hover:text-[#FF001E] transition-colors mt-0.5 block"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>
              )}

              {company?.address && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 text-[#FF001E] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold uppercase tracking-wider text-neutral-400"
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                    >
                      Registered Address
                    </h4>
                    <p className="text-sm text-neutral-300 mt-0.5 leading-relaxed">
                      {company.address}
                    </p>
                  </div>
                </div>
              )}

              {company?.business_hours && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 text-[#FF001E] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-bold uppercase tracking-wider text-neutral-400"
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                    >
                      Working Hours
                    </h4>
                    <p className="text-sm text-neutral-300 mt-0.5">{company.business_hours}</p>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <WhatsAppButton
                  phoneNumber={company?.whatsapp_number}
                  type="general"
                  variant="whatsapp"
                  size="md"
                  className="w-full justify-center !rounded-none rounded-none font-bold uppercase tracking-[0.12em]"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Start WhatsApp Chat Now
                </WhatsAppButton>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Quotation Form */}
          <div className="lg:col-span-7">
            <ContactForm company={company} />
          </div>
        </div>
      </main>

      <Footer company={company} />
    </div>
  );
}
