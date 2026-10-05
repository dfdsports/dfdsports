'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowRight, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -400 : 400;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const activeCategories = (categories || []).filter((c) => c.is_active);

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

  return (
    <section className="relative overflow-hidden bg-[#080A0F] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore"
          title="Shop the game"
          highlightWord="game"
          subtitle="Quality equipment for every sport"
          align="between"
          action={
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll categories left"
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-gray-300 transition-colors hover:border-[#F5A623]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll categories right"
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-gray-300 transition-colors hover:border-[#F5A623]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        {/* Horizontal scroller with snap; arrows above scroll it */}
        <div
          ref={scrollContainerRef}
          className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {activeCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group relative min-h-[210px] w-[90%] shrink-0 snap-start overflow-hidden rounded-2xl bg-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] sm:w-[420px] lg:w-[460px]"
            >
              {/* Photo, pushed right and darkened */}
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 85vw"
                  className="object-cover object-right transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />
              ) : (
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#F5A623]/10 blur-3xl" />
              )}

              {/* Lighter fade: only darkens the text side, photo stays clear */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent" />

              {/* Content */}
              <div className="relative flex h-full min-h-[210px] flex-col justify-center p-6 sm:p-7">
                <span className="mb-1 text-sm font-medium tabular-nums text-[#F5A623]">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3 className="text-2xl font-extrabold uppercase tracking-wide text-white sm:text-3xl">
                  {category.name}
                </h3>

                {category.short_description && (
                  <p className="mt-1 line-clamp-2 max-w-[16rem] text-sm text-gray-400">
                    {category.short_description}
                  </p>
                )}

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#F5A623]">
                  Explore
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}