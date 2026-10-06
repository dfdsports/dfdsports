'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Category, Brand, Product } from '@/types/database';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff, Tag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteImageFromCloudinary } from '@/lib/media';
import { AdminModal } from '@/components/admin/AdminModal';
import { ProductForm } from '@/components/admin/ProductForm';

interface ProductsListProps {
  products: Product[];
  categories?: Category[];
  brands?: Brand[];
}

export function ProductsList({ products, categories = [], brands = [] }: ProductsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    product?: Product | null;
  }>({
    open: false,
    mode: 'create',
    product: null,
  });

  const handleToggle = async (product: Product, field: 'is_active' | 'is_featured') => {
    setError('');
    if (field === 'is_featured' && !product.is_featured) {
      const currentFeaturedCount = products.filter((p) => p.is_featured).length;
      if (currentFeaturedCount >= 5) {
        setError('Maximum 5 featured products allowed (5/5 already featured). Please unfeature another product first.');
        return;
      }
    }

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Products Catalog</h1>
          <p className="text-sm text-slate-600 mt-0.5">{products.length} total products in database</p>
        </div>
        <button
          type="button"
          onClick={() => setModalState({ open: true, mode: 'create', product: null })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-16 text-center shadow-sm">
          <Tag className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black mb-2">No Products Yet</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">Add your first product to display on the storefront and allow customer WhatsApp orders.</p>
          <button
            type="button"
            onClick={() => setModalState({ open: true, mode: 'create', product: null })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm shadow-sm cursor-pointer hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add First Product
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-black">Product</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-black hidden lg:table-cell">Category</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-black hidden md:table-cell">Brand</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-black">Featured</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-black">Status</th>
                  <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wider text-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-black line-clamp-1">{product.name}</p>
                          <code className="text-[11px] text-slate-600 font-mono">{product.slug}</code>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-black font-semibold text-xs">{product.category?.name || '—'}</td>
                    <td className="px-5 py-4 hidden md:table-cell text-black font-semibold text-xs">{product.brand?.name || '—'}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(product, 'is_featured')}
                        title={product.is_featured ? 'Remove from featured' : 'Mark as featured'}
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {product.is_featured
                          ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          : <StarOff className="w-4 h-4 text-slate-300 hover:text-slate-500" />}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2.5 py-1 rounded-lg text-[11px] font-bold border',
                        product.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggle(product, 'is_active')}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Toggle visibility"
                        >
                          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalState({ open: true, mode: 'edit', product })}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete product and media"
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

      {/* Reusable Product Modal */}
      <AdminModal
        isOpen={modalState.open}
        onClose={() => setModalState((prev) => ({ ...prev, open: false }))}
        title={modalState.mode === 'create' ? 'Create product' : 'Edit product'}
        subtitle={
          modalState.mode === 'create'
            ? 'Add a new sports product to your equipment catalog'
            : `Update product specs and media for ${modalState.product?.name || 'product'}`
        }
        maxWidth="4xl"
      >
        <ProductForm
          key={modalState.product?.id || 'new-product'}
          mode={modalState.mode}
          initialData={
            modalState.product
              ? {
                  ...modalState.product,
                  specifications: (modalState.product.specifications as Record<string, string>) || {},
                  sizes: modalState.product.sizes || [],
                  features: modalState.product.features || [],
                  images: modalState.product.images || [],
                  category_id: modalState.product.category_id || '',
                  brand_id: modalState.product.brand_id || '',
                  short_description: modalState.product.short_description || '',
                  long_description: modalState.product.long_description || '',
                  image_url: modalState.product.image_url || '',
                  seo_title: modalState.product.seo_title || '',
                  seo_description: modalState.product.seo_description || '',
                }
              : undefined
          }
          categories={categories}
          brands={brands}
          onSuccess={() => {
            setModalState((prev) => ({ ...prev, open: false }));
            router.refresh();
          }}
          onCancel={() => setModalState((prev) => ({ ...prev, open: false }))}
        />
      </AdminModal>
    </div>
  );

}
