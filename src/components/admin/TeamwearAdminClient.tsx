'use client';

import React, { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Teamwear } from '@/types/database';
import { Plus, Edit2, Trash2, Save, X, Upload, CheckCircle2, Shirt, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamwearAdminClientProps {
  items: Teamwear[];
}

const emptyTeamwear = {
  title: '',
  slug: '',
  description: '',
  front_image_url: '',
  back_image_url: '',
  gallery_images: [] as string[],
  colors: ['#0A192F', '#F5A623', '#FFFFFF', '#DC2626'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  fabric_options: ['Micro Polyester 160 GSM', 'Dot Knit Breathable', 'Jacquard Honeycomb'],
  customization_options: ['Player Name', 'Player Number', 'Team Logo (Sublimated/Embroidered)', 'Sponsor Badges', 'Collar Style'],
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
  const [colorInput, setColorInput] = useState('');
  const [fabricInput, setFabricInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [customOptInput, setCustomOptInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      gallery_images: tw.gallery_images || [],
      colors: tw.colors || [],
      sizes: tw.sizes || [],
      fabric_options: tw.fabric_options || [],
      customization_options: tw.customization_options || [],
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

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `teamwear/${folder}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error: uploadErr } = await supabase.storage
      .from('dfd-sports')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (uploadErr) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from('dfd-sports')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFront(true);
    try {
      const url = await uploadFile(file, 'front');
      setForm((p) => ({ ...p, front_image_url: url }));
    } catch (err: any) {
      setError(err?.message || 'Front image upload failed');
    } finally {
      setUploadingFront(false);
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBack(true);
    try {
      const url = await uploadFile(file, 'back');
      setForm((p) => ({ ...p, back_image_url: url }));
    } catch (err: any) {
      setError(err?.message || 'Back image upload failed');
    } finally {
      setUploadingBack(false);
    }
  };

  const addColor = () => {
    if (!colorInput.trim()) return;
    if (!form.colors.includes(colorInput.trim())) {
      setForm((p) => ({ ...p, colors: [...p.colors, colorInput.trim()] }));
    }
    setColorInput('');
  };

  const removeColor = (idx: number) => {
    setForm((p) => ({ ...p, colors: p.colors.filter((_, i) => i !== idx) }));
  };

  const addSize = () => {
    if (!sizeInput.trim()) return;
    if (!form.sizes.includes(sizeInput.trim().toUpperCase())) {
      setForm((p) => ({ ...p, sizes: [...p.sizes, sizeInput.trim().toUpperCase()] }));
    }
    setSizeInput('');
  };

  const removeSize = (idx: number) => {
    setForm((p) => ({ ...p, sizes: p.sizes.filter((_, i) => i !== idx) }));
  };

  const addFabric = () => {
    if (!fabricInput.trim()) return;
    if (!form.fabric_options.includes(fabricInput.trim())) {
      setForm((p) => ({ ...p, fabric_options: [...p.fabric_options, fabricInput.trim()] }));
    }
    setFabricInput('');
  };

  const removeFabric = (idx: number) => {
    setForm((p) => ({ ...p, fabric_options: p.fabric_options.filter((_, i) => i !== idx) }));
  };

  const addCustomOpt = () => {
    if (!customOptInput.trim()) return;
    if (!form.customization_options.includes(customOptInput.trim())) {
      setForm((p) => ({ ...p, customization_options: [...p.customization_options, customOptInput.trim()] }));
    }
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
            .update({ ...form, updated_at: new Date().toISOString() })
            .eq('id', editing.id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase.from('teamwear').insert([form]);
          if (insertErr) throw insertErr;
        }
        setSavedSuccess(true);
        setTimeout(() => setShowForm(false), 500);
        router.refresh();
      } catch (err: any) {
        setError(err?.message || 'Save failed');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom jersey model?')) return;
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
    'w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm border border-white/5';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2';

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Custom Teamwear & Jersey Templates</h1>
          <p className="text-sm text-gray-400 mt-1">Manage mockups, 360 front/back angles, fabrics, and customizations</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Jersey Model
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 text-red-300 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl bg-[#0E121B] border border-[#F5A623]/30 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-white">
              {editing ? 'Edit Teamwear Model' : 'Create Jersey Template'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Model Title <span className="text-[#F5A623]">*</span>
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
                Slug <span className="text-[#F5A623]">*</span>
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
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
                    <Image
                      src={form.front_image_url}
                      alt="Front view"
                      fill
                      className="object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, front_image_url: '' }))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 bg-white/5 shrink-0">
                    <Shirt className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Front</span>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    <Upload className="w-3 h-3" />
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
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
                    <Image
                      src={form.back_image_url}
                      alt="Back view"
                      fill
                      className="object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, back_image_url: '' }))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 bg-white/5 shrink-0">
                    <Shirt className="w-6 h-6 rotate-180" />
                    <span className="text-[10px] mt-1">Back</span>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    <Upload className="w-3 h-3" />
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono text-white"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                    {c}
                    <button type="button" onClick={() => removeColor(i)} className="text-gray-400 hover:text-white">
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
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold shrink-0"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-xs font-medium text-white"
                  >
                    {f}
                    <button type="button" onClick={() => removeFabric(i)} className="text-gray-400 hover:text-white">
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
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold shrink-0"
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
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono text-white">
                    {s}
                    <button type="button" onClick={() => removeSize(i)} className="text-gray-400 hover:text-white"><X className="w-3 h-3" /></button>
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
                <button type="button" onClick={addSize} className="px-3 py-2 bg-white/10 text-white rounded-xl text-xs font-bold shrink-0">Add</button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Customization Options</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.customization_options.map((co, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-xs font-medium text-white">
                    {co}
                    <button type="button" onClick={() => removeCustomOpt(i)} className="text-gray-400 hover:text-white"><X className="w-3 h-3" /></button>
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
                <button type="button" onClick={addCustomOpt} className="px-3 py-2 bg-white/10 text-white rounded-xl text-xs font-bold shrink-0">Add</button>
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

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="tw_active"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#F5A623] focus:ring-[#F5A623] bg-white/5 border-white/10"
              />
              <label htmlFor="tw_active" className="text-sm font-medium text-white cursor-pointer">
                Active & Live on Teamwear Builder
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploadingFront || uploadingBack}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all"
            >
              {isPending ? 'Saving...' : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Jersey Model
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Teamwear List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-gray-400 text-sm rounded-2xl bg-[#0E121B] border border-white/5">
            No teamwear jersey templates added yet.
          </div>
        ) : (
          items.map((tw) => (
            <div
              key={tw.id}
              className="p-5 rounded-2xl bg-[#0E121B] border border-white/5 flex gap-4 hover:border-white/10 transition-colors"
            >
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/5 flex items-center justify-center">
                {tw.front_image_url ? (
                  <Image
                    src={tw.front_image_url}
                    alt={tw.title}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <Shirt className="w-10 h-10 text-gray-600" />
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-white truncate">{tw.title}</h4>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0',
                        tw.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      )}
                    >
                      {tw.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  {tw.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{tw.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {tw.colors?.slice(0, 5).map((col, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                    {tw.fabric_options?.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-mono ml-2">
                        {tw.fabric_options.length} fabrics
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                  <span className="text-[11px] text-gray-500 font-mono">Order: {tw.display_order}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggle(tw)}
                      className="px-2.5 py-1 rounded-lg border border-white/10 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      {tw.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => openEdit(tw)}
                      className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-[#F5A623] hover:bg-white/5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tw.id)}
                      className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
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
