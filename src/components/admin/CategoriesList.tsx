'use client';

import React, { useState, useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Categories Yet</h3>
          <p className="text-sm text-gray-400 mb-6">Add sports categories to organize your product catalog.</p>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] text-[#080A0F] font-bold text-sm"
          >
            <Plus className="w-4 h-4" /> Create First Category
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0E121B] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Slug</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Order</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#141924] shrink-0">
                          {cat.image_url ? (
                            <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{cat.name}</p>
                          {cat.short_description && (
                            <p className="text-xs text-gray-400 line-clamp-1">{cat.short_description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">{cat.slug}</code>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-gray-400">{cat.display_order}</td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold',
                        cat.is_active ? 'bg-emerald-900/30 text-emerald-300' : 'bg-white/5 text-gray-500'
                      )}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          title={cat.is_active ? 'Hide category' : 'Show category'}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {cat.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/admin/categories/${cat.id}/edit`}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-colors disabled:opacity-50"
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
