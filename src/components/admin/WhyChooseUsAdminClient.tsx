'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WhyChooseUs } from '@/types/database';
import { Plus, Edit2, Trash2, Save, X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminModal } from '@/components/admin/AdminModal';

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
    'w-full px-4 py-3 rounded-xl bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-300 transition-all shadow-xs font-medium';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-black mb-2';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Why Choose Us</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage trust and competitive advantages displayed on the storefront.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs">{error}</div>}

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit feature' : 'Add feature'}
        subtitle={
          editing
            ? `Update benefit details for ${editing.title}`
            : 'Highlight a key advantage of choosing DFD Sports'
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={labelCls}>
              Feature Title <span className="text-amber-600">*</span>
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
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="is_active" className="text-sm font-bold text-slate-800 cursor-pointer">
              Active & Visible on Public Site
            </label>
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
              disabled={isPending}
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
                  <Save className="w-4 h-4" /> Save Feature
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>


      {/* Items List */}
      <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No features added yet. Click &quot;Add Item&quot; to highlight your advantages.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                        item.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {item.is_active ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Order: {item.display_order}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-500 mt-1 max-w-xl">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(item)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  {item.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  title="Edit item"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete item"
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
