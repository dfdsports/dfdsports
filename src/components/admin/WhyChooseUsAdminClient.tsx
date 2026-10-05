'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WhyChooseUs } from '@/types/database';
import { Plus, Edit2, Trash2, Save, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhyChooseUsAdminClientProps {
  items: WhyChooseUs[];
}

const emptyItem = {
  title: '',
  description: '',
  icon: 'ShieldCheck',
  display_order: 0,
  is_active: true,
};

export function WhyChooseUsAdminClient({ items }: WhyChooseUsAdminClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WhyChooseUs | null>(null);
  const [form, setForm] = useState(emptyItem);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyItem, display_order: items.length });
    setShowForm(true);
    setSavedSuccess(false);
  };

  const openEdit = (item: WhyChooseUs) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || '',
      icon: item.icon || 'ShieldCheck',
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setShowForm(true);
    setSavedSuccess(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      try {
        const supabase = createClient();
        if (editing) {
          const { error: updateErr } = await supabase
            .from('why_choose_us')
            .update({ ...form })
            .eq('id', editing.id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('why_choose_us')
            .insert([form]);
          if (insertErr) throw insertErr;
        }
        setSavedSuccess(true);
        setTimeout(() => setShowForm(false), 500);
        router.refresh();
      } catch (err: any) {
        setError(err?.message || 'Failed to save item');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    const supabase = createClient();
    await supabase.from('why_choose_us').delete().eq('id', id);
    router.refresh();
  };

  const handleToggle = async (item: WhyChooseUs) => {
    const supabase = createClient();
    await supabase.from('why_choose_us').update({ is_active: !item.is_active }).eq('id', item.id);
    router.refresh();
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm border border-white/5';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Why Choose Us</h1>
          <p className="text-sm text-gray-400 mt-1">Manage competitive advantages displayed on the homepage</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 text-red-300 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl bg-[#0E121B] border border-[#F5A623]/30 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-white">
              {editing ? 'Edit Advantage' : 'Add New Advantage'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                Feature Title <span className="text-[#F5A623]">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 100% Authentic Authorized Equipment"
                required
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className={inputCls}
                placeholder="Explain the benefit for sports academies, teams, and athletes..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Icon Name</label>
                <select
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="ShieldCheck">Shield / Trust</option>
                  <option value="Trophy">Trophy / Championship</option>
                  <option value="Clock">Fast Turnaround / Clock</option>
                  <option value="Sparkles">Custom Design / Premium</option>
                  <option value="Users">Academy & Bulk / Users</option>
                  <option value="Truck">Fast Delivery / Truck</option>
                </select>
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
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#F5A623] focus:ring-[#F5A623] bg-white/5 border-white/10"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-white cursor-pointer">
                Active & Visible on Public Site
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
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all"
            >
              {isPending ? 'Saving...' : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Feature
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 divide-y divide-white/5 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No features added yet. Click &quot;Add Item&quot; to highlight your advantages.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-5 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                        item.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      )}
                    >
                      {item.is_active ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">Order: {item.display_order}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-400 mt-1 max-w-xl">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(item)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-[#F5A623] hover:bg-white/5"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
