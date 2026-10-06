import React from 'react';
import Image from 'next/image';
import { Brand } from '@/types/database';
import { BadgeCheck } from 'lucide-react';

interface BrandsSectionProps {
  brands: Brand[];
}

/** Marquee only when there are enough logos to fill the row */
const MARQUEE_MIN = 6;

export function BrandsSection({ brands }: BrandsSectionProps) {
  const activeBrands = (brands || []).filter((b) => b.is_active);

  // If no brands in Supabase, cleanly hide the section (per requirements)
  if (activeBrands.length === 0) {
    return null;
  }

  const slides = activeBrands.length >= MARQUEE_MIN;
  const items = slides ? [...activeBrands, ...activeBrands] : activeBrands;

  return (
    <section className="bg-[#05060A] py-14 sm:py-20">
      <style>{`
        @keyframes brands-marquee { to { transform: translateX(-50%); } }
        .brands-track { animation: brands-marquee var(--brands-dur, 30s) linear infinite; }
        .brands-viewport:hover .brands-track,
        .brands-viewport:focus-within .brands-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .brands-track { animation: none; }
          .brands-viewport { overflow-x: auto; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header: title + trust line */}
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Brands we <span className="text-[#F5A623]">supply</span>
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-400 sm:text-base">
              Trusted sports brands, stocked and sold directly to you.
            </p>
          </div>

          <p className="inline-flex items-center gap-2 text-sm font-medium text-gray-300">
            <BadgeCheck className="h-5 w-5 text-[#F5A623]" />
            100% genuine certified gear
          </p>
        </div>

        {/* Logo tiles */}
        <div
          className={
            slides
              ? 'brands-viewport overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]'
              : ''
          }
        >
          <div
            className={slides ? 'brands-track flex w-max gap-4' : 'flex flex-wrap justify-center gap-4'}
            style={
              slides
                ? ({ '--brands-dur': `${activeBrands.length * 4}s` } as React.CSSProperties)
                : undefined
            }
          >
            {items.map((brand, i) => {
              const isClone = slides && i >= activeBrands.length;
              return (
                <div
                  key={`${brand.id}-${i}`}
                  title={brand.name}
                  aria-hidden={isClone || undefined}
                  className="group flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] px-6 transition-colors duration-300 hover:border-transparent hover:bg-white sm:h-24 sm:w-48"
                >
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={isClone ? '' : brand.name}
                      width={120}
                      height={48}
                      className="max-h-10 w-auto max-w-full object-contain brightness-0 invert transition duration-300 group-hover:brightness-100 group-hover:invert-0 sm:max-h-12"
                    />
                  ) : (
                    <span className="text-center text-base font-extrabold uppercase tracking-wide text-white transition-colors duration-300 group-hover:text-[#05060A]">
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