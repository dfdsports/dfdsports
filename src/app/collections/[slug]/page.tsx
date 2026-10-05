import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getActiveCategories } from '@/services/categories';
import { getActiveProducts } from '@/services/products';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag, ArrowLeft, ArrowRight } from 'lucide-react';

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [company, category, allCategories] = await Promise.all([
    getCompanySettings(),
    getCategoryBySlug(slug),
    getActiveCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const products = await getActiveProducts({
    categoryId: category.id,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white">
      <Header company={company} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Back Link */}
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Sports Collections</span>
        </Link>

        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141925] via-[#0E121B] to-[#0A0D14] p-8 sm:p-12 mb-12 shadow-2xl">
          {category.image_url && (
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none">
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E121B] via-[#0E121B]/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#F5A623] mb-2">
              SPORTS CATEGORY
            </p>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
              {category.name}
            </h1>
            {category.short_description && (
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
                {category.short_description}
              </p>
            )}

            <WhatsAppButton
              phoneNumber={company?.whatsapp_number}
              type="category"
              categoryName={category.name}
              variant="whatsapp"
              size="md"
            >
              Enquire About {category.name} Gear
            </WhatsAppButton>
          </div>
        </div>

        {/* Products in this category */}
        {products.length === 0 ? (
          <EmptyState
            icon={Tag}
            title={`No products currently listed under ${category.name}`}
            description="Our equipment catalog is updated regularly. Feel free to enquire directly on WhatsApp for special orders."
            actionText="Chat with DFD Sports on WhatsApp"
            actionHref={`https://wa.me/${company?.whatsapp_number || ''}?text=${encodeURIComponent(`Hi DFD Sports, I am looking for ${category.name} equipment.`)}`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-3xl overflow-hidden bg-gradient-to-b from-[#121622] to-[#0A0D14] flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
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
                </Link>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
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
                      <span>Specifications</span>
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
