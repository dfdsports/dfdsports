'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CompanySettings } from '@/types/database';
import {
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';

interface FooterProps {
  company?: CompanySettings | null;
}

// ── Accordion section (mobile-only) ─────────────────────────────────────────
function FooterAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 md:border-none">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-4 md:hidden"
        aria-expanded={open}
      >
        <span className="text-white font-bold text-xs uppercase tracking-[0.2em]">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Desktop heading */}
      <h4 className="hidden md:block text-white font-bold text-xs uppercase tracking-[0.2em] mb-5">
        {title}
      </h4>

      {/* Content: always visible on md+, collapsible on mobile */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:!max-h-none md:!opacity-100 md:!mb-0 ${open ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'
          }`}
      >
        {children}
      </div>
    </div>
  );
}

// ── Link list helper ─────────────────────────────────────────────────────────
function FooterLinkList({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  return (
    <ul className="space-y-3 pb-1">
      {items.map((item) => (
        <li key={item.label}>
          <Link
            href={item.href}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ── Main Footer ──────────────────────────────────────────────────────────────
export function Footer({ company }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const brandName = company?.company_name || 'DFD SPORTS';
  const fullName = company?.full_name || 'DESTINATION FOR DREAMS';

  const whatsappHref = company?.whatsapp_number
    ? `https://wa.me/${company.whatsapp_number.replace(/\D/g, '')}`
    : '#';

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Collections', href: '/collections' },
    { label: 'About Us', href: '/about' },
  ];

  const policyLinks = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Delivery Policy', href: '/delivery-policy' },
    { label: 'Contact Us', href: '/contact' },
 
  ];

  return (
    <footer className="bg-[#06080C] text-gray-400 text-sm ">
      {/* ── Upper Footer ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Info — 2 cols on lg */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5 group">
              <div className="relative w-36 h-14 sm:w-44 sm:h-16">
                <Image
                  src={company?.logo_url || '/logo.png'}
                  alt={brandName}
                  fill
                  sizes="(max-width: 640px) 144px, 176px"
                  className="object-contain object-left group-hover:opacity-90 transition-opacity"
                />
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              {company?.short_description ||
                'High-performance sports equipment supplier and custom teamwear provider for schools, clubs, academies and tournaments across India.'}
            </p>

            {/* Social icons */}
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

          {/* ── Quick Links ───────────────────────────────────────────── */}
          <div>
            <FooterAccordion title="Quick Links">
              <FooterLinkList items={quickLinks} />
            </FooterAccordion>
          </div>

          {/* ── Customer Policies ─────────────────────────────────────── */}
          <div>
            <FooterAccordion title="Customer Policies">
              <FooterLinkList items={policyLinks} />
            </FooterAccordion>
          </div>

          {/* ── Contact Us ────────────────────────────────────────────── */}
          <div>
            <FooterAccordion title="Contact Us">
              <div className="space-y-3.5 text-sm pb-1">
                {/* Address */}
                {company?.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{company.address}</span>
                  </div>
                )}

                {/* Phone */}
                {company?.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#F5A623] shrink-0" />
                    <a
                      href={`tel:${company.phone}`}
                      className="hover:text-white transition-colors"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}

                {/* Email */}
                {company?.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
                    <a
                      href={`mailto:${company.email}`}
                      className="hover:text-white transition-colors break-all"
                    >
                      {company.email}
                    </a>
                  </div>
                )}

                {/* WhatsApp */}
                {company?.whatsapp_number && (
                  <div className="flex items-center gap-2.5">
                    {/* WhatsApp icon (brand SVG) */}
                    <svg
                      className="w-4 h-4 fill-[#25D366] shrink-0"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      {company.whatsapp_number}
                    </a>
                  </div>
                )}

                {/* WhatsApp chat button */}
                {company?.whatsapp_number && (
                  <a
                    href={`${whatsappHref}?text=Hi%2C%20I%27m%20interested%20in%20your%20sports%20products.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat on WhatsApp
                  </a>
                )}
              </div>
            </FooterAccordion>
          </div>
        </div>
      </div>

      {/* ── Sub Footer ────────────────────────────────────────────────── */}
      <div className="bg-[#040508] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {currentYear} {brandName} ({fullName}). All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span>Crafted by</span>
            <a
              href="https://www.ekodrix.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5A623] hover:text-white transition-colors font-semibold"
            >
              Ekodrix
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
