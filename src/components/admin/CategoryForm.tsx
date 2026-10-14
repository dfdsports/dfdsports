'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, AlertCircle } from 'lucide-react';
import { slugify } from '@/lib/utils';

import { Category } from '@/types/database';

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
  initialData?: (Partial<Category> & { id?: string }) | null;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ initialData, mode, onSuccess, onCancel }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSlugTouched, setIsSlugTouched] = useState(mode === 'edit' && Boolean(initialData?.slug));

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
      slug: !isSlugTouched ? slugify(name) : prev.slug,
      seo_title: (!prev.seo_title || prev.seo_title === `${prev.name} Sports Equipment | DFD Sports`)
        ? (name ? `${name} Sports Equipment | DFD Sports` : '')
        : prev.seo_title,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'slug') {
      setIsSlugTouched(value.trim() !== '');
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleRegenerateSlug = () => {
    const newSlug = slugify(form.name);
    setForm((prev) => ({ ...prev, slug: newSlug }));
    setIsSlugTouched(false);
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
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/categories');
          router.refresh();
        }
      } catch (err: any) {
        setSaveStatus('error');
        setErrorMsg(err?.message || 'Failed to save category');
      }
    });
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-300 transition-all shadow-xs font-medium';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-black mb-2';

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {saveStatus === 'error' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-black pb-2 border-b border-slate-100">Category Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className={labelCls}>Category Name <span className="text-amber-600">*</span></label>
            <input name="name" value={form.name} onChange={handleNameChange} className={inputCls} placeholder="e.g. Football" required />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-black">URL Slug <span className="text-amber-600">*</span></label>
              {form.name && (
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                >
                  Auto-create from name
                </button>
              )}
            </div>
            <input name="slug" value={form.slug} onChange={handleChange} className={inputCls} placeholder="football" required />
            <p className="text-[11px] text-slate-500 mt-1">Used in URL: /collections/<strong className="text-black">{form.slug || 'slug'}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div>
            <label className={labelCls}>Display Order</label>
            <input type="number" name="display_order" value={form.display_order} onChange={handleChange} className={inputCls} min={0} />
          </div>
          <div className="sm:col-span-2 flex items-center sm:items-end pb-1 sm:pb-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-bold text-black">Active (visible on website)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 text-sm font-bold text-black hover:bg-slate-200 transition-colors text-center justify-center cursor-pointer border-0"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isPending ? 'Saving...' : mode === 'create' ? 'Create Category' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
}

