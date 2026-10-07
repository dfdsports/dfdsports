import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySlug, getActiveProducts } from '@/services/products';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppOrderModal } from '@/components/ui/WhatsAppOrderModal';
import { ProductDetailInteractive } from '@/components/products/ProductDetailInteractive';
import { Tag } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white">
      <Header company={company} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap">
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

        {/* Product Main Showcase & Interactive Actions */}
        <ProductDetailInteractive product={product} company={company} />

        {/* Long Description and Technical Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 border-t border-white/5 pt-12">
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
              <div className="rounded-2xl overflow-hidden bg-[#0E121B] border border-white/5 divide-y divide-white/5">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-3.5 text-xs">
                    <span className="font-semibold text-gray-400 uppercase tracking-wider">{key}</span>
                    <span className="font-mono text-gray-200">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0E121B] border border-white/5 text-xs text-gray-400">
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
