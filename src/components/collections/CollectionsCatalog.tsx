'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Product, Category, Brand, CompanySettings } from '@/types/database';
import { FilterSidebar } from './FilterSidebar';
import { ProductCard } from '@/components/ui/ProductCard';
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
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold uppercase tracking-tight text-white"
          style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
        >
          Collections
        </h1>
      </div>

      {/* ================= Mobile Floating Bottom Filter & Sort Capsule (< md) ================= */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="pointer-events-auto flex items-center gap-2 max-w-xs w-full shadow-2xl">
          {/* Mobile Filter Pill Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-none font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer bg-[#FF001E] hover:bg-[#d6001a] text-white shadow-md"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-none bg-white text-[#FF001E] text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Mobile Sort Pill Button */}
          <button
            type="button"
            onClick={() => setMobileSortOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-none text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer truncate bg-neutral-950 hover:bg-neutral-900 text-white shadow-md"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate">
              {sortOptions.find((o) => o.value === sortBy)?.label || 'Sort'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white shrink-0" />
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
          <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-6">
            {/* Left: Product Count */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-base font-bold uppercase tracking-wider text-white"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </span>
              {filteredProducts.length !== initialProducts.length && (
                <span className="text-xs text-neutral-400 font-medium">
                  (of {initialProducts.length} total)
                </span>
              )}
            </div>

            {/* Right: Modern Search Input + Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Inline Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Filter catalog products..."
                  className="w-full pl-9 pr-8 py-2 rounded-none bg-[#0E121B] border border-white/15 text-xs font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FF001E] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-white cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Desktop Custom Sort Dropdown */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <span
                  className="text-xs font-bold uppercase tracking-wider text-neutral-400"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Sort:
                </span>
                <div className="relative" ref={desktopSortRef}>
                  <button
                    type="button"
                    onClick={() => setDesktopSortOpen(!desktopSortOpen)}
                    className={cn(
                      'flex items-center gap-2.5 px-3.5 py-2 rounded-none border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs',
                      desktopSortOpen
                        ? 'border-[#FF001E] bg-white/10 text-white'
                        : sortBy !== 'featured'
                        ? 'border-[#FF001E]/50 bg-[#0E121B] text-white'
                        : 'border-white/20 bg-[#0E121B] hover:bg-white/5 text-white'
                    )}
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    {(() => {
                      const currentOpt = sortOptions.find((o) => o.value === sortBy) || sortOptions[0];
                      const Icon = currentOpt.icon;
                      return (
                        <>
                          <Icon className="w-3.5 h-3.5 text-[#FF001E]" />
                          <span>{currentOpt.label}</span>
                        </>
                      );
                    })()}
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-neutral-400 transition-transform duration-200',
                        desktopSortOpen && 'rotate-180 text-[#FF001E]'
                      )}
                    />
                  </button>

                  {desktopSortOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-72 bg-[#0E121B] border border-white/15 rounded-none shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between border-b border-white/10">
                        <span>Sort Products By</span>
                        <ArrowUpDown className="w-3 h-3 text-[#FF001E]" />
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
                              'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-none text-xs transition-all cursor-pointer text-left group',
                              isSelected
                                ? 'bg-[#FF001E]/10 text-[#FF001E] font-bold'
                                : 'text-neutral-300 hover:text-white hover:bg-white/5'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  'w-7 h-7 rounded-none flex items-center justify-center shrink-0 transition-colors',
                                  isSelected
                                    ? 'bg-[#FF001E]/20 text-[#FF001E]'
                                    : 'bg-white/5 text-neutral-400 group-hover:text-white group-hover:bg-white/10'
                                )}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold leading-tight truncate">{opt.label}</span>
                                <span className="text-[10px] text-neutral-400 font-normal leading-tight truncate">
                                  {opt.subtitle}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#FF001E] shrink-0" />}
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
              <span
                className="text-xs font-bold uppercase tracking-wider text-neutral-500 mr-1"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#FF001E]/10 text-xs font-semibold text-[#FF001E] hover:bg-[#FF001E]/20 transition-all group cursor-pointer border border-[#FF001E]/20"
                  >
                    <span>{catObj?.name || catSlug}</span>
                    <X className="w-3 h-3 text-[#FF001E] group-hover:scale-125 transition-transform" />
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-neutral-100 text-xs font-semibold text-neutral-800 hover:bg-neutral-200 transition-all group cursor-pointer border border-neutral-300"
                  >
                    <span>{brandObj?.name || brandSlug}</span>
                    <X className="w-3 h-3 text-neutral-600 group-hover:scale-125 transition-transform" />
                  </button>
                );
              })}

              {/* Search Query */}
              {isSearchFiltered && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-neutral-100 text-xs font-semibold text-neutral-800 hover:bg-neutral-200 transition-all group cursor-pointer border border-neutral-300"
                >
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <X className="w-3 h-3 text-neutral-600 group-hover:scale-125 transition-transform" />
                </button>
              )}

              {/* Clear All Link */}
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-neutral-500 hover:text-[#FF001E] underline underline-offset-4 ml-1 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid / Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 px-4 rounded-none bg-neutral-50 border border-neutral-200 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="w-16 h-16 rounded-none bg-neutral-200/50 flex items-center justify-center text-neutral-400 mb-4">
                <Tag className="w-8 h-8 text-[#FF001E]" />
              </div>
              <h3
                className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-950 mb-2"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
              >
                No products found
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
                No products match your selected filter criteria. Try adjusting your categories, brands, or search terms.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-6 py-3 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  company={company}
                />
              ))}
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
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Sliding Bottom Sheet (Bottom to Up, 75% Height) */}
        <div
          className={cn(
            'absolute bottom-0 inset-x-0 h-[75vh] max-h-[75vh] bg-[#0E121B] text-white rounded-none shadow-2xl flex flex-col transition-transform duration-300 ease-out border-t border-white/10',
            mobileDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          {/* Top Handle Drag Pill */}
          <div className="pt-3 pb-1 flex justify-center shrink-0 cursor-pointer" onClick={() => setMobileDrawerOpen(false)}>
            <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
          </div>

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#121622] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-none bg-[#FF001E]/10 text-[#FF001E]">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2
                  className="text-base font-bold text-white uppercase tracking-wide"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Filters
                </h2>
                <p className="text-xs text-neutral-400">
                  {filteredProducts.length} matching products
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2 rounded-none text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain bg-[#0E121B]">
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
          <div className="p-4 sm:p-5 bg-[#121622] border-t border-white/10 flex items-center gap-3 shrink-0">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="py-3 px-4 rounded-none border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex-1 py-3.5 px-4 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
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
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Sliding Bottom Sheet */}
        <div
          className={cn(
            'absolute bottom-0 inset-x-0 bg-[#0E121B] text-white rounded-none shadow-2xl flex flex-col transition-transform duration-300 ease-out pb-8 border-t border-white/10',
            mobileSortOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          {/* Top Handle Drag Pill */}
          <div
            className="pt-3 pb-1 flex justify-center shrink-0 cursor-pointer"
            onClick={() => setMobileSortOpen(false)}
          >
            <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
          </div>

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#121622] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-none bg-[#FF001E]/10 text-[#FF001E]">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              <div>
                <h2
                  className="text-base font-bold text-white uppercase tracking-wide"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Sort Products
                </h2>
                <p className="text-xs text-neutral-400">Choose display ordering</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSortOpen(false)}
              className="p-2 rounded-none text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close sort menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Options List */}
          <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh] bg-[#0E121B]">
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
                    'w-full flex items-center justify-between p-3.5 rounded-none transition-all active:scale-98 cursor-pointer text-left border',
                    isSelected
                      ? 'border-[#FF001E] bg-[#FF001E]/10 text-[#FF001E]'
                      : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-none flex items-center justify-center shrink-0',
                        isSelected ? 'bg-[#FF001E]/20 text-[#FF001E]' : 'bg-white/10 text-neutral-400'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm leading-tight text-white">{opt.label}</span>
                      <span className="text-xs text-neutral-400 mt-0.5 leading-tight">{opt.subtitle}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-none bg-[#FF001E] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
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
