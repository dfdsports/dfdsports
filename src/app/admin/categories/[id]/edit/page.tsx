import React from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/CategoryForm';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: category } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();

  if (!category) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-black">Edit Category</h1>
        <p className="text-sm text-slate-600 mt-1">Update category details and visibility.</p>
      </div>
      <CategoryForm mode="edit" initialData={category} />
    </div>
  );
}
