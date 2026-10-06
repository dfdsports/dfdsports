import React from 'react';
import { getAllProducts } from '@/services/products';
import { getAllCategories } from '@/services/categories';
import { getAllBrands } from '@/services/brands';
import { ProductsList } from '@/components/admin/ProductsList';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, categories, brands] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getAllBrands(),
  ]);
  return <ProductsList products={products} categories={categories} brands={brands} />;
}
