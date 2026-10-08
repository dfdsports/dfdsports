'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EmptyState } from '@/components/ui/EmptyState';
import { ChevronDown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoriesSectionProps {
  categories: Category[];
}

const INITIAL_COUNT = 6;

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const displayedCategories = isExpanded
    ? activeCategories
    : activeCategories.slice(0, INITIAL_COUNT);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#080A0F] via-[#0E1424] to-[#080A0F] py-10 sm:py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore"
          title="Shop the game"
          highlightWord="game"
          subtitle="Quality equipment for every sport"
          align="left"
        />

        {/* Categories Grid */}
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group block focus-visible:outline-none"
            >
              {/* Image Card without black gradient and rounded-sm border radius */}
              <div className="relative h-[160px] sm:h-[210px] w-full overflow-hidden rounded-sm bg-black focus-visible:ring-2 focus-visible:ring-[#F5A623]">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none [backface-visibility:hidden] [transform:translateZ(0)]"
                  />
                ) : (
                  <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#F5A623]/10 blur-3xl" />
                )}
              </div>

              {/* Category Name outside bottom center */}
              <h3 className="mt-2.5 sm:mt-3 text-center text-sm sm:text-base lg:text-lg font-extrabold uppercase tracking-wide text-white group-hover:text-[#F5A623] transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>

        {/* View More / Close Button (shown when more than INITIAL_COUNT categories) */}
        {activeCategories.length > INITIAL_COUNT && (
          <div className="mt-10 sm:mt-14 flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{isExpanded ? 'Close' : 'View More'}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-300',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}