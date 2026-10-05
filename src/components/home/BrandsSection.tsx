import React from 'react';
import Image from 'next/image';
import { Brand } from '@/types/database';

interface BrandsSectionProps {
  brands: Brand[];
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  const activeBrands = (brands || []).filter((b) => b.is_active);

  // If no brands in Supabase, cleanly hide the section (per requirements)
  if (activeBrands.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-[#05060A] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
          {/* Section Label */}
          <div className="shrink-0">
            <h3 className="text-xs uppercase tracking-[0.25em] font-extrabold text-[#F5A623] whitespace-nowrap">
              BRANDS WE SUPPLY
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">100% Genuine Certified Gear</p>
          </div>

          {/* Brand Logos Row */}
          <div className="flex-1 flex flex-wrap items-center justify-between gap-8 sm:gap-12 overflow-x-auto py-2">
            {activeBrands.map((brand) => (
              <div
                key={brand.id}
                className="relative h-10 min-w-[90px] flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-300"
                title={brand.name}
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={110}
                    height={40}
                    className="object-contain max-h-9 w-auto"
                  />
                ) : (
                  <span className="text-base font-black uppercase tracking-wider text-gray-300">
                    {brand.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
