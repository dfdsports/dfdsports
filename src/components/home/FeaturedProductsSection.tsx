'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, CompanySettings } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FEATURED_BG_COLORS } from '@/lib/featuredColors';
import type { FeaturedColorOption } from '@/lib/featuredColors';
import { extractProductPrice } from '@/lib/productFilters';
import { CartItem } from '@/components/layout/Header';
import { addToCart } from '@/lib/cart';
import { Tag, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturedSettings {
  colorId: string;
  color: FeaturedColorOption;
  /** Per-card override: productId → colorId */
  cardColors?: Record<string, string>;
}

interface FeaturedProductsSectionProps {
  products: Product[];
  company?: CompanySettings | null;
  settings?: FeaturedSettings | null;
  /** Short text shown under the heading on the left */
  description?: string;
}

const DEFAULT_DESCRIPTION =
  'Hand-picked gear our team trusts. Browse the top picks and open any product for full details.';

function FeaturedProductCard({
  product,
  cardBg,
}: {
  product: Product;
  cardBg: string;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const price = extractProductPrice(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      addToCart(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: price ?? undefined,
          quantity: 1,
          image: product.image_url ?? undefined,
          size: product.sizes?.[0] || undefined,
        },
        { openCart: true }
      );

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);
    } catch (err) {
      console.warn('Failed to add to cart:', err);
    }
  };

  return (
    <div className="group block focus-visible:outline-none">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-sm transition-shadow duration-300 !bg-white group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-[#F5A623] transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: cardBg }}
      >
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full h-full block"
          tabIndex={-1}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain  motion-reduce:transition-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/40">
              <Tag className="h-8 w-8" />
            </div>
          )}
        </Link>

        {/* Mobile View: Round Add to Cart icon on image bottom right side */}
        <button
          type="button"
          onClick={handleAddToCart}
          title={isAdded ? 'Added to cart' : 'Add to cart'}
          aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
          className={cn(
            'sm:hidden absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer active:scale-90',
            isAdded
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-amber-500 text-white hover:bg-amber-400 shadow-amber-500/20'
          )}
        >
          {isAdded ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <ShoppingCart className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Desktop Hover Action: Add to Cart button slides up smoothly */}
        <div className="hidden sm:block absolute inset-x-3 bottom-3 z-20 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            className={cn(
              'w-full py-2.5 px-3 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all duration-200 cursor-pointer active:scale-95',
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            )}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Link href={`/products/${product.slug}`} className="block">
        <h3 className="mt-3 line-clamp-2 text-center text-sm font-semibold text-white group-hover:text-amber-400 transition-colors sm:text-base uppercase">
          {product.name}
        </h3>
      </Link>
    </div>
  );
}

export function FeaturedProductsSection({
  products,
  settings,
  description = DEFAULT_DESCRIPTION,
}: FeaturedProductsSectionProps) {
  if (!products || products.length === 0) return null;

  const sectionColor = settings?.color ?? FEATURED_BG_COLORS[0];

  /** Card background: per-card override or section default */
  const getCardBg = (productId: string): string => {
    const overrideId = settings?.cardColors?.[productId];
    if (overrideId) {
      const override = FEATURED_BG_COLORS.find((c) => c.id === overrideId);
      if (override) return override.cardBg;
    }
    return sectionColor.cardBg;
  };

  return (
    <section style={{ backgroundColor: sectionColor.sectionBg }} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: heading, then short description, both left-aligned */}
        <div className="mb-10 sm:mb-12">
          <SectionHeading
            eyebrow="Equipment & gear"
            title="Featured products"
            highlightWord="products"
            align="left"
            className="!mb-0 !pb-0 [&_*]:!mb-0 [&_*]:!pb-0"
          />
          <p className="hidden sm:block mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {description}
          </p>
        </div>

        {/* Bottom: products */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <FeaturedProductCard
              key={p.id}
              product={p}
              cardBg={getCardBg(p.id)}
            />
          ))}
        </div>

        {/* Section Bottom: View All Button redirecting to /collections with new arrival filter */}
        <div className="mt-10 sm:mt-14 flex justify-center">
          <Link
            href="/collections?sort=newest"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>View All</span>
          </Link>
        </div>
      </div>
    </section>
  );
}