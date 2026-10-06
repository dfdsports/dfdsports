'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Fabric } from '@/types/database';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface FabricCollectionSectionProps {
  fabrics: Fabric[];
}

export function FabricCollectionSection({ fabrics }: FabricCollectionSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeFabrics = (fabrics || []).filter((f) => f.is_active);

  // If no fabric data exists: do not show fake cards, cleanly hide section
  if (activeFabrics.length === 0) {
    return null;
  }

  /** Slide by exactly one card (card width + gap) */
  const slide = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    const firstCard = scroller?.firstElementChild as HTMLElement | null;
    if (!scroller || !firstCard) return;
    scroller.scrollBy({ left: direction * (firstCard.offsetWidth + 16), behavior: 'smooth' });
  };

  return (
    <section id="fabrics" className="bg-[#080A0F] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row: eyebrow + heading + description left, tagline + arrows right */}
        <div className="mb-6 flex items-end justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#F5A623]">
              Premium fabric collection
            </p>
            {/* ADDED: heading + small description */}
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Fabrics built for performance
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-gray-400">
              Breathable, durable and moisture-wicking fabrics for comfort on the field.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-white sm:block">
              High-Performance Fabrics for Every Game
            </p>
            <button
              type="button"
              onClick={() => slide(-1)}
              aria-label="Previous fabrics"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => slide(1)}
              aria-label="Next fabrics"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slider: 5 cards visible on desktop */}
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {activeFabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="group shrink-0 basis-[78%] snap-start sm:basis-[calc(50%-8px)] lg:basis-[calc(23%-12px)]"
            >
              {/* Fabric image with the name overlapping its bottom edge */}
              <div className="relative">
                <div className="relative aspect-[18/7] w-full overflow-hidden rounded-xl bg-white/5">
                  {fabric.image_url ? (
                    <Image
                      src={fabric.image_url}
                      alt={fabric.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 78vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Layers className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>

                <h3 className="absolute bottom-0 left-3 translate-y-1/3 text-base font-extrabold uppercase leading-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] sm:text-lg">
                  {fabric.name}
                </h3>
              </div>

              {fabric.short_description && (
                <p className="mt-4 line-clamp-1 pl-3 text-xs text-white/90">
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