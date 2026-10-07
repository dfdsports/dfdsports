'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Highlight } from '@/types/database';
import { Plus, Edit2, Trash2, Save, X, TrendingUp, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

interface HighlightsAdminClientProps {
  highlights: Highlight[];
}

const empty = { label: '', value: '', suffix: '', description: '', icon: '', display_order: 0, is_active: true };

export function HighlightsAdminClient({ highlights }: HighlightsAdminClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Highlight | null>(null);
  const [highlightToDelete, setHighlightToDelete] = useState<Highlight | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState(empty);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const openCreate = () => { setEditing(null); setForm({ ...empty, display_order: highlights.length }); setShowForm(true); };
  const openEdit = (h: Highlight) => { setEditing(h); setForm({ label: h.label, value: h.value, suffix: h.suffix || '', description: h.description || '', icon: h.icon || '', display_order: h.display_order, is_active: h.is_active }); setShowForm(true); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      try {
        const supabase = createClient();
        if (editing) {
          const { error } = await supabase.from('highlights').update({ ...form }).eq('id', editing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('highlights').insert([form]);
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
    if (!highlightToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from('highlights').delete().eq('id', highlightToDelete.id);
      if (deleteError) throw deleteError;
      setHighlightToDelete(null);
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
      router.refresh();
    }
  };

  const handleToggle = async (h: Highlight) => {
    const supabase = createClient();
    await supabase.from('highlights').update({ is_active: !h.is_active }).eq('id', h.id);
    router.refresh();
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-300 transition-all shadow-xs font-medium';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-black mb-2';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Business Highlights</h1>
          <p className="text-sm text-slate-600 mt-0.5">Key factual performance metrics displayed across the store.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Highlight Stat
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
        title={editing ? 'Edit highlight stat' : 'Add highlight stat'}
        subtitle={
          editing
            ? `Update metric numbers for ${editing.label}`
            : 'Add a verified milestone or statistical achievement to display'
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Stat Label <span className="text-amber-600">*</span></label>
              <input name="label" value={form.label} onChange={handleChange} className={inputCls} placeholder="e.g. Teams Served" required />
            </div>
            <div>
              <label className={labelCls}>Value <span className="text-amber-600">*</span></label>
              <input name="value" value={form.value} onChange={handleChange} className={inputCls} placeholder="500" required />
            </div>
            <div>
              <label className={labelCls}>Suffix</label>
              <input name="suffix" value={form.suffix} onChange={handleChange} className={inputCls} placeholder="+" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Short Description (Optional)</label>
            <input name="description" value={form.description} onChange={handleChange} className={inputCls} placeholder="Across schools, clubs and academies" />
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
              disabled={isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editing ? 'Save Changes' : 'Add Highlight'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {highlights.length === 0 && !showForm ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-10 sm:p-16 text-center shadow-sm">
          <TrendingUp className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black mb-2">No Statistics Added Yet</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">Add verified figures such as jerseys delivered or teams outfitted.</p>
          <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm shadow-sm cursor-pointer w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add First Stat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {highlights.map((h) => (
            <div key={h.id} className={cn('rounded-2xl bg-white border shadow-sm p-4 sm:p-5 flex items-center justify-between gap-3 hover:shadow-md transition-shadow', h.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60')}>
              <div className="min-w-0 flex-1">
                <p className="text-2xl sm:text-3xl font-bold text-black">{h.value}<span className="text-amber-600">{h.suffix}</span></p>
                <p className="text-sm font-bold text-black mt-0.5 truncate">{h.label}</p>
                {h.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{h.description}</p>}
                <span className={cn('text-[11px] font-bold mt-1.5 block', h.is_active ? 'text-emerald-700' : 'text-slate-400')}>{h.is_active ? '• Visible' : '• Hidden'}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(h)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Toggle visibility"
                >
                  {h.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(h)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setHighlightToDelete(h)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Delete highlight">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(highlightToDelete)}
        onClose={() => setHighlightToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Business Highlight"
        description={
          highlightToDelete
            ? `Are you sure you want to permanently delete the stat metric "${highlightToDelete.label}" (${highlightToDelete.value}${highlightToDelete.suffix || ''})?`
            : 'Are you sure you want to delete this highlight?'
        }
        confirmText="Delete Stat"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
