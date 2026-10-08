'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Fabric } from '@/types/database';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface FabricCollectionSectionProps {
  fabrics: Fabric[];
}

export function FabricCollectionSection({ fabrics }: FabricCollectionSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 8; // 4 in top row + 4 in bottom row

  const activeFabrics = (fabrics || []).filter((f) => f.is_active);

  // If no fabric data exists: cleanly hide section
  if (activeFabrics.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(activeFabrics.length / PAGE_SIZE);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // Up to 8 cards for the current page: 4 in first row, up to 4 more at the bottom
  const visibleFabrics = activeFabrics.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  return (
    <section id="fabrics" className="bg-[#080A0F] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header Row matching Featured Products text size & color */}
        <div className="mb-10 sm:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623] mb-2 sm:mb-2.5">
              Premium fabric collection
            </p>
            <h1 className="text-2xl sm:text-4xl font-semibold text-white uppercase font-black">
              Fabrics built for <span className="text-[#F5A623]">performance</span>
            </h1>
            <p className="hidden sm:block mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Breathable, durable and moisture-wicking fabrics for comfort on the field.
            </p>
          </div>

          {/* Right Header: Tagline and Next/Previous navigation buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={totalPages <= 1}
                aria-label="Previous fabrics"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-all hover:bg-white/10 hover:border-amber-500/50 hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={totalPages <= 1}
                aria-label="Next fabrics"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-all hover:bg-white/10 hover:border-amber-500/50 hover:text-[#F5A623] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Centered responsive flex layout: 2 cols on mobile, 3 on md, 4 on lg; remaining cards center-aligned */}
        <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-6 sm:gap-y-8">
          {visibleFabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="group w-[calc(50%-6px)] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-18px)] shrink-0"
            >
              {/* Fabric image with the name overlapping its bottom edge */}
              <div className="relative">
                <div className="relative aspect-[18/7] w-full overflow-hidden rounded-xl bg-white/5 shadow-md">
                  {fabric.image_url ? (
                    <Image
                      src={fabric.image_url}
                      alt={fabric.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Layers className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>

                <h3 className="absolute bottom-0 left-2.5 sm:left-3 translate-y-1/3 text-xs sm:text-base font-extrabold uppercase leading-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] sm:text-lg">
                  {fabric.name}
                </h3>
              </div>

              {fabric.short_description && (
                <p className="mt-3 sm:mt-4 line-clamp-1 pl-2.5 sm:pl-3 text-[11px] sm:text-xs text-white/90">
                  {fabric.short_description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}