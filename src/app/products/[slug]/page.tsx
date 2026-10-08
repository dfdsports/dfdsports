import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getActiveProducts } from '@/services/products';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailInteractive } from '@/components/products/ProductDetailInteractive';

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
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 pt-12">
          {/* Long description */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-black uppercase font-semibold text-white mb-4">
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
            <h3 className="text-xl font-black uppercase font-semibold tracking-tight text-white mb-4">
              Specifications
            </h3>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="rounded-2xl overflow-hidden bg-[#0E121B]">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-3.5 text-xs">
                    <span className="font-semibold text-gray-400 uppercase tracking-wider">{key}</span>
                    <span className="font-mono text-gray-200">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0E121B] text-xs text-gray-400">
                Detailed technical specifications provided upon quotation request.
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-16">
            <h3 className="text-2xl font-black font-semibold uppercase text-white mb-8">
              Related Equipment & Gear
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  company={company}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer company={company} />
    </div>
  );
}
