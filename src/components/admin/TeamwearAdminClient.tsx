'use client';

import React, { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Teamwear } from '@/types/database';
import { Plus, Edit2, Trash2, Save, X, Upload, CheckCircle2, Shirt, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminModal } from '@/components/admin/AdminModal';

interface TeamwearAdminClientProps {
  items: Teamwear[];
}

const emptyTeamwear = {
  title: '',
  slug: '',
  description: '',
  front_image_url: '',
  back_image_url: '',
  colors: ['#FFFFFF', '#080A0F', '#1E3A8A', '#DC2626', '#16A34A', '#F5A623'],
  fabric_options: ['160 GSM Micro Poly', '180 GSM Interlock', '220 GSM Jacquard Mesh'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  customization_options: ['Player Name', 'Jersey Number', 'Custom Team Crest', 'Sponsor Logo Sublimation'],
  display_order: 0,
  is_active: true,
};

export function TeamwearAdminClient({ items }: TeamwearAdminClientProps) {
  const router = useRouter();
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Teamwear | null>(null);
  const [form, setForm] = useState(emptyTeamwear);
  const [isPending, startTransition] = useTransition();
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // String inputs for array tags
  const [colorInput, setColorInput] = useState('');
  const [fabricInput, setFabricInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [customOptInput, setCustomOptInput] = useState('');

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyTeamwear, display_order: items.length });
    setShowForm(true);
    setSavedSuccess(false);
  };

  const openEdit = (tw: Teamwear) => {
    setEditing(tw);
    setForm({
      title: tw.title,
      slug: tw.slug,
      description: tw.description || '',
      front_image_url: tw.front_image_url || '',
      back_image_url: tw.back_image_url || '',
      colors: Array.isArray(tw.colors) && tw.colors.length > 0 ? tw.colors : emptyTeamwear.colors,
      fabric_options: Array.isArray(tw.fabric_options) && tw.fabric_options.length > 0 ? tw.fabric_options : emptyTeamwear.fabric_options,
      sizes: Array.isArray(tw.sizes) && tw.sizes.length > 0 ? tw.sizes : emptyTeamwear.sizes,
      customization_options: Array.isArray(tw.customization_options) && tw.customization_options.length > 0 ? tw.customization_options : emptyTeamwear.customization_options,
      display_order: tw.display_order,
      is_active: tw.is_active,
    });
    setShowForm(true);
    setSavedSuccess(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      };
      if (name === 'title' && !editing) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFront(true);
    setError('');

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `teamwear/front-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('dfd-sports')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) {
        console.warn('Upload to storage failed:', uploadErr);
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm((p) => ({ ...p, front_image_url: reader.result as string }));
          setUploadingFront(false);
        };
        reader.readAsDataURL(file);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('dfd-sports')
          .getPublicUrl(fileName);
        setForm((p) => ({ ...p, front_image_url: publicUrlData.publicUrl }));
        setUploadingFront(false);
      }
    } catch (err: any) {
      setError('Upload failed: ' + err?.message);
      setUploadingFront(false);
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBack(true);
    setError('');

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `teamwear/back-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('dfd-sports')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) {
        console.warn('Upload to storage failed:', uploadErr);
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm((p) => ({ ...p, back_image_url: reader.result as string }));
          setUploadingBack(false);
        };
        reader.readAsDataURL(file);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('dfd-sports')
          .getPublicUrl(fileName);
        setForm((p) => ({ ...p, back_image_url: publicUrlData.publicUrl }));
        setUploadingBack(false);
      }
    } catch (err: any) {
      setError('Upload failed: ' + err?.message);
      setUploadingBack(false);
    }
  };

  // Color Array handlers
  const addColor = () => {
    if (!colorInput.trim()) return;
    setForm((p) => ({ ...p, colors: [...p.colors, colorInput.trim()] }));
    setColorInput('');
  };
  const removeColor = (idx: number) => {
    setForm((p) => ({ ...p, colors: p.colors.filter((_, i) => i !== idx) }));
  };

  // Fabric Array handlers
  const addFabric = () => {
    if (!fabricInput.trim()) return;
    setForm((p) => ({ ...p, fabric_options: [...p.fabric_options, fabricInput.trim()] }));
    setFabricInput('');
  };
  const removeFabric = (idx: number) => {
    setForm((p) => ({ ...p, fabric_options: p.fabric_options.filter((_, i) => i !== idx) }));
  };

  // Size Array handlers
  const addSize = () => {
    if (!sizeInput.trim()) return;
    setForm((p) => ({ ...p, sizes: [...p.sizes, sizeInput.trim()] }));
    setSizeInput('');
  };
  const removeSize = (idx: number) => {
    setForm((p) => ({ ...p, sizes: p.sizes.filter((_, i) => i !== idx) }));
  };

  // Custom Options handlers
  const addCustomOpt = () => {
    if (!customOptInput.trim()) return;
    setForm((p) => ({ ...p, customization_options: [...p.customization_options, customOptInput.trim()] }));
    setCustomOptInput('');
  };
  const removeCustomOpt = (idx: number) => {
    setForm((p) => ({ ...p, customization_options: p.customization_options.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      try {
        const supabase = createClient();
        if (editing) {
          const { error: updateErr } = await supabase
            .from('teamwear')
            .update({ ...form })
            .eq('id', editing.id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('teamwear')
            .insert([form]);
          if (insertErr) throw insertErr;
        }
        setSavedSuccess(true);
        setTimeout(() => setShowForm(false), 500);
        router.refresh();
      } catch (err: any) {
        setError(err?.message || 'Failed to save teamwear model');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teamwear model?')) return;
    const supabase = createClient();
    await supabase.from('teamwear').delete().eq('id', id);
    router.refresh();
  };

  const handleToggle = async (tw: Teamwear) => {
    const supabase = createClient();
    await supabase.from('teamwear').update({ is_active: !tw.is_active }).eq('id', tw.id);
    router.refresh();
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-300 transition-all shadow-xs font-medium';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-black mb-2';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Custom Teamwear & Jersey Templates</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage 360 front/back mockups, color palettes, and customization options.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Jersey Model
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs">{error}</div>}

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit teamwear model' : 'Create teamwear model'}
        subtitle={
          editing
            ? `Customize jersey specs and options for ${editing.title}`
            : 'Add a new customizable team jersey template'
        }
        maxWidth="4xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Model Title <span className="text-amber-600">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. Pro Elite Matchday Jersey"
                required
              />
            </div>

            <div>
              <label className={labelCls}>
                Slug <span className="text-amber-600">*</span>
              </label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className={inputCls}
                placeholder="pro-elite-matchday-jersey"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className={inputCls}
                placeholder="Tailored athletic cut jersey with sublimation printing and moisture-wicking technology..."
              />
            </div>

            {/* Front & Back Images */}
            <div className="space-y-2">
              <label className={labelCls}>Front View Image</label>
              <div className="flex items-center gap-4">
                {form.front_image_url ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                    <Image
                      src={form.front_image_url}
                      alt="Front view"
                      fill
                      className="object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, front_image_url: '' }))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                    <Shirt className="w-6 h-6" />
                    <span className="text-[10px] mt-1 font-bold">Front</span>
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    ref={frontFileInputRef}
                    onChange={handleFrontUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingFront}
                    onClick={() => frontFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200"
                  >
                    <Upload className="w-3 h-3 text-amber-600" />
                    {uploadingFront ? 'Uploading...' : 'Upload Front'}
                  </button>
                  <input
                    name="front_image_url"
                    value={form.front_image_url}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="https://... front image URL"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Back View Image</label>
              <div className="flex items-center gap-4">
                {form.back_image_url ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                    <Image
                      src={form.back_image_url}
                      alt="Back view"
                      fill
                      className="object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, back_image_url: '' }))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                    <Shirt className="w-6 h-6 rotate-180" />
                    <span className="text-[10px] mt-1 font-bold">Back</span>
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    ref={backFileInputRef}
                    onChange={handleBackUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingBack}
                    onClick={() => backFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200"
                  >
                    <Upload className="w-3 h-3 text-amber-600" />
                    {uploadingBack ? 'Uploading...' : 'Upload Back'}
                  </button>
                  <input
                    name="back_image_url"
                    value={form.back_image_url}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="https://... back image URL"
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="md:col-span-2 space-y-2">
              <label className={labelCls}>Available Colors (Hex codes)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                    {c}
                    <button type="button" onClick={() => removeColor(i)} className="text-slate-400 hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="#1E3A8A or Royal Blue"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shrink-0"
                >
                  Add Color
                </button>
              </div>
            </div>

            {/* Fabric Options */}
            <div className="md:col-span-2 space-y-2">
              <label className={labelCls}>Fabric Options</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.fabric_options.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                  >
                    {f}
                    <button type="button" onClick={() => removeFabric(i)} className="text-slate-400 hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fabricInput}
                  onChange={(e) => setFabricInput(e.target.value)}
                  placeholder="e.g. 180 GSM Pro Dry Fit"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addFabric}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shrink-0"
                >
                  Add Fabric
                </button>
              </div>
            </div>

            {/* Sizes & Customization Options */}
            <div>
              <label className={labelCls}>Available Sizes</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.sizes.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800">
                    {s}
                    <button type="button" onClick={() => removeSize(i)} className="text-slate-400 hover:text-rose-600"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="e.g. 4XL"
                  className={inputCls}
                />
                <button type="button" onClick={addSize} className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shrink-0">Add</button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Customization Options</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.customization_options.map((co, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
                    {co}
                    <button type="button" onClick={() => removeCustomOpt(i)} className="text-slate-400 hover:text-rose-600"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customOptInput}
                  onChange={(e) => setCustomOptInput(e.target.value)}
                  placeholder="e.g. Sleeve Badges"
                  className={inputCls}
                />
                <button type="button" onClick={addCustomOpt} className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shrink-0">Add</button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Display Order</label>
              <input
                type="number"
                name="display_order"
                value={form.display_order}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="flex items-end pb-2">
              <label htmlFor="tw_active" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="tw_active"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm font-bold text-black">
                  Active & Live on Teamwear Builder
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-black font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploadingFront || uploadingBack}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  <span>Saving...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Jersey Model
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>


      {/* Teamwear List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-sm rounded-2xl bg-white border border-slate-200 shadow-sm">
            No teamwear jersey templates added yet.
          </div>
        ) : (
          items.map((tw) => (
            <div
              key={tw.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex gap-4 hover:shadow-md transition-shadow"
            >
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200 flex items-center justify-center shadow-xs">
                {tw.front_image_url ? (
                  <Image
                    src={tw.front_image_url}
                    alt={tw.title}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <Shirt className="w-10 h-10 text-slate-400" />
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900 truncate">{tw.title}</h4>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0',
                        tw.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {tw.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  {tw.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tw.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {tw.colors?.slice(0, 5).map((col, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs inline-block"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                    {tw.fabric_options?.length > 0 && (
                      <span className="text-[10px] text-slate-500 font-mono ml-2">
                        {tw.fabric_options.length} fabrics
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                  <span className="text-[11px] text-slate-400 font-mono">Order: {tw.display_order}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggle(tw)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      {tw.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => openEdit(tw)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tw.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
