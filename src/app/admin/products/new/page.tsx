import React from 'react';
import { getAllCategories } from '@/services/categories';
import { getAllBrands } from '@/services/brands';
import { ProductForm } from '@/components/admin/ProductForm';

export const revalidate = 0;

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getAllCategories(), getAllBrands()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-black">Add New Product</h1>
        <p className="text-sm text-slate-600 mt-1">Add a product to your sports equipment catalog.</p>
      </div>
      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}
