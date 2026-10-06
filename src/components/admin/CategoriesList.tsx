'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types/database';
import { Plus, Edit2, Trash2, Eye, EyeOff, ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteImageFromCloudinary } from '@/lib/media';

interface CategoriesListProps {
  categories: Category[];
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleToggleActive = async (cat: Category) => {
    const supabase = createClient();
    await supabase
      .from('categories')
      .update({ is_active: !cat.is_active, updated_at: new Date().toISOString() })
      .eq('id', cat.id);
    router.refresh();
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete "${cat.name}"? All associated Cloudinary images will also be removed.`)) return;
    setDeletingId(cat.id);
    setError('');

    try {
      if (cat.image_url) {
        await deleteImageFromCloudinary(cat.image_url);
      }
      const supabase = createClient();
      const { error: deleteError } = await supabase.from('categories').delete().eq('id', cat.id);
      if (deleteError) throw deleteError;
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">{categories.length} total categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-16 text-center shadow-sm">
          <ImageIcon className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Categories Yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Add sports categories to organize your product catalog.</p>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create First Category
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Slug</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Order</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {cat.image_url ? (
                            <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{cat.name}</p>
                          {cat.short_description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{cat.short_description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">{cat.slug}</code>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-slate-600 font-mono text-xs">{cat.display_order}</td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold border',
                        cat.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          title={cat.is_active ? 'Hide category' : 'Show category'}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          {cat.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/admin/categories/${cat.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat.id}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete category and media"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
