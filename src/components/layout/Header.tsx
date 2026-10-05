'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CompanySettings } from '@/types/database';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { Menu, X, Search, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  company?: CompanySettings | null;
}

export function Header({ company }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
    { label: 'Equipment', href: '/collections?type=equipment' },
    { label: 'Custom Jerseys', href: '/custom-jerseys' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const brandName = company?.company_name || 'DFD SPORTS';
  const fullName = company?.full_name || 'DESTINATION FOR DREAMS';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080A0F]/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">

            <div className="relative w-20 h-20">
              <Image
                src="/logo.png"
                alt="logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium tracking-wide transition-colors relative py-1',
                    isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F5A623] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/collections"
              aria-label="Search Catalog"
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            <WhatsAppButton
              phoneNumber={company?.whatsapp_number}
              type="general"
              variant="whatsapp"
              size="md"
            >
              Enquire on WhatsApp
            </WhatsAppButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <WhatsAppButton
              phoneNumber={company?.whatsapp_number}
              type="general"
              variant="whatsapp"
              size="sm"
            >
              Enquire
            </WhatsAppButton>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0E14] px-4 pt-3 pb-6 shadow-2xl transition-all">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg text-base font-medium tracking-wide transition-colors',
                    isActive
                      ? 'bg-white/10 text-[#F5A623] font-semibold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 flex flex-col gap-3">
              <WhatsAppButton
                phoneNumber={company?.whatsapp_number}
                type="general"
                variant="whatsapp"
                size="lg"
                className="w-full justify-center"
              >
                Enquire on WhatsApp
              </WhatsAppButton>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-gray-300"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin CMS Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
