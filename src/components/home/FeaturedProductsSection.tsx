import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, CompanySettings } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ArrowRight, Tag } from 'lucide-react';

interface FeaturedProductsSectionProps {
  products: Product[];
  company?: CompanySettings | null;
}

export function FeaturedProductsSection({ products, company }: FeaturedProductsSectionProps) {
  // If there are no featured products from Supabase, cleanly hide the section (per requirements)
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#06080C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="EQUIPMENT & GEAR"
          title="FEATURED PRODUCTS"
          highlightWord="PRODUCTS"
          subtitle="Engineered for peak performance, tournaments and intense training"
          align="between"
          action={
            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-[#F5A623] hover:text-white transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group rounded-3xl overflow-hidden bg-gradient-to-b from-[#121622] to-[#0A0D14] flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black"
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

              {/* Product Info */}
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

                {/* WhatsApp Enquiry Button */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
