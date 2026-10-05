'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Highlight } from '@/types/database';
import { Plus, Edit2, Trash2, Save, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HighlightsAdminClientProps {
  highlights: Highlight[];
}

const empty = { label: '', value: '', suffix: '', description: '', icon: '', display_order: 0, is_active: true };

export function HighlightsAdminClient({ highlights }: HighlightsAdminClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Highlight | null>(null);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this business highlight?')) return;
    const supabase = createClient();
    await supabase.from('highlights').delete().eq('id', id);
    router.refresh();
  };

  const handleToggle = async (h: Highlight) => {
    const supabase = createClient();
    await supabase.from('highlights').update({ is_active: !h.is_active }).eq('id', h.id);
    router.refresh();
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm border border-white/5';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Business Highlights</h1>
          <p className="text-sm text-gray-400 mt-1">⚠️ Only add confirmed, factual statistics. Never add fake numbers.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Stat
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 text-red-300 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl bg-[#0E121B] border border-[#F5A623]/30 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-white">{editing ? 'Edit Highlight' : 'Add Highlight'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="rounded-xl bg-amber-950/30 border border-amber-700/30 p-3 text-xs text-amber-300">
            ⚠️ Only enter real, confirmed, verified statistics. Do not enter estimates or placeholder numbers.
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Stat Label <span className="text-[#F5A623]">*</span></label>
              <input name="label" value={form.label} onChange={handleChange} className={inputCls} placeholder="e.g. Teams Served" required />
            </div>
            <div>
              <label className={labelCls}>Value <span className="text-[#F5A623]">*</span></label>
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
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> {isPending ? 'Saving...' : editing ? 'Save Changes' : 'Add Highlight'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-white">Cancel</button>
          </div>
        </form>
      )}

      {highlights.length === 0 && !showForm ? (
        <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Statistics Added Yet</h3>
          <p className="text-sm text-gray-400 mb-1">Only add confirmed, real business statistics.</p>
          <p className="text-xs text-amber-400">The highlights section stays hidden on the website until you add data here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {highlights.map((h) => (
            <div key={h.id} className={cn('rounded-2xl bg-[#0E121B] border p-5 flex items-center justify-between', h.is_active ? 'border-white/10' : 'border-white/5 opacity-60')}>
              <div>
                <p className="text-3xl font-black text-white">{h.value}<span className="text-[#F5A623]">{h.suffix}</span></p>
                <p className="text-sm font-bold text-gray-300 mt-0.5">{h.label}</p>
                {h.description && <p className="text-xs text-gray-500">{h.description}</p>}
                <span className={cn('text-[11px] font-bold mt-1 block', h.is_active ? 'text-emerald-400' : 'text-gray-500')}>{h.is_active ? 'Visible' : 'Hidden'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggle(h)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  {h.is_active ? '🙈' : '👁️'}
                </button>
                <button onClick={() => openEdit(h)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(h.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
