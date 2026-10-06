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
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-[#F5A623]/10 text-[#F5A623]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            Featured Products
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Up to 5 products. Pick a card background color for each, then save.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-xs text-red-400 hover:text-white">✕</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-sm">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-xs text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl bg-[#0E121B] border border-white/5 overflow-hidden">

        {/* Add product bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.01]">
          <Star className="w-4 h-4 text-[#F5A623] fill-[#F5A623] shrink-0" />
          <span className={cn(
            'text-xs font-bold px-2.5 py-0.5 rounded-full border',
            isLimitReached
              ? 'bg-amber-500/10 text-[#F5A623] border-[#F5A623]/30'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
          )}>
            {featuredProducts.length} / 5
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={selectedProductIdToAdd}
              onChange={(e) => setSelectedProductIdToAdd(e.target.value)}
              disabled={isLimitReached || updatingId !== null}
              className="bg-[#121622] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5A623] disabled:opacity-50"
            >
              <option value="" disabled hidden>
                {isLimitReached ? '5/5 Slots Filled' : '— pick a product —'}
              </option>
              {unfeaturedProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedProductIdToAdd || isLimitReached || updatingId !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Product rows */}
        {featuredProducts.length > 0 ? (
          <div className="divide-y divide-white/5">
            {featuredProducts.map((p, index) => {
              const selectedColorId = cardColors[p.id] ?? FEATURED_BG_COLORS[0].id;
              const selectedColor = FEATURED_BG_COLORS.find((c) => c.id === selectedColorId) ?? FEATURED_BG_COLORS[0];

              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  {/* Index */}
                  <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[11px] font-bold text-gray-400 shrink-0">
                    {index + 1}
                  </span>

                  {/* Thumbnail */}
                  <div
                    className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10"
                    style={{ backgroundColor: selectedColor.cardBg }}
                  >
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Tag className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Name + category */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm line-clamp-1">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400">{p.category?.name || '—'}</span>
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] text-[#F5A623] hover:underline"
                      >
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Color dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: selectedColor.cardBg }}
                    />
                    <select
                      value={selectedColorId}
                      onChange={(e) =>
                        setCardColors((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      className="bg-[#121622] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#F5A623] cursor-pointer"
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
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {updatingId === p.id ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
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
            <Star className="w-8 h-8 mx-auto text-gray-700 mb-3" />
            <p className="text-sm font-semibold text-white">No featured products yet</p>
            <p className="text-xs text-gray-500 mt-1">Use the dropdown above to add up to 5 products.</p>
          </div>
        )}

        {/* Save footer */}
        {featuredProducts.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5 bg-white/[0.01]">
            {saveFeedback ? (
              <span className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full border',
                saveFeedback.ok
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              )}>
                {saveFeedback.msg}
              </span>
            ) : (
              <p className="text-xs text-gray-500">Changes to card colors require saving.</p>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-[#080A0F] font-bold text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-[#F5A623]/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
