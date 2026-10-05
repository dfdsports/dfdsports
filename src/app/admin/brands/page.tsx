import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllBrands } from '@/services/brands';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Brand } from '@/types/database';
import { Plus, Edit2, Trash2, Eye, EyeOff, Tag } from 'lucide-react';
import { BrandsAdminClient } from '@/components/admin/BrandsAdminClient';

export const revalidate = 0;

export default async function AdminBrandsPage() {
  const brands = await getAllBrands();
  return <BrandsAdminClient brands={brands} />;
}
