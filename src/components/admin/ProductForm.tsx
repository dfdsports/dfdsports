'use client';

import React, { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Upload, X, AlertCircle, CheckCircle2, Plus, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { slugify } from '@/lib/utils';
import { Category, Brand } from '@/types/database';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/media';

interface ProductFormData {
  name: string;
  slug: string;
  category_id: string;
  brand_id: string;
  short_description: string;
  long_description: string;
  image_url: string;
  images: string[];
  specifications: Record<string, string>;
  sizes: string[];
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  seo_title: string;
  seo_description: string;
}

interface ProductFormProps {
  initialData?: (ProductFormData & { id?: string }) | null;
  mode: 'create' | 'edit';
  categories: Category[];
  brands: Brand[];
}

export function ProductForm({ initialData, mode, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    category_id: initialData?.category_id || '',
    brand_id: initialData?.brand_id || '',
    short_description: initialData?.short_description || '',
    long_description: initialData?.long_description || '',
    image_url: initialData?.image_url || '',
    images: initialData?.images || [],
    specifications: initialData?.specifications || {},
    sizes: initialData?.sizes || [],
    features: initialData?.features || [],
    is_featured: initialData?.is_featured ?? false,
    is_active: initialData?.is_active ?? true,
    display_order: initialData?.display_order ?? 0,
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
  });

  // Transient state for comma-separated inputs
  const [sizesText, setSizesText] = useState((initialData?.sizes || []).join(', '));
  const [featuresText, setFeaturesText] = useState((initialData?.features || []).join('\n'));
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({ ...prev, name, slug: prev.slug || slugify(name) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (form.image_url) {
        await deleteImageFromCloudinary(form.image_url);
      }
      const url = await uploadImageToCloudinary(file, 'dfd-sports/products');
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      setErrorMsg('Image upload failed: ' + err?.message);
      setSaveStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMainImage = async () => {
    const oldUrl = form.image_url;
    setForm((prev) => ({ ...prev, image_url: '' }));
    if (oldUrl) {
      await deleteImageFromCloudinary(oldUrl);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImageToCloudinary(files[i], 'dfd-sports/products/gallery');
        uploadedUrls.push(url);
      }
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (err: any) {
      setErrorMsg('Gallery image upload failed: ' + err?.message);
      setSaveStatus('error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = async (index: number) => {
    const targetUrl = form.images[index];
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    if (targetUrl) {
      await deleteImageFromCloudinary(targetUrl);
    }
  };

  const addSpec = () => {
    if (!specKey.trim()) return;
    setForm((prev) => ({ ...prev, specifications: { ...prev.specifications, [specKey.trim()]: specValue.trim() } }));
    setSpecKey('');
    setSpecValue('');
  };

  const removeSpec = (key: string) => {
    setForm((prev) => {
      const specs = { ...prev.specifications };
      delete specs[key];
      return { ...prev, specifications: specs };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('idle');
    setErrorMsg('');

    const payload = {
      ...form,
      sizes: sizesText.split(',').map((s) => s.trim()).filter(Boolean),
      features: featuresText.split('\n').map((f) => f.trim()).filter(Boolean),
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
    };

    startTransition(async () => {
      try {
        const supabase = createClient();
        if (mode === 'edit' && initialData?.id) {
          const { error } = await supabase.from('products').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', initialData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('products').insert([payload]);
          if (error) throw error;
        }
        setSaveStatus('success');
        router.push('/admin/products');
        router.refresh();
      } catch (err: any) {
        setSaveStatus('error');
        setErrorMsg(err?.message || 'Failed to save product');
      }
    });
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm border border-white/5';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2';

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-7xl">
      {saveStatus === 'error' && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> <span>{errorMsg}</span>
        </div>
      )}

      {/* Core Info */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Product Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Product Name <span className="text-[#F5A623]">*</span></label>
            <input name="name" value={form.name} onChange={handleNameChange} className={inputCls} placeholder="e.g. Nivia Pro Football" required />
          </div>
          <div>
            <label className={labelCls}>URL Slug <span className="text-[#F5A623]">*</span></label>
            <input name="slug" value={form.slug} onChange={handleChange} className={inputCls} placeholder="nivia-pro-football" required />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className={inputCls}>
              <option value="">— Select Category —</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Brand</label>
            <select name="brand_id" value={form.brand_id} onChange={handleChange} className={inputCls}>
              <option value="">— Select Brand —</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Short Description</label>
          <textarea name="short_description" value={form.short_description} onChange={handleChange} rows={2} className={inputCls} placeholder="Brief product description (shown in cards)" />
        </div>
        <div>
          <label className={labelCls}>Long Description / Product Story</label>
          <textarea name="long_description" value={form.long_description} onChange={handleChange} rows={5} className={inputCls} placeholder="Detailed product description, features and usage" />
        </div>
      </div>

      {/* Main Image */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Main Product Image (Cloudinary)</h3>
          <span className="text-[11px] text-[#F5A623] font-mono">Auto-syncs with Cloudinary</span>
        </div>
        {form.image_url ? (
          <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-[#141924] border border-white/10">
            <Image src={form.image_url} alt="Product preview" fill className="object-contain p-2" />
            <button
              type="button"
              onClick={handleRemoveMainImage}
              title="Delete from Cloudinary"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-40 h-40 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-[#F5A623] transition-all cursor-pointer"
          >
            {uploading ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#F5A623]/20 border-t-[#F5A623] animate-spin" />
            ) : (
              <>
                <Upload className="w-7 h-7 mb-1" />
                <span className="text-xs font-semibold">Upload to Cloudinary</span>
              </>
            )}
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <div>
          <label className={labelCls}>Or Paste Direct Cloudinary / Image URL</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className={inputCls} placeholder="https://res.cloudinary.com/..." />
        </div>
      </div>

      {/* Additional Gallery Images */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Product Gallery Images</h3>
          <span className="text-[11px] text-gray-400">{form.images.length} images uploaded</span>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {form.images.map((imgUrl, idx) => (
            <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden bg-[#141924] border border-white/10 group">
              <Image src={imgUrl} alt={`Gallery image ${idx + 1}`} fill className="object-contain p-1" />
              <button
                type="button"
                onClick={() => handleRemoveGalleryImage(idx)}
                title="Delete from Cloudinary"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploadingGallery}
            className="w-28 h-28 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-[#F5A623] transition-all cursor-pointer"
          >
            {uploadingGallery ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#F5A623]/20 border-t-[#F5A623] animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-[11px]">Add Image</span>
              </>
            )}
          </button>
        </div>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
      </div>

      {/* Specs & Sizes */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Specifications & Sizes</h3>

        <div>
          <label className={labelCls}>Available Sizes (comma-separated)</label>
          <input value={sizesText} onChange={(e) => setSizesText(e.target.value)} className={inputCls} placeholder="S, M, L, XL, XXL or Size 3, Size 4, Size 5" />
        </div>

        <div>
          <label className={labelCls}>Key Features (one per line)</label>
          <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} className={inputCls} placeholder="High-tensile nylon mesh&#10;Zero-fade sublimation print&#10;Competition-grade leather" />
        </div>

        {/* Specs key-value pairs */}
        <div>
          <label className={labelCls}>Technical Specifications</label>
          <div className="space-y-2 mb-3">
            {Object.entries(form.specifications).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl">
                <span className="text-xs font-semibold text-gray-300 flex-1">{key}</span>
                <span className="text-xs font-mono text-gray-400 flex-1">{val}</span>
                <button type="button" onClick={() => removeSpec(key)} className="text-gray-600 hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input value={specKey} onChange={(e) => setSpecKey(e.target.value)} className={`${inputCls} flex-1`} placeholder="e.g. Material" />
            <input value={specValue} onChange={(e) => setSpecValue(e.target.value)} className={`${inputCls} flex-1`} placeholder="e.g. Premium Rubber" />
            <button type="button" onClick={addSpec} className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Display Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelCls}>Display Order</label>
            <input type="number" name="display_order" value={form.display_order} onChange={handleChange} className={inputCls} min={0} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded" />
              <span className="text-sm font-semibold text-gray-300">Active (visible)</span>
            </label>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 rounded" />
              <span className="text-sm font-semibold text-gray-300">Featured on Homepage</span>
            </label>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">SEO</h3>
        <div>
          <label className={labelCls}>SEO Title</label>
          <input name="seo_title" value={form.seo_title} onChange={handleChange} className={inputCls} placeholder="Product Name | DFD Sports" />
        </div>
        <div>
          <label className={labelCls}>SEO Description</label>
          <textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={2} className={inputCls} placeholder="Meta description for search engines (150–160 chars)" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={isPending || uploading} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95 disabled:opacity-50">
          <Save className="w-4 h-4" />
          <span>{isPending ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}</span>
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
      </div>
    </form>
  );
}
