import React from 'react';
import { getAllPoliciesAdmin } from '@/services/policies';
import { PoliciesAdminClient } from '@/components/admin/PoliciesAdminClient';

export const revalidate = 0;

export const metadata = {
  title: 'Policy Management | DFD Sports Admin',
};

export default async function AdminPoliciesPage() {
  const policies = await getAllPoliciesAdmin();
  return <PoliciesAdminClient initialPolicies={policies} />;
}
