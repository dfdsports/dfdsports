'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types/database';
import { FEATURED_BG_COLORS } from '@/lib/featuredColors';
import type { FeaturedSettings } from '@/services/featuredSettings';
import {
  Sparkles,
  Check,
  Star,
  StarOff,
  Plus,
  AlertCircle,
  Tag,
  ExternalLink,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturedAdminClientProps {
  initialSettings: FeaturedSettings;
  products: Product[];
}

export function FeaturedAdminClient({ initialSettings, products }: FeaturedAdminClientProps) {
  const router = useRouter();

  // Per-card colors: productId → colorId
  const [cardColors, setCardColors] = useState<Record<string, string>>(
    initialSettings.cardColors ?? {}
  );

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Featured product CRUD
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] = useState<string>('');

  const featuredProducts = products.filter((p) => p.is_featured);
  const unfeaturedProducts = products.filter((p) => !p.is_featured && p.is_active);
  const isLimitReached = featuredProducts.length >= 5;

  // Save all card colors
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveFeedback(null);
    try {
      const res = await fetch('/api/featured-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorId: initialSettings.colorId,
          cardColors,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      setSaveFeedback({ ok: true, msg: 'Saved successfully!' });
      router.refresh();
    } catch (err: unknown) {
      setSaveFeedback({ ok: false, msg: err instanceof Error ? err.message : 'Error saving' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveFeedback(null), 4000);
    }
  };

  // Remove from featured
  const handleRemove = async (product: Product) => {
    setUpdatingId(product.id);
    setError(null);
    setSuccess(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_featured: false, updated_at: new Date().toISOString() })
        .eq('id', product.id);
      if (updateError) throw updateError;
      setCardColors((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      setSuccess(`"${product.name}" removed from featured.`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setUpdatingId(null);
    }
  };

  // Add to featured
  const handleAdd = async () => {
    if (!selectedProductIdToAdd) return;
    if (isLimitReached) {
      setError('Maximum 5 featured products allowed. Remove one first.');
      return;
    }
    setUpdatingId(selectedProductIdToAdd);
    setError(null);
    setSuccess(null);
    try {
      const supabase = createClient();
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true);
      if (countError) throw countError;
      if ((count ?? 0) >= 5) {
        setError('5/5 slots already filled. Remove a product first.');
        return;
      }
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_featured: true, updated_at: new Date().toISOString() })
        .eq('id', selectedProductIdToAdd);
      if (updateError) throw updateError;
      const added = products.find((p) => p.id === selectedProductIdToAdd);
      setSuccess(`"${added?.name || 'Product'}" added to featured.`);
      setSelectedProductIdToAdd('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-amber-600" />
            Featured Products
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Up to 5 products showcase on homepage. Select custom card accents and save.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-xs text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow-xs">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-xs text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Add product bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span className={cn(
              'text-xs font-bold px-2.5 py-0.5 rounded-full border',
              isLimitReached
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-blue-100 text-blue-800 border-blue-300'
            )}>
              {featuredProducts.length} / 5 Slots Used
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedProductIdToAdd}
              onChange={(e) => setSelectedProductIdToAdd(e.target.value)}
              disabled={isLimitReached || updatingId !== null}
              className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 shadow-xs"
            >
              <option value="" disabled hidden>
                {isLimitReached ? '5/5 Slots Filled' : '— Select a product to feature —'}
              </option>
              {unfeaturedProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedProductIdToAdd || isLimitReached || updatingId !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Product rows */}
        {featuredProducts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {featuredProducts.map((p, index) => {
              const selectedColorId = cardColors[p.id] ?? FEATURED_BG_COLORS[0].id;
              const selectedColor = FEATURED_BG_COLORS.find((c) => c.id === selectedColorId) ?? FEATURED_BG_COLORS[0];

              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors">
                  {/* Index */}
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                    {index + 1}
                  </span>

                  {/* Thumbnail */}
                  <div
                    className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs"
                    style={{ backgroundColor: selectedColor.cardBg }}
                  >
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Tag className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Name + category */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 font-medium">{p.category?.name || '—'}</span>
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:underline font-bold"
                      >
                        View Public <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Color dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-xs"
                      style={{ backgroundColor: selectedColor.cardBg }}
                    />
                    <select
                      value={selectedColorId}
                      onChange={(e) =>
                        setCardColors((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
                    >
                      {FEATURED_BG_COLORS.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemove(p)}
                    disabled={updatingId === p.id}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {updatingId === p.id ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-400 border-t-rose-700 animate-spin" />
                    ) : (
                      <StarOff className="w-3.5 h-3.5" />
                    )}
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Star className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-800">No featured products selected</p>
            <p className="text-xs text-slate-500 mt-1">Use the dropdown above to add up to 5 products to the homepage.</p>
          </div>
        )}

        {/* Save footer */}
        {featuredProducts.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-slate-50/80">
            {saveFeedback ? (
              <span className={cn(
                'text-xs font-bold px-3 py-1.5 rounded-full border',
                saveFeedback.ok
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              )}>
                {saveFeedback.msg}
              </span>
            ) : (
              <p className="text-xs text-slate-500 font-medium">Changes to card colors require saving to take effect.</p>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Colors'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
