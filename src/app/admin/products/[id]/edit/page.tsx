import React from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAllCategories } from '@/services/categories';
import { getAllBrands } from '@/services/brands';
import { ProductForm } from '@/components/admin/ProductForm';

export const revalidate = 0;

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const [{ data: product }, categories, brands] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    getAllCategories(),
    getAllBrands(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-black">Edit Product</h1>
        <p className="text-sm text-slate-600 mt-1">Update product details, images, and specifications.</p>
      </div>
      <ProductForm mode="edit" initialData={product} categories={categories} brands={brands} />
    </div>
  );
}
