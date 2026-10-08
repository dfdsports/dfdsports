import React from 'react';
import type { Metadata } from 'next';
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
import { ProductCard } from '@/components/ui/ProductCard';
import { Tag, ArrowLeft, ArrowRight } from 'lucide-react';

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found | DFD Sports',
    };
  }

  const title = category.seo_title || `${category.name} | DFD Sports`;
  const description =
    category.seo_description ||
    category.short_description ||
    `Browse ${category.name} sports equipment and apparel at DFD Sports.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: category.image_url ? [{ url: category.image_url, alt: category.name }] : undefined,
    },
  };
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
          className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Sports Collections</span>
        </Link>

        {/* Category Hero Banner */}
        <div className="relative rounded-xl sm:rounded-sm overflow-hidden bg-[#0E121B] py-6 px-6 sm:py-8 sm:px-10 lg:px-12 mb-10 shadow-xl flex items-center min-h-[160px] sm:min-h-[180px]">
          {/* Background image full of section right side */}
          {category.image_url && (
            <div className="absolute right-0 inset-y-0 w-full sm:w-1/2 md:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden">
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E121B] via-[#0E121B]/60 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-lg">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-[#F5A623] mb-1.5">
              SPORTS CATEGORY
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold uppercase tracking-tight text-white mb-3 sm:mb-4">
              {category.name}
            </h1>
            {category.short_description && (
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4 max-w-md line-clamp-2">
                {category.short_description}
              </p>
            )}

            <WhatsAppButton
              phoneNumber={company?.whatsapp_number}
              type="category"
              categoryName={category.name}
              variant="whatsapp"
              size="sm"
              className="!rounded-sm shadow-md !text-xs sm:!text-sm !px-3.5 sm:!px-4 !py-2 w-fit max-w-max"
            >
              <span className="sm:hidden">Enquire Now</span>
              <span className="hidden sm:inline">Enquire About {category.name}</span>
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
            actionClassName="!rounded-sm"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                company={company}
              />
            ))}
          </div>
        )}
      </main>

      <Footer company={company} />
    </div>
  );
}
