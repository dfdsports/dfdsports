'use client';

import React, { useState } from 'react';
import { Category, Brand } from '@/types/database';
import { Check, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: [number, number];
  priceBounds: { min: number; max: number; hasPrices: boolean };
  onToggleCategory: (slug: string) => void;
  onToggleBrand: (slug: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  categoryCounts?: Record<string, number>;
  brandCounts?: Record<string, number>;
  className?: string;
  isMobileDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export function FilterSidebar({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  priceRange,
  priceBounds,
  onToggleCategory,
  onToggleBrand,
  onPriceChange,
  onClearAll,
  activeFilterCount,
  categoryCounts = {},
  brandCounts = {},
  className,
  isMobileDrawer = false,
  onCloseDrawer,
}: FilterSidebarProps) {
  // Collapsible section states for smooth accordion if needed
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(true);

  // Search filter inside categories if many
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <aside
      className={cn(
        'w-full flex flex-col',
        !isMobileDrawer && 'bg-[#0E121B] rounded-none p-6 shadow-sm',
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-none bg-[#FF001E]/10 text-[#FF001E]">
            <Filter className="w-4 h-4" />
          </div>
          <h2
            className="text-base font-bold uppercase tracking-wider text-white"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
          >
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-none bg-[#FF001E] text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#FF001E] hover:text-[#d6001a] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* ================= CATEGORY FILTER ================= */}
        <div className="pt-5 first:pt-4">
          <button
            type="button"
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white hover:text-[#FF001E] transition-colors mb-3"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
          >
            <span>Categories</span>
            <div className="flex items-center gap-1.5 text-neutral-400">
              {selectedCategories.length > 0 && (
                <span className="text-[10px] text-[#FF001E] font-bold">
                  ({selectedCategories.length})
                </span>
              )}
              {categoriesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {categoriesOpen && (
            <div className="space-y-2.5">
              {categories.length > 7 && (
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full px-3 py-1.5 mb-2 rounded-none bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF001E]"
                />
              )}

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1.5 custom-scrollbar [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-none hover:[&::-webkit-scrollbar-thumb]:bg-[#FF001E]">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.slug);
                    const count = categoryCounts[cat.slug] ?? 0;

                    return (
                      <label
                        key={cat.id}
                        className={cn(
                          'flex items-center justify-between px-2.5 py-2 rounded-none cursor-pointer select-none transition-all group',
                          isChecked ? 'bg-white/10 text-white font-semibold' : 'hover:bg-white/5 text-neutral-300'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              'w-4 h-4 rounded-none border flex items-center justify-center transition-all shrink-0',
                              isChecked
                                ? 'bg-[#FF001E] border-[#FF001E] text-white'
                                : 'border-white/20 bg-black/40 group-hover:border-[#FF001E]'
                            )}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleCategory(cat.slug)}
                            className="sr-only"
                          />
                          <span className="text-xs font-medium truncate">{cat.name}</span>
                        </div>

                        {count > 0 && (
                          <span className="text-[10px] font-mono font-semibold text-neutral-400 group-hover:text-neutral-300 shrink-0 ml-2">
                            {count}
                          </span>
                        )}
                      </label>
                    );
                  })
                ) : (
                  <p className="text-xs text-neutral-400 py-1">No categories found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= BRAND FILTER ================= */}
        {brands.length > 0 && (
          <div className="pt-5">
            <button
              type="button"
              onClick={() => setBrandsOpen(!brandsOpen)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white hover:text-[#FF001E] transition-colors mb-3"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
            >
              <span>Brands</span>
              <div className="flex items-center gap-1.5 text-neutral-400">
                {selectedBrands.length > 0 && (
                  <span className="text-[10px] text-[#FF001E] font-bold">
                    ({selectedBrands.length})
                  </span>
                )}
                {brandsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {brandsOpen && (
              <div className="space-y-2.5">
                {brands.length > 7 && (
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full px-3 py-1.5 mb-2 rounded-none bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF001E]"
                  />
                )}

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1.5 custom-scrollbar [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-none hover:[&::-webkit-scrollbar-thumb]:bg-[#FF001E]">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => {
                      const isChecked = selectedBrands.includes(brand.slug);
                      const count = brandCounts[brand.slug] ?? 0;

                      return (
                        <label
                          key={brand.id}
                          className={cn(
                            'flex items-center justify-between px-2.5 py-2 rounded-none cursor-pointer select-none transition-all group',
                            isChecked ? 'bg-white/10 text-white font-semibold' : 'hover:bg-white/5 text-neutral-300'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                'w-4 h-4 rounded-none border flex items-center justify-center transition-all shrink-0',
                                isChecked
                                  ? 'bg-[#FF001E] border-[#FF001E] text-white'
                                  : 'border-white/20 bg-black/40 group-hover:border-[#FF001E]'
                              )}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleBrand(brand.slug)}
                              className="sr-only"
                            />
                            <span className="text-xs font-medium truncate">{brand.name}</span>
                          </div>

                          {count > 0 && (
                            <span className="text-[10px] font-mono font-semibold text-neutral-400 group-hover:text-neutral-300 shrink-0 ml-2">
                              {count}
                            </span>
                          )}
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-neutral-400 py-1">No brands found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear Filters CTA Button in Sidebar */}
      {activeFilterCount > 0 && (
        <div className="mt-6 pt-5">
          <button
            type="button"
            onClick={onClearAll}
            className="w-full py-2.5 px-4 rounded-none border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF001E]" />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}
    </aside>
  );
}
