'use client';

import React, { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Upload, X, AlertCircle, CheckCircle2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { slugify } from '@/lib/utils';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/media';

interface CategoryFormData {
  name: string;
  slug: string;
  short_description: string;
  image_url: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  seo_title: string;
  seo_description: string;
}

interface CategoryFormProps {
  initialData?: (CategoryFormData & { id?: string }) | null;
  mode: 'create' | 'edit';
}

export function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<CategoryFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    short_description: initialData?.short_description || '',
    image_url: initialData?.image_url || '',
    icon: initialData?.icon || '',
    display_order: initialData?.display_order ?? 0,
    is_active: initialData?.is_active ?? true,
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug || slugify(name),
      seo_title: prev.seo_title || `${name} Sports Equipment | DFD Sports`,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (form.image_url) {
        await deleteImageFromCloudinary(form.image_url);
      }
      const url = await uploadImageToCloudinary(file, 'dfd-sports/categories');
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      setErrorMsg('Image upload failed: ' + (err?.message || 'Unknown error'));
      setSaveStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const oldUrl = form.image_url;
    setForm((prev) => ({ ...prev, image_url: '' }));
    if (oldUrl) {
      await deleteImageFromCloudinary(oldUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('idle');
    setErrorMsg('');

    startTransition(async () => {
      try {
        const supabase = createClient();

        if (mode === 'edit' && initialData?.id) {
          const { error } = await supabase
            .from('categories')
            .update({ ...form, updated_at: new Date().toISOString() })
            .eq('id', initialData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('categories').insert([form]);
          if (error) throw error;
        }

        setSaveStatus('success');
        router.push('/admin/categories');
        router.refresh();
      } catch (err: any) {
        setSaveStatus('error');
        setErrorMsg(err?.message || 'Failed to save category');
      }
    });
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm border border-white/5';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2';

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      {saveStatus === 'error' && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Category Name <span className="text-[#F5A623]">*</span></label>
            <input name="name" value={form.name} onChange={handleNameChange} className={inputCls} placeholder="e.g. Football" required />
          </div>
          <div>
            <label className={labelCls}>URL Slug <span className="text-[#F5A623]">*</span></label>
            <input name="slug" value={form.slug} onChange={handleChange} className={inputCls} placeholder="football" required />
            <p className="text-[11px] text-gray-500 mt-1">Used in URL: /collections/<strong>{form.slug || 'slug'}</strong></p>
          </div>
        </div>

        <div>
          <label className={labelCls}>Short Description</label>
          <textarea name="short_description" value={form.short_description} onChange={handleChange} rows={2} className={inputCls} placeholder="e.g. Match & Training Equipment" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelCls}>Display Order</label>
            <input type="number" name="display_order" value={form.display_order} onChange={handleChange} className={inputCls} min={0} />
          </div>
          <div className="sm:col-span-2 flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-600 bg-white/5 text-[#F5A623] focus:ring-[#F5A623]"
              />
              <span className="text-sm font-semibold text-gray-300">Active (visible on website)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Category Image</h3>

        {form.image_url ? (
          <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden bg-[#141924]">
            <Image src={form.image_url} alt="Category preview" fill className="object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              title="Delete from Cloudinary"
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full max-w-sm aspect-video rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-[#F5A623] transition-all cursor-pointer"
          >
            {uploading ? (
              <div className="w-6 h-6 rounded-full border-2 border-[#F5A623]/20 border-t-[#F5A623] animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-xs font-semibold">Click to upload category image</span>
                <span className="text-[11px] text-gray-500 mt-1">JPG, PNG, WebP (max 5MB)</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <div>
          <label className={labelCls}>Or paste Image URL directly</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className={inputCls} placeholder="https://..." />
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">SEO Metadata</h3>
        <div>
          <label className={labelCls}>SEO Title</label>
          <input name="seo_title" value={form.seo_title} onChange={handleChange} className={inputCls} placeholder="Football Sports Equipment | DFD Sports" />
        </div>
        <div>
          <label className={labelCls}>SEO Description</label>
          <textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={2} className={inputCls} placeholder="Buy genuine football equipment..." />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? 'Saving...' : mode === 'create' ? 'Create Category' : 'Save Changes'}</span>
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
