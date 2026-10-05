'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types/database';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff, Tag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteImageFromCloudinary } from '@/lib/media';

interface ProductsListProps {
  products: Product[];
}

export function ProductsList({ products }: ProductsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleToggle = async (product: Product, field: 'is_active' | 'is_featured') => {
    const supabase = createClient();
    await supabase
      .from('products')
      .update({ [field]: !product[field], updated_at: new Date().toISOString() })
      .eq('id', product.id);
    router.refresh();
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? All associated Cloudinary images will also be removed.`)) return;
    setDeletingId(product.id);
    setError('');

    try {
      // 1. Delete main image from Cloudinary
      if (product.image_url) {
        await deleteImageFromCloudinary(product.image_url);
      }
      // 2. Delete gallery images from Cloudinary
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        await Promise.all(product.images.map((url) => deleteImageFromCloudinary(url)));
      }

      // 3. Delete from database
      const supabase = createClient();
      const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id);
      if (deleteError) throw deleteError;
    } catch (err: any) {
      setError(err?.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-12 text-center">
          <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Products Yet</h3>
          <p className="text-sm text-gray-400 mb-6">Add your first product to get started.</p>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A623] text-[#080A0F] font-bold text-sm">
            <Plus className="w-4 h-4" /> Add First Product
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0E121B] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Product</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Category</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Brand</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Featured</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#141924] shrink-0">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{product.name}</p>
                          <code className="text-[11px] text-gray-500">{product.slug}</code>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-gray-400 text-xs">{product.category?.name || '—'}</td>
                    <td className="px-5 py-4 hidden md:table-cell text-gray-400 text-xs">{product.brand?.name || '—'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(product, 'is_featured')} title={product.is_featured ? 'Remove from featured' : 'Mark as featured'}>
                        {product.is_featured
                          ? <Star className="w-4 h-4 text-[#F5A623] fill-[#F5A623]" />
                          : <StarOff className="w-4 h-4 text-gray-600" />}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2.5 py-1 rounded-lg text-[11px] font-bold',
                        product.is_active ? 'bg-emerald-900/30 text-emerald-300' : 'bg-white/5 text-gray-500'
                      )}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleToggle(product, 'is_active')} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Toggle visibility">
                          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/products/${product.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(product)} disabled={deletingId === product.id} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-colors disabled:opacity-50" title="Delete product and media">
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
