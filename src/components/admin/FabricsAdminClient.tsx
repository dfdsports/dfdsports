'use client';

import React, { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Fabric } from '@/types/database';
import { Plus, Edit2, Trash2, Save, X, Upload, CheckCircle2, Layers, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FabricsAdminClientProps {
  fabrics: Fabric[];
}

const emptyFabric = {
  name: '',
  slug: '',
  short_description: '',
  image_url: '',
  specifications: '',
  display_order: 0,
  is_active: true,
};

export function FabricsAdminClient({ fabrics }: FabricsAdminClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fabric | null>(null);
  const [form, setForm] = useState(emptyFabric);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
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
    setForm({ ...emptyFabric, display_order: fabrics.length });
    setShowForm(true);
    setSavedSuccess(false);
  };

  const openEdit = (fabric: Fabric) => {
    setEditing(fabric);
    setForm({
      name: fabric.name,
      slug: fabric.slug,
      short_description: fabric.short_description || '',
      image_url: fabric.image_url || '',
      specifications: fabric.specifications || '',
      display_order: fabric.display_order,
      is_active: fabric.is_active,
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
      if (name === 'name' && !editing) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `fabrics/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('dfd-sports')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) {
        console.warn('Upload to storage failed:', uploadErr);
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm((p) => ({ ...p, image_url: reader.result as string }));
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('dfd-sports')
          .getPublicUrl(fileName);
        setForm((p) => ({ ...p, image_url: publicUrlData.publicUrl }));
        setUploading(false);
      }
    } catch (err: any) {
      setError('Upload failed: ' + err?.message);
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
          const { error: updateErr } = await supabase
            .from('fabrics')
            .update({ ...form })
            .eq('id', editing.id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('fabrics')
            .insert([form]);
          if (insertErr) throw insertErr;
        }
        setSavedSuccess(true);
        setTimeout(() => setShowForm(false), 500);
        router.refresh();
      } catch (err: any) {
        setError(err?.message || 'Failed to save fabric');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fabric option?')) return;
    const supabase = createClient();
    await supabase.from('fabrics').delete().eq('id', id);
    router.refresh();
  };

  const handleToggle = async (fabric: Fabric) => {
    const supabase = createClient();
    await supabase.from('fabrics').update({ is_active: !fabric.is_active }).eq('id', fabric.id);
    router.refresh();
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-200 transition-all shadow-xs';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Custom Fabrics & Tech</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage breathable fabrics and GSM specifications for team jersey production.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Fabric
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs">{error}</div>}

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl bg-white border-2 border-amber-400/80 shadow-md p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {editing ? 'Edit Fabric' : 'Add New Fabric'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Fabric Name <span className="text-amber-600">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. Micro Polyester Interlock (160 GSM)"
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
                placeholder="micro-poly-interlock-160gsm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Short Description</label>
              <textarea
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                rows={2}
                className={inputCls}
                placeholder="High breathability, quick-dry fabric engineered for intense football and running..."
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Specifications / GSM / Composition</label>
              <input
                name="specifications"
                value={form.specifications}
                onChange={handleChange}
                className={inputCls}
                placeholder="100% Micro Polyester, 160 GSM, Anti-Bacterial, Moisture Wicking"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className={labelCls}>Fabric Swatch Image</label>
              <div className="flex items-center gap-4">
                {form.image_url ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                    <Image
                      src={form.image_url}
                      alt="Swatch preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, image_url: '' }))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-600" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <span className="text-xs text-slate-400">or enter direct image URL below</span>
                  </div>
                  <input
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="https://example.com/fabric-swatch.jpg"
                  />
                </div>
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
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="fabric_active"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm font-bold text-slate-800">
                  Active & Visible on Public Site
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-sm transition-all"
            >
              {isPending ? 'Saving...' : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Fabric
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Fabrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fabrics.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-sm rounded-2xl bg-white border border-slate-200 shadow-sm">
            No fabrics added yet. Click &quot;Add Fabric&quot; to configure swatches.
          </div>
        ) : (
          fabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex gap-4 hover:shadow-md transition-shadow"
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-xs">
                {fabric.image_url ? (
                  <Image
                    src={fabric.image_url}
                    alt={fabric.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Layers className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900 truncate">{fabric.name}</h4>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0',
                        fabric.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {fabric.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  {fabric.specifications && (
                    <p className="text-xs text-amber-600 font-bold font-mono mt-0.5">{fabric.specifications}</p>
                  )}
                  {fabric.short_description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{fabric.short_description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                  <span className="text-[11px] text-slate-400 font-mono">Order: {fabric.display_order}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggle(fabric)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      {fabric.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => openEdit(fabric)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(fabric.id)}
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
