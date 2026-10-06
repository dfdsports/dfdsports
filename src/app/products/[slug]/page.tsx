import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySlug, getActiveProducts } from '@/services/products';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppOrderModal } from '@/components/ui/WhatsAppOrderModal';
import {
  ArrowLeft,
  CheckCircle,
  Truck,
  ShieldCheck,
  Tag,
  Info,
  Layers,
} from 'lucide-react';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [company, product] = await Promise.all([
    getCompanySettings(),
    getProductBySlug(slug),
  ]);

  if (!product) {
    notFound();
  }

  // Related products under the same category
  const relatedProducts = product.category_id
    ? (await getActiveProducts({ categoryId: product.category_id, limit: 4 })).filter(
        (p) => p.id !== product.id
      )
    : [];

  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.images || []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white">
      <Header company={company} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-8">
          <Link href="/collections" className="hover:text-white transition-colors">
            Collections
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                href={`/collections/${product.category.slug}`}
                className="hover:text-white transition-colors"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#F5A623] truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Main Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left Column: Image Viewer */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#141924] to-[#0A0D14] flex items-center justify-center p-8 shadow-2xl">
              {allImages.length > 0 ? (
                <Image
                  src={allImages[0]}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-6"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-600">
                  <Tag className="w-16 h-16 mb-2" />
                  <span className="text-xs uppercase tracking-widest">No Image Available</span>
                </div>
              )}

              {product.brand?.name && (
                <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 uppercase tracking-widest">
                  {product.brand.name}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery if multiple images exist */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#10141E] p-2 shrink-0 border border-white/5 hover:border-[#F5A623] transition-colors"
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Quotation CTA */}
          <div className="lg:col-span-6 flex flex-col">
            {product.category && (
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#F5A623] mb-2">
                {product.category.name}
              </p>
            )}

            <h1 className="text-3xl sm:text-4xl  font-black uppercase tracking-tight text-white mb-4">
              {product.name}
            </h1>

            {product.short_description && (
              <p className="text-base text-gray-300 leading-relaxed mb-6 font-normal">
                {product.short_description}
              </p>
            )}

            {/* Sizes Chips if available */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Available Sizes / Specs:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="px-3.5 py-1.5 rounded-lg bg-white/5 text-xs font-mono font-bold text-gray-200"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features Bullet List */}
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
                  Highlights & Features:
                </span>
                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl bg-gradient-to-r from-[#141924] to-[#0F131C] p-6 shadow-xl mb-8">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#F5A623] mb-1">
                WHATSAPP ORDER
              </p>
              <h3 className="text-base font-bold text-white mb-2">
                Order via WhatsApp – Fast &amp; Easy
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                Fill in your details and we&apos;ll process your order instantly. We supply schools, academies, clubs and tournaments pan-India.
              </p>

              <WhatsAppOrderModal
                whatsappNumber={company?.whatsapp_number}
                productName={product.name}
                productCategory={product.category?.name}
                productSizes={product.sizes}
                label="Order on WhatsApp"
                size="lg"
                className="w-full"
              />
            </div>

            {/* Supply Guarantee Pills */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#F5A623]" />
                <span>Pan-India Safe Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                <span>100% Genuine Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Long Description and Technical Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 border-t border-white/5 pt-12">
          {/* Long description */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4">
              Product Overview
            </h3>
            {product.long_description ? (
              <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {product.long_description}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {product.short_description || 'Detailed specifications and batch pricing available upon enquiry.'}
              </p>
            )}
          </div>

          {/* Technical Specs Key-Value Table */}
          <div className="lg:col-span-5">
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4">
              Specifications
            </h3>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="rounded-2xl overflow-hidden bg-[#0E121B] divide-y divide-white/5">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-3.5 text-xs">
                    <span className="font-semibold text-gray-400 uppercase tracking-wider">{key}</span>
                    <span className="font-mono text-gray-200">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/5 text-xs text-gray-400">
                Detailed technical specifications provided upon quotation request.
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-white/5 pt-16">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-8">
              Related Equipment & Gear
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0E121B] flex flex-col justify-between shadow-lg hover:-translate-y-1 transition-all border border-white/5"
                >
                  <Link
                    href={`/products/${rel.slug}`}
                    className="relative aspect-square w-full bg-[#121622] p-2 sm:p-4 flex items-center justify-center"
                  >
                    {rel.image_url ? (
                      <Image
                        src={rel.image_url}
                        alt={rel.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-contain p-2 sm:p-4"
                      />
                    ) : (
                      <Tag className="w-8 h-8 text-gray-600" />
                    )}
                  </Link>

                  <div className="p-3 sm:p-5 flex flex-col justify-between flex-1">
                    <Link href={`/products/${rel.slug}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-white hover:text-[#F5A623] transition-colors line-clamp-2">
                        {rel.name}
                      </h4>
                    </Link>
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5">
                      <WhatsAppOrderModal
                        whatsappNumber={company?.whatsapp_number}
                        productName={rel.name}
                        productCategory={rel.category?.name}
                        productSizes={rel.sizes}
                        label="Order"
                        size="sm"
                        className="w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer company={company} />
    </div>
  );
}
