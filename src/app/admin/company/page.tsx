import React from 'react';
import { getCompanySettings } from '@/services/company';
import { CompanyForm } from '@/components/admin/CompanyForm';

import { AdminHeader } from '@/components/admin/AdminHeader';

export const revalidate = 0;

export default async function AdminCompanyPage() {
  const company = await getCompanySettings();

  return (
    <div className="space-y-6 max-w-7xl">
      <AdminHeader
        title="Company Details"
        description="Central CMS for all business information. Changes reflect site-wide instantly."
      />

      <CompanyForm initialData={company} />
    </div>
  );
}
