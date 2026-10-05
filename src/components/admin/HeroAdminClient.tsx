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

  const handleRemoveImage = async () => {
    const oldUrl = form.image_url;
    setForm((p) => ({ ...p, image_url: '' }));
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

  const handleToggle = async (slide: HeroSlide) => {
    const supabase = createClient();
    await supabase.from('hero_slides').update({ is_active: !slide.is_active, updated_at: new Date().toISOString() }).eq('id', slide.id);
    router.refresh();
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!confirm(`Delete slide "${slide.heading}"? Hero background will also be deleted from Cloudinary.`)) return;
    try {
      if (slide.image_url) {
        await deleteImageFromCloudinary(slide.image_url);
      }
      if (slide.mobile_image_url) {
        await deleteImageFromCloudinary(slide.mobile_image_url);
      }
      const supabase = createClient();
      await supabase.from('hero_slides').delete().eq('id', slide.id);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm border border-white/5';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2';

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Hero Banners</h1>
          <p className="text-sm text-gray-400 mt-0.5">{slides.length} slides</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Hero Slide
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 text-red-300 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl bg-[#0E121B] border border-[#F5A623]/30 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{editing ? 'Edit Hero Slide' : 'New Hero Slide'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

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
            <label className={labelCls}>Main Heading <span className="text-[#F5A623]">*</span></label>
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
                <div className="relative w-40 h-24 rounded-xl overflow-hidden bg-[#141924]">
                  <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, image_url: '' }))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 flex items-center justify-center text-white hover:text-red-400 rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Hero Image'}
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
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-300">Active Slide</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> {isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create Slide'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {slides.length === 0 && !showForm ? (
        <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Hero Slides Yet</h3>
          <p className="text-sm text-gray-400 mb-6">Create your first hero slide to appear at the top of the homepage.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] text-[#080A0F] font-bold text-sm">
            <Plus className="w-4 h-4" /> Create First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <div key={slide.id} className={cn('rounded-2xl bg-[#0E121B] border flex items-start gap-4 p-5', slide.is_active ? 'border-white/10' : 'border-white/5 opacity-60')}>
              <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-[#141924] shrink-0">
                {slide.image_url ? (
                  <Image src={slide.image_url} alt={slide.heading} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-600" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#F5A623] font-semibold uppercase tracking-wider mb-0.5">{slide.eyebrow}</p>
                <p className="font-bold text-white line-clamp-1">{slide.heading}</p>
                {slide.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{slide.description}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('px-2 py-0.5 rounded text-[11px] font-bold', slide.is_active ? 'bg-emerald-900/30 text-emerald-300' : 'bg-white/5 text-gray-500')}>
                    {slide.is_active ? 'Active' : 'Hidden'}
                  </span>
                  <span className="text-[11px] text-gray-500">Order: {slide.display_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggle(slide)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  {slide.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(slide)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(slide)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-colors">
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
