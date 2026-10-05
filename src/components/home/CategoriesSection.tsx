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
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const activeCategories = (categories || []).filter((c) => c.is_active);

  if (activeCategories.length === 0) {
    return (
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="EXPLORE"
          title="SHOP THE GAME"
          highlightWord="GAME"
          subtitle="Quality Equipment for Every Sport"
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
    <section className="py-20 relative overflow-hidden bg-[#080A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="EXPLORE"
          title="SHOP THE GAME"
          highlightWord="GAME"
          subtitle="Quality Equipment for Every Sport"
          align="between"
          action={
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll Categories Left"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll Categories Right"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          }
        />

        {/* Categories Grid / Horizontal Scroll on mobile */}
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activeCategories.map((category, index) => {
            const indexNumber = String(index + 1).padStart(2, '0');

            return (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className="group relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-[#141923] via-[#0E121B] to-[#0A0D14] p-7 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#F5A623]/10"
              >
                {/* Background image with smooth gradient overlay */}
                {category.image_url ? (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover object-right group-hover:scale-105 transition-transform duration-700 opacity-60 mix-blend-luminosity group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0E121B] via-[#0E121B]/80 to-transparent" />
                  </div>
                ) : (
                  <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-[#F5A623]/5 blur-2xl group-hover:bg-[#F5A623]/10 transition-colors pointer-events-none" />
                )}

                {/* Content */}
                <div className="relative z-10">
                  <span className="text-xs font-mono font-bold tracking-widest text-[#F5A623]/80">
                    {indexNumber}
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white mt-1 group-hover:text-[#F5A623] transition-colors">
                    {category.name}
                  </h3>
                  {category.short_description && (
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px] line-clamp-2">
                      {category.short_description}
                    </p>
                  )}
                </div>

                {/* Action Link */}
                <div className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5A623] group-hover:text-white transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
