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
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

interface BrandsAdminClientProps {
  brands: Brand[];
}

export function BrandsAdminClient({ brands }: BrandsAdminClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = { name: '', slug: '', logo_url: '', description: '', display_order: 0, is_active: true };
  const [form, setForm] = useState(emptyForm);

  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setIsSlugTouched(false); setShowForm(true); setError(''); };
  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({ name: brand.name, slug: brand.slug, logo_url: brand.logo_url || '', description: brand.description || '', display_order: brand.display_order, is_active: brand.is_active });
    setIsSlugTouched(true);
    setShowForm(true);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'name') {
      setForm((p) => ({ ...p, name: value, slug: !isSlugTouched ? slugify(value) : p.slug }));
    } else if (name === 'slug') {
      setIsSlugTouched(value.trim() !== '');
      setForm((p) => ({ ...p, slug: value }));
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

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    const brand = brandToDelete;
    setIsDeleting(true);
    setError('');
    try {
      if (brand.logo_url) {
        await deleteImageFromCloudinary(brand.logo_url);
      }
      const supabase = createClient();
      const { error: deleteError } = await supabase.from('brands').delete().eq('id', brand.id);
      if (deleteError) throw deleteError;
      setBrandToDelete(null);
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
      router.refresh();
    }
  };

  const handleToggle = async (brand: Brand) => {
    const supabase = createClient();
    await supabase.from('brands').update({ is_active: !brand.is_active, updated_at: new Date().toISOString() }).eq('id', brand.id);
    router.refresh();
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-300 transition-all shadow-xs font-medium';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-black mb-2';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Brands We Supply</h1>
          <p className="text-sm text-slate-600 mt-0.5">{brands.length} brand partners listed</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> {error}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit brand' : 'Create brand'}
        subtitle={
          editing
            ? `Update partner details for ${editing.name}`
            : 'Add a new athletic brand to display on the storefront'
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className={labelCls}>Brand Name <span className="text-amber-600">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="e.g. Nivia" required />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className={inputCls} placeholder="nivia" required />
            </div>
          </div>
          <div>
            <label className={labelCls}>Brand Logo</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {form.logo_url && (
                <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shadow-xs shrink-0">
                  <Image src={form.logo_url} alt="Logo preview" fill className="object-contain p-1" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    title="Delete from Cloudinary"
                    className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-rose-600 text-white hover:bg-rose-700 rounded-bl transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-600" /> {uploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
            <input name="logo_url" value={form.logo_url} onChange={handleChange} className={`${inputCls} mt-3`} placeholder="Or paste logo URL directly" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className={labelCls}>Display Order</label>
              <input type="number" name="display_order" value={form.display_order} onChange={handleChange} className={inputCls} min={0} />
            </div>
            <div className="sm:col-span-2 flex items-center sm:items-end pb-1 sm:pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                <span className="text-sm font-bold text-black">Active (visible on store)</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-bold text-black hover:bg-slate-50 transition-colors text-center justify-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isPending ? 'Saving...' : editing ? 'Save Changes' : 'Add Brand'}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Brands Grid */}
      {brands.length === 0 && !showForm ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-10 sm:p-16 text-center shadow-sm">
          <Tag className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black mb-2">No Brands Yet</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">Add brands that you supply to display them on the website.</p>
          <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm shadow-sm cursor-pointer w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add First Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-11 sm:w-16 sm:h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {brand.logo_url ? (
                    <Image src={brand.logo_url} alt={brand.name} width={60} height={36} className="object-contain max-h-9 w-auto" />
                  ) : (
                    <span className="text-sm font-bold text-slate-400">{brand.name[0]}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-black text-sm truncate">{brand.name}</p>
                  <span className={cn('text-[11px] font-bold', brand.is_active ? 'text-emerald-700' : 'text-slate-500')}>
                    {brand.is_active ? '• Active' : '• Hidden'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(brand)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Toggle visibility"
                >
                  {brand.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(brand)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit brand"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBrandToDelete(brand)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete brand and media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(brandToDelete)}
        onClose={() => setBrandToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Brand"
        description={
          brandToDelete
            ? `Are you sure you want to permanently delete "${brandToDelete.name}"? The logo will also be removed from Cloudinary.`
            : 'Are you sure you want to delete this brand?'
        }
        confirmText="Delete Brand"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
