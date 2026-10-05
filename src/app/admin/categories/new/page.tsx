import React from 'react';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Add New Category</h1>
        <p className="text-sm text-gray-400 mt-1">Create a sports category to organize your products.</p>
      </div>
      <CategoryForm mode="create" />
    </div>
  );
}
