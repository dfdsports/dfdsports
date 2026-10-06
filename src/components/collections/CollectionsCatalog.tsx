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
  Search,
  Check,
  ChevronDown,
  Flame,
  ArrowDownAZ,
  ArrowUpZA,
  Sparkles,
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
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [desktopSortOpen, setDesktopSortOpen] = useState(false);

  const desktopSortRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    {
      value: 'featured',
      label: 'Featured',
      subtitle: 'DFD Sports recommendations',
      icon: Flame,
    },
    {
      value: 'newest',
      label: 'Newest Arrivals',
      subtitle: 'Latest gear in stock',
      icon: Sparkles,
    },
    {
      value: 'name-asc',
      label: 'Name: A to Z',
      subtitle: 'Alphabetical ascending order',
      icon: ArrowDownAZ,
    },
    {
      value: 'name-desc',
      label: 'Name: Z to A',
      subtitle: 'Alphabetical descending order',
      icon: ArrowUpZA,
    },
  ];

  // Close desktop sort dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopSortRef.current && !desktopSortRef.current.contains(e.target as Node)) {
        setDesktopSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state with URL when back/forward occurs
  useEffect(() => {
    setSelectedCategories(parseCategories());
    setSelectedBrands(parseBrands());
    setPriceRange([parseMinPrice(), parseMaxPrice()]);
    setSearchQuery(parseSearchQuery());
    setSortBy(parseSortBy());
  }, [searchParams, parseCategories, parseBrands, parseMinPrice, parseMaxPrice, parseSearchQuery, parseSortBy]);

  // Lock body scroll for mobile drawers
  useEffect(() => {
    if (mobileDrawerOpen || mobileSortOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen, mobileSortOpen]);

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

  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    updateUrlParams(selectedCategories, selectedBrands, priceRange, newQuery, sortBy);
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

  return (
    <div className="w-full pb-28 md:pb-0">
      {/* ================= Header Title Section ================= */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
          Collections
        </h1>
      </div>

      {/* ================= Mobile Floating Bottom Filter & Sort Capsule (< md) ================= */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-[#0C101A]/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.9)] max-w-xs w-full">
          {/* Mobile Filter Pill Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm',
              activeFilterCount > 0
                ? 'bg-[#F5A623] text-[#080A0F] shadow-lg shadow-[#F5A623]/30'
                : 'bg-white/10 hover:bg-white/15 text-white'
            )}
          >
            <SlidersHorizontal className={cn('w-3.5 h-3.5', activeFilterCount > 0 ? 'text-[#080A0F]' : 'text-[#F5A623]')} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#080A0F] text-[#F5A623] text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Vertical Separator */}
          <div className="h-4 w-px bg-white/15 shrink-0" />

          {/* Mobile Sort Pill Button */}
          <button
            type="button"
            onClick={() => setMobileSortOpen(true)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer truncate',
              sortBy !== 'featured'
                ? 'bg-amber-500/20 text-[#F5A623] border border-amber-500/40'
                : 'bg-white/10 hover:bg-white/15 text-white'
            )}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
            <span className="truncate">
              {sortOptions.find((o) => o.value === sortBy)?.label || 'Sort'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
            {/* Left: Product Count */}
            <div className="flex items-center gap-2 shrink-0">
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

            {/* Right: Modern Search Input + Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Inline Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Filter catalog products..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0E121B] border border-white/10 text-xs font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Desktop Custom Sort Dropdown */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Sort:
                </span>
                <div className="relative" ref={desktopSortRef}>
                  <button
                    type="button"
                    onClick={() => setDesktopSortOpen(!desktopSortOpen)}
                    className={cn(
                      'flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-inner',
                      desktopSortOpen
                        ? 'bg-[#141925] border-amber-400 text-amber-300'
                        : sortBy !== 'featured'
                        ? 'bg-[#141925] border-amber-500/40 text-white'
                        : 'bg-[#0E121B] hover:bg-white/10 border-white/10 hover:border-amber-500/40 text-white'
                    )}
                  >
                    {(() => {
                      const currentOpt = sortOptions.find((o) => o.value === sortBy) || sortOptions[0];
                      const Icon = currentOpt.icon;
                      return (
                        <>
                          <Icon className="w-3.5 h-3.5 text-[#F5A623]" />
                          <span>{currentOpt.label}</span>
                        </>
                      );
                    })()}
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
                        desktopSortOpen && 'rotate-180 text-[#F5A623]'
                      )}
                    />
                  </button>

                  {desktopSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-[#0C101A]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-white/5 mb-1 flex items-center justify-between">
                        <span>Sort Products By</span>
                        <ArrowUpDown className="w-3 h-3 text-amber-400" />
                      </div>
                      {sortOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              handleSortChange(opt.value);
                              setDesktopSortOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left group',
                              isSelected
                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-[#F5A623] font-bold border border-amber-500/30'
                                : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                                  isSelected
                                    ? 'bg-amber-500/20 text-[#F5A623]'
                                    : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                                )}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold leading-tight truncate">{opt.label}</span>
                                <span className="text-[10px] text-gray-400 group-hover:text-gray-300 font-normal leading-tight truncate">
                                  {opt.subtitle}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                No products match your selected filter criteria. Try adjusting your categories, brands, or search terms.
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => {
                return (
                  <div
                    key={product.id}
                    className="group rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#121622] to-[#0A0D14] flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-white/5"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative aspect-square w-full bg-[#0E121B] flex items-center justify-center p-3 sm:p-6 overflow-hidden block"
                    >
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, 50vw"
                          className="object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-600">
                          <Tag className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2 text-gray-500" />
                          <span className="text-[10px] sm:text-xs uppercase tracking-wider">Gear</span>
                        </div>
                      )}

                      {product.brand?.name && (
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/60 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded text-[8px] sm:text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                          {product.brand.name}
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="p-3 sm:p-6 flex flex-col flex-1 justify-between">
                      <div>
                        {product.category?.name && (
                          <p className="text-[9px] sm:text-[11px] font-semibold text-[#F5A623] uppercase tracking-wider mb-0.5 sm:mb-1 truncate">
                            {product.category.name}
                          </p>
                        )}
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-[#F5A623] transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        {product.short_description && (
                          <p className="hidden sm:block text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                            {product.short_description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-4 border-t border-white/5 flex flex-col gap-1.5 sm:gap-2">
                        <WhatsAppButton
                          phoneNumber={company?.whatsapp_number}
                          type="product"
                          productName={product.name}
                          variant="whatsapp"
                          size="sm"
                          className="w-full justify-center text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 sm:px-3"
                        >
                          <span className="sm:hidden">Enquire</span>
                          <span className="hidden sm:inline">Enquire on WhatsApp</span>
                        </WhatsAppButton>

                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex items-center justify-center text-[10px] sm:text-xs font-semibold text-gray-400 hover:text-white py-0.5 sm:py-1 transition-colors"
                        >
                          <span>Specifications</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
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

      {/* ================= Mobile Filter Drawer (Bottom Sheet: 75% Height, Top 25% Empty) ================= */}
      <div
        className={cn(
          'fixed inset-0 z-[100] transition-[opacity,visibility] duration-300 md:hidden',
          mobileDrawerOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!mobileDrawerOpen}
      >
        {/* Backdrop blur overlay (clicking top 25% closes the sheet) */}
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="absolute inset-0 bg-[#080A0F]/80 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Bottom Sheet (Bottom to Up, 75% Height) */}
        <div
          className={cn(
            'absolute bottom-0 inset-x-0 h-[75vh] max-h-[75vh] bg-[#0B0E14] border-t border-white/10 rounded-t-3xl shadow-2xl shadow-black flex flex-col transition-transform duration-300 ease-out',
            mobileDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          {/* Top Handle Drag Pill */}
          <div className="pt-3 pb-1 flex justify-center shrink-0 cursor-pointer" onClick={() => setMobileDrawerOpen(false)}>
            <div className="w-12 h-1.5 bg-white/25 rounded-full" />
          </div>

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D111A]/80 shrink-0">
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
          <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
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
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0D111A] flex items-center gap-3 shrink-0">
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

      {/* ================= Mobile Sort Drawer (Bottom Sheet) ================= */}
      <div
        className={cn(
          'fixed inset-0 z-[100] transition-[opacity,visibility] duration-300 md:hidden',
          mobileSortOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!mobileSortOpen}
      >
        {/* Backdrop blur overlay */}
        <div
          onClick={() => setMobileSortOpen(false)}
          className="absolute inset-0 bg-[#080A0F]/80 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Bottom Sheet */}
        <div
          className={cn(
            'absolute bottom-0 inset-x-0 bg-[#0B0E14] border-t border-white/15 rounded-t-3xl shadow-2xl shadow-black flex flex-col transition-transform duration-300 ease-out pb-8',
            mobileSortOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          {/* Top Handle Drag Pill */}
          <div
            className="pt-3 pb-1 flex justify-center shrink-0 cursor-pointer"
            onClick={() => setMobileSortOpen(false)}
          >
            <div className="w-12 h-1.5 bg-white/25 rounded-full" />
          </div>

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D111A]/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F5A623]/10 text-[#F5A623]">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Sort Products</h2>
                <p className="text-xs text-gray-400">Choose display ordering</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSortOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close sort menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Options List */}
          <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
            {sortOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = sortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    handleSortChange(opt.value);
                    setMobileSortOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between p-3.5 rounded-2xl transition-all active:scale-98 cursor-pointer text-left',
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/40 text-[#F5A623]'
                      : 'bg-white/5 border border-white/5 text-gray-200 hover:bg-white/10'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        isSelected ? 'bg-amber-500/20 text-[#F5A623]' : 'bg-white/10 text-gray-400'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm leading-tight text-white">{opt.label}</span>
                      <span className="text-xs text-gray-400 mt-0.5 leading-tight">{opt.subtitle}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#080A0F] stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
