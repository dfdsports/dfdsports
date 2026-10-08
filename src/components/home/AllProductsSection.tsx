import React from 'react';
import Link from 'next/link';
import { Product, CompanySettings } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductCard } from '@/components/ui/ProductCard';
import { ArrowRight } from 'lucide-react';

interface AllProductsSectionProps {
  products: Product[];
  company?: CompanySettings | null;
  description?: string;
}

const DEFAULT_DESCRIPTION =
  'Explore our full range of sports equipment, training essentials, and team gear.';

export function AllProductsSection({
  products,
  company,
  description = DEFAULT_DESCRIPTION,
}: AllProductsSectionProps) {
  if (!products || products.length === 0) return null;

  // Show up to 10 products total (2 rows of 5 on desktop)
  const displayProducts = products.slice(0, 10);

  return (
    <section className="bg-[#080A0F] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <SectionHeading
            eyebrow="DFD Sports Catalog"
            title="All products"
            highlightWord="products"
            align="left"
            className="!mb-0 !pb-0 [&_*]:!mb-0 [&_*]:!pb-0"
          />
          <p className="hidden sm:block mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {description}
          </p>
        </div>

        {/* 5 products in first row on desktop, 10 products total */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {displayProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              company={company}
              priority={idx < 5}
            />
          ))}
        </div>

        {/* Section Bottom: View All Button redirecting to /collections */}
        <div className="mt-10 sm:mt-14 flex justify-center">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>View All</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
