import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveCategories } from '@/services/categories';
import { getActiveProducts } from '@/services/products';
import { getActiveBrands } from '@/services/brands';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag, Trophy, ArrowRight } from 'lucide-react';

export const revalidate = 60;

interface CollectionsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
  }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { category: categorySlug, brand: brandSlug } = await searchParams;

  const [company, categories, products, brands] = await Promise.all([
    getCompanySettings(),
    getActiveCategories(),
    getActiveProducts({
      categorySlug: categorySlug,
    }),
    getActiveBrands(),
  ]);

  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white">
      <Header company={company} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#F5A623] mb-2">
            CATALOG & GEAR
          </p>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            {selectedCategory ? `${selectedCategory.name} COLLECTION` : 'ALL SPORTS COLLECTIONS'}
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Browse genuine sports equipment, team jerseys and training accessories. Enquire directly on WhatsApp for live availability and quotations.
          </p>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
            <Link
              href="/collections"
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                !categorySlug
                  ? 'bg-[#F5A623] text-[#080A0F] shadow-lg shadow-[#F5A623]/20'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              All Categories
            </Link>

            {categories.map((cat) => {
              const isSelected = cat.slug === categorySlug;
              return (
                <Link
                  key={cat.id}
                  href={`/collections?category=${cat.slug}`}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#F5A623] text-[#080A0F] shadow-lg shadow-[#F5A623]/20'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Products Grid or Empty State */}
        {products.length === 0 ? (
          <EmptyState
            icon={Tag}
            title={selectedCategory ? `No products in ${selectedCategory.name}` : 'No products available yet'}
            description="Products added in the Admin CMS will appear here in real-time."
            actionText="Browse Categories"
            actionHref="/collections"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-3xl overflow-hidden bg-gradient-to-b from-[#121622] to-[#0A0D14] flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative aspect-square w-full bg-[#0E121B] flex items-center justify-center p-6 overflow-hidden block"
                >
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-600">
                      <Tag className="w-10 h-10 mb-2 text-gray-500" />
                      <span className="text-xs uppercase tracking-wider">Product Gear</span>
                    </div>
                  )}

                  {product.brand?.name && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      {product.brand.name}
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    {product.category?.name && (
                      <p className="text-[11px] font-semibold text-[#F5A623] uppercase tracking-wider mb-1">
                        {product.category.name}
                      </p>
                    )}
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-base font-bold text-white group-hover:text-[#F5A623] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    {product.short_description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex flex-col gap-2">
                    <WhatsAppButton
                      phoneNumber={company?.whatsapp_number}
                      type="product"
                      productName={product.name}
                      variant="whatsapp"
                      size="sm"
                      className="w-full justify-center"
                    >
                      Enquire on WhatsApp
                    </WhatsAppButton>

                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center justify-center text-xs font-semibold text-gray-400 hover:text-white py-1 transition-colors"
                    >
                      <span>View Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer company={company} />
    </div>
  );
}
