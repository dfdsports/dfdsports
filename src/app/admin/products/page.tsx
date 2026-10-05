import React from 'react';
import { getAllProducts } from '@/services/products';
import { ProductsList } from '@/components/admin/ProductsList';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getAllProducts();
  return <ProductsList products={products} />;
}
