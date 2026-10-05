'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Brand } from '@/types/database';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Upload, AlertCircle, Tag } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/media';

interface BrandsAdminClientProps {
  brands: Brand[];
}

export function BrandsAdminClient({ brands }: BrandsAdminClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = { name: '', slug: '', logo_url: '', description: '', display_order: 0, is_active: true };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(''); };
  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({ name: brand.name, slug: brand.slug, logo_url: brand.logo_url || '', description: brand.description || '', display_order: brand.display_order, is_active: brand.is_active });
    setShowForm(true);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'name') {
      setForm((p) => ({ ...p, name: value, slug: p.slug || slugify(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (form.logo_url) {
        await deleteImageFromCloudinary(form.logo_url);
      }
      const url = await uploadImageToCloudinary(file, 'dfd-sports/brands');
      setForm((p) => ({ ...p, logo_url: url }));
    } catch (err: any) {
      setError('Upload failed: ' + err?.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    const oldUrl = form.logo_url;
    setForm((p) => ({ ...p, logo_url: '' }));
    if (oldUrl) {
      await deleteImageFromCloudinary(oldUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      try {
        const supabase = createClient();
        if (editing) {
          const { error } = await supabase.from('brands').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('brands').insert([form]);
          if (error) throw error;
        }
        setShowForm(false);
        router.refresh();
      } catch (err: any) {
        setError(err?.message || 'Save failed');
      }
    });
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Delete "${brand.name}"? The logo will also be removed from Cloudinary.`)) return;
    try {
      if (brand.logo_url) {
        await deleteImageFromCloudinary(brand.logo_url);
      }
      const supabase = createClient();
      await supabase.from('brands').delete().eq('id', brand.id);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  };

  const handleToggle = async (brand: Brand) => {
    const supabase = createClient();
    await supabase.from('brands').update({ is_active: !brand.is_active, updated_at: new Date().toISOString() }).eq('id', brand.id);
    router.refresh();
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm border border-white/5';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2';

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Brands We Supply</h1>
          <p className="text-sm text-gray-400 mt-0.5">{brands.length} brands</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Inline Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl bg-[#0E121B] border border-[#F5A623]/30 p-6 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{editing ? 'Edit Brand' : 'Add New Brand'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Brand Name <span className="text-[#F5A623]">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="e.g. Nivia" required />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className={inputCls} placeholder="nivia" required />
            </div>
          </div>
          <div>
            <label className={labelCls}>Brand Logo</label>
            <div className="flex items-center gap-4">
              {form.logo_url && (
                <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-[#141924]">
                  <Image src={form.logo_url} alt="Logo preview" fill className="object-contain p-1" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    title="Delete from Cloudinary"
                    className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center bg-red-600/80 text-white hover:bg-red-600 rounded-bl transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
            <input name="logo_url" value={form.logo_url} onChange={handleChange} className={`${inputCls} mt-3`} placeholder="Or paste logo URL" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelCls}>Display Order</label>
              <input type="number" name="display_order" value={form.display_order} onChange={handleChange} className={inputCls} min={0} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-300">Active (visible)</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all disabled:opacity-50">
              <Save className="w-4 h-4" /> {isPending ? 'Saving...' : editing ? 'Save Changes' : 'Add Brand'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Brands Grid */}
      {brands.length === 0 && !showForm ? (
        <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-12 text-center">
          <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Brands Yet</h3>
          <p className="text-sm text-gray-400 mb-6">Add brands that you supply to display them on the website.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] text-[#080A0F] font-bold text-sm">
            <Plus className="w-4 h-4" /> Add First Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="rounded-2xl bg-[#0E121B] border border-white/5 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-10 rounded-lg bg-[#141924] flex items-center justify-center shrink-0 overflow-hidden">
                  {brand.logo_url ? (
                    <Image src={brand.logo_url} alt={brand.name} width={60} height={36} className="object-contain max-h-8 w-auto" />
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{brand.name[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{brand.name}</p>
                  <span className={cn('text-[11px] font-semibold', brand.is_active ? 'text-emerald-400' : 'text-gray-500')}>
                    {brand.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggle(brand)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  {brand.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(brand)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(brand)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                  title="Delete brand and media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
