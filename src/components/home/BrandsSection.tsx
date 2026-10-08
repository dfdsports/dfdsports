'use client';

import React from 'react';
import Image from 'next/image';
import { Brand } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface BrandsSectionProps {
  brands: Brand[];
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  const activeBrands = (brands || []).filter((b) => b.is_active);

  // If no brands in Supabase, cleanly hide the section
  if (activeBrands.length === 0) {
    return null;
  }

  // Ensure sufficient logos so the infinite marquee seamlessly covers full viewport widths
  const repeatCount = Math.max(3, Math.ceil(8 / activeBrands.length));
  const baseList = Array(repeatCount).fill(activeBrands).flat();
  const marqueeItems = [...baseList, ...baseList]; // Two identical halves for seamless infinite loop

  // Animation duration scales nicely with items
  const durationSec = Math.max(16, baseList.length * 3);

  return (
    <section className="bg-black py-5 sm:py-20 border-t border-white/5">
      <style>{`
        @keyframes brands-marquee-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .brands-marquee-track {
          display: flex;
          width: max-content;
          animation: brands-marquee-left var(--marquee-dur, 24s) linear infinite;
        }
        .brands-marquee-container:hover .brands-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .brands-marquee-track {
            animation: none;
          }
          .brands-marquee-container {
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header: identical font size, style and layout to Featured Products */}
        <div className="mb-10 sm:mb-12">
          <SectionHeading
            title="Brands we supply"
            highlightWord="supply"
            align="left"
            className="!mb-0 !pb-0 [&_*]:!mb-0 [&_*]:!pb-0"
          />
          <p className="hidden sm:block mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Trusted sports brands, stocked and sold directly to you.
          </p>
        </div>

        {/* Continuous right-to-left marquee without card background color */}
        <div className="brands-marquee-container overflow-hidden py-4 sm:py-8">
          <div
            className="brands-marquee-track flex items-center gap-3 sm:gap-20"
            style={{ '--marquee-dur': `${durationSec}s` } as React.CSSProperties}
          >
            {marqueeItems.map((brand, i) => {
              const isClone = i >= baseList.length;
              return (
                <div
                  key={`${brand.id}-${i}`}
                  title={brand.name}
                  aria-hidden={isClone || undefined}
                  className="group flex h-12 sm:h-24 w-24 sm:w-52 shrink-0 items-center justify-center bg-transparent transition-all duration-300"
                >
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={isClone ? '' : brand.name}
                      width={200}
                      height={80}
                      className="max-h-8 sm:max-h-16 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-center text-xs sm:text-lg font-black uppercase tracking-wider text-white/80 group-hover:text-[#F5A623] transition-colors duration-300">
                      {brand.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}