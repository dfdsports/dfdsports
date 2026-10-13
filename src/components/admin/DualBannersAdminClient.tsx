'use client';

import React, { useState, useRef, useTransition, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DualBannersSettings, DualBannerItem } from '@/types/dualBanners';
import { Category, Product } from '@/types/database';
import { uploadImageToCloudinary } from '@/lib/media';
import { AdminModal } from '@/components/admin/AdminModal';
import {
  Upload,
  Image as ImageIcon,
  Layers,
  Package,
  Check,
  X,
  ExternalLink,
  Save,
  Search,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Shirt,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DualBannersAdminClientProps {
  initialSettings: DualBannersSettings;
  categories: Category[];
  products: Product[];
}

export function DualBannersAdminClient({
  initialSettings,
  categories,
  products,
}: DualBannersAdminClientProps) {
  const [settings, setSettings] = useState<DualBannersSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Upload states
  const [uploadingLeft, setUploadingUploadingLeft] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);
  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);

  // Product selector modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // Filter products by selected category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategoryFilter === 'all' ||
        p.category_id === selectedCategoryFilter ||
        p.category?.id === selectedCategoryFilter;

      const matchesSearch =
        !productSearchQuery.trim() ||
        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        (p.category?.name &&
          p.category.name.toLowerCase().includes(productSearchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryFilter, productSearchQuery]);

  // Handle image upload for left banner
  const handleLeftImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingUploadingLeft(true);
    setErrorMessage('');
    try {
      const url = await uploadImageToCloudinary(file, 'dfd-sports/banners');
      setSettings((prev) => ({
        ...prev,
        left_banner: {
          ...prev.left_banner,
          image_url: url,
        },
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload left banner image');
    } finally {
      setUploadingUploadingLeft(false);
      if (leftFileRef.current) leftFileRef.current.value = '';
    }
  };

  // Handle image upload for right banner
  const handleRightImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRight(true);
    setErrorMessage('');
    try {
      const url = await uploadImageToCloudinary(file, 'dfd-sports/banners');
      setSettings((prev) => ({
        ...prev,
        right_banner: {
          ...prev.right_banner,
          image_url: url,
        },
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload right banner image');
    } finally {
      setUploadingRight(false);
      if (rightFileRef.current) rightFileRef.current.value = '';
    }
  };

  // Selecting a product from category selector modal
  const handleSelectProduct = (product: Product) => {
    const categoryName = product.category?.name || 'Category';
    const linkPath = `/products/${product.slug}`;

    setSettings((prev) => ({
      ...prev,
      left_banner: {
        ...prev.left_banner,
        link: linkPath,
        product_id: product.id,
        product_name: product.name,
        category_id: product.category_id || '',
        category_name: categoryName,
      },
    }));

    setIsProductModalOpen(false);
  };

  // Clear selected product for left banner
  const handleClearSelectedProduct = () => {
    setSettings((prev) => ({
      ...prev,
      left_banner: {
        ...prev.left_banner,
        product_id: '',
        product_name: '',
        category_id: '',
        category_name: '',
        link: '',
      },
    }));
  };

  // Save changes to API
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/dual-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save dual banner settings');
      }

      setSettings(data.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving banner settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-amber-500" />
            Dual Promotional Banners
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure the two side-by-side promotional banners displayed on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition-colors"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Banners'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm font-medium animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Dual banner configurations have been saved successfully and are live on the storefront!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm font-medium animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Two Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ========================================================================= */}
        {/* 1. LEFT SIDE BANNER (Click path to Any Product via Category Selector)      */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                Left Side Banner
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Target: Product Link
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              Product Promotion Banner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload banner image and select any product through categories for the click destination.
            </p>
          </div>

          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Left Banner Image
              </label>

              {settings.left_banner.image_url ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-64 sm:h-72 w-full">
                  <Image
                    src={settings.left_banner.image_url}
                    alt={settings.left_banner.title || 'Left Banner'}
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => leftFileRef.current?.click()}
                      className="px-3.5 py-2 rounded-lg bg-white text-slate-900 text-xs font-bold shadow hover:bg-slate-100 transition-colors"
                    >
                      Replace Image
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          left_banner: { ...prev.left_banner, image_url: '' },
                        }))
                      }
                      className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => leftFileRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64 sm:h-72"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    {uploadingLeft ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {uploadingLeft ? 'Uploading Image...' : 'Click to Upload Left Banner Image'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG, WEBP recommended (e.g. 800x600 or 1200x800)
                  </p>
                </div>
              )}

              <input
                ref={leftFileRef}
                type="file"
                accept="image/*"
                onChange={handleLeftImageUpload}
                className="hidden"
              />
            </div>

            {/* Click Destination / Product Selector */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Click Destination (Target Product)
                </label>

                {settings.left_banner.product_name ? (
                  /* Selected Product Card */
                  <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-blue-900 truncate">
                          {settings.left_banner.product_name}
                        </p>
                        <p className="text-[11px] text-blue-700 font-mono truncate">
                          {settings.left_banner.link}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsProductModalOpen(true)}
                        className="px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 text-blue-800 text-xs font-bold transition-colors"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSelectedProduct}
                        className="p-1.5 rounded-lg text-blue-700 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Clear Target"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Open Category / Product Selector Button */
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl border border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 text-blue-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Select Product (Open Category & Pick Product)</span>
                  </button>
                )}
              </div>

              {/* Direct Path Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Resolved URL Link Path
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.left_banner.link}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        left_banner: {
                          ...prev.left_banner,
                          link: e.target.value,
                        },
                      }))
                    }
                    placeholder="/products/your-product-slug"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Optional Title */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Banner Title (Optional)
                </label>
                <input
                  type="text"
                  value={settings.left_banner.title || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      left_banner: {
                        ...prev.left_banner,
                        title: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. Featured Match Gear"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RIGHT SIDE BANNER (Default to Custom Jersey Page /custom-jerseys)       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                Right Side Banner
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Default: /custom-jerseys
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              Custom Teamwear Banner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload banner image. Default click path takes customers straight to the Custom Jersey Studio.
            </p>
          </div>

          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Right Banner Image
              </label>

              {settings.right_banner.image_url ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-64 sm:h-72 w-full">
                  <Image
                    src={settings.right_banner.image_url}
                    alt={settings.right_banner.title || 'Right Banner'}
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => rightFileRef.current?.click()}
                      className="px-3.5 py-2 rounded-lg bg-white text-slate-900 text-xs font-bold shadow hover:bg-slate-100 transition-colors"
                    >
                      Replace Image
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          right_banner: { ...prev.right_banner, image_url: '' },
                        }))
                      }
                      className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => rightFileRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/30 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64 sm:h-72"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                    {uploadingRight ? (
                      <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {uploadingRight ? 'Uploading Image...' : 'Click to Upload Right Banner Image'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG, WEBP recommended (e.g. 800x600 or 1200x800)
                  </p>
                </div>
              )}

              <input
                ref={rightFileRef}
                type="file"
                accept="image/*"
                onChange={handleRightImageUpload}
                className="hidden"
              />
            </div>

            {/* Click Destination (Default: /custom-jerseys) */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Click Destination (Default Custom Jersey Page)
                </label>
                <div className="relative">
                  <Shirt className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.right_banner.link}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        right_banner: {
                          ...prev.right_banner,
                          link: e.target.value,
                        },
                      }))
                    }
                    placeholder="/custom-jerseys"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default: <code className="text-amber-600">/custom-jerseys</code> (routes directly to the custom teamwear studio)
                </p>
              </div>

              {/* Optional Title */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Banner Title (Optional)
                </label>
                <input
                  type="text"
                  value={settings.right_banner.title || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      right_banner: {
                        ...prev.right_banner,
                        title: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. Custom Sublimated Teamwear"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRODUCT SELECTOR MODAL: Open Category -> Select Product                   */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Select Target Product"
        subtitle="Filter by category to pick the exact product for the left banner click path"
        maxWidth="3xl"
      >
        <div className="space-y-5">
          {/* 1. Category Filter Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Choose Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                  selectedCategoryFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                )}
              >
                All Categories ({products.length})
              </button>

              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.category_id === cat.id || p.category?.id === cat.id
                ).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                      selectedCategoryFilter === cat.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    )}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Product Search Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Search Product
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Search products by title or keywords..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* 3. Products List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const isSelected = settings.left_banner.product_id === p.id;

                return (
                  <div
                    key={p.id}
                    className={cn(
                      'p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors',
                      isSelected && 'bg-blue-50/60'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden shrink-0">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            fill
                            className="object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.category?.name && (
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              {p.category.name}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono truncate">
                            /products/{p.slug}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800'
                      )}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>No products found matching your filter.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
