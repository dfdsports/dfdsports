import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CompanySettings } from '@/types/database';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface FooterProps {
  company?: CompanySettings | null;
}

export function Footer({ company }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const brandName = company?.company_name || 'DFD SPORTS';
  const fullName = company?.full_name || 'DESTINATION FOR DREAMS';

  return (
    <footer className="bg-[#06080C] text-gray-400 text-sm mt-24">
      {/* Upper Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              {company?.logo_url ? (
                <div className="relative w-12 h-12">
                  <Image
                    src={company.logo_url}
                    alt={brandName}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#F5A623] flex items-center justify-center shadow-lg shadow-blue-900/30">
                  <span className="font-black text-xl tracking-tighter text-white">DFD</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white uppercase leading-tight">
                  {brandName}
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-gray-400">
                  {fullName}
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              {company?.short_description ||
                'High-performance sports equipment supplier and custom teamwear provider for schools, clubs, academies and tournaments across India.'}
            </p>

            <div className="flex items-center gap-3">
              {company?.instagram_url && (
                <a
                  href={company.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-[#F5A623] hover:bg-white/10 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {company?.facebook_url && (
                <a
                  href={company.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-[#F5A623] hover:bg-white/10 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {company?.youtube_url && (
                <a
                  href={company.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-[#F5A623] hover:bg-white/10 transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
              {company?.twitter_url && (
                <a
                  href={company.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-[#F5A623] hover:bg-white/10 transition-colors"
                  aria-label="Twitter / X"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'All Collections', href: '/collections' },
                { label: 'Custom Teamwear', href: '/custom-jerseys' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Teamwear Services */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Custom Teamwear
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Sublimation Jerseys', href: '/custom-jerseys' },
                { label: 'School & Academy Kits', href: '/custom-jerseys' },
                { label: 'Club Tournament Wear', href: '/custom-jerseys' },
                { label: 'Fabric Technologies', href: '/custom-jerseys#fabrics' },
                { label: 'Custom Quote Enquiry', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details (From Supabase) */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-4">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              {company?.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                  <a href={`tel:${company.phone}`} className="hover:text-white transition-colors">
                    {company.phone}
                  </a>
                </div>
              )}

              {company?.email && (
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                  <a href={`mailto:${company.email}`} className="hover:text-white transition-colors">
                    {company.email}
                  </a>
                </div>
              )}

              {company?.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                  <span>{company.address}</span>
                </div>
              )}

              {company?.business_hours && (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                  <span>{company.business_hours}</span>
                </div>
              )}

              <div className="pt-2">
                <WhatsAppButton
                  phoneNumber={company?.whatsapp_number}
                  type="general"
                  variant="whatsapp"
                  size="sm"
                  className="w-full justify-center"
                >
                  Direct WhatsApp Chat
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Footer */}
      <div className="bg-[#040508] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} {brandName} ({fullName}). All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span>Pan-India Supply & Custom Teamwear</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 hover:text-gray-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
