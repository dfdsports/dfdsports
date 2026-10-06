'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Product, Category, Brand, CompanySettings } from '@/types/database';
import { FilterSidebar } from './FilterSidebar';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import {
  getProductPriceBounds,
  filterAndSortProducts,
  extractProductPrice,
  FilterState,
} from '@/lib/productFilters';
import {
  Tag,
  ArrowRight,
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionsCatalogProps {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
  company?: CompanySettings | null;
  initialParams?: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    search?: string;
    sort?: string;
  };
}

export function CollectionsCatalog({
  initialProducts,
  categories,
  brands,
  company,
  initialParams,
}: CollectionsCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Dynamic price bounds
  const priceBounds = useMemo(() => {
    return getProductPriceBounds(initialProducts);
  }, [initialProducts]);

  // Parse initial state
  const parseCategories = useCallback((): string[] => {
    const param = searchParams.get('category') ?? initialParams?.category;
    if (!param) return [];
    return param.split(',').map((s) => s.trim()).filter(Boolean);
  }, [searchParams, initialParams]);

  const parseBrands = useCallback((): string[] => {
    const param = searchParams.get('brand') ?? initialParams?.brand;
    if (!param) return [];
    return param.split(',').map((s) => s.trim()).filter(Boolean);
  }, [searchParams, initialParams]);

  const parseMinPrice = useCallback((): number => {
    const param = searchParams.get('minPrice') ?? initialParams?.minPrice;
    if (param && !isNaN(Number(param))) {
      return Math.max(priceBounds.min, Number(param));
    }
    return priceBounds.min;
  }, [searchParams, initialParams, priceBounds.min]);

  const parseMaxPrice = useCallback((): number => {
    const param = searchParams.get('maxPrice') ?? initialParams?.maxPrice;
    if (param && !isNaN(Number(param))) {
      return Math.min(priceBounds.max, Number(param));
    }
    return priceBounds.max;
  }, [searchParams, initialParams, priceBounds.max]);

  const parseSearchQuery = useCallback((): string => {
    return searchParams.get('q') ?? searchParams.get('search') ?? initialParams?.q ?? '';
  }, [searchParams, initialParams]);

  const parseSortBy = useCallback((): string => {
    return searchParams.get('sort') ?? initialParams?.sort ?? 'featured';
  }, [searchParams, initialParams]);

  // Local state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(parseCategories);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(parseBrands);
  const [priceRange, setPriceRange] = useState<[number, number]>([parseMinPrice(), parseMaxPrice()]);
  const [searchQuery, setSearchQuery] = useState<string>(parseSearchQuery);
  const [sortBy, setSortBy] = useState<string>(parseSortBy);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Sync state with URL when back/forward occurs
  useEffect(() => {
    setSelectedCategories(parseCategories());
    setSelectedBrands(parseBrands());
    setPriceRange([parseMinPrice(), parseMaxPrice()]);
    setSearchQuery(parseSearchQuery());
    setSortBy(parseSortBy());
  }, [searchParams, parseCategories, parseBrands, parseMinPrice, parseMaxPrice, parseSearchQuery, parseSortBy]);

  // Lock body scroll for mobile drawer
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Debounced URL updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateUrlParams = useCallback(
    (
      newCategories: string[],
      newBrands: string[],
      newPrice: [number, number],
      newQuery: string,
      newSort: string
    ) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams();

        if (newCategories.length > 0) {
          params.set('category', newCategories.join(','));
        }
        if (newBrands.length > 0) {
          params.set('brand', newBrands.join(','));
        }
        if (newPrice[0] > priceBounds.min) {
          params.set('minPrice', newPrice[0].toString());
        }
        if (newPrice[1] < priceBounds.max) {
          params.set('maxPrice', newPrice[1].toString());
        }
        if (newQuery.trim().length > 0) {
          params.set('q', newQuery.trim());
        }
        if (newSort && newSort !== 'featured') {
          params.set('sort', newSort);
        }

        const queryString = params.toString();
        const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
        window.history.replaceState(null, '', nextUrl);
      }, 250);
    },
    [pathname, priceBounds]
  );

  // Handlers
  const handleToggleCategory = (slug: string) => {
    const updated = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug];
    setSelectedCategories(updated);
    updateUrlParams(updated, selectedBrands, priceRange, searchQuery, sortBy);
  };

  const handleToggleBrand = (slug: string) => {
    const updated = selectedBrands.includes(slug)
      ? selectedBrands.filter((s) => s !== slug)
      : [...selectedBrands, slug];
    setSelectedBrands(updated);
    updateUrlParams(selectedCategories, updated, priceRange, searchQuery, sortBy);
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    updateUrlParams(selectedCategories, selectedBrands, [min, max], searchQuery, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateUrlParams(selectedCategories, selectedBrands, priceRange, searchQuery, newSort);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSearchQuery('');
    setSortBy('featured');
    updateUrlParams([], [], [priceBounds.min, priceBounds.max], '', 'featured');
  };

  const handleRemoveCategory = (slug: string) => {
    handleToggleCategory(slug);
  };

  const handleRemoveBrand = (slug: string) => {
    handleToggleBrand(slug);
  };

  const handleResetPrice = () => {
    handlePriceChange(priceBounds.min, priceBounds.max);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    updateUrlParams(selectedCategories, selectedBrands, priceRange, '', sortBy);
  };

  // Active filter status
  const isPriceFiltered = priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max;
  const isSearchFiltered = searchQuery.trim().length > 0;
  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (isPriceFiltered ? 1 : 0) +
    (isSearchFiltered ? 1 : 0);

  // Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of initialProducts) {
      if (p.category?.slug) {
        counts[p.category.slug] = (counts[p.category.slug] || 0) + 1;
      }
    }
    return counts;
  }, [initialProducts]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of initialProducts) {
      if (p.brand?.slug) {
        counts[p.brand.slug] = (counts[p.brand.slug] || 0) + 1;
      }
    }
    return counts;
  }, [initialProducts]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const filterState: FilterState = {
      categories: selectedCategories,
      brands: selectedBrands,
      minPrice: isPriceFiltered ? priceRange[0] : undefined,
      maxPrice: isPriceFiltered ? priceRange[1] : undefined,
      searchQuery: searchQuery,
      sortBy: sortBy,
    };
    return filterAndSortProducts(initialProducts, filterState, priceBounds);
  }, [initialProducts, selectedCategories, selectedBrands, isPriceFiltered, priceRange, searchQuery, sortBy, priceBounds]);

  const singleSelectedCategory =
    selectedCategories.length === 1
      ? categories.find((c) => c.slug === selectedCategories[0])
      : null;

  return (
    <div className="w-full">
      {/* ================= Header Title Section ================= */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#F5A623] mb-2">
          CATALOG & GEAR
        </p>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          {singleSelectedCategory
            ? `${singleSelectedCategory.name} COLLECTION`
            : selectedCategories.length > 1
            ? 'FILTERED SPORTS COLLECTIONS'
            : 'ALL SPORTS COLLECTIONS'}
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
          Browse genuine sports equipment, team jerseys and training accessories. Enquire directly on
          WhatsApp for live availability and quotations.
        </p>
      </div>

      {/* ================= Mobile/Tablet Filter Trigger Bar (< md) ================= */}
      <div className="md:hidden flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-[#0E121B] border border-white/10 shadow-lg">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#F5A623]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#F5A623] text-[#080A0F] text-[10px] font-black">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="relative flex-1">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-[#F5A623] pr-8"
          >
            <option value="featured" className="bg-[#0B0E14] text-white">Sort: Featured</option>
            <option value="price-low" className="bg-[#0B0E14] text-white">Price: Low to High</option>
            <option value="price-high" className="bg-[#0B0E14] text-white">Price: High to Low</option>
            <option value="name-asc" className="bg-[#0B0E14] text-white">Name: A to Z</option>
            <option value="name-desc" className="bg-[#0B0E14] text-white">Name: Z to A</option>
            <option value="newest" className="bg-[#0B0E14] text-white">Newest Arrivals</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ================= Main Layout: Sidebar on Left, Products on Right ================= */}
      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
        {/* ================= Filter Sidebar (Desktop & Tablet: md and up) ================= */}
        <div className="hidden md:block w-64 lg:w-72 xl:w-80 shrink-0 sticky top-28">
          <FilterSidebar
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            priceRange={priceRange}
            priceBounds={priceBounds}
            onToggleCategory={handleToggleCategory}
            onToggleBrand={handleToggleBrand}
            onPriceChange={handlePriceChange}
            onClearAll={handleClearAll}
            activeFilterCount={activeFilterCount}
            categoryCounts={categoryCounts}
            brandCounts={brandCounts}
          />
        </div>

        {/* ================= Products Area ================= */}
        <div className="flex-1 min-w-0 w-full">
          {/* Top Bar above Product Grid */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
            {/* Dynamic Product Count */}
            <div className="flex items-center gap-2">
              <span className="text-base font-black uppercase tracking-wider text-white">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </span>
              {filteredProducts.length !== initialProducts.length && (
                <span className="text-xs text-gray-400 font-medium">
                  (of {initialProducts.length} total)
                </span>
              )}
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden md:flex items-center gap-2.5">
              <label htmlFor="desktop-sort" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="desktop-sort"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none px-4 py-2 rounded-xl bg-[#0E121B] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#F5A623] pr-8 cursor-pointer hover:border-white/20 transition-colors"
                >
                  <option value="featured" className="bg-[#0B0E14] text-white">Featured</option>
                  <option value="price-low" className="bg-[#0B0E14] text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-[#0B0E14] text-white">Price: High to Low</option>
                  <option value="name-asc" className="bg-[#0B0E14] text-white">Name: A to Z</option>
                  <option value="name-desc" className="bg-[#0B0E14] text-white">Name: Z to A</option>
                  <option value="newest" className="bg-[#0B0E14] text-white">Newest Arrivals</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in duration-200">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">
                Active Filters:
              </span>

              {/* Categories */}
              {selectedCategories.map((catSlug) => {
                const catObj = categories.find((c) => c.slug === catSlug);
                return (
                  <button
                    key={catSlug}
                    type="button"
                    onClick={() => handleRemoveCategory(catSlug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/30 text-xs font-semibold text-[#F5A623] hover:bg-[#F5A623]/20 transition-all group cursor-pointer"
                  >
                    <span>{catObj?.name || catSlug}</span>
                    <X className="w-3 h-3 text-[#F5A623] group-hover:scale-125 transition-transform" />
                  </button>
                );
              })}

              {/* Brands */}
              {selectedBrands.map((brandSlug) => {
                const brandObj = brands.find((b) => b.slug === brandSlug);
                return (
                  <button
                    key={brandSlug}
                    type="button"
                    onClick={() => handleRemoveBrand(brandSlug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-all group cursor-pointer"
                  >
                    <span>{brandObj?.name || brandSlug}</span>
                    <X className="w-3 h-3 text-blue-300 group-hover:scale-125 transition-transform" />
                  </button>
                );
              })}

              {/* Price Range */}
              {isPriceFiltered && (
                <button
                  type="button"
                  onClick={handleResetPrice}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all group cursor-pointer"
                >
                  <span>
                    ₹{priceRange[0].toLocaleString('en-IN')} — ₹{priceRange[1].toLocaleString('en-IN')}
                  </span>
                  <X className="w-3 h-3 text-emerald-300 group-hover:scale-125 transition-transform" />
                </button>
              )}

              {/* Search Query */}
              {isSearchFiltered && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all group cursor-pointer"
                >
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <X className="w-3 h-3 text-purple-300 group-hover:scale-125 transition-transform" />
                </button>
              )}

              {/* Clear All Link */}
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-gray-400 hover:text-white underline underline-offset-4 ml-1 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid / Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 px-4 rounded-3xl bg-[#0E121B] border border-white/5 flex flex-col items-center justify-center text-center shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 mb-4">
                <Tag className="w-8 h-8 text-[#F5A623]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
                No products found
              </h3>
              <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
                No products match your selected filter criteria. Try adjusting your categories, brands, or price range.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-6 py-3 rounded-xl bg-[#F5A623] hover:bg-[#e09418] text-[#080A0F] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#F5A623]/20 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const productPrice = extractProductPrice(product);

                return (
                  <div
                    key={product.id}
                    className="group rounded-3xl overflow-hidden bg-gradient-to-b from-[#121622] to-[#0A0D14] flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-white/5"
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

                      {productPrice != null && (
                        <div className="absolute top-4 right-4 bg-[#F5A623] text-[#080A0F] px-2.5 py-1 rounded-md text-xs font-black tracking-tight shadow-md">
                          ₹{productPrice.toLocaleString('en-IN')}
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= Mobile Filter Drawer (Modal Sheet: < md) ================= */}
      <div
        className={cn(
          'fixed inset-0 z-[100] transition-[opacity,visibility] duration-300 md:hidden',
          mobileDrawerOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!mobileDrawerOpen}
      >
        {/* Backdrop blur overlay */}
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="absolute inset-0 bg-[#080A0F]/80 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Panel from Left */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-full max-w-sm bg-[#0B0E14] border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out',
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0D111A]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F5A623]/10 text-[#F5A623]">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Filters</h2>
                <p className="text-xs text-gray-400">
                  {filteredProducts.length} matching products
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              priceRange={priceRange}
              priceBounds={priceBounds}
              onToggleCategory={handleToggleCategory}
              onToggleBrand={handleToggleBrand}
              onPriceChange={handlePriceChange}
              onClearAll={handleClearAll}
              activeFilterCount={activeFilterCount}
              categoryCounts={categoryCounts}
              brandCounts={brandCounts}
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>

          {/* Drawer Sticky Footer with CTA */}
          <div className="p-5 border-t border-white/10 bg-[#0D111A] flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex-1 py-3.5 px-4 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#F5A623]/20 transition-all active:scale-98 cursor-pointer"
            >
              <span>Show {filteredProducts.length} Products</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
