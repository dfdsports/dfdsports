'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowRight, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

interface CategoriesSectionProps {
  categories: Category[];
}

const ITEMS_PER_PAGE = 6;

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const activeCategories = (categories || []).filter((c) => c.is_active);
  const totalPages = Math.ceil(activeCategories.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const handlePrev = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prev) => (prev + 1 < totalPages ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (activeCategories.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore"
          title="Shop the game"
          highlightWord="game"
          subtitle="Quality equipment for every sport"
        />
        <EmptyState
          icon={Trophy}
          title="No Categories Available Yet"
          description="Sports categories can be added in the Admin Dashboard to showcase your equipment catalog."
          actionText="Go to Admin CMS"
          actionHref="/admin/categories"
        />
      </section>
    );
  }

  // Split categories into pages of 6 items (3 items row 1, 3 items row 2 on desktop)
  const pages: Category[][] = [];
  for (let i = 0; i < activeCategories.length; i += ITEMS_PER_PAGE) {
    pages.push(activeCategories.slice(i, i + ITEMS_PER_PAGE));
  }

  return (
    <section className="relative overflow-hidden bg-black py-10 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore"
          title="Shop the game"
          highlightWord="game"
          subtitle="Quality equipment for every sport"
          align="between"
          action={
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={totalPages <= 1}
                aria-label="Previous categories"
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-gray-300 transition-colors hover:border-[#F5A623]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={totalPages <= 1}
                aria-label="Next categories"
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-gray-300 transition-colors hover:border-[#F5A623]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        {/* 6 categories per view: 2 rows of 3 fully visible cards */}
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${safeCurrentPage * 100}%)` }}
          >
            {pages.map((pageCategories, pageIndex) => (
              <div
                key={pageIndex}
                className="grid w-full shrink-0 grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {pageCategories.map((category, index) => {
                  const itemNumber = pageIndex * ITEMS_PER_PAGE + index + 1;
                  return (
                    <Link
                      key={category.id}
                      href={`/collections/${category.slug}`}
                      className="group relative min-h-[160px] sm:min-h-[210px] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
                    >
                      {/* Photo, pushed right and darkened */}
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt=""
                          fill
                          sizes="(min-width:1024px) 33vw, 50vw"
                          className="object-cover object-right transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                        />
                      ) : (
                        <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#F5A623]/10 blur-3xl" />
                      )}

                      {/* Fade: bottom fade on mobile, left-to-right fade on desktop */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent sm:bg-gradient-to-r sm:from-black/50 sm:via-black/10 sm:to-transparent" />

                      {/* Content — left bottom on mobile, vertically centered on desktop */}
                      <div className="relative flex h-full min-h-[160px] sm:min-h-[210px] flex-col justify-end sm:justify-center p-3 sm:p-7 text-left items-start">
                        <span className="mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium tabular-nums text-[#F5A623]">
                          {String(itemNumber).padStart(2, '0')}
                        </span>

                        <h3 className="text-base sm:text-2xl lg:text-3xl font-extrabold uppercase tracking-wide text-white">
                          {category.name}
                        </h3>

                        {category.short_description && (
                          <p className="mt-1 hidden line-clamp-2 max-w-[16rem] text-sm text-gray-400 sm:block">
                            {category.short_description}
                          </p>
                        )}

                        <span className="mt-2 sm:mt-4 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-[#F5A623]">
                          Explore
                          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}