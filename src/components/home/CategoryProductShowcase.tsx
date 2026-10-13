'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Category } from '@/types/database';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryShowcaseItem {
  id: string;
  title: string;
  slug?: string;
  image_url?: string | null;
  price?: number | string | null;
  category_name?: string;
  href?: string;
  badge?: string;
}

export interface CategoryProductShowcaseProps {
  /** Category Name displayed as the main centered heading (e.g. "BADMINTON", "CRICKET", "FOOTBALL") */
  categoryName: string;
  /** Optional slug for collections link */
  categorySlug?: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Products to display - accepts Supabase Product[] or curated CategoryShowcaseItem[] */
  products?: (Product | CategoryShowcaseItem)[];
  /** Optional custom URL for "View Collection" */
  viewAllHref?: string;
  /** Additional container styling */
  className?: string;
  /** Show navigation arrows (default: true) */
  showArrows?: boolean;
}

// =========================================================================
// Single Studio Card Component (Faithful to Reference Image)
// =========================================================================
function StudioCard({ item }: { item: CategoryShowcaseItem }) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const targetHref = item.href || (item.slug ? `/products/${item.slug}` : '#');

  return (
    <Link
      href={targetHref}
      className="group relative block overflow-hidden rounded-none bg-[#09090b] transition-transform duration-300 ease-out hover:scale-[1.04] sm:hover:scale-105 hover:z-30 focus-visible:outline-none cursor-pointer aspect-[3/4] sm:aspect-auto sm:h-[430px] w-full origin-center will-change-transform"
    >
      {/* Skeleton Placeholder while image is loading */}
      {isImageLoading && !imageError && (
        <div className="absolute inset-0 z-10 bg-neutral-900 animate-pulse flex flex-col justify-between p-4">
          <div className="w-16 h-4 bg-neutral-800 rounded-none animate-pulse" />
          <div className="w-3/4 h-5 mx-auto bg-neutral-800 rounded-none animate-pulse" />
        </div>
      )}

      {/* 1. Full Image - Fills 100% of the entire card */}
      <div className="absolute inset-0 w-full h-full bg-black">
        {item.image_url && !imageError ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            quality={95}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover object-center transition-opacity duration-300",
              isImageLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setIsImageLoading(false);
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-white/30 text-xs p-4">
            <Sparkles className="h-10 w-10 text-white/40 mb-2 group-hover:text-[#E8192C] transition-colors" />
            <span className="font-sans uppercase tracking-wider text-[11px] text-white/50 text-center">
              {item.title}
            </span>
          </div>
        )}
      </div>

      {/* 2. Name placed at Bottom Center with black gradient background */}
      {item.title && (
        <div className="absolute inset-x-0 bottom-0 z-20 pt-10 sm:pt-14 pb-3 sm:pb-4 px-2 sm:px-3 bg-gradient-to-t from-black via-black/75 to-transparent flex items-end justify-center text-center pointer-events-none">
          <h3
            className="font-semibold text-[11px] sm:text-sm lg:text-[15px] uppercase tracking-wider text-white group-hover:text-[#E8192C] transition-colors line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
          >
            {item.title}
          </h3>
        </div>
      )}
    </Link>
  );
}

// =========================================================================
// Main Reusable Category Component (White Background)
// =========================================================================
export function CategoryProductShowcase({
  categoryName,
  categorySlug,
  subtitle,
  products,
  viewAllHref,
  className,
  showArrows = true,
}: CategoryProductShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const items: CategoryShowcaseItem[] = React.useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    return products.map((p) => {
      if ('category_id' in p) {
        // It's a Supabase Product
        const prod = p as Product;
        return {
          id: prod.id,
          title: prod.name,
          slug: prod.slug,
          image_url: prod.image_url,
          category_name: prod.category?.name || categoryName,
          href: `/products/${prod.slug}`,
        };
      }
      return p as CategoryShowcaseItem;
    });
  }, [products, categoryName]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -330, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 330, behavior: 'smooth' });
    }
  };

  const resolvedViewAll =
    viewAllHref || (categorySlug ? `/collections?category=${encodeURIComponent(categorySlug)}` : '/collections');

  if (items.length === 0) return null;

  return (
    <div className={cn('bg-white text-neutral-900 pt-0 pb-6 sm:pb-14 w-full', className)}>
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Category Heading Header (Left-aligned, Hero font, reduced bold, no underline) */}
        <div className="relative mb-6 sm:mb-8 flex items-end justify-between">
          <div className="flex flex-col items-start text-left">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.08em] text-neutral-900 leading-tight"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
            >
              {categoryName}
            </h2>

            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right-side controls: View All link + navigation arrows (Desktop Only) */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4">
            <Link
              href={resolvedViewAll}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] text-neutral-600 hover:text-black group transition-colors"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-neutral-900" />
            </Link>

            {showArrows && items.length > 3 && (
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollLeft}
                  aria-label="Previous items"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-neutral-300 hover:border-neutral-900 flex items-center justify-center text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  aria-label="Next items"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-neutral-300 hover:border-neutral-900 flex items-center justify-center text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 1. DESKTOP VIEW: Cards Row / Carousel with all items (UNCHANGED) */}
        <div
          ref={scrollRef}
          className="hidden sm:flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-3 pb-6 px-1 scroll-smooth"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[260px] md:w-[280px] lg:w-[290px] xl:w-[310px] shrink-0 snap-start relative z-10 hover:z-30"
            >
              <StudioCard item={item} />
            </div>
          ))}
        </div>

        {/* 2. MOBILE VIEW: 2-column grid showing 4 cards */}
        <div className="grid grid-cols-2 gap-3 pt-1 pb-2 sm:hidden">
          {items.slice(0, 4).map((item) => (
            <div key={item.id} className="relative z-10 w-full">
              <StudioCard item={item} />
            </div>
          ))}
        </div>

        {/* 3. MOBILE VIEW: View All button at bottom center */}
        <div className="mt-5 flex justify-center sm:hidden">
          <Link
            href={resolvedViewAll}
            className="inline-flex items-center justify-center gap-2 px-8 py-2.5 text-neutral-900 bg-transparent hover:bg-[#E8192C] hover:text-white active:bg-[#E8192C] active:text-white transition-colors text-xs font-bold uppercase tracking-[0.14em] rounded-none shadow-none group border border-[#E8192C]"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Multi-Category Section Component (Reusable container for multiple sports)
// =========================================================================
export interface SportCategoriesSectionProps {
  categories?: Category[];
  products?: Product[];
  groups?: Array<{
    name: string;
    slug?: string;
    subtitle?: string;
    products?: (Product | CategoryShowcaseItem)[];
  }>;
  className?: string;
}

export function SportCategoriesSection({
  categories,
  products = [],
  groups,
  className,
}: SportCategoriesSectionProps) {
  // If groups are explicitly provided, render them
  if (groups && groups.length > 0) {
    return (
      <section className={cn('bg-white border-0 border-none shadow-none', className)}>
        {groups.map((group) => (
          <CategoryProductShowcase
            key={group.name}
            categoryName={group.name}
            categorySlug={group.slug}
            subtitle={group.subtitle}
            products={group.products}
          />
        ))}
      </section>
    );
  }

  // If Supabase categories exist, group products by category
  if (categories && categories.length > 0) {
    const activeCategories = categories.filter((c) => c.is_active);

    const categoriesWithProducts = activeCategories.filter((cat) =>
      products.some(
        (p) => p.category_id === cat.id || p.category?.slug === cat.slug
      )
    );

    if (categoriesWithProducts.length === 0) {
      return null;
    }

    return (
      <section className={cn('bg-white border-0 border-none shadow-none', className)}>
        {categoriesWithProducts.map((cat) => {
          const categoryProducts = products.filter(
            (p) => p.category_id === cat.id || p.category?.slug === cat.slug
          );

          return (
            <CategoryProductShowcase
              key={cat.id}
              categoryName={cat.name}
              categorySlug={cat.slug}
              subtitle={cat.short_description || undefined}
              products={categoryProducts}
            />
          );
        })}
      </section>
    );
  }

  return null;
}

// =========================================================================
// Skeleton Components for Loading States
// =========================================================================
export function StudioCardSkeleton() {
  return (
    <div className="relative block overflow-hidden rounded-none bg-neutral-900 aspect-[3/4] sm:aspect-auto sm:h-[430px] w-full animate-pulse border border-neutral-800/60">
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900 to-neutral-800" />
      <div className="absolute bottom-4 inset-x-3 flex flex-col items-center gap-2">
        <div className="w-3/4 h-5 bg-neutral-800" />
      </div>
    </div>
  );
}

export function CategoryProductShowcaseSkeleton() {
  return (
    <div className="bg-white text-neutral-900 pt-0 pb-6 sm:pb-14 w-full animate-pulse">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8 flex items-end justify-between">
          <div className="w-44 sm:w-60 h-8 sm:h-10 bg-neutral-200" />
          <div className="hidden sm:block w-24 h-5 bg-neutral-200" />
        </div>

        {/* Desktop Carousel Skeleton */}
        <div className="hidden sm:flex gap-4 sm:gap-5 lg:gap-6 overflow-hidden pt-3 pb-6 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[260px] md:w-[280px] lg:w-[290px] xl:w-[310px] shrink-0">
              <StudioCardSkeleton />
            </div>
          ))}
        </div>

        {/* Mobile Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 pt-1 pb-2 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full">
              <StudioCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
