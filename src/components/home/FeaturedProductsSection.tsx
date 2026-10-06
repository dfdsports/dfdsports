import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, CompanySettings } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FEATURED_BG_COLORS } from '@/lib/featuredColors';
import type { FeaturedColorOption } from '@/lib/featuredColors';
import { Tag } from 'lucide-react';

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
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {description}
          </p>
        </div>

        {/* Bottom: products */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group block focus-visible:outline-none"
            >
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-2xl transition-shadow duration-300 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-[#F5A623]"
                style={{ backgroundColor: getCardBg(p.id) }}
              >
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/40">
                    <Tag className="h-8 w-8" />
                  </div>
                )}
              </div>
              <h3 className="mt-3 line-clamp-2 text-center text-sm font-semibold text-white sm:text-base">
                {p.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}