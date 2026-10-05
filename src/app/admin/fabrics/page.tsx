import React from 'react';
import { getAllFabrics } from '@/services/fabrics';
import { FabricsAdminClient } from '@/components/admin/FabricsAdminClient';

export const revalidate = 0;

export default async function AdminFabricsPage() {
  const fabrics = await getAllFabrics();
  return <FabricsAdminClient fabrics={fabrics} />;
}
