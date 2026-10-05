import React from 'react';
import { getAllCategories } from '@/services/categories';
import { CategoriesList } from '@/components/admin/CategoriesList';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  return <CategoriesList categories={categories} />;
}
