'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HeroSlide } from '@/types/database';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Upload, GripVertical, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/media';
import { AdminModal } from '@/components/admin/AdminModal';

interface HeroAdminClientProps {
  slides: HeroSlide[];
}

const emptySlide = {
  eyebrow: 'DESTINATION FOR DREAMS',
  heading: '',
  highlight_text: '',
  description: '',
  primary_cta_text: 'Explore Collections',
  primary_cta_link: '/collections',
  secondary_cta_text: 'Enquire on WhatsApp',
  secondary_cta_link: '',
  image_url: '',
  mobile_image_url: '',
  badge_text: 'PLAY • EQUIP • PERFORM',
  display_order: 0,
  is_active: true,
};

export function HeroAdminClient({ slides }: HeroAdminClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState(emptySlide);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptySlide, display_order: slides.length }); setShowForm(true); setError(''); };
  const openEdit = (slide: HeroSlide) => {
    setEditing(slide);
    setForm({
      eyebrow: slide.eyebrow || '',
      heading: slide.heading,
      highlight_text: slide.highlight_text || '',
      description: slide.description || '',
      primary_cta_text: slide.primary_cta_text || '',
      primary_cta_link: slide.primary_cta_link || '',
      secondary_cta_text: slide.secondary_cta_text || '',
      secondary_cta_link: slide.secondary_cta_link || '',
      image_url: slide.image_url || '',
      mobile_image_url: slide.mobile_image_url || '',
      badge_text: slide.badge_text || '',
      display_order: slide.display_order,
      is_active: slide.is_active,
    });
    setShowForm(true);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (form.image_url) {
        await deleteImageFromCloudinary(form.image_url);
      }
      const url = await uploadImageToCloudinary(file, 'dfd-sports/heroes');
      setForm((p) => ({ ...p, image_url: url }));
    } catch (err: any) {
      setError('Upload failed: ' + err?.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      try {
        const supabase = createClient();
        if (editing) {
          const { error } = await supabase.from('hero_slides').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('hero_slides').insert([form]);
          if (error) throw error;
        }
        setShowForm(false);
        router.refresh();
      } catch (err: any) {
        setError(err?.message || 'Save failed');
      }
    });
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!confirm('Delete this hero slide?')) return;
    try {
      if (slide.image_url) {
        await deleteImageFromCloudinary(slide.image_url);
      }
      const supabase = createClient();
      await supabase.from('hero_slides').delete().eq('id', slide.id);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  };

  const handleToggle = async (slide: HeroSlide) => {
    const supabase = createClient();
    await supabase.from('hero_slides').update({ is_active: !slide.is_active, updated_at: new Date().toISOString() }).eq('id', slide.id);
    router.refresh();
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-300 transition-all shadow-xs font-medium';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-black mb-2';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Hero Banners</h1>
          <p className="text-sm text-slate-600 mt-0.5">{slides.length} slides configured for homepage</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Hero Slide
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs">{error}</div>}

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit hero slide' : 'Create hero slide'}
        subtitle={
          editing
            ? 'Update slide typography, CTAs, and background imagery'
            : 'Configure a new promotional banner for the storefront hero section'
        }
        maxWidth="3xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Eyebrow Text</label>
              <input name="eyebrow" value={form.eyebrow} onChange={handleChange} className={inputCls} placeholder="DESTINATION FOR DREAMS" />
            </div>
            <div>
              <label className={labelCls}>Badge Text</label>
              <input name="badge_text" value={form.badge_text} onChange={handleChange} className={inputCls} placeholder="PLAY • EQUIP • PERFORM" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Main Heading <span className="text-amber-600">*</span></label>
            <input name="heading" value={form.heading} onChange={handleChange} className={inputCls} placeholder="TEAMWEAR WITH IDENTITY." required />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={inputCls} placeholder="Custom jerseys and premium sports equipment..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Primary CTA Text</label>
              <input name="primary_cta_text" value={form.primary_cta_text} onChange={handleChange} className={inputCls} placeholder="Explore Collections" />
            </div>
            <div>
              <label className={labelCls}>Primary CTA Link</label>
              <input name="primary_cta_link" value={form.primary_cta_link} onChange={handleChange} className={inputCls} placeholder="/collections" />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelCls}>Hero Background Image</label>
            <div className="flex items-center gap-4 mb-3">
              {form.image_url && (
                <div className="relative w-40 h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-xs">
                  <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, image_url: '' }))} className="absolute top-1 right-1 w-6 h-6 bg-rose-600 flex items-center justify-center text-white hover:bg-rose-700 rounded-full shadow-xs cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-600" /> {uploading ? 'Uploading...' : 'Upload Hero Image'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
            <input name="image_url" value={form.image_url} onChange={handleChange} className={inputCls} placeholder="Or paste image URL" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelCls}>Display Order</label>
              <input type="number" name="display_order" value={form.display_order} onChange={handleChange} className={inputCls} min={0} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                <span className="text-sm font-bold text-black">Active Slide</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isPending || uploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editing ? 'Save Changes' : 'Create Slide'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-bold text-black hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminModal>


      {slides.length === 0 && !showForm ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-16 text-center shadow-sm">
          <ImageIcon className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Hero Slides Yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Create your first hero slide to appear at the top of the homepage.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Create First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <div key={slide.id} className={cn('rounded-2xl bg-white border shadow-sm flex items-start gap-4 p-5 hover:shadow-md transition-shadow', slide.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60')}>
              <div className="relative w-28 h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {slide.image_url ? (
                  <Image src={slide.image_url} alt={slide.heading} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-slate-400" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-0.5">{slide.eyebrow}</p>
                <p className="font-bold text-slate-900 line-clamp-1">{slide.heading}</p>
                {slide.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{slide.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn('px-2.5 py-0.5 rounded-md text-[11px] font-bold border', slide.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200')}>
                    {slide.is_active ? 'Active' : 'Hidden'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Order: {slide.display_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggle(slide)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  {slide.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(slide)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(slide)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
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
