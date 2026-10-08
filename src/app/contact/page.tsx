import React from 'react';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export const revalidate = 60;

export default async function ContactPage() {
  const company = await getCompanySettings();

  const brandName = company?.company_name || 'DFD SPORTS';

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white">
      <Header company={company} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#F5A623] mb-3">
            GET IN TOUCH WITH {brandName}
          </p>
          <h1 className="text-4xl sm:text-4xl font-semibold uppercase tracking-tight text-white mb-4">
            LET&apos;S TALK SPORTS.
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Have questions about sports equipment supply, brand catalog quotations, or custom team jerseys?
            Connect with us directly.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact Details from Supabase */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-0 sm:p-8 rounded-sm bg-transparent sm:bg-[#0E121B] shadow-none sm:shadow-xl space-y-6">
              <h3 className="text-lg font-semibold uppercase tracking-tight text-white mb-4">
                Direct Contact Channels
              </h3>

              {company?.whatsapp_number && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      WhatsApp Hotline
                    </h4>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {company.whatsapp_number}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Instant quotation & fabric samples</p>
                  </div>
                </div>
              )}

              {company?.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-[#F5A623] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Phone Number
                    </h4>
                    <a
                      href={`tel:${company.phone}`}
                      className="text-sm font-semibold text-white hover:text-[#F5A623] transition-colors mt-0.5 block"
                    >
                      {company.phone}
                    </a>
                  </div>
                </div>
              )}

              {company?.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-[#F5A623] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Email Address
                    </h4>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-sm font-semibold text-white hover:text-[#F5A623] transition-colors mt-0.5 block"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>
              )}

              {company?.address && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-[#F5A623] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Registered Address
                    </h4>
                    <p className="text-sm text-gray-300 mt-0.5 leading-relaxed">
                      {company.address}
                    </p>
                  </div>
                </div>
              )}

              {company?.business_hours && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-[#F5A623] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Working Hours
                    </h4>
                    <p className="text-sm text-gray-300 mt-0.5">{company.business_hours}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5">
                <WhatsAppButton
                  phoneNumber={company?.whatsapp_number}
                  type="general"
                  variant="whatsapp"
                  size="md"
                  className="w-full justify-center"
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
